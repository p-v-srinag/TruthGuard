import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';

// Vercel Serverless Function entrypoint
let app: Hono<any, any, any>;

try {
  const config = loadConfig(process.env);
  app = createApp(config);
} catch (error) {
  // Synchronous fallback app if config fails (e.g., missing PAY_TO_ADDRESS)
  app = new Hono();
  app.all('*', (c) => c.json({ 
    error: 'configuration_error', 
    message: error instanceof Error ? error.message : String(error),
    instructions: 'Please configure this environment variable in your Vercel Project Settings -> Environment Variables.'
  }, 500));
}

export default handle(app);