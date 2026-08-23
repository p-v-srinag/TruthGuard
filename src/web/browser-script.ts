import { existsSync, readFileSync } from 'node:fs';
<<<<<<< HEAD
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
=======
import { resolve } from 'node:path';

const browserBundlePath = resolve(process.cwd(), 'dist', 'web', 'app.js');

export function loadBrowserAppScript(): string {
  if (existsSync(browserBundlePath)) return readFileSync(browserBundlePath, 'utf8');
>>>>>>> 2bc5af1c52910442c3c72b7d01ec6ff6bc1264af
  return 'console.error("TruthGuard browser bundle is missing. Run pnpm bundle:web before starting the server.");';
}
