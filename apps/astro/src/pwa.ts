/**
 * Service Worker Registration for CosmicHub Astro App
 * Registers the comprehensive service worker system
 */

/* eslint-disable no-console */ // We wrap console usage through devConsole fallback below
import { devConsole, isDevelopment } from './config/environment';

// PWA Service Worker Registration
function registerServiceWorker(): void {
  // Only register the service worker in production. Vite HMR + SW in dev can cause reload loops.
  if (!import.meta.env.PROD) {
    devConsole.warn?.('⚠️ Skipping Service Worker registration in development to avoid HMR reload loops');
    return;
  }

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      devConsole.log?.('🔧 Registering Service Worker...');

      void navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((registration) => {
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update notification
                  showUpdateNotification();
                }
              });
            }
          });
          // Check for updates periodically (production only)
          if (typeof globalThis !== 'undefined' && typeof globalThis.setInterval === 'function') {
            globalThis.setInterval(() => { void registration.update(); }, 60000); // Check every minute
          }
          devConsole.log?.('✅ Service Worker registered successfully');
          initializePWAFeatures();
        })
        .catch((error) => {
          devConsole.error('❌ Service Worker registration failed:', error);
        });
    } catch (error) {
      devConsole.error('❌ Service Worker registration failed (outer try/catch):', error);
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
  document.getElementById('dismiss-update-btn')?.addEventListener('click', () => {
    updateBanner.remove();
  });
}

// Show install prompt
function showInstallPrompt(): void {
  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return;
  }
  
  // Create install prompt
  const installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: rgba(26, 26, 46, 0.95);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(85, 60, 154, 0.3);
      border-radius: 16px;
      padding: 20px;
      z-index: 10000;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      font-family: system-ui, -apple-system, sans-serif;
      color: #e2e8f0;
      max-width: 400px;
      margin: 0 auto;
    ">
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #553c9a, #f6ad55);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        ">🌟</div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">Install CosmicHub</h3>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.4;">Get the full cosmic experience with faster loading and offline access.</p>
        </div>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <button id="install-app-btn" style="
          flex: 1;
          background: linear-gradient(135deg, #553c9a, #f6ad55);
          border: none;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        ">Install App</button>
        <button id="dismiss-install-btn" style="
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: #cbd5e1;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        ">Not Now</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // Handle install button
  document.getElementById('install-app-btn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('install-app'));
    installBanner.remove();
  });
  
  // Handle dismiss button
  document.getElementById('dismiss-install-btn')?.addEventListener('click', () => {
    installBanner.remove();
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
      navigator.serviceWorker.getRegistrations()
        .then((regs) => {
          if (regs.length > 0) {
            devConsole.warn?.(`🧹 Unregistering ${regs.length} service worker(s) in development`);
          }
          // Unregister all registrations in parallel
          void Promise.all(regs.map(r => r.unregister().catch(() => false)));
        })
        .catch((error) => {
          if (isDevelopment()) {
            devConsole.error('Failed to fetch service worker registrations for unregister', error);
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
