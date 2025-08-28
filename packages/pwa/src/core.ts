/**
 * Shared PWA core utilities: initPWA, register SW with backoff, visibility-aware updates.
 */
export interface SWRegisterOptions {
  swPath?: string;
  scope?: string;
  type?: 'classic' | 'module';
  checkIntervalMs?: number;
  maxRetries?: number;
  onUpdateFound?: () => void;
  onControllerChange?: () => void;
}

const HAS_WINDOW = typeof window !== 'undefined';
const HAS_DOCUMENT = typeof document !== 'undefined';

export async function registerServiceWorkerWithBackoff(
  opts: SWRegisterOptions = {}
): Promise<ServiceWorkerRegistration | null> {
  if (!HAS_WINDOW || !('serviceWorker' in navigator)) return null;
  const {
    swPath = '/sw.js',
    scope = '/',
    type = 'module',
    maxRetries = 5,
  } = opts;
  let attempt = 0;
  let delay = 1500;
  while (attempt <= maxRetries) {
    try {
      const reg = await navigator.serviceWorker.register(swPath, {
        scope,
        type,
      });
      return reg;
    } catch {
      if (attempt === maxRetries) break;
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 2, 60000);
      attempt += 1;
    }
  }
  return null;
}

export interface InitPWAResult {
  dispose(): void;
}
export interface InitPWAParams extends SWRegisterOptions {
  auto?: boolean;
}

export function initPWA(params: InitPWAParams = {}): InitPWAResult {
  const disposers: Array<() => void> = [];
  if (!HAS_DOCUMENT) return { dispose: () => undefined };

  const start = () => {
    void registerServiceWorkerWithBackoff(params).then(reg => {
      if (!reg) return;
      if (params.onUpdateFound) {
        reg.addEventListener('updatefound', params.onUpdateFound);
        disposers.push(() =>
          reg.removeEventListener('updatefound', params.onUpdateFound!)
        );
      }
      if (params.onControllerChange) {
        const cc = params.onControllerChange;
        navigator.serviceWorker.addEventListener('controllerchange', cc);
        disposers.push(() =>
          navigator.serviceWorker.removeEventListener('controllerchange', cc)
        );
      }
      // Visibility aware update loop
      const interval = params.checkIntervalMs ?? 60000;
      let timeoutId: number;
      const schedule = () => {
        if (document.visibilityState === 'visible') {
          void reg.update();
        }
        timeoutId = window.setTimeout(schedule, interval);
      };
      timeoutId = window.setTimeout(schedule, interval);
      const vis = () => schedule();
      document.addEventListener('visibilitychange', vis);
      disposers.push(() =>
        document.removeEventListener('visibilitychange', vis)
      );
      disposers.push(() => clearTimeout(timeoutId));
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  return {
    dispose: () =>
      disposers.forEach(d => {
        try {
          d();
        } catch {
          /* ignore */
        }
      }),
  };
}
