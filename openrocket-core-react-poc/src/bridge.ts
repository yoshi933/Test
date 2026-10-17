/* Bridge that initializes CheerpJ and runs the headless OpenRocket Core bridge.

   It expects the following runtime artifacts to exist under /engine in the served tree:
   - openrocket-core-runtime.jar  (the upstream OpenRocket core module)
   - openrocket-core-bridge.jar   (the bridge main class)
   - lib/*.jar                    (the core module's runtime dependencies)

   The build script scripts/build-core-runtime.sh will produce those files from the upstream OpenRocket checkout.
*/

declare const cheerpjInit: any;
declare const cheerpjRunMain: any;

async function ensureCheerpJ() {
  if (typeof cheerpjInit === 'undefined') {
    throw new Error('CheerpJ runtime not found on the page');
  }
}

export async function runCoreSmokeSimulation(): Promise<any> {
  return runCoreOperation(['smoke']);
}

export async function runCoreOperation(args: string[]): Promise<any> {
  await ensureCheerpJ();
  await cheerpjInit({ version: 17, status: (s: any) => console.log('[CheerpJ status]', s) });

  const manifestResponse = await fetch('/engine/runtime-manifest.json', { cache: 'no-store' });
  if (!manifestResponse.ok) {
    throw new Error('OpenRocket Core runtime manifest is not available');
  }
  const manifest = await manifestResponse.json() as {
    coreJar: string;
    bridgeJar: string;
    dependencies: string[];
  };
  const classpath = [
    `/engine/${manifest.bridgeJar}`,
    `/engine/${manifest.coreJar}`,
    ...manifest.dependencies.map((jar) => `/engine/lib/${jar}`)
  ].join(':');
  console.log('[bridge] Running CoreBridge with classpath', classpath);
  const mainClass = 'com.example.openrocket.browser.CoreBridge';

  const exitCode = await cheerpjRunMain(mainClass, classpath, args);
  console.log('[bridge] cheerpjRunMain exit code', exitCode);

  const res = await fetch('/engine/core-result.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('CoreBridge did not produce result file');
  }
  const result = await res.json();
  if (!result.ok) {
    throw new Error(result.message ?? 'OpenRocket Core operation failed');
  }
  return result;
}
