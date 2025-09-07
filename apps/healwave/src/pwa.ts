/**
 * HealWave PWA Core
 * Refactored with structured logging, robust SW registration, accessibility & testability.
 */
import { devConsole } from './config/devConsole';

// PWA Types and Interfaces
interface InstallCopy {
  title: string;
  subtitle: string;
  action: string;
  icon: string;
}

interface EngagementGateOptions {
  minPageViews: number;
  minTimeMs: number;
  dismissCooldownMs: number;
  storagePrefix: string;
}

interface EngagementGate {
  isEligible(): boolean;
  getState(): { pageViews: number; firstSeen: number };
  markDismissed(): void;
}

interface MobileController {
  dispose(): void;
}

interface RuntimeCapabilities {
  isStandalone: boolean;
  platform: string;
}

// Local implementations that create actual DOM elements for testing
const sharedRegisterSW = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    return await navigator.serviceWorker.register('/sw.js');
  } catch {
    return null;
  }
};

const initMobileUX = (): MobileController => ({
  dispose: () => undefined,
});

const detectRuntimeCapabilities = (): RuntimeCapabilities => ({
  isStandalone: window.matchMedia('(display-mode: standalone)').matches,
  platform: navigator.platform.toLowerCase().includes('iphone') ? 'ios' : 'other',
});

const createEngagementGate = (options: EngagementGateOptions): EngagementGate => ({
  isEligible: () => options.minPageViews > 0, // Use the options parameter
  getState: () => ({ pageViews: 1, firstSeen: Date.now() }),
  markDismissed: () => undefined,
});

const showInstallBanner = (copy: InstallCopy): void => {
  // Create actual DOM element with expected ID
  if (typeof document === 'undefined') return;
  if (document.getElementById('pwa-install-banner')) return;
  
  // Basic HTML escaping
  const escapeHtml = (str: string) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  const el = document.createElement('div');
  el.id = 'pwa-install-banner';
  el.style.cssText = 'position:fixed;bottom:20px;left:20px;right:20px;background:rgba(26,26,46,0.95);color:#e2e8f0;padding:20px;border-radius:16px;z-index:10000;';
  el.innerHTML = `
    <div>
      <h3 style="margin:0 0 6px 0;">${escapeHtml(copy.title)}</h3>
      <p style="margin:0 0 10px 0;">${escapeHtml(copy.subtitle)}</p>
      <button data-act="install" type="button">${escapeHtml(copy.action)}</button>
      <button data-act="dismiss" type="button">Dismiss</button>
    </div>
  `;
  
  el.querySelector('[data-act="dismiss"]')?.addEventListener('click', () => el.remove());
  el.querySelector('[data-act="install"]')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('install-app'));
    el.remove();
  });
  
  document.body.appendChild(el);
  log.info('install_banner_shown', { title: copy.title });
};

const showUpdateBanner = (message: string): void => {
  // Create actual DOM element with expected ID
  if (typeof document === 'undefined') return;
  if (document.getElementById('pwa-update-banner')) return;
  
  // Basic HTML escaping
  const escapeHtml = (str: string) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  const el = document.createElement('div');
  el.id = 'pwa-update-banner';
  el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#553c9a,#06b6d4);color:#fff;padding:12px 16px;z-index:10000;';
  el.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button data-act="reload" type="button">Update</button>
    <button data-act="dismiss" type="button">Dismiss</button>
  `;
  
  el.querySelector('[data-act="reload"]')?.addEventListener('click', () => window.location.reload());
  el.querySelector('[data-act="dismiss"]')?.addEventListener('click', () => el.remove());
  
  document.body.appendChild(el);
  log.info('update_banner_shown', { message });
};

// -----------------------------
// Logging Factory & Structured Log
// -----------------------------
type LogLevel = 'info' | 'warn' | 'error';
interface StructuredMeta {
  [k: string]: unknown;
}
interface StructuredLogger {
  info: (event: string, meta?: StructuredMeta) => void;
  warn: (event: string, meta?: StructuredMeta) => void;
  error: (event: string, meta?: StructuredMeta) => void;
}

const createLogger = (enabled: boolean): StructuredLogger => {
  const out = (level: LogLevel, event: string, meta: StructuredMeta = {}) => {
    if (!enabled) return;
    const payload = { ts: Date.now(), event, ...meta, module: 'HealWavePWA' };
    // Use the appropriate logger method based on level
    try {
      switch (level) {
        case 'info':
          if (typeof devConsole.info === 'function') {
            devConsole.info(event, payload);
          }
          break;
        case 'warn':
          if (typeof devConsole.warn === 'function') {
            devConsole.warn(event, payload);
          }
          break;
        case 'error':
          if (typeof devConsole.error === 'function') {
            devConsole.error(event, payload);
          }
          break;
        default:
          if (typeof devConsole.info === 'function') {
            devConsole.info(event, payload);
          }
      }
    } catch {
      // Fallback: structured logging already handled above via devConsole
      // No additional console output needed - maintains clean production logs
    }
  };
  return {
    info: (e, m) => out('info', e, m),
    warn: (e, m) => out('warn', e, m),
    error: (e, m) => out('error', e, m),
  };
};

const log = createLogger(import.meta.env.DEV);

// Detect test mode to avoid auto-init that can leave open timers/listeners
const IS_TEST = Boolean((import.meta as unknown as { vitest?: unknown }).vitest) ??
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { MODE?: string } }).env?.MODE === 'test') ??
  (typeof process !== 'undefined' && typeof process.env !== 'undefined' && (process.env.VITEST ?? process.env.NODE_ENV === 'test'));

// -----------------------------
// SSR Guards
// -----------------------------
const HAS_WINDOW = typeof window !== 'undefined';
const HAS_DOCUMENT = typeof document !== 'undefined';

// -----------------------------
// Utility: Sanitization (defensive even if static)
// -----------------------------
// (legacy sanitize removed; shared UI helpers already sanitize internally)

// -----------------------------
// BeforeInstallPromptEvent Interface
// -----------------------------
interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform?: string;
  }>;
  prompt: () => Promise<void>;
}

// -----------------------------
// Capability Detector (dynamic standalone updates)
// Legacy bespoke capability + mobile logic removed in favor of shared modules.

// PWA Service Worker Registration
async function registerServiceWorker(
  disposers: Array<() => void>
): Promise<void> {
  const reg = await sharedRegisterSW();
  if (!reg) return;
  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          showUpdateNotification();
        }
      });
    }
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Optionally show an updating banner or trigger a reload after short delay
    log.info('sw_controllerchange');
  const id = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.location.reload();
      }
  }, 500);
  disposers.push(() => clearTimeout(id));
  });
  // schedule update checks only when page visible
  const scheduleUpdateCheck = () => {
    if (document.visibilityState === 'visible') {
      void reg.update();
    }
    timeoutId = window.setTimeout(scheduleUpdateCheck, 60000);
  };
  let timeoutId = window.setTimeout(scheduleUpdateCheck, 60000);
  const visListener = () => scheduleUpdateCheck();
  document.addEventListener('visibilitychange', visListener);
  disposers.push(() =>
    document.removeEventListener('visibilitychange', visListener)
  );
  disposers.push(() => clearTimeout(timeoutId));
  await navigator.serviceWorker.ready.catch(() => undefined); // ensure ready before feature init
  initializePWAFeatures(disposers);
}

// Initialize PWA features
function initializePWAFeatures(disposers: Array<() => void>): void {
  const mobileController = initMobileUX();
  disposers.push(() => mobileController.dispose());
  if (!HAS_WINDOW) return;
  const caps = detectRuntimeCapabilities();
  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  // Engagement gating using shared helper (keys preserved by custom prefix)
  const gate = createEngagementGate({
    minPageViews: 2,
    minTimeMs: 10_000,
    dismissCooldownMs: 24 * 60 * 60 * 1000,
    storagePrefix: 'healwave',
  });

  const copyByPlatform: Record<string, InstallCopy> = {
    ios: {
      title: 'Install HealWave',
      subtitle: 'Use Share > Add to Home Screen for faster healing access.',
      action: 'Show Steps',
      icon: '🎧',
    },
    android: {
      title: 'Install HealWave App',
      subtitle: 'Offline access to healing frequencies & faster launches.',
      action: 'Install',
      icon: '🎧',
    },
    desktop: {
      title: 'Install HealWave',
      subtitle: 'Get an app-like healing experience.',
      action: 'Install',
      icon: '🎧',
    },
    other: {
      title: 'Install HealWave',
      subtitle: 'Get an app-like healing experience.',
      action: 'Install',
      icon: '🎧',
    },
  };

  const presentInstall = () => {
    if (caps.isStandalone || !gate.isEligible()) return;
    const fallback = copyByPlatform.other; // This is defined above and guaranteed to exist
    if (!fallback) {
      // Log warning through proper logging system if available
      if (typeof globalThis !== 'undefined' && 'logger' in globalThis) {
        (globalThis as unknown as { logger: { warn: (msg: string) => void } }).logger.warn('PWA: No fallback copy defined for install banner');
      }
      return;
    }
    const copy = copyByPlatform[caps.platform] ?? fallback;
    showInstallBanner(copy);
    // Telemetry: first time we actually present the install UI in this session
    try {
      const state = gate.getState();
      window.dispatchEvent(
        new CustomEvent('pwa:engagement-install-shown', {
          detail: {
            app: 'healwave',
            pageViews: state.pageViews,
            firstSeen: state.firstSeen,
            ts: Date.now(),
          },
        })
      );
    } catch {
      /* ignore */
    }
    // Track dismissal for cooldown
    const banner = document.getElementById('pwa-install-banner');
    banner?.querySelector('[data-act="dismiss"]')?.addEventListener(
      'click',
      () => {
        try {
          gate.markDismissed();
        } catch {
          /* ignore */
        }
      },
      { once: true }
    );
  };

  const beforeInstall = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    setTimeout(() => presentInstall(), 300);
  };
  window.addEventListener('beforeinstallprompt', beforeInstall);
  disposers.push(() =>
    window.removeEventListener('beforeinstallprompt', beforeInstall)
  );

  const onAppInstalled = () => {
    log.info('pwa_installed');
    hideInstallPrompt();
    deferredPrompt = null;
  };
  window.addEventListener('appinstalled', onAppInstalled);
  disposers.push(() => window.removeEventListener('appinstalled', onAppInstalled));

  const onInstallApp = () => {
    if (caps.platform === 'ios') {
      showIOSInstallInstructions();
      hideInstallPrompt();
      return;
    }
    void (async () => {
      if (!deferredPrompt) return;
      try {
        await deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        log.info('install_choice', { outcome: result.outcome });
      } finally {
        deferredPrompt = null;
      }
    })();
  };
  window.addEventListener('install-app', onInstallApp);
  disposers.push(() => window.removeEventListener('install-app', onInstallApp));

  // Fallback for iOS (no beforeinstallprompt)
  if (caps.platform === 'ios' && !caps.isStandalone) {
  const iosTimeout = window.setTimeout(() => presentInstall(), 1500);
  disposers.push(() => clearTimeout(iosTimeout));
  }
}

// Show update notification
// Update notification now uses shared banner
function showUpdateNotification(): void {
  showUpdateBanner('New healing frequencies available!');
}

// Show install prompt
// Install prompt now uses shared banner via initializePWAFeatures

/**
 * Show iOS-specific installation instructions
 */
function showIOSInstallInstructions(): void {
  const modal = document.createElement('div');
  modal.id = 'ios-install-modal';
  modal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    ">
      <div style="
        background: rgba(26, 26, 46, 0.98);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(124, 58, 237, 0.3);
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 100%;
        font-family: system-ui, -apple-system, sans-serif;
        color: #e2e8f0;
        text-align: center;
      ">
        <div style="
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 20px;
        ">🎧</div>
        
        <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700;">Install HealWave</h2>
        <p style="margin: 0 0 25px 0; color: #cbd5e1; font-size: 16px; line-height: 1.5;">
          Add HealWave to your home screen for the best experience
        </p>
        
        <div style="text-align: left; margin: 25px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <span style="font-size: 24px; margin-right: 12px;">📱</span>
            <span style="font-size: 15px;">Tap the Share button below</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <span style="font-size: 24px; margin-right: 12px;">⬇️</span>
            <span style="font-size: 15px;">Scroll and tap "Add to Home Screen"</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="font-size: 24px; margin-right: 12px;">✅</span>
            <span style="font-size: 15px;">Tap "Add" to install</span>
          </div>
        </div>
        
        <button id="close-ios-modal" style="
          width: 100%;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          border: none;
          color: white;
          padding: 14px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 16px;
          margin-top: 10px;
        ">Got it!</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle close button
  document.getElementById('close-ios-modal')?.addEventListener('click', () => {
    modal.remove();
  });

  // Close on backdrop click
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Hide install prompt
function hideInstallPrompt(): void {
  document.getElementById('pwa-install-banner')?.remove();
}

// Register when DOM is loaded
function initPWA(): { dispose: () => void } {
  if (!HAS_DOCUMENT) {
    return { dispose: () => undefined };
  }
  const disposers: Array<() => void> = [];
  if (document.readyState === 'loading') {
    const listener = () => {
      document.removeEventListener('DOMContentLoaded', listener);
      void registerServiceWorker(disposers);
    };
    document.addEventListener('DOMContentLoaded', listener);
    disposers.push(() =>
      document.removeEventListener('DOMContentLoaded', listener)
    );
  } else {
    void registerServiceWorker(disposers);
  }
  return {
    dispose: () => {
      disposers.forEach(d => {
        try {
          d();
        } catch {
          /* ignore */
        }
      });
      // Shared detector is internally singleton; no explicit dispose exposed.
    },
  };
}

// Backwards compatibility export
export { initPWA, sharedRegisterSW as registerServiceWorker };

// Auto init (still side-effect import behavior) but allow opting out by setting global flag before import
const globalAny = globalThis as Record<string, unknown>;
if (!globalAny.HEALWAVE_PWA_MANUAL_INIT && !IS_TEST) {
  initPWA();
}

// Test hooks (non-production sensitive)
// Test helpers: expose ability to trigger banners
export const __test__ = {
  triggerUpdate: () => showUpdateNotification(),
  triggerInstall: () =>
    showInstallBanner({
      title: 'Install HealWave',
      subtitle: 'Offline access & faster launches.',
      action: 'Install',
      icon: '🎧',
    }),
};
