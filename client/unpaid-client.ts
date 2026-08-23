import 'dotenv/config';
import { readPaymentRequired, resourceUrl } from './lib.js';

async function main() {
  const url = resourceUrl();
  console.log('[INFO] Requesting TruthGuard Oracle without payment proof...');
  console.log(`[INFO] Endpoint URL: ${url}\n`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ claim: 'Testing unpaid challenge handling.' }),
  });

  console.log(`HTTP ${response.status} ${response.statusText}`);
  if (response.status !== 402) {
    console.log(await response.text());
    throw new Error('Expected HTTP 402. Verify that the route is gated by x402.');
  }

  const requirement = readPaymentRequired(response);
  console.log('\n[SUCCESS] Successfully received x402 Payment Challenge:');
  if (requirement) {
    console.log(`- Service: ${requirement.description}`);
    console.log(`- Price: ${requirement.price} USDC`);
    console.log(`- Network: ${requirement.network}`);
    console.log(`- Asset: ${requirement.asset}`);
  }
}

main().catch(error => {
  console.error(`\n[ERROR] Unpaid challenge failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});