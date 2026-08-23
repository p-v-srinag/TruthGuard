import 'dotenv/config';

const baseUrl = (process.env.API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const health = await fetch(`${baseUrl}/health`);
if (!health.ok) throw new Error(`/health returned HTTP ${health.status}`);
console.log('✓ /health returned 200');

const unpaid = await fetch(`${baseUrl}/api/v1/verify`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ claim: 'Algorand settlement test.' }),
});

if (unpaid.status !== 402) throw new Error(`Protected route returned HTTP ${unpaid.status}, expected 402`);
console.log('✓ Protected /api/v1/verify endpoint returned HTTP 402 without payment');