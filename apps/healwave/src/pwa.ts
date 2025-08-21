/**
 * Service Worker Registration for HealWave App
 * Registers the comprehensive service worker system
 */

// Simple logger for PWA service worker
class PWALogger {
  private static isDevelopment = import.meta.env.DEV;
  static log(message: string, ...args: unknown[]): void { if (this.isDevelopment) { /* eslint-disable no-console */ console.log(message, ...args); /* eslint-enable no-console */ } }
  static warn(message: string, ...args: unknown[]): void { if (this.isDevelopment) { /* eslint-disable no-console */ console.warn(message, ...args); /* eslint-enable no-console */ } }
  static error(message: string, ...args: unknown[]): void { /* eslint-disable no-console */ console.error(message, ...args); /* eslint-enable no-console */ }
}

// PWA Service Worker Registration
async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      PWALogger.log('🔧 Registering Service Worker...');
      
  const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module'
      });
      
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
      
      // Check for updates periodically
  setInterval(() => { void registration.update(); }, 60000); // Check every minute
      
      PWALogger.log('✅ Service Worker registered successfully');
      
      // Initialize PWA features
  // Fire-and-forget; internal logic attaches listeners only
  initializePWAFeatures();
      
    } catch (error) {
      PWALogger.error('❌ Service Worker registration failed:', error);
    }
  } else {
    PWALogger.warn('⚠️ Service Worker not supported');
  }
}

// Initialize PWA features
function initializePWAFeatures(): void {
  let deferredPrompt: { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null = null;
  
  window.addEventListener('beforeinstallprompt', (e: Event): void => {
    e.preventDefault();
    const evt = e as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
    deferredPrompt = evt;
    showInstallPrompt();
  });
  
  // App installed handler
  window.addEventListener('appinstalled', (): void => {
    PWALogger.log('🎉 HealWave PWA installed successfully');
    hideInstallPrompt();
    deferredPrompt = null;
  });
  
  // Handle install button click
  window.addEventListener('install-app', () => { void (async () => {
    if (deferredPrompt !== null) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        PWALogger.log(choiceResult.outcome === 'accepted' ? '✅ User accepted the install prompt' : '❌ User dismissed the install prompt');
      } finally {
        deferredPrompt = null;
      }
    }
  })(); });
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
      background: linear-gradient(135deg, #7c3aed, #06b6d4);
      color: white;
      padding: 12px 20px;
      text-align: center;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <span style="margin-right: 15px;">🎵 New healing frequencies available!</span>
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
  document.getElementById('update-app-btn')?.addEventListener('click', () => { window.location.reload(); });
  
  // Handle dismiss button
  document.getElementById('dismiss-update-btn')?.addEventListener('click', () => { updateBanner.remove(); });
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
      border: 1px solid rgba(124, 58, 237, 0.3);
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
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        ">🎧</div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">Install HealWave</h3>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.4;">Access healing frequencies faster with offline capability and better performance.</p>
        </div>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <button id="install-app-btn" style="
          flex: 1;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
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
  document.getElementById('install-app-btn')?.addEventListener('click', () => { window.dispatchEvent(new CustomEvent('install-app')); installBanner.remove(); });
  
  // Handle dismiss button
  document.getElementById('dismiss-install-btn')?.addEventListener('click', () => { installBanner.remove(); });
}

// Hide install prompt
function hideInstallPrompt(): void {
  const installBanner = document.getElementById('pwa-install-banner');
  if (installBanner) {
    installBanner.remove();
  }
}

// Register when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', registerServiceWorker);
} else {
  registerServiceWorker();
}

export { registerServiceWorker };
