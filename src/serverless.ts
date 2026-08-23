import { createApp } from './app.js';
import { loadConfig } from './config.js';

/**
 * Serverless entry (Vercel, etc.): builds the Hono app from environment variables.
 * No dotenv, no listen — the platform provides env vars and the HTTP runtime.
 */
export function createServerlessApp() {
  return createApp(loadConfig());
}
