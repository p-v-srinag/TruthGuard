import { createHash } from 'node:crypto';
import type { Context } from 'hono';
import type { AppEnv } from '../app.js';
import { VerificationEngine, type VerificationResult } from '../services/verification.js';

export interface VerificationRequest {
  claim: string;
  context?: string;
}

export function createVerifyClaimHandler(engine: VerificationEngine) {
  return async (c: Context<AppEnv>) => {
    const startedAt = Date.now();
    const body = c.get('validatedBody');
    const claim = body.claim.trim();
    const warmed = c.get('verificationPromise');
    const verificationStartedAt = c.get('verificationStartedAt') ?? startedAt;
    let verification: VerificationResult;
    if (warmed) {
      verification = await warmed;
    } else {
      verification = await engine.verify(claim, body.context?.trim());
    }
    const timestamp = new Date().toISOString();
    const proofPayload = JSON.stringify({ claim, timestamp, verification });

    return c.json({
      success: true,
      protocol: 'x402-algorand',
      timestamp,
      latencyMs: Date.now() - startedAt,
      verificationMs: Date.now() - verificationStartedAt,
      verificationProofHash: createHash('sha256').update(proofPayload).digest('hex'),
      verification: {
        claim,
        verified: verification.verdict === 'SUPPORTED',
        verdict: verification.verdict,
        confidenceScore: verification.confidenceScore,
        summary: verification.summary,
        evidence: verification.evidence,
        layersUsed: verification.layersUsed,
        warnings: verification.warnings,
        aiOrigin: {
          status: 'NOT_DETERMINABLE',
          message: 'Text-only AI-authorship detection is not reliable enough to be used as evidence. TruthGuard does not make a binary AI-origin claim.',
        },
      },
    });
  };
}
