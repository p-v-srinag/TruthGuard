import './browser-shim.js';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';
import { ExactAvmScheme } from '@x402/avm';
import { wrapFetchWithPayment, x402Client, x402HTTPClient } from '@x402/fetch';

declare global { interface Window { TRUTHGUARD_CONFIG: { network: string; networkName: 'testnet' | 'mainnet' }; } }
type PeraTransaction = { txn: unknown; signers: string[] };
const config = window.TRUTHGUARD_CONFIG;
if (!config) {
  document.getElementById('activity-message')?.replaceChildren('FATAL: page config missing — reload the page.');
  throw new Error('window.TRUTHGUARD_CONFIG is missing.');
}
const pera = new PeraWalletConnect({
  chainId: config.networkName === 'testnet' ? 416002 : 416001,
  shouldShowSignTxnToast: false,
  singleAccount: true,
  experimental: true,
});
let connectedAddress: string | undefined;
const form = document.querySelector<HTMLFormElement>('#purchase-form')!;
const button = document.querySelector<HTMLButtonElement>('#purchase-button')!;
const connectButton = document.querySelector<HTMLButtonElement>('#connect-wallet')!;
const walletText = document.querySelector<HTMLElement>('#wallet-address')!;
const input = document.querySelector<HTMLInputElement>('#claim-input')!;
const statusText = document.querySelector<HTMLElement>('#activity-status')!;
const message = document.querySelector<HTMLElement>('#activity-message')!;
const result = document.querySelector<HTMLElement>('#result')!;
const stepNames = ['challenge', 'terms', 'agent', 'settlement', 'report'];
function stepElement(name: string) { return document.querySelector<HTMLElement>(`[data-step="${name}"]`)!; }
let waitTicker: ReturnType<typeof setInterval> | undefined;
let payCallCount = 0;
function stopWaitTicker() { if (waitTicker) { clearInterval(waitTicker); waitTicker = undefined; } }
function startWaitTicker() { stopWaitTicker(); const started = Date.now(); waitTicker = setInterval(() => { statusText.textContent = `ACTIVE · ${Math.floor((Date.now() - started) / 1000)}s`; }, 1000); }
function uiAwareFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  payCallCount += 1;
  message.textContent = payCallCount <= 1
    ? 'Step 3: Waiting for your approval in the Pera Wallet popup…'
    : 'Signature received — submitting payment proof and running verification…';
  return fetch(input, init);
}
function shortAddress(address: string) { return `${address.slice(0, 8)}…${address.slice(-6)}`; }
function resetSteps() { for (const name of stepNames) stepElement(name).className = ''; result.hidden = true; }
function setStep(name: string, state: string, text?: string) { stepElement(name).className = state; if (text) { message.textContent = text; message.classList.toggle('error', state === 'failed'); } statusText.textContent = state === 'failed' ? 'FAILED' : state === 'done' ? 'PROCESSING' : 'ACTIVE'; }
function decodePaymentRequired(value: string) { const normalized = value.replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(atob(normalized + '='.repeat((4 - (normalized.length % 4)) % 4))); }
function formatPrice(requirement: { amount?: string; extra?: { decimals?: number } }) { return `$${Number(requirement.amount) / 10 ** (requirement.extra?.decimals ?? 6)} USDC`; }
function updateWallet(address?: string) { connectedAddress = address; walletText.textContent = address ? `Connected: ${shortAddress(address)}` : 'Wallet not connected'; connectButton.textContent = address ? 'Disconnect Pera' : 'Connect Pera Wallet'; }
function reportError(error: unknown, prefix = 'ERROR') { console.error(error); const text = error instanceof Error ? error.message : String(error); walletText.textContent = connectedAddress ? `Connected: ${shortAddress(connectedAddress)}` : 'Wallet not connected'; message.textContent = `${prefix}: ${text} — Install the Pera Wallet extension (pera.app) for your browser, or scan the Pera modal QR with the Pera mobile app.`; message.classList.add('error'); }
function isModalClosed(error: unknown): boolean {
  return (error as { data?: { type?: string } } | null)?.data?.type === 'CONNECT_MODAL_CLOSED';
}
async function connectWallet() {
  if (connectedAddress) { connectButton.disabled = true; try { await pera.disconnect(); } finally { connectButton.disabled = false; } updateWallet(); return; }
  connectButton.disabled = true;
  walletText.textContent = 'Opening Pera Wallet… approve in the extension popup, or scan the QR with the Pera app.';
  try {
    const accounts = await pera.connect();
    if (!accounts[0]) throw new Error('Pera did not return an account.');
    updateWallet(accounts[0]);
    message.classList.remove('error');
    message.textContent = `Wallet ${shortAddress(accounts[0])} connected. Enter a claim and approve the x402 payment.`;
  } catch (error) {
    if (isModalClosed(error)) {
      walletText.textContent = 'Wallet not connected';
      message.textContent = 'Connect window was closed. Click Connect Pera Wallet when you are ready.';
    } else { throw error; }
  } finally { connectButton.disabled = false; }
}
function createPeraSigner(address: string) {
  return {
    address,
    async signTransactions(txns: Uint8Array[], indexesToSign?: number[]): Promise<(Uint8Array | null)[]> {
      const indexes = new Set(indexesToSign ?? txns.map((_, index) => index));
      const group: PeraTransaction[] = txns.map((encoded, index) => ({ txn: algosdk.decodeUnsignedTransaction(encoded), signers: indexes.has(index) ? [address] : [] }));
      const signed = (await pera.signTransaction([group] as never, address)) as Array<Uint8Array | null>;
      if (signed.length === txns.length) return txns.map((_, index) => (indexes.has(index) ? signed[index] ?? null : null));
      // Some transports drop foreign-signer slots; remap returned signatures onto our indexes in order.
      const queue = signed[Symbol.iterator]();
      return txns.map((_, index) => (indexes.has(index) ? queue.next().value ?? null : null));
    },
  };
}
function createBrowserPayingClient(address: string) { const client = new x402Client(); client.register(config.network as `${string}:${string}`, new ExactAvmScheme(createPeraSigner(address))); return { fetchWithPayment: wrapFetchWithPayment(uiAwareFetch, client), httpClient: new x402HTTPClient(client) }; }
function renderResult(data: any) { const verification = data.verification; document.querySelector<HTMLElement>('#metric-status')!.textContent = verification.verdict; document.querySelector<HTMLElement>('#metric-confidence')!.textContent = `${Math.round(verification.confidenceScore * 100)}%`; document.querySelector<HTMLElement>('#report-summary')!.textContent = verification.summary; document.querySelector<HTMLElement>('#proof-hash')!.textContent = data.verificationProofHash; document.querySelector<HTMLElement>('#transaction-id')!.textContent = data.settlement.transaction; (document.querySelector<HTMLAnchorElement>('#explorer-link')!).href = data.settlement.explorer; result.hidden = false; result.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
connectButton.addEventListener('click', () => connectWallet().catch(error => reportError(error, 'WALLET CONNECT FAILED')));
pera.reconnectSession().then((accounts: string[]) => { if (accounts[0]) { updateWallet(accounts[0]); message.textContent = `Restored Pera session for ${shortAddress(accounts[0])}.`; } }).catch(() => undefined);
form.addEventListener('submit', async event => { event.preventDefault(); resetSteps(); button.disabled = true; const claim = input.value.trim(); try { if (!connectedAddress) throw new Error('Connect your Pera wallet before approving this x402 payment.'); setStep('challenge', 'active', 'Step 1: Requesting payment terms without payment proof…'); const challenge = await fetch('/api/v1/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claim }) }); if (challenge.status !== 402) { const detail = await challenge.json().catch(() => ({})); throw new Error(detail.message || `Expected HTTP 402, received ${challenge.status}`); } setStep('challenge', 'done', 'HTTP 402 Payment Required received.'); const header = challenge.headers.get('payment-required'); if (!header) throw new Error('Response is missing the payment-required header.'); const requirement = decodePaymentRequired(header).accepts?.[0]; if (!requirement) throw new Error('No supported payment requirement was advertised.'); document.querySelector<HTMLElement>('#term-price')!.textContent = formatPrice(requirement); setStep('terms', 'done', `Terms accepted: ${formatPrice(requirement)} on Algorand ${config.networkName}.`); setStep('agent', 'active', 'Step 3: Review and sign the payment in Pera Wallet…'); payCallCount = 0; startWaitTicker(); const payer = createBrowserPayingClient(connectedAddress); const response = await payer.fetchWithPayment('/api/v1/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ claim }) }); if (!response.ok) throw new Error(`Paid request returned HTTP ${response.status}: ${await response.text()}`); setStep('agent', 'done', 'Payment authorization signed by your Pera wallet.'); setStep('settlement', 'active', 'Step 4: Facilitator is settling the approved USDC transfer…'); const settlement = payer.httpClient.getPaymentSettleResponse(name => response.headers.get(name)); if (!settlement.success || !settlement.transaction) throw new Error('No successful x402 settlement receipt was returned.'); const data = await response.json(); data.settlement = { transaction: settlement.transaction, explorer: `https://${config.networkName === 'testnet' ? 'testnet.' : ''}explorer.perawallet.app/tx/${settlement.transaction}` }; setStep('settlement', 'done', `Settled in transaction ${settlement.transaction.slice(0, 12)}…`); setStep('report', 'done', `Step 5: Evidence report delivered (${data.latencyMs}ms verification latency).`); statusText.textContent = 'SETTLED & DELIVERED'; renderResult(data); } catch (error) { const active = document.querySelector<HTMLElement>('.steps li.active'); if (active) active.className = 'failed'; statusText.textContent = 'ERROR'; message.textContent = error instanceof Error ? error.message : String(error); } finally { stopWaitTicker(); button.disabled = false; } });
