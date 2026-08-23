import type { RuntimeConfig } from '../config.js';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderPage(config: RuntimeConfig): string {
  const receiver = escapeHtml(config.payTo);
  const defaultClaim = 'The Eiffel Tower is in Paris.';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TruthGuard Oracle | Machine-to-Machine Verification</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23100d18'/%3E%3Ctext x='16' y='21.5' font-family='monospace' font-size='12' font-weight='700' fill='%23a78bfa' text-anchor='middle'%3ETG%3C/text%3E%3C/svg%3E" />
    <meta name="theme-color" content="#100d18" />
    <link rel="stylesheet" href="/assets/styles.css" />
    <script>window.TRUTHGUARD_CONFIG = ${JSON.stringify({ network: config.network, networkName: config.networkName })};</script>
    <script src="/assets/app.js" defer></script>
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/" aria-label="TruthGuard Oracle">
        <span class="brand-mark">TG</span>
        <span>TruthGuard Oracle</span>
      </a>
      <div class="header-status">
        <span class="status-dot"></span>
        <span>Algorand ${escapeHtml(config.networkName)}</span>
        <span class="header-divider"></span>
        <span>Pera Wallet Payments</span>
      </div>
    </header>
    <main>
      <section class="hero">
        <p class="eyebrow">x402 Agentic Fact-Checking Oracle</p>
        <h1>Autonomous Claim Verification.<br /><span>Machine-Paid Trust.</span></h1>
        <p class="hero-copy">
          Agents and people buy one evidence-first verification at ${escapeHtml(config.price)} USDC. Unverified claims stay unverified—TruthGuard does not invent certainty.
        </p>
      </section>
      <section class="workspace">
        <div class="demo-panel">
          <div class="panel-heading">
            <h2>Live Oracle Verification Flow</h2>
            <span class="testnet-pill">Algorand TestNet Rail</span>
          </div>
          <form id="purchase-form">
            <label for="claim-input">Assertion / Statement to Verify</label>
            <div class="input-row">
              <input
                id="claim-input"
                name="claim"
                value="${escapeHtml(defaultClaim)}"
                spellcheck="false"
                autocomplete="off"
                required
              />
              <button id="purchase-button" type="submit">Pay & Verify with Pera</button>
            </div>
            <div class="wallet-row"><button id="connect-wallet" class="wallet-button" type="button">Connect Pera Wallet</button><span id="wallet-address">Wallet not connected</span></div>
          </form>
          <div class="terms">
            <div><span>Oracle Fee</span><strong id="term-price">${escapeHtml(config.price)} USDC</strong></div>
            <div><span>Settlement Rail</span><strong>Algorand TestNet</strong></div>
            <div><span>Asset ASA</span><strong>ASA ${escapeHtml(config.usdcAssetId)}</strong></div>
            <div><span>Receiver PayTo</span><strong title="${receiver}">${receiver.slice(0, 8)}...${receiver.slice(-6)}</strong></div>
          </div>
          <div class="activity">
            <div class="activity-topline">
              <span>PROTOCOL EXECUTION LOG</span>
              <span id="activity-status">STANDBY</span>
            </div>
            <ol class="steps">
              <li data-step="challenge"><strong>1. Query Oracle</strong><small>POST without proof</small></li>
              <li data-step="terms"><strong>2. Read 402</strong><small>Parse USDC terms</small></li>
              <li data-step="agent"><strong>3. Sign AVM Tx</strong><small>Client wallet signs</small></li>
              <li data-step="settlement"><strong>4. Settle On-Chain</strong><small>GoPlausible facilitator</small></li>
              <li data-step="report"><strong>5. Deliver Proof</strong><small>Unlock verification</small></li>
            </ol>
            <p id="activity-message" class="activity-message">Connect Pera, review the 402 terms, then approve the exact USDC payment in your wallet.</p>
          </div>
        </div>
        <aside class="explainer">
          <h2>Machine-to-Machine Trust</h2>
          <div class="flow-list">
            <div>
              <strong>No Subscriptions / Zero API Keys</strong>
              <small>Autonomous agents procure intelligence dynamically per transaction using native HTTP 402 negotiation.</small>
            </div>
            <div>
              <strong>Sub-Second Finality</strong>
              <small>Algorand settles the micro-transaction in under 500ms, releasing the knowledge payload immediately.</small>
            </div>
            <div>
              <strong>Cryptographic Provenance Proof</strong>
              <small>Every report includes a tamper-evident SHA-256 hash, evidence links, and a settlement receipt.</small>
            </div>
          </div>
        </aside>
      </section>
      <section id="result" class="result" hidden>
        <div class="result-heading">
          <h2>Oracle Verification Verdict</h2>
          <a id="explorer-link" class="explorer-btn" href="#" target="_blank" rel="noreferrer">View On-Chain Settlement</a>
        </div>
        <div class="metrics">
          <article><span>Verdict Status</span><strong id="metric-status">-</strong></article>
          <article><span>Confidence Score</span><strong id="metric-confidence">-</strong></article>
          <article><span>Protocol</span><strong>x402-algorand</strong></article>
          <article><span>Settlement</span><strong>TestNet USDC</strong></article>
        </div>
        <div class="result-bottom">
          <div>
            <span>Oracle Recommendation & Evidence</span>
            <p id="report-summary">-</p>
          </div>
          <div>
            <span>Cryptographic Proof Hash</span>
            <code id="proof-hash">-</code>
            <span style="margin-top: 10px;">Algorand Transaction ID</span>
            <code id="transaction-id">-</code>
          </div>
        </div>
      </section>
    </main>
    <footer>
      <span>TruthGuard Autonomous Oracle</span>
      <span>Algorand x402 Protocol Implementation</span>
    </footer>
  </body>
</html>`;
}
