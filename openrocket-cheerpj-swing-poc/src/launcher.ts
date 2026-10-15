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

type CheerpJWindow = typeof window & {
  cheerpjInit?: () => Promise<void>;
  cheerpjCreateDisplay?: (width: number, height: number) => void;
  cheerpjRunJar?: (path: string) => Promise<number>;
};

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ? `${error.message}\n${error.stack}` : error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  return String(error);
}

export function createLauncher(options: LauncherOptions) {
  return {
    async launch(): Promise<LaunchResult> {
      const { statusElement, displayElement, diagnostics } = options;
      const cheerpj = window as CheerpJWindow;

      try {
        diagnostics.mark('cheerpj-init');
        statusElement.textContent = 'Initializing CheerpJ...';

        if (!cheerpj.cheerpjInit) {
          throw new Error('CheerpJ loader is not available in the browser context.');
        }

        await cheerpj.cheerpjInit();
        diagnostics.addLog('CheerpJ initialized');

        diagnostics.mark('cheerpj-display');
        statusElement.textContent = 'Creating Swing display...';
        cheerpj.cheerpjCreateDisplay?.(1200, 800);
        displayElement.setAttribute('data-ready', 'true');

        diagnostics.mark('java-launch');
        statusElement.textContent = 'Launching sample Java app...';

        if (!cheerpj.cheerpjRunJar) {
          throw new Error('cheerpjRunJar is unavailable in this CheerpJ version.');
        }

        const exitCode = await cheerpj.cheerpjRunJar('/app/engine/openrocket-app.jar');
        diagnostics.addLog(`Java app exited with code ${exitCode}`);
        if (exitCode !== 0) {
          throw new Error(`OpenRocket exited with code ${exitCode}. Check the browser console for Java runtime errors.`);
        }

        statusElement.textContent = 'Launch finished. Confirm runtime behavior in the browser console.';
        return { ok: true, message: 'Launch process completed without a fatal client-side error.' };
      } catch (error) {
        const message = describeError(error);
        console.error('CheerpJ OpenRocket launch failed', error);
        diagnostics.addLog(`Launch failed: ${message}`);
        statusElement.textContent = `Launch failed: ${message}`;
        return { ok: false, message };
      }
    },
  };
}
