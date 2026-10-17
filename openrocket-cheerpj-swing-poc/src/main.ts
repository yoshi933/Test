import './styles.css';
import { createLauncher } from './launcher';
import { buildDiagnosticsSession } from './diagnostics';

const app = document.getElementById('app');

if (!app) {
  throw new Error('App root is missing.');
}

const consoleEntries: string[] = [];

app.innerHTML = `
  <main class="openrocket-window" aria-label="OpenRocket">
    <div id="cheerpj-display"></div>
    <div id="status" role="status" aria-live="polite">Starting OpenRocket...</div>
    <section id="runtime-console" aria-label="Runtime console" hidden>
      <header>
        <strong>OpenRocket Console</strong>
        <button id="clear-console" type="button">Clear</button>
      </header>
      <pre id="console-output"></pre>
    </section>
  </main>
`;

const statusElement = document.getElementById('status');
const displayElement = document.getElementById('cheerpj-display');
const runtimeConsole = document.getElementById('runtime-console');
const consoleOutput = document.getElementById('console-output');
const clearConsole = document.getElementById('clear-console');

if (!statusElement || !displayElement || !runtimeConsole || !consoleOutput || !clearConsole) {
  throw new Error('Required OpenRocket display nodes are missing.');
}

const appendConsole = (entry: string) => {
  consoleEntries.push(`[${new Date().toLocaleTimeString()}] ${entry}`);
  consoleOutput.textContent = consoleEntries.join('\n');
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
};

appendConsole(`Page loaded: ${location.href}`);
appendConsole(`Viewport: ${window.innerWidth}x${window.innerHeight}`);

const toggleConsole = () => {
  runtimeConsole.hidden = !runtimeConsole.hidden;
};

window.addEventListener('keydown', (event) => {
  if (event.altKey && event.shiftKey && event.code === 'KeyC') {
    event.preventDefault();
    toggleConsole();
  }
});

clearConsole.addEventListener('click', () => {
  consoleEntries.length = 0;
  consoleOutput.textContent = '';
});

window.addEventListener('error', (event) => {
  appendConsole(`ERROR: ${event.message} (${event.filename}:${event.lineno})`);
});

window.addEventListener('unhandledrejection', (event) => {
  appendConsole(`UNHANDLED REJECTION: ${String(event.reason)}`);
});

const launcher = createLauncher({
  statusElement,
  displayElement,
  diagnostics: buildDiagnosticsSession(),
  log: appendConsole,
});

void launcher.launch();
