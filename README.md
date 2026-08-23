# TruthGuard x402

TruthGuard is a paid, evidence-first claim verification API. It uses x402 on Algorand: an unpaid request receives HTTP 402 terms, a buyer signs an exact USDC authorization, GoPlausible settles it, and only then TruthGuard returns the report.

The browser buyer connects its own Pera Wallet. Its private key never reaches this server; `CLIENT_MNEMONIC` is only for optional disposable TestNet CLI-agent tests.


## Start Here

Fork this repository to your GitHub account (recommended for customization and contributions), or clone it directly if you're just trying it locally.

```bash
git clone <repo-url>
cd x402-commerce-template
```

Then install dependencies, configure your environment, and start the development server:

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Then fill in `.env`:

```env
ALGORAND_NETWORK=testnet
PAY_TO_ADDRESS=YOUR_RECEIVER_TESTNET_ADDRESS
CLIENT_MNEMONIC="your disposable payer wallet 25-word mnemonic"
GOOGLE_FACTCHECK_API_KEY=OPTIONAL_SERVER_ONLY_KEY
GROQ_API_KEY=OPTIONAL_SERVER_ONLY_KEY
```

Open `http://localhost:3000` to run the visual demo.

## Participant Flow

1. Fill `PROJECT_BRIEF.md` with the agentic commerce idea.
2. Ask an AI coding agent to read `AGENTS.md`, `skills.md`, and the project brief.
3. Configure `.env`.
4. Run `pnpm dev`.
5. Test unpaid and paid flows.
6. Customize the paid resource, Bazaar metadata, clients, dashboard, and tests.

Open `http://localhost:3000`, connect Pera, enter a claim, inspect the HTTP 402 terms, and approve the payment in Pera. The protected resource is `POST /api/v1/verify`.

TruthGuard returns `SUPPORTED`, `REFUTED`, or `INSUFFICIENT_EVIDENCE`. A keyword match, writing style, or an AI-text detector never becomes a factual verdict.

## Evidence providers and API keys

Layer 1 applies **relevance gating**: a ClaimReview is treated as authoritative only when its reviewed wording closely matches the submitted claim (token-overlap plus polarity checks). Tangential search hits that merely share entities — e.g., an unrelated "Eiffel Tower photo hoax" rating — are discarded, so true claims are never refuted by someone else's false claim.

Open-knowledge context (Wikipedia full-text search plus Wikidata entity lookup) works without any key. For useful published-fact-check matches, enable Google Fact Check Tools: create or select a Google Cloud project, enable **Fact Check Tools API**, create a restricted server API key under **APIs & Services → Credentials**, then put it in `.env` as `GOOGLE_FACTCHECK_API_KEY`. The API's `claims:search` endpoint is the source TruthGuard calls. See [Google's API reference](https://developers.google.com/fact-check/tools/api/reference/rest/).

`GROQ_API_KEY` is optional. Create a Groq Console key at [Groq Quickstart](https://console.groq.com/docs/quickstart) and add it only to `.env`. TruthGuard uses it only to synthesize retrieved evidence, caps its confidence, and does not send the key to the browser. Do not put either key in frontend code or commit `.env`.

For Pera payments, install or open Pera Wallet, select the same network as the service, fund the buyer with ALGO for fees and the matching USDC, and opt in to that USDC ASA. Select **Connect Pera Wallet** on the site and approve the exact x402 payment. The receiver remains `PAY_TO_ADDRESS`.

## What x402 Payment Needs

| Piece | Where |
| --- | --- |
| Public paid route | `src/app.ts` and `src/routes/verify.ts` |
| Payment middleware | `src/x402/config.ts` |
| Facilitator | `FACILITATOR_URL`, defaults to GoPlausible |
| Receiver wallet | `PAY_TO_ADDRESS` |
| Payment asset | USDC ASA from `@x402/avm` |
| Browser payer signer | Connected Pera Wallet; signing occurs in the browser |
| CLI payer signer | `CLIENT_MNEMONIC` for local TestNet clients only |
| Buyer client | `client/paid-client.ts` and `client/agent-client.ts` |
| Bazaar metadata | `src/x402/config.ts` |
| Visual simulator | `pnpm simulate` and browser dashboard |

## Deployment (Vercel)

The same codebase runs locally (`pnpm dev`) and on Vercel with no code changes.

- `vercel.json` runs `pnpm build` (bundles the browser client into `public/assets/app.js`, compiles TS to `dist/src`), then routes all traffic to `api/index.mjs`, a Hono-on-Vercel handler importing the compiled app.
- Static assets under `public/` are served from Vercel's CDN automatically; everything else (page, `/health`, `/api/v1/verify`) flows through the serverless function.
- Set these environment variables in the Vercel dashboard (Project → Settings → Environment Variables):

| Variable | Required | Notes |
| --- | --- | --- |
| `PAY_TO_ADDRESS` | yes | Public receiver address only — never a mnemonic |
| `ALGORAND_NETWORK` | yes | `testnet` or `mainnet` |
| `PRICE_USDC` | no | Defaults to the template price if unset |
| `FACILITATOR_URL` | no | Defaults to GoPlausible |
| `GOOGLE_FACTCHECK_API_KEY` | recommended | Enables Layer 1 ClaimReview evidence |
| `GROQ_API_KEY` / `GROQ_MODEL` | optional | Enables Layer 3 reasoning synthesis |
| `CHALLENGE_MODE` | optional | Global challenge mode toggle |

- **Never** set `CLIENT_MNEMONIC` on Vercel. Paying clients keep their keys locally; browser payers sign with Pera Wallet.
- The in-memory rate limiter is per serverless instance; add a shared store if you need strict global limits.
- Deploy: `npx vercel --prod`.

## Included Tools

```bash
pnpm build
pnpm test
pnpm smoke
pnpm simulate
pnpm x402 inspect
pnpm x402 checklist
pnpm sandbox
AGENT_SANDBOX_PAY=true pnpm sandbox
pnpm client:unpaid
pnpm client:paid
pnpm client:agent
```

## Folder Map

```text
.
├── AGENTS.md
├── skills.md
├── PROJECT_BRIEF.md
├── client/
├── contracts/templates/
├── docs/resources/
├── sdk/
├── scripts/
├── src/
└── test/
```

## Add Your Own Paid Resource

Ask your AI agent:

```text
Read AGENTS.md, skills.md, and PROJECT_BRIEF.md. Build the paid x402 service described in the brief. Keep the default x402 lifecycle intact, update Bazaar metadata, update the browser demo, and verify with build/tests/smoke/simulator.
```

The agent should change:

- `src/routes/*` for business logic.
- `src/app.ts` for route registration and pre-payment validation.
- `src/x402/config.ts` for payment terms and Bazaar metadata.
- `client/lib.ts` and clients for the buyer URL.
- `src/web/*` for the visual demo.
- `test/*` for route behavior.

## Resources

- `docs/resources/X402_PRIMER.md`
- `docs/resources/ALGORAND_PAYMENT_REQUIREMENTS.md`
- `docs/resources/GOPLAUSIBLE_FACILITATOR.md`
- `docs/resources/BAZAAR_DISCOVERY.md`
- `docs/resources/AGENTIC_COMMERCE_PATTERNS.md`
- `docs/resources/TROUBLESHOOTING_PLAYBOOK.md`
- `docs/resources/IMPLEMENTATION_MAP.md`
- `docs/resources/TECH_STACK.md`
- x402 docs: https://docs.x402.org/introduction
- Algorand x402 guide: https://dev.algorand.co/resources/x402-on-algorand/
- GoPlausible resource catalog: https://facilitator.goplausible.xyz/dashboard/leaderboards?cat=resources

## Safety

- Do not commit `.env`.
- Do not log mnemonics.
- Use disposable TestNet wallets locally.
- Keep payer and receiver as different accounts.
- The website never uses `CLIENT_MNEMONIC`; it uses the connected Pera Wallet.
- Reject invalid input before payment middleware.
