/**
 * Service Worker Registration for CosmicHub Astro App
 * Enhanced with UX-021 Mobile PWA Features
 * Registers the comprehensive service worker system
 */

// We wrap console usage through devConsole fallback below
import { devConsole, isDevelopment } from './config/environment';

// UX-021: Mobile PWA capabilities detection
interface PWACapabilities {
  hasTouch: boolean;
  hasStandalone: boolean;
  hasPushNotifications: boolean;
  hasBackgroundSync: boolean;
  hasWebShare: boolean;
  hasDeviceMotion: boolean;
  hasVibration: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

class PWACapabilitiesDetector {
  static detect(): PWACapabilities {
    return {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasStandalone:
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true,
      hasPushNotifications: 'PushManager' in window && 'Notification' in window,
      hasBackgroundSync:
        'serviceWorker' in navigator &&
        'sync' in window.ServiceWorkerRegistration.prototype,
      hasWebShare: 'share' in navigator,
      hasDeviceMotion: 'DeviceMotionEvent' in window,
      hasVibration: 'vibrate' in navigator,
      platform: this.detectPlatform(),
    };
  }

  private static detectPlatform(): 'ios' | 'android' | 'desktop' | 'unknown' {
    const ua = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) {
      return 'ios';
    } else if (/android/.test(ua)) {
      return 'android';
    } else if (/win|mac|linux/.test(ua) && !('ontouchstart' in window)) {
      return 'desktop';
    }

    return 'unknown';
  }
}

// UX-021: Initialize mobile enhancements
function initializeMobileEnhancements(): void {
  const capabilities = PWACapabilitiesDetector.detect();

  // Add CSS classes for platform detection
  document.documentElement.classList.toggle('has-touch', capabilities.hasTouch);
  document.documentElement.classList.toggle(
    'is-standalone',
    capabilities.hasStandalone
  );
  document.documentElement.classList.add(`platform-${capabilities.platform}`);

  // Set up dynamic viewport height for mobile Safari
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });

  // Enhanced vibration feedback for touch interactions
  if (capabilities.hasVibration) {
    document.addEventListener(
      'click',
      e => {
        const target = e.target as HTMLElement;
        if (target.matches('button, .btn, [role="button"]')) {
          navigator.vibrate([10]); // Short vibration
        }
      },
      { passive: true }
    );
  }

  // Web share integration
  if (capabilities.hasWebShare) {
    window.addEventListener('share-chart', async (_e: any) => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Cosmic Chart - CosmicHub',
            text: 'Check out my astrological chart from CosmicHub!',
            url: window.location.href,
          });
        } catch (error) {
          devConsole.log?.('Share cancelled or failed:', error);
        }
      }
    });
  }

  devConsole.log?.(
    '🎯 Mobile PWA enhancements initialized for',
    capabilities.platform
  );
}

// PWA Service Worker Registration
function registerServiceWorker(): void {
  // Only register the service worker in production. Vite HMR + SW in dev can cause reload loops.
  if (!import.meta.env.PROD) {
    devConsole.warn?.(
      '⚠️ Skipping Service Worker registration in development to avoid HMR reload loops'
    );
    return;
  }

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      devConsole.log?.('🔧 Registering Service Worker...');

      void navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(registration => {
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available, show update notification
                  showUpdateNotification();
                }
              });
            }
          });
          // Check for updates periodically (production only)
          if (
            typeof globalThis !== 'undefined' &&
            typeof globalThis.setInterval === 'function'
          ) {
            globalThis.setInterval(() => {
              void registration.update();
            }, 60000); // Check every minute
          }
          devConsole.log?.('✅ Service Worker registered successfully');
          initializePWAFeatures();
        })
        .catch(error => {
          devConsole.error('❌ Service Worker registration failed:', error);
        });
    } catch (error) {
      devConsole.error(
        '❌ Service Worker registration failed (outer try/catch):',
        error
      );
    }
  } else {
    devConsole.warn?.('⚠️ Service Worker not supported');
  }
}

// Initialize PWA features
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

function initializePWAFeatures(): void {
  // Initialize mobile-specific enhancements first (UX-021)
  initializeMobileEnhancements();

  // Install prompt handling
  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      showInstallPrompt();
    });
  }

  // App installed handler
  if (typeof window !== 'undefined') {
    window.addEventListener('appinstalled', () => {
      devConsole.log?.('🎉 CosmicHub PWA installed successfully');
      hideInstallPrompt();
      deferredPrompt = null;
    });
  }

  // Handle install button click
  if (typeof window !== 'undefined') {
    window.addEventListener('install-app', () => {
      void (async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          devConsole.log?.('✅ User accepted the install prompt');
        } else {
          devConsole.log?.('❌ User dismissed the install prompt');
        }
        deferredPrompt = null;
      })();
    });
  }
}

// Show update notification
function showUpdateNotification(): void {
  // Create update notification
  const updateBanner = document.createElement('div');
  updateBanner.id = 'pwa-update-banner';
  updateBanner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #553c9a, #f6ad55);
      color: white;
      padding: 12px 20px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <span style="margin-right: 15px;">🌟 New cosmic features available!</span>
      <button id="update-app-btn" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 6px 16px;
        border-radius: 6px;
        cursor: pointer;
        margin-right: 10px;
        font-weight: 500;
      ">Update Now</button>
      <button id="dismiss-update-btn" style="
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        opacity: 0.8;
      ">✕</button>
    </div>
  `;

  document.body.appendChild(updateBanner);

  // Handle update button
  document.getElementById('update-app-btn')?.addEventListener('click', () => {
    window.location.reload();
  });

  // Handle dismiss button
  document
    .getElementById('dismiss-update-btn')
    ?.addEventListener('click', () => {
      updateBanner.remove();
    });
}

// Show install prompt (Enhanced for UX-021)
function showInstallPrompt(): void {
  const capabilities = PWACapabilitiesDetector.detect();

  // Platform-specific messaging
  const messages = {
    ios: {
      title: 'Add CosmicHub to Home Screen',
      description:
        'Tap the Share button, then "Add to Home Screen" for the best cosmic experience.',
      action: 'Show Instructions',
    },
    android: {
      title: 'Install CosmicHub App',
      description:
        'Get faster access to your cosmic insights and offline chart viewing.',
      action: 'Install Now',
    },
    desktop: {
      title: 'Install CosmicHub',
      description:
        'Install for faster loading, offline access, and desktop integration.',
      action: 'Install App',
    },
  } as const;

  const platform =
    capabilities.platform === 'unknown' ? 'desktop' : capabilities.platform;
  const message = messages[platform];

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }

  // Create enhanced install banner
  const installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: rgba(26, 26, 46, 0.98);
      -webkit-backdrop-filter: blur(20px);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(85, 60, 154, 0.3);
      border-radius: 20px;
      padding: 24px;
      z-index: 10000;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      font-family: system-ui, -apple-system, sans-serif;
      transform: translateY(100%);
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    ">
      <div style="display: flex; align-items: flex-start; gap: 16px;">
        <div style="
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #553c9a, #f6ad55);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        ">🌟</div>
        <div style="flex: 1; min-width: 0;">
          <h3 style="margin: 0 0 8px 0; color: white; font-size: 18px; font-weight: 600; line-height: 1.3;">
            ${message.title}
          </h3>
          <p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 14px; line-height: 1.5;">
            ${message.description}
          </p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="install-app-btn" style="
              padding: 12px 20px;
              border-radius: 10px;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s ease;
              border: none;
              flex: 1;
              min-width: 80px;
              background: linear-gradient(135deg, #553c9a, #f6ad55);
              color: white;
            ">${message.action}</button>
            <button id="dismiss-install-btn" style="
              padding: 12px 16px;
              border-radius: 10px;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s ease;
              background: rgba(255, 255, 255, 0.1);
              color: #cbd5e1;
              border: 1px solid rgba(255, 255, 255, 0.2);
              flex: 1;
              min-width: 80px;
            ">Later</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add animation styles
  if (!document.querySelector('#pwa-install-styles')) {
    const styles = document.createElement('style');
    styles.id = 'pwa-install-styles';
    styles.textContent = `
      @keyframes slideUp {
        to { transform: translateY(0); }
      }
      @media (max-width: 480px) {
        #pwa-install-banner > div {
          padding: 20px !important;
          left: 16px !important;
          right: 16px !important;
          bottom: 16px !important;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(installBanner);

  // Handle install button with platform-specific behavior
  document.getElementById('install-app-btn')?.addEventListener('click', () => {
    if (capabilities.platform === 'ios') {
      showIOSInstructions();
    } else {
      window.dispatchEvent(new CustomEvent('install-app'));
    }
    installBanner.remove();
  });

  // Handle dismiss button
  document
    .getElementById('dismiss-install-btn')
    ?.addEventListener('click', () => {
      installBanner.remove();
    });
}

// Show iOS installation instructions (UX-021)
function showIOSInstructions(): void {
  const modal = document.createElement('div');
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
        background: white;
        border-radius: 20px;
        max-width: 400px;
        width: 100%;
        overflow: hidden;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e5e5;
        ">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">Add to Home Screen</h3>
          <button class="close-btn" style="
            background: none;
            border: none;
            font-size: 24px;
            color: #666;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
          ">×</button>
        </div>
        <div style="padding: 24px;">
          <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;">
            <div style="
              width: 32px;
              height: 32px;
              background: #553c9a;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 14px;
              flex-shrink: 0;
            ">1</div>
            <div style="color: #333; font-size: 15px; line-height: 1.5; padding-top: 4px;">
              Tap the Share button <span style="display: inline-block; margin: 0 4px; font-size: 18px;">⬆️</span> at the bottom of Safari
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;">
            <div style="
              width: 32px;
              height: 32px;
              background: #553c9a;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 14px;
              flex-shrink: 0;
            ">2</div>
            <div style="color: #333; font-size: 15px; line-height: 1.5; padding-top: 4px;">
              Scroll down and tap "Add to Home Screen"
            </div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div style="
              width: 32px;
              height: 32px;
              background: #553c9a;
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 14px;
              flex-shrink: 0;
            ">3</div>
            <div style="color: #333; font-size: 15px; line-height: 1.5; padding-top: 4px;">
              Tap "Add" to install CosmicHub
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle close
  modal.querySelector('.close-btn')?.addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Hide install prompt
function hideInstallPrompt(): void {
  const installBanner = document.getElementById('pwa-install-banner');
  if (installBanner) {
    installBanner.remove();
  }
}

// Register when DOM is loaded (prod) or unregister SW in dev to ensure no stale SW controls the page
if (import.meta.env.PROD) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
  } else {
    registerServiceWorker();
  }
} else {
  const unregisterInDev = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then(regs => {
          if (regs.length > 0) {
            devConsole.warn?.(
              `🧹 Unregistering ${regs.length} service worker(s) in development`
            );
          }
          // Unregister all registrations in parallel
          void Promise.all(regs.map(r => r.unregister().catch(() => false)));
        })
        .catch(error => {
          if (isDevelopment()) {
            devConsole.error(
              'Failed to fetch service worker registrations for unregister',
              error
            );
          }
        });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', unregisterInDev);
  } else {
    unregisterInDev();
  }
}

export { registerServiceWorker };
