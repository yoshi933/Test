export type LauncherOptions = {
  statusElement: HTMLElement;
  displayElement: HTMLElement;
  diagnostics: {
    mark: (label: string) => number;
    addLog: (entry: string) => void;
    getTimeline: () => Array<{ label: string; time: number }>;
  };
};

export type LaunchResult = {
  ok: boolean;
  message: string;
};

export function createLauncher(options: LauncherOptions) {
  return {
    async launch(): Promise<LaunchResult> {
      const { statusElement, displayElement, diagnostics } = options;

      try {
        diagnostics.mark('cheerpj-init');
        statusElement.textContent = 'Initializing CheerpJ...';

        if (!(window as typeof window & { cheerpjInit?: () => Promise<void> }).cheerpjInit) {
          throw new Error('CheerpJ loader is not available in the browser context.');
        }

        await (window as typeof window & { cheerpjInit: () => Promise<void> }).cheerpjInit();
        diagnostics.addLog('CheerpJ initialized');

        diagnostics.mark('cheerpj-display');
        statusElement.textContent = 'Creating Swing display...';
        (window as typeof window & { cheerpjCreateDisplay?: (w: number, h: number) => void }).cheerpjCreateDisplay?.(1200, 800);
        displayElement.setAttribute('data-ready', 'true');

        diagnostics.mark('java-launch');
        statusElement.textContent = 'Launching sample Java app...';

        if (!(window as typeof window & { cheerpjRunJar?: (path: string) => Promise<void> }).cheerpjRunJar) {
          throw new Error('cheerpjRunJar is unavailable in this CheerpJ version.');
        }

        await (window as typeof window & { cheerpjRunJar: (path: string) => Promise<void> }).cheerpjRunJar('/app/engine/openrocket-app.jar');
        diagnostics.addLog('Java app launch attempted');

        statusElement.textContent = 'Launch finished. Confirm runtime behavior in the browser console.';
        return { ok: true, message: 'Launch process completed without a fatal client-side error.' };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        diagnostics.addLog(`Launch failed: ${message}`);
        statusElement.textContent = `Launch failed: ${message}`;
        return { ok: false, message };
      }
    },
  };
}
