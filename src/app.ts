<<<<<<< HEAD
import { createHash } from 'node:crypto';
=======
>>>>>>> 2bc5af1c52910442c3c72b7d01ec6ff6bc1264af
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { RuntimeConfig } from './config.js';
import { createVerifyClaimHandler, type VerificationRequest } from './routes/verify.js';
<<<<<<< HEAD
import { VerificationEngine, type VerificationResult } from './services/verification.js';
=======
import { VerificationEngine } from './services/verification.js';
>>>>>>> 2bc5af1c52910442c3c72b7d01ec6ff6bc1264af
import { loadBrowserAppScript } from './web/browser-script.js';
import { renderPage } from './web/page.js';
import { STYLES } from './web/styles.js';
import { createX402Middleware } from './x402/config.js';

export type AppEnv = {
  Variables: {
    validatedBody: VerificationRequest;
<<<<<<< HEAD
    verificationPromise?: Promise<VerificationResult>;
    verificationStartedAt?: number;
=======
>>>>>>> 2bc5af1c52910442c3c72b7d01ec6ff6bc1264af
  };
};

export interface AppOptions {
  fetchImpl?: typeof fetch;
}

const UNPAID_RATE_LIMIT = { windowMs: 60_000, max: 30 } as const;
const unpaidHits = new Map<string, number[]>();
<<<<<<< HEAD
const WARM_RESULT_TTL_MS = 60_000;
const WARM_CACHE_MAX = 128;
const warmVerifications = new Map<string, Promise<VerificationResult>>();

function warmCacheKey(claim: string, context?: string): string {
  return createHash('sha256').update(`${claim}\u0000${context ?? ''}`).digest('hex');
}

=======

>>>>>>> 2bc5af1c52910442c3c72b7d01ec6ff6bc1264af
function rateLimitKey(c: Context<AppEnv>): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (unpaidHits.get(key) ?? []).filter(t => now - t < UNPAID_RATE_LIMIT.windowMs);
  if (hits.length >= UNPAID_RATE_LIMIT.max) {
    unpaidHits.set(key, hits);
    return true;
  }
  hits.push(now);
  unpaidHits.set(key, hits);
  if (unpaidHits.size > 10_000) {
    for (const [k, times] of unpaidHits) {
      if (times.every(t => now - t >= UNPAID_RATE_LIMIT.windowMs)) unpaidHits.delete(k);
    }
  }
  return false;
}

export function createApp(config: RuntimeConfig, options: AppOptions = {}) {
  const app = new Hono<AppEnv>();
  const verificationEngine = new VerificationEngine({
    fetchImpl: options.fetchImpl,
    googleFactCheckApiKey: config.googleFactCheckApiKey,
    groqApiKey: config.groqApiKey,
    groqModel: config.groqModel,
  });

  // Security & response headers
  app.use(async (c, next) => {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Referrer-Policy', 'no-referrer');
    c.header('X-Frame-Options', 'DENY');
  });

  // Public Assets & Health Checks
  app.get('/', c => c.html(renderPage(config)));
  app.get('/assets/styles.css', c =>
    c.body(STYLES, 200, { 'Content-Type': 'text/css; charset=utf-8' }),
  );
  app.get('/assets/app.js', c =>
    c.body(loadBrowserAppScript(), 200, { 'Content-Type': 'text/javascript; charset=utf-8' }),
  );
  app.get('/health', c =>
    c.json({ status: 'ok', service: 'truthguard-x402', verificationEngine: verificationEngine.capabilities }),
  );

  // Pre-payment Input Validation (Reject malformed requests with 400 before charging)
  app.use('/api/v1/verify', async (c, next) => {
    if (c.req.method === 'POST') {
      const key = rateLimitKey(c);
      if (isRateLimited(key)) {
        return c.json(
          {
            error: 'rate_limited',
            message: `Too many requests from this address. Limit is ${UNPAID_RATE_LIMIT.max} per ${UNPAID_RATE_LIMIT.windowMs / 1000}s.`,
          },
          429,
        );
      }
      let body: unknown = null;
      try {
        body = await c.req.json();
      } catch {
        return c.json(
          {
            error: 'invalid_payload',
            message: 'Malformed JSON payload. A JSON object with a "claim" string is required.',
          },
          400,
        );
      }

      if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body) ||
        !('claim' in body) ||
        typeof (body as VerificationRequest).claim !== 'string' ||
        (body as VerificationRequest).claim.trim().length === 0
      ) {
        return c.json(
          {
            error: 'invalid_payload',
            message: 'A non-empty "claim" string is required in the request body.',
          },
          400,
        );
      }

      const claimString = (body as VerificationRequest).claim;
      if (claimString.length > 5000) {
        return c.json(
          {
            error: 'payload_too_large',
            message: 'Claim string exceeds the maximum allowed length of 5000 characters.',
          },
          400,
        );
      }

      if (
        'context' in body &&
        (typeof (body as VerificationRequest).context !== 'string' ||
          ((body as VerificationRequest).context?.length ?? 0) > 10_000)
      ) {
        return c.json(
          { error: 'invalid_payload', message: 'Optional "context" must be a string of at most 10,000 characters.' },
          400,
        );
      }

      c.set('validatedBody', body as VerificationRequest);
<<<<<<< HEAD

      // Speculative verification: once a paid attempt arrives, start gathering evidence
      // immediately so it overlaps facilitator verify + on-chain settlement instead of
      // running serially after them. Unpaid 402 probes never trigger this (no waste).
      if (c.req.header('x-payment')) {
        const key = warmCacheKey(claimString, (body as VerificationRequest).context?.trim());
        let promise = warmVerifications.get(key);
        if (!promise) {
          const startedAt = Date.now();
          promise = verificationEngine.verify(claimString.trim(), (body as VerificationRequest).context?.trim());
          promise.catch(() => undefined);
          if (warmVerifications.size >= WARM_CACHE_MAX) {
            const oldest = warmVerifications.keys().next().value;
            if (oldest) warmVerifications.delete(oldest);
          }
          warmVerifications.set(key, promise);
          setTimeout(() => warmVerifications.delete(key), WARM_RESULT_TTL_MS).unref?.();
        }
        c.set('verificationPromise', promise);
        c.set('verificationStartedAt', Date.now());
      }
=======
>>>>>>> 2bc5af1c52910442c3c72b7d01ec6ff6bc1264af
    }
    await next();
  });

  // x402 Payment Middleware
  app.use(createX402Middleware(config));

  // Protected Resource Route
  app.post('/api/v1/verify', createVerifyClaimHandler(verificationEngine));

  app.notFound(c => c.json({ error: 'not_found', message: 'Route not found.' }, 404));

  app.onError((error, c) => {
    console.error(error);
    const message = error.message.toLowerCase();
    if (
      message.includes('facilitator') ||
      message.includes('payment') ||
      message.includes('settle') ||
      message.includes('verify') ||
      message.includes('fetch')
    ) {
      return c.json(
        {
          error: 'payment_service_unavailable',
          message:
            'x402 payment processing is unavailable. Check FACILITATOR_URL, network compatibility, and facilitator status.',
        },
        503,
      );
    }
    return c.json({ error: 'internal_error', message: 'The paid verification oracle could not complete the request.' }, 500);
  });

  return app;
}
