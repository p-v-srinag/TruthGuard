import 'dotenv/config';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { withBazaar, type DiscoveryResource } from '@x402-avm/extensions';
import {
  createPayingClient,
  explainPaymentError,
  resourceUrl,
} from './lib.js';

async function discoverPaidResource(facilitatorUrl: string): Promise<DiscoveryResource | undefined> {
  const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
  const bazaar = withBazaar(
    facilitator as unknown as Parameters<typeof withBazaar>[0],
  );
  const limit = 50;
  for (let offset = 0; ; offset += limit) {
    const page = await bazaar.extensions.discovery.listResources({ type: 'http', limit, offset });
    const match = page.items.find(item => {
      const searchable = `${item.resource} ${JSON.stringify(item.metadata ?? {})}`.toLowerCase();
      return searchable.includes('truthguard') || searchable.includes('verify') || searchable.includes('claim');
    });
    if (match || offset + page.items.length >= page.pagination.total) return match;
  }
}

async function main() {
  const facilitatorUrl = process.env.FACILITATOR_URL ?? 'https://facilitator.goplausible.xyz';
  const mode = process.env.AGENT_DISCOVERY ?? 'direct';
  let url: string;

  if (mode === 'bazaar') {
    console.log('[AGENT] Searching GoPlausible Bazaar for TruthGuard Oracle...');
    const discovered = await discoverPaidResource(facilitatorUrl);
    if (!discovered) {
      throw new Error(
        'TruthGuard is not currently indexed in Bazaar. A public endpoint and a successful settlement are required before discovery can be claimed.',
      );
    }
    url = discovered.resource;
    console.log(`[AGENT] Discovered endpoint: ${url}`);
  } else if (mode === 'direct') {
    url = resourceUrl();
    console.log(`[AGENT] Operating in direct endpoint mode: ${url}`);
  } else {
    throw new Error('AGENT_DISCOVERY must be either "direct" or "bazaar".');
  }

  const payer = createPayingClient();
  console.log('[AGENT] Submitting assertion for verification with x402 payment...');

  const claimPayload = {
    claim: 'Algorand provides instant transaction finality with zero chain forks.'
  };

  const response = await payer.fetchWithPayment(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimPayload)
  });

  if (!response.ok) {
    throw new Error(`Purchase failed with HTTP ${response.status}: ${await response.text()}`);
  }

  const settlement = payer.httpClient.getPaymentSettleResponse(name => response.headers.get(name));
  if (!settlement.success) {
    throw new Error('Response received without confirmed settlement receipt.');
  }

  console.log(`[SUCCESS] Agent settlement confirmed in tx: ${settlement.transaction}`);
  console.log('[AGENT] Consumed verification oracle verdict:');
  console.log(JSON.stringify(await response.json(), null, 2));
}

main().catch(error => {
  console.error(`\n[ERROR] Agent execution failed: ${explainPaymentError(error)}`);
  process.exit(1);
});