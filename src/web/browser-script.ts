import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const candidates = [
  resolve(moduleDir, '..', '..', 'public', 'assets', 'app.js'),
  resolve(process.cwd(), 'public', 'assets', 'app.js'),
  resolve(process.cwd(), 'dist', 'web', 'app.js'),
];

export function loadBrowserAppScript(): string {
  for (const candidate of candidates) {
    if (existsSync(candidate)) return readFileSync(candidate, 'utf8');
  }
  return 'console.error("TruthGuard browser bundle is missing. Run pnpm bundle:web before starting the server.");';
}
