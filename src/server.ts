import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

try {
  const config = loadConfig();
  const app = createApp(config);

  const server = serve({ fetch: app.fetch, port: config.port }, info => {
    console.log(`TruthGuard x402 running on http://localhost:${info.port}`);
    console.log('Health endpoint: /health');
    console.log('Protected endpoint: POST /api/v1/verify');
    console.log(`Payment network: Algorand ${config.networkName}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
      console.log(`\n${signal} received — shutting down…`);
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 2_000).unref();
    });
  }
} catch (error) {
  console.error(`x402 Commerce Template could not start: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
