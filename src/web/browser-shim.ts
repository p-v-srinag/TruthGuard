/** Browser shims for Node core globals used by bundled polyfills. Must be imported first. */
type MinimalProcess = {
  env: Record<string, string | undefined>;
  nextTick: (fn: () => void) => void;
  browser?: boolean;
  version?: string;
};

type BrowserGlobal = Omit<typeof globalThis, 'process' | 'global'> & {
  process?: MinimalProcess;
  global?: unknown;
};

const g = globalThis as BrowserGlobal;

if (!g.process) {
  const minimal: MinimalProcess = {
    env: {},
    nextTick: (fn: () => void) => Promise.resolve().then(fn),
    browser: true,
    version: '',
  };
  g.process = minimal;
}
if (!g.global) g.global = globalThis;

export {};
