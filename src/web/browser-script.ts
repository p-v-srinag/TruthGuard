import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FALLBACK_SCRIPT = 'console.error("TruthGuard browser bundle is missing. Run pnpm bundle:web before starting the server.");';

let cachedScript: string | undefined;

export function loadBrowserAppScript(): string {
  if (cachedScript !== undefined) return cachedScript;

  const candidates = [
    resolve(process.cwd(), 'public', 'assets', 'app.js'),
    resolve(process.cwd(), 'dist', 'web', 'app.js'),
  ];

  for (const candidate of candidates) {
    try {
      if (existsSync(candidate)) {
        cachedScript = readFileSync(candidate, 'utf8');
        return cachedScript;
      }
    } catch {
      // Skip inaccessible paths
    }
  }

  cachedScript = FALLBACK_SCRIPT;
  return cachedScript;
}
