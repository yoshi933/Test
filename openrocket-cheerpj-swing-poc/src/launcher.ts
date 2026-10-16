export type LauncherOptions = {
  statusElement: HTMLElement;
  displayElement: HTMLElement;
  diagnostics: {
    mark: (label: string) => number;
    addLog: (entry: string) => void;
    getTimeline: () => Array<{ label: string; time: number }>;
  };
  log?: (entry: string) => void;
};

export type LaunchResult = {
  ok: boolean;
  message: string;
};

type CheerpJWindow = typeof window & {
  cheerpjInit?: () => Promise<void>;
  cheerpjCreateDisplay?: (width: number, height: number, parent?: HTMLElement) => HTMLElement;
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
      const log = (entry: string) => {
        diagnostics.addLog(entry);
        options.log?.(entry);
      };

      try {
        diagnostics.mark('cheerpj-init');
        statusElement.textContent = 'Initializing CheerpJ...';

        if (!cheerpj.cheerpjInit) {
          throw new Error('CheerpJ loader is not available in the browser context.');
        }

        await cheerpj.cheerpjInit();
        log('CheerpJ initialized');

        diagnostics.mark('cheerpj-display');
        statusElement.textContent = 'Creating OpenRocket window...';
        if (!cheerpj.cheerpjCreateDisplay) {
          throw new Error('cheerpjCreateDisplay is unavailable in this CheerpJ version.');
        }
        cheerpj.cheerpjCreateDisplay(-1, -1, displayElement);
        displayElement.setAttribute('data-ready', 'true');

        diagnostics.mark('java-launch');
        statusElement.textContent = 'Launching OpenRocket...';

        if (!cheerpj.cheerpjRunJar) {
          throw new Error('cheerpjRunJar is unavailable in this CheerpJ version.');
        }

        statusElement.textContent = '';
        void cheerpj.cheerpjRunJar('/app/engine/openrocket-app.jar').then((exitCode) => {
          log(`Java app exited with code ${exitCode}`);
          if (exitCode !== 0) {
            const message = `OpenRocket exited with code ${exitCode}. Check the Console for Java runtime errors.`;
            console.error(message);
            statusElement.textContent = message;
          } else {
            statusElement.textContent = 'OpenRocket has exited.';
          }
        }).catch((error: unknown) => {
          const message = describeError(error);
          console.error('CheerpJ OpenRocket launch failed', error);
          log(`Launch failed: ${message}`);
          statusElement.textContent = `Launch failed: ${message}`;
        });

        log('OpenRocket launch requested');
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
