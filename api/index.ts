import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

// Force Node.js runtime (not Edge) so node:crypto, node:fs etc. are available.
export const config = { runtime: 'nodejs' };

// Vercel Serverless Function entrypoint
let app: Hono<any, any, any>;

try {
  const runtimeConfig = loadConfig(process.env);
  app = createApp(runtimeConfig);
} catch (error) {
  // Synchronous fallback app if config fails (e.g., missing PAY_TO_ADDRESS)
  app = new Hono();
  app.all('*', (c) => c.json({ 
    error: 'configuration_error', 
    message: error instanceof Error ? error.message : String(error),
    instructions: 'Please configure this environment variable in your Vercel Project Settings -> Environment Variables.'
  }, 500));
}

// Vercel expects named exports for each HTTP method, plus a default for catch-all
const handler = handle(app);
export default handler;
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
export const HEAD = handler;