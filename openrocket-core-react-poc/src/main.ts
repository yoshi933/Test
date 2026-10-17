import './styles.css';
import { runCoreSmokeSimulation } from './bridge';

const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="container">
    <h1>OpenRocket Core PoC</h1>
    <button id="run">Run core smoke simulation</button>
    <pre id="output">(no output yet)</pre>
  </div>
`;

document.getElementById('run')!.addEventListener('click', async () => {
  const out = document.getElementById('output')!;
  out.textContent = 'Starting CheerpJ and core...';
  try {
    const res = await runCoreSmokeSimulation();
    out.textContent = JSON.stringify(res, null, 2);
  } catch (e) {
    out.textContent = 'Error: ' + (e instanceof Error ? e.message : String(e));
    console.error(e);
  }
});
