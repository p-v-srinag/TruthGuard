# Project Brief

Participants fill this in first. AI agents should read this file before changing code.

## Service

- Name: TruthGuard x402
- One-line description: Evidence-first claim verification for agents and people, paid per report with Algorand USDC.
- Paid route: POST /api/v1/verify
- Price in USDC: $0.001
- Network for local testing: Algorand TestNet
- Intended production network: Algorand MainNet after TestNet settlement validation

## Buyer

- Who or what pays for this? AI agents, research tools, and users who need one bounded verification report.
- Why would an autonomous agent buy it? It receives structured evidence, an explicit confidence limit, and a settlement receipt before acting on a claim.
- What policy should an agent use before paying? Require the advertised Algorand network, expected USDC ASA, expected receiver, a price at or below its budget, and a claim that warrants verification.

## Input

Describe each input field, validation rule, and example value.

```json
{
  "claim": "The Eiffel Tower is in Paris.",
  "context": "Optional background only; it is never accepted as independent evidence."
}
```

## Output

Describe the response returned after settlement.

```json
{
  "verification": {
    "verdict": "SUPPORTED | REFUTED | INSUFFICIENT_EVIDENCE",
    "confidenceScore": 0.86,
    "evidence": [{ "source": "google_fact_check", "url": "https://example.org/fact-check" }]
  }
}
```

## Data Sources Or Actions

- External APIs: Google Fact Check Tools API when configured; keyless Wikipedia full-text search and Wikidata entity lookup for context; optional Groq evidence-bounded reasoning.
- On-chain reads: No direct resource reads; GoPlausible settles the Algorand USDC payment.
- Off-chain computation: Evidence retrieval, rating normalization, optional constrained reasoning, SHA-256 report hash.
- Side effects after payment: An evidence report is generated only after x402 verification and settlement.

## Bazaar Metadata

- Search keywords: claim verification, fact check, evidence, misinformation, agent safety, Algorand x402.
- Input schema: `claim` string 1–5,000 chars; optional `context` string up to 10,000 chars.
- Output example: See the Output section and `src/x402/config.ts`.
- Trust or freshness notes: A knowledge-graph hit alone never verifies a claim. Without a matching fact check (or bounded reasoning over retrieved evidence), the verdict is `INSUFFICIENT_EVIDENCE`.

## Deployment Notes

- Required env vars: `PAY_TO_ADDRESS`; optionally `GOOGLE_FACTCHECK_API_KEY` and `GROQ_API_KEY`. `CLIENT_MNEMONIC` is CLI-only and never used by the website.
- TestNet readiness: Receiver and Pera payer each need TestNet ALGO, opt-in to TestNet USDC ASA 10458941, and the payer needs USDC.
- MainNet readiness: Use a MainNet receiver opted into MainNet USDC, and complete a public HTTPS paid flow.
- Known risks: Public search sources can be unavailable or incomplete. AI-text-origin detection is intentionally not offered as a factual verdict.
