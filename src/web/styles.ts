export const STYLES = `
:root {
  --bg: #07060b;
  --panel: #100d18;
  --panel-soft: #16121f;
  --panel-inset: #0b0912;
  --panel-border: #262036;
  --text-main: #f5f3ff;
  --text-muted: #a49bbd;
  --purple: #8b5cf6;
  --purple-bright: #a78bfa;
  --purple-glow: rgba(139, 92, 246, 0.22);
  --violet-deep: #6d28d9;
  --green: #34d399;
  --danger: #f87171;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text-main);
  background-color: var(--bg);
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -10%, rgba(109, 40, 217, 0.25), transparent),
    radial-gradient(ellipse 60% 40% at 90% 110%, rgba(139, 92, 246, 0.12), transparent);
  background-attachment: fixed;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

::selection { background: var(--violet-deep); color: #fff; }

.site-header, main, footer {
  width: min(1160px, calc(100% - 48px));
  margin-inline: auto;
}

.site-header {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--panel-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-main);
  text-decoration: none;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.03em;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, var(--purple), var(--violet-deep));
  border-radius: 10px;
  font-family: var(--font-mono);
  font-weight: 900;
  box-shadow: 0 4px 20px var(--purple-glow);
}

.header-status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 10px var(--green);
}

.header-divider {
  width: 1px;
  height: 14px;
  background: var(--panel-border);
}

.hero {
  padding: 64px 0 44px;
  max-width: 860px;
}

.eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: var(--purple-bright);
  letter-spacing: 0.16em;
  margin-bottom: 16px;
  text-transform: uppercase;
  padding: 6px 14px;
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  background: rgba(139, 92, 246, 0.08);
}

h1 {
  margin: 0;
  font-size: clamp(38px, 5.5vw, 62px);
  line-height: 1.06;
  letter-spacing: -0.04em;
  font-weight: 900;
}

h1 span {
  color: var(--purple-bright);
  text-shadow: 0 0 40px var(--purple-glow);
}

.hero-copy {
  margin: 20px 0 0;
  color: var(--text-muted);
  font-size: 17px;
  line-height: 1.65;
  max-width: 700px;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 1fr);
  gap: 0;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-top: 3px solid var(--purple);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55), 0 0 60px rgba(109, 40, 217, 0.08);
}

.demo-panel {
  padding: 36px 40px;
}

.explainer {
  padding: 36px 32px;
  background: var(--panel-soft);
  border-left: 1px solid var(--panel-border);
}

.panel-heading, .result-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 26px;
}

.panel-heading h2, .result-heading h2, .explainer h2 {
  margin: 0;
  font-size: 21px;
  letter-spacing: -0.02em;
}

.testnet-pill {
  padding: 6px 13px;
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: var(--purple-bright);
  background: rgba(139, 92, 246, 0.1);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  white-space: nowrap;
}

form label {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.09em;
  margin-bottom: 10px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.wallet-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 14px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  min-width: 0;
}

#wallet-address {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wallet-button {
  height: 38px;
  padding: 0 16px;
  flex-shrink: 0;
  background: rgba(139, 92, 246, 0.12);
  color: var(--purple-bright);
  border: 1px solid var(--purple);
  border-radius: 9px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;
}

.wallet-button:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.25);
  box-shadow: 0 0 18px var(--purple-glow);
}

input {
  flex: 1;
  min-width: 0;
  height: 52px;
  padding: 0 16px;
  background: var(--panel-inset);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  color: #fff;
  font-family: var(--font-mono);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px var(--purple-glow);
}

button {
  height: 52px;
  padding: 0 26px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--purple), var(--violet-deep));
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 6px 24px var(--purple-glow);
}

button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

button:focus-visible,
input:focus-visible,
.wallet-button:focus-visible,
.explorer-btn:focus-visible {
  outline: 2px solid var(--purple-bright);
  outline-offset: 2px;
}

.terms {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 26px;
}

.terms div {
  padding: 14px 15px;
  background: var(--panel-inset);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  min-width: 0;
}

.terms span {
  display: block;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 5px;
}

.terms strong {
  display: block;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--purple-bright);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity {
  margin-top: 34px;
  border-top: 1px solid var(--panel-border);
  padding-top: 26px;
}

.activity-topline {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
}

#activity-status { color: var(--purple-bright); }

.steps {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 0;
  margin: 20px 0 0;
  list-style: none;
}

.steps li {
  padding: 13px 12px;
  background: var(--panel-inset);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  color: var(--text-muted);
  transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
}

.steps li strong {
  display: block;
  font-size: 12px;
  color: var(--text-main);
  margin-bottom: 3px;
}

.steps li small {
  display: block;
  font-size: 10px;
  line-height: 1.35;
}

.steps li.active {
  border-color: var(--purple);
  box-shadow: 0 0 14px var(--purple-glow);
}

.steps li.done {
  border-color: rgba(52, 211, 153, 0.55);
  background: rgba(52, 211, 153, 0.06);
}

.steps li.done strong { color: var(--green); }

.steps li.failed {
  border-color: var(--danger);
  background: rgba(248, 113, 113, 0.07);
  box-shadow: 0 0 12px rgba(248, 113, 113, 0.2);
}

.activity-message {
  margin-top: 18px;
  padding: 13px 16px;
  background: var(--panel-inset);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-muted);
}

.activity-message.error {
  border-color: rgba(248, 113, 113, 0.5);
  color: #fecaca;
}

.flow-list > div {
  padding: 15px 0;
  border-bottom: 1px solid var(--panel-border);
}

.flow-list > div:last-child { border-bottom: none; }

.flow-list strong {
  display: block;
  font-size: 14px;
  color: var(--text-main);
  margin-bottom: 3px;
}

.flow-list small {
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.result {
  margin-top: 28px;
  padding: 32px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-top: 3px solid var(--purple);
  border-radius: 16px;
}

.result[hidden] { display: none; }

.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin: 26px 0;
}

.metrics article {
  padding: 17px 16px;
  background: var(--panel-inset);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  transition: transform 0.2s, border-color 0.2s;
}

.metrics article:hover {
  transform: translateY(-2px);
  border-color: var(--purple);
}

.metrics span {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 7px;
}

.metrics strong {
  font-size: 19px;
  font-family: var(--font-mono);
  color: var(--purple-bright);
}

.result-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding-top: 22px;
  border-top: 1px solid var(--panel-border);
}

.result-bottom span {
  display: block;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 7px;
}

.result-bottom p {
  margin: 0;
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.55;
}

.result-bottom code {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--purple-bright);
  word-break: break-all;
  margin-bottom: 12px;
}

.explorer-btn {
  display: inline-block;
  padding: 9px 18px;
  border: 1px solid var(--purple);
  color: var(--purple-bright);
  background: rgba(139, 92, 246, 0.08);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 12px;
  border-radius: 9px;
  white-space: nowrap;
  transition: all 0.2s;
}

.explorer-btn:hover {
  background: rgba(139, 92, 246, 0.2);
  box-shadow: 0 0 16px var(--purple-glow);
}

footer {
  display: flex;
  justify-content: space-between;
  padding: 42px 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@media (max-width: 980px) {
  .workspace { grid-template-columns: 1fr; }
  .explainer { border-left: none; border-top: 1px solid var(--panel-border); }
  .terms { grid-template-columns: 1fr 1fr; }
  .steps { grid-template-columns: repeat(2, 1fr); }
  .metrics { grid-template-columns: 1fr 1fr; }
  .result-bottom { grid-template-columns: 1fr; }
  .input-row { flex-direction: column; }
  button[type="submit"] { width: 100%; }
}
`;
