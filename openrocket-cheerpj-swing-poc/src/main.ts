import './styles.css';
import { createLauncher, type LaunchResult } from './launcher';
import { buildDiagnosticsSession, logRuntimeSummary } from './diagnostics';

const app = document.getElementById('app');

if (!app) {
  throw new Error('App root is missing.');
}

const diagnostics = buildDiagnosticsSession();

diagnostics.mark('page-load');
app.innerHTML = `
  <div class="page-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">OpenRocket + CheerpJ</p>
        <h1>Swing compatibility prototype</h1>
      </div>
      <button id="launch-button" type="button">Launch Swing test</button>
    </header>
    <main class="content-grid">
      <section class="panel overview-panel">
        <h2>Research status</h2>
        <p class="muted">
          This scaffold verifies that the runtime can initialize, load the browser bridge, and prepare the path toward launching the actual OpenRocket Swing app.
        </p>
        <ul class="status-list">
          <li>CheerpJ loader script loaded</li>
          <li>Browser document initialized</li>
          <li>Runtime manifest ready</li>
          <li>Launch path prepared</li>
        </ul>
        <div class="meta-box">
          <strong>Target runtime:</strong>
          <span>CheerpJ 4.3</span>
        </div>
      </section>

      <section class="panel launcher-panel">
        <h2>Launcher</h2>
        <div id="status" aria-live="polite">Waiting for launch...</div>
        <div class="actions">
          <button id="launch-button-secondary" type="button" class="secondary">Run sample launch</button>
        </div>
        <div id="cheerpj-display" class="display-slot"></div>
      </section>
    </main>
    <section class="panel log-panel">
      <h2>Diagnostics</h2>
      <pre id="diagnostics-output"></pre>
    </section>
  </div>
`;

const statusEl = document.getElementById('status');
const displayEl = document.getElementById('cheerpj-display');
const logEl = document.getElementById('diagnostics-output');

if (!statusEl || !displayEl || !logEl) {
  throw new Error('Required diagnostics nodes are missing.');
}

const launchHandler = async (): Promise<LaunchResult> => {
  const launcher = createLauncher({
    statusElement: statusEl,
    displayElement: displayEl,
    diagnostics,
  });

  const result = await launcher.launch();
  const text = logRuntimeSummary(diagnostics);
  logEl.textContent = text;
  return result;
};

const launchButton = document.getElementById('launch-button');
const secondaryButton = document.getElementById('launch-button-secondary');

if (launchButton) {
  launchButton.addEventListener('click', () => {
    void launchHandler();
  });
}

if (secondaryButton) {
  secondaryButton.addEventListener('click', () => {
    void launchHandler();
  });
}

logEl.textContent = logRuntimeSummary(diagnostics);
