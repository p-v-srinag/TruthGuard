import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { VerificationEngine } from '../src/services/verification.js';
import { testConfig } from './config.js';

describe('TruthGuard x402 Verification API - Edge Cases & Security', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>(async input => {
        const url = String(input);
        if (url.endsWith('/supported')) {
          return Response.json({
            kinds: [
              {
                x402Version: 2,
                scheme: 'exact',
                network: testConfig.network,
                extra: { feePayer: testConfig.payTo },
              },
            ],
            extensions: [],
            signers: { 'algorand:*': [testConfig.payTo] },
          });
        }
        throw new Error(`Unexpected facilitator request: ${url}`);
      }),
    );
  });

  // Section 1: Public Routes & Routing Bounds
  it('keeps health endpoint public and operational', async () => {
    const response = await createApp(testConfig).request('/health');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: 'ok',
      service: 'truthguard-x402',
      verificationEngine: {
        googleFactCheck: false,
        openKnowledgeContext: true,
        groqReasoning: false,
        groqModel: 'openai/gpt-oss-20b',
      },
    });
  });

  it('serves styles and script assets correctly', async () => {
    const app = createApp(testConfig);
    const [page, styles, script] = await Promise.all([
      app.request('/'),
      app.request('/assets/styles.css'),
      app.request('/assets/app.js'),
    ]);
    expect(page.status).toBe(200);
    expect(styles.headers.get('content-type')).toContain('text/css');
    expect(script.headers.get('content-type')).toContain('text/javascript');
  });

  it('returns structured JSON 404 for nonexistent routes', async () => {
    const response = await createApp(testConfig).request('/api/v1/nonexistent');
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: 'not_found' });
  });

  // Section 2: Input Validation Edge Cases (Pre-x402 gate)
  it('rejects an empty claim string with HTTP 400', async () => {
    const response = await createApp(testConfig).request('/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: '' }),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_payload' });
  });

  it('rejects a whitespace-only claim with HTTP 400', async () => {
    const response = await createApp(testConfig).request('/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: '     ' }),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_payload' });
  });

  it('rejects payloads missing the claim key with HTTP 400', async () => {
    const response = await createApp(testConfig).request('/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otherKey: 'data' }),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_payload' });
  });

  it('rejects non-string claim types (number, boolean, object) with HTTP 400', async () => {
    const app = createApp(testConfig);
    const testCases = [{ claim: 12345 }, { claim: true }, { claim: { nested: 'claim' } }];

    for (const body of testCases) {
      const response = await app.request('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({ error: 'invalid_payload' });
    }
  });

  it('rejects top-level array JSON bodies with HTTP 400', async () => {
    const response = await createApp(testConfig).request('/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ claim: 'Array payload' }]),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_payload' });
  });

  it('rejects malformed raw JSON strings with HTTP 400', async () => {
    const response = await createApp(testConfig).request('/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"claim": "unclosed json string',
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_payload' });
  });

  it('rejects oversized claim strings exceeding 5000 characters with HTTP 400', async () => {
    const longClaim = 'A'.repeat(5001);
    const response = await createApp(testConfig).request('/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: longClaim }),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'payload_too_large' });
  });

  // Section 3: x402 Protocol & Payment Challenge Checks
  it('returns HTTP 402 challenge with valid payment requirements for unpaid valid claim', async () => {
    const response = await createApp(testConfig).request('/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: 'Algorand provides instant finality.' }),
    });
    expect(response.status).toBe(402);
    const header = response.headers.get('payment-required');
    expect(header).toBeTruthy();

    const decoded = JSON.parse(Buffer.from(header!, 'base64url').toString('utf8'));
    expect(decoded.accepts).toBeDefined();
    expect(decoded.accepts[0].network).toBe(testConfig.network);
    expect(decoded.accepts[0].payTo).toBe(testConfig.payTo);
  });

  it('embeds x402-global-challenge tag when challengeMode is enabled', async () => {
    const app = createApp({ ...testConfig, challengeMode: true });
    const response = await app.request('/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: 'Algorand settlement verification.' }),
    });
    expect(response.status).toBe(402);

    const encoded = response.headers.get('payment-required');
    const paymentRequired = JSON.parse(Buffer.from(encoded!, 'base64url').toString('utf8'));
    expect(paymentRequired.accepts[0]?.extra?.tag).toBe('x402-global-challenge');
  });

  // Section 4: Browser payments never use a server-held payer wallet
  it('does not expose the retired server-side demo buyer endpoint', async () => {
    const response = await createApp(testConfig).request('/demo/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: 'Test assertion' }),
    });
    expect(response.status).toBe(404);
  });

  // Section 5: Evidence-first Verification Engine
  it('uses a matching ClaimReview as evidence instead of hard-coded keyword rules', async () => {
    const engine = new VerificationEngine({
      googleFactCheckApiKey: 'test-key',
      fetchImpl: vi.fn<typeof fetch>(async input => {
        expect(String(input)).toContain('factchecktools.googleapis.com');
        return Response.json({
          claims: [{
            text: 'Vaccines contain microchips.',
            claimReview: [{
              publisher: { name: 'Example Fact Check' },
              textualRating: 'False',
              url: 'https://example.test/fact-check',
              title: 'Vaccines do not contain tracking microchips',
            }],
          }],
        });
      }),
    });

    const result = await engine.verify('Vaccines contain microchips.');
    expect(result.verdict).toBe('REFUTED');
    expect(result.confidenceScore).toBeGreaterThan(0.8);
    expect(result.evidence[0]).toMatchObject({ source: 'google_fact_check', url: 'https://example.test/fact-check' });
  });

  it('does not mark an uncorroborated claim as verified', async () => {
    const engine = new VerificationEngine({
      fetchImpl: vi.fn<typeof fetch>(async () => Response.json({ search: [] })),
    });
    const result = await engine.verify('An unsupported assertion with no matching fact check.');
    expect(result.verdict).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.confidenceScore).toBe(0);
  });

  it('collects open-knowledge context from Wikipedia without any API keys', async () => {
    const engine = new VerificationEngine({
      fetchImpl: vi.fn<typeof fetch>(async input => {
        const url = String(input);
        if (url.includes('en.wikipedia.org')) {
          return Response.json({
            query: {
              search: [
                {
                  title: 'Eiffel Tower',
                  snippet: 'The <span>Eiffel Tower</span> is a wrought-iron lattice tower in Paris.',
                  timestamp: '2026-01-01T00:00:00Z',
                },
              ],
            },
          });
        }
        return Response.json({ search: [] });
      }),
    });

    const result = await engine.verify('The Eiffel Tower is in Paris.');
    expect(result.layersUsed).toContain('open_knowledge_context');
    expect(result.evidence[0]).toMatchObject({ source: 'wikipedia', title: 'Eiffel Tower' });
    expect(result.evidence[0].excerpt).not.toContain('<span>');
    // Context alone must never produce a verified verdict.
    expect(result.verdict).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.warnings.some(w => w.includes('No independent ClaimReview'))).toBe(true);
  });

  it('runs evidence-bounded Groq reasoning only after retrieval and caps its confidence', async () => {
    const requestedUrls: string[] = [];
    const engine = new VerificationEngine({
      groqApiKey: 'test-groq-key',
      fetchImpl: vi.fn<typeof fetch>(async input => {
        const url = String(input);
        requestedUrls.push(url);
        if (url.includes('en.wikipedia.org')) {
          return Response.json({
            query: { search: [{ title: 'Eiffel Tower', snippet: 'A lattice tower in Paris, France.' }] },
          });
        }
        if (url === 'https://api.groq.com/openai/v1/chat/completions') {
          return Response.json({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    verdict: 'SUPPORTED',
                    confidence: 0.99,
                    summary: 'Wikipedia confirms the Eiffel Tower is in Paris.',
                  }),
                },
              },
            ],
          });
        }
        return Response.json({ search: [] });
      }),
    });

    const result = await engine.verify('The Eiffel Tower is in Paris.');
    expect(requestedUrls.some(u => u.includes('wikipedia'))).toBe(true);
    expect(result.layersUsed).toEqual(['open_knowledge_context', 'groq_reasoning']);
    expect(result.verdict).toBe('SUPPORTED');
    expect(result.confidenceScore).toBeLessThanOrEqual(0.75);
    expect(result.evidence.at(-1)).toMatchObject({ source: 'groq_reasoning' });
  });

  it('ignores tangential ClaimReviews that merely share entities with a true claim', async () => {
    const engine = new VerificationEngine({
      googleFactCheckApiKey: 'test-key',
      fetchImpl: vi.fn<typeof fetch>(async input => {
        const url = String(input);
        if (url.includes('factchecktools.googleapis.com')) {
          return Response.json({
            claims: [{
              text: 'A photo shows tourists taking selfies in front of the Eiffel Tower during the 2024 Paris Olympics opening ceremony.',
              claimReview: [{
                publisher: { name: 'Rappler' },
                textualRating: 'False',
                url: 'https://example.test/photo-hoax',
                title: 'Photo of Eiffel Tower at Paris event is not authentic',
              }],
            }],
          });
        }
        return Response.json({ search: [] });
      }),
    });

    const result = await engine.verify('The Eiffel Tower is in Paris.');
    expect(result.verdict).not.toBe('REFUTED');
    expect(result.layersUsed).not.toContain('google_fact_check');
    expect(result.warnings.some(w => w.includes('closely matched'))).toBe(true);
  });

  it('rejects ClaimReviews whose polarity contradicts the claim wording', async () => {
    const engine = new VerificationEngine({
      googleFactCheckApiKey: 'test-key',
      fetchImpl: vi.fn<typeof fetch>(async input => {
        const url = String(input);
        if (url.includes('factchecktools.googleapis.com')) {
          return Response.json({
            claims: [{
              text: 'The Great Wall of China is not visible from space with the naked eye.',
              claimReview: [{
                publisher: { name: 'Example Fact Check' },
                textualRating: 'True',
                url: 'https://example.test/great-wall',
                title: 'Great Wall visibility myth',
              }],
            }],
          });
        }
        return Response.json({ search: [] });
      }),
    });

    const result = await engine.verify('The Great Wall of China is visible from space.');
    expect(result.verdict).toBe('INSUFFICIENT_EVIDENCE');
    expect(result.layersUsed).not.toContain('google_fact_check');
  });
});
