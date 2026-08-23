import 'dotenv/config';
import { createPayingClient, explainPaymentError, readPaymentRequired, resourceUrl } from './lib.js';

async function main() {
  const url = resourceUrl();
  const payer = createPayingClient();
  const claimPayload = {
    claim: 'Algorand supports instant transaction finality with zero chain forks.'
  };

  console.log('[INFO] Sending unauthenticated request to TruthGuard Oracle...');
  const unpaid = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimPayload),
  });

  if (unpaid.status !== 402) {
    throw new Error(`Expected HTTP 402 challenge, but received HTTP ${unpaid.status}.`);
  }

  const requirement = readPaymentRequired(unpaid);
  console.log('\n[INFO] HTTP 402 Payment Required intercepted:');
  if (requirement) {
    console.log(`- Service: ${requirement.description}`);
    console.log(`- Price: ${requirement.price} USDC`);
    console.log(`- Network: ${requirement.network}`);
  }

  console.log(`\n[INFO] Payer Account: ${payer.signer.address}`);
  console.log('[INFO] Signing AVM micro-settlement...');
  const response = await payer.fetchWithPayment(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(claimPayload),
  });

  if (!response.ok) {
    throw new Error(`Paid request returned HTTP ${response.status}: ${await response.text()}`);
  }

  const settlement = payer.httpClient.getPaymentSettleResponse(name => response.headers.get(name));
  if (!settlement.success) {
    throw new Error(`Payment response received without confirmed settlement: ${JSON.stringify(settlement)}`);
  }

  console.log('\n[SUCCESS] Payment Settled on Algorand TestNet');
  console.log(`- Transaction ID: ${settlement.transaction}`);
  console.log(`- Explorer URL: https://testnet.explorer.perawallet.app/tx/${settlement.transaction}`);
  console.log('\n[ORACLE VERDICT PAYLOAD]');
  console.log(JSON.stringify(await response.json(), null, 2));
}

main().catch(error => {
  console.error(`\n[ERROR] Paid verification failed: ${explainPaymentError(error)}`);
  process.exit(1);
});