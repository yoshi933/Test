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
  cheerpjInit?: (options?: {
    version?: 8 | 11 | 17;
    status?: 'splash' | 'none' | 'default';
    javaProperties?: string[];
  }) => Promise<void>;
  cheerpjCreateDisplay?: (width: number, height: number, parent?: HTMLElement) => HTMLElement;
  cheerpjRunJar?: (path: string) => Promise<number | void>;
  cheerpjRunMain?: (className: string, classPath: string, ...args: string[]) => Promise<number | void>;
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

        await cheerpj.cheerpjInit({
          version: 11,
          status: 'default',
        });
        log('CheerpJ initialized with Java 11');

        diagnostics.mark('cheerpj-display');
        statusElement.textContent = 'Creating OpenRocket window...';
        if (!cheerpj.cheerpjCreateDisplay) {
          throw new Error('cheerpjCreateDisplay is unavailable in this CheerpJ version.');
        }
        const createdDisplay = cheerpj.cheerpjCreateDisplay(-1, -1, displayElement);
        log(`CheerpJ display created: ${createdDisplay?.tagName ?? 'unknown element'}`);
        log(`Display parent children: ${displayElement.children.length}`);
        log(`Display root children: ${createdDisplay?.children.length ?? 0}`);
        const displayObserver = new MutationObserver(() => {
          log(`Display DOM changed: parent=${displayElement.children.length}, root=${createdDisplay?.children.length ?? 0}`);
        });
        if (createdDisplay) {
          displayObserver.observe(createdDisplay, { childList: true, subtree: true });
        } else {
          displayObserver.observe(displayElement, { childList: true, subtree: true });
        }
        displayElement.setAttribute('data-ready', 'true');

        diagnostics.mark('java-launch');
        statusElement.textContent = 'Launching OpenRocket...';

        if (!cheerpj.cheerpjRunMain) {
          throw new Error('cheerpjRunMain is unavailable in this CheerpJ version.');
        }

        statusElement.textContent = '';
        log('Starting net.sf.openrocket.startup.OpenRocket with cheerpjRunMain');
        void cheerpj.cheerpjRunMain(
          'net.sf.openrocket.startup.OpenRocket',
          '/app/engine/openrocket-app.jar',
        ).then((exitCode) => {
          log(`Java app promise resolved with exit code ${String(exitCode)}`);
          if (typeof exitCode === 'number' && exitCode !== 0) {
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
        window.setTimeout(() => {
          log('OpenRocket is still running after 15 seconds; cheerpjRunJar remains pending until the Java process exits.');
          if (!displayElement.querySelector('canvas')) {
            log('No Canvas found inside the OpenRocket display container yet.');
          } else {
            log('Canvas is present inside the OpenRocket display container.');
          }
          log(`Display root still attached: ${Boolean(createdDisplay?.isConnected)}`);
          displayObserver.disconnect();
        }, 15_000);
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
