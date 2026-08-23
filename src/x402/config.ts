import { ExactAvmScheme } from '@x402/avm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import type { ResourceServerExtension } from '@x402/core/types';
import { paymentMiddleware, x402ResourceServer } from '@x402/hono';
import { bazaarResourceServerExtension, declareDiscoveryExtension } from '@x402-avm/extensions';
import type { RuntimeConfig } from '../config.js';

export const VERIFY_DESCRIPTION =
  'TruthGuard evidence-first claim verification: fact-check lookup, open knowledge context, and optional evidence-bounded reasoning for agents.';

export function createX402Middleware(config: RuntimeConfig) {
  const facilitator = new HTTPFacilitatorClient({ url: config.facilitatorUrl });
  const server = new x402ResourceServer(facilitator);
  server.register(config.network, new ExactAvmScheme());
  server.registerExtension(bazaarResourceServerExtension as unknown as ResourceServerExtension);

  const discovery = declareDiscoveryExtension({
    bodyType: 'json',
    input: {
      claim: 'The Eiffel Tower is in Paris.',
      context: 'Optional background that is not treated as evidence.',
    },
    inputSchema: {
      type: 'object',
      properties: {
        claim: {
          type: 'string',
          description: 'The statement, factual claim, or data assertion to verify.',
          minLength: 5,
          maxLength: 5000,
        },
        context: {
          type: 'string',
          description: 'Optional background for interpretation. It is never treated as independent factual evidence.',
          maxLength: 10000,
        },
      },
      required: ['claim'],
    },
    output: {
      example: {
        success: true,
        protocol: 'x402-algorand',
        timestamp: '2026-08-21T08:00:00.000Z',
        verificationProofHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        verification: {
          claim: 'The Eiffel Tower is in Paris.',
          verified: true,
          verdict: 'SUPPORTED',
          confidenceScore: 0.86,
          summary: 'A matching ClaimReview supplied a supporting rating.',
          evidence: [{ source: 'google_fact_check', title: 'Example ClaimReview', url: 'https://example.org/fact-check' }],
          aiOrigin: { status: 'NOT_DETERMINABLE' },
        },
      },
    },
  });

  return paymentMiddleware(
    {
      'POST /api/v1/verify': {
        accepts: [
          {
            scheme: 'exact',
            price: config.price,
            network: config.network,
            payTo: config.payTo,
            extra: {
              asset: config.usdcAssetId,
              ...(config.challengeMode ? { tag: 'x402-global-challenge' } : {}),
            },
          },
        ],
        description: VERIFY_DESCRIPTION,
        mimeType: 'application/json',
        extensions: discovery,
      },
    },
    server,
  );
}
