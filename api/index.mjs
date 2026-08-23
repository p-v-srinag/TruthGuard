// Vercel Node function entry. Imports the compiled ESM output (dist/src) so the
// bundler never has to rewrite TypeScript's ".js" import specifiers.
import { handle } from 'hono/vercel';
import { createServerlessApp } from '../dist/src/serverless.js';

const app = createServerlessApp();

export const GET = handle(app);
export const POST = handle(app);
