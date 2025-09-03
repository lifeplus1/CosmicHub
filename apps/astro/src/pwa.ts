/**
 * Astro App PWA bootstrap (refactored to shared @cosmichub/pwa modules)
 * - Shared SW registration with update banner
 * - Shared capability + mobile UX initialization
 * - Shared install/update banners (with iOS instruction fallback)
 */

import { devConsole, isDevelopment } from './config/environment';
// Temporarily disabled PWA imports to fix dev server
// import {
//   initPWA as sharedInitPWA,
//   initMobileUX,
//   detectRuntimeCapabilities,
//   showUpdateBanner,
//   showInstallBanner,
//   createEngagementGate,
// } from '@cosmichub/pwa';

// Placeholder functions for disabled PWA
const sharedInitPWA = (_options?: any) => {};
const initMobileUX = () => ({ dispose: () => {} });
const detectRuntimeCapabilities = () => ({ platform: 'other', isStandalone: false });
const showUpdateBanner = (_message?: string) => {};
const showInstallBanner = (_copy?: any) => {};
const createEngagementGate = (_options?: any) => ({ 
  isEligible: () => false, 
  markDismissed: () => {},
  getState: () => ({ pageViews: 0, firstSeen: Date.now() })
});

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

function showIOSInstructions(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pwa-ios-instructions')) return;
  const modal = document.createElement('div');
  modal.id = 'pwa-ios-instructions';
  modal.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;">
      <div style="background:white;border-radius:20px;max-width:420px;width:100%;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #e5e5e5;">
          <h3 style="margin:0;font-size:18px;font-weight:600;color:#333;">Add to Home Screen</h3>
          <button class="close-btn" style="background:none;border:none;font-size:24px;color:#666;cursor:pointer;padding:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;">×</button>
        </div>
        <div style="padding:22px 24px 26px 24px;">
          <ol style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:16px;">
            <li style="display:flex;gap:14px;align-items:flex-start;">
              <span style="width:32px;height:32px;background:#553c9a;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;flex-shrink:0;">1</span>
              <span style="color:#333;font-size:15px;line-height:1.45;">Tap the Share button <span style="display:inline-block;margin:0 4px;font-size:18px;">⬆️</span> in Safari.</span>
            </li>
            <li style="display:flex;gap:14px;align-items:flex-start;">
              <span style="width:32px;height:32px;background:#553c9a;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;flex-shrink:0;">2</span>
              <span style="color:#333;font-size:15px;line-height:1.45;">Scroll and tap <strong>Add to Home Screen</strong>.</span>
            </li>
            <li style="display:flex;gap:14px;align-items:flex-start;">
              <span style="width:32px;height:32px;background:#553c9a;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;flex-shrink:0;">3</span>
              <span style="color:#333;font-size:15px;line-height:1.45;">Tap <strong>Add</strong> to install CosmicHub.</span>
            </li>
          </ol>
        </div>
      </div>
    </div>`;
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });
  modal
    .querySelector('.close-btn')
    ?.addEventListener('click', () => modal.remove());
  document.body.appendChild(modal);
}

function hideInstallBanner(): void {
  document.getElementById('pwa-install-banner')?.remove();
}

function initializePWAFeatures(): void {
  const mobile = initMobileUX();
  const caps = detectRuntimeCapabilities();
  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  // Engagement gating (Astro) using shared helper
  const gate = createEngagementGate({
    minPageViews: 2,
    minTimeMs: 8_000,
    dismissCooldownMs: 24 * 60 * 60 * 1000,
    storagePrefix: 'astro',
  });
  let eligibilityLogged = false;

  const presentInstallUI = () => {
    if (caps.isStandalone || !gate.isEligible()) return;
    const copyByPlatform: Record<
      string,
      { title: string; subtitle: string; action: string; icon?: string }
    > = {
      ios: {
        title: 'Add CosmicHub to Home Screen',
        subtitle:
          'Use the Share button then "Add to Home Screen" for the best experience.',
        action: 'Show Steps',
        icon: '🌟',
      },
      android: {
        title: 'Install CosmicHub App',
        subtitle: 'Offline access & faster loading for your cosmic insights.',
        action: 'Install',
        icon: '🌟',
      },
      desktop: {
        title: 'Install CosmicHub',
        subtitle: 'Desktop integration and offline charts.',
        action: 'Install',
        icon: '🌟',
      },
      other: {
        title: 'Install CosmicHub',
        subtitle: 'Get an app-like experience.',
        action: 'Install',
        icon: '🌟',
      },
    };
    const copy = copyByPlatform[caps.platform] ??
      copyByPlatform.other ?? {
        title: 'Install CosmicHub',
        subtitle: 'Get an app-like experience.',
        action: 'Install',
        icon: '🌟',
      };
    showInstallBanner(copy);
    if (!eligibilityLogged) {
      eligibilityLogged = true;
      devConsole.log?.('[engagement] install prompt shown');
      try {
        const state = gate.getState();
        window.dispatchEvent(
          new CustomEvent('pwa:engagement-install-shown', {
            detail: {
              app: 'astro',
              pageViews: state.pageViews,
              firstSeen: state.firstSeen,
              ts: Date.now(),
            },
          })
        );
      } catch {
        /* ignore */
      }
    }
    // Record dismissal to cooldown when user explicitly dismisses banner
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

  // beforeinstallprompt (Android / some desktop Chromium)
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    presentInstallUI();
  });

  // iOS has no beforeinstallprompt – proactively show banner after a slight delay
  if (caps.platform === 'ios' && !caps.isStandalone) {
    setTimeout(() => presentInstallUI(), 1500);
  }

  window.addEventListener('appinstalled', () => {
    devConsole.log?.('🎉 CosmicHub PWA installed');
    hideInstallBanner();
    deferredPrompt = null;
    mobile.dispose();
  });

  // Unified handler triggered by shared banner button
  window.addEventListener('install-app', () => {
    // iOS: show instructions instead of prompting
    if (caps.platform === 'ios') {
      showIOSInstructions();
      hideInstallBanner();
      return;
    }
    void (async () => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      devConsole.log?.(
        choice.outcome === 'accepted'
          ? '✅ Install accepted'
          : '❌ Install dismissed'
      );
      deferredPrompt = null;
    })();
  });
}

function registerServiceWorker(): void {
  if (!import.meta.env.PROD) {
    devConsole.warn?.('Skipping SW registration in development');
    // Ensure no stale registrations while developing
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then(regs => {
          if (regs.length) {
            devConsole.warn?.(`🧹 Unregistering ${regs.length} SW(s)`);
          }
          return Promise.all(regs.map(r => r.unregister().catch(() => false)));
        })
        .catch(
          err =>
            isDevelopment() && devConsole.error?.('SW unregister failed', err)
        );
    }
    return;
  }

  sharedInitPWA({
    onUpdateFound: () => showUpdateBanner('New cosmic features available'),
    onControllerChange: () => devConsole.log?.('SW controller changed'),
  });
  initializePWAFeatures();
}

if (import.meta.env.PROD) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
  } else {
    registerServiceWorker();
  }
} else {
  // Development cleanup executed immediately (registerServiceWorker handles it)
  registerServiceWorker();
}
