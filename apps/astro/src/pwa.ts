/**
 * Service Worker Registration for CosmicHub Astro App
 * Registers the comprehensive service worker system
 */

// PWA Service Worker Registration
async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      console.log('🔧 Registering Service Worker...');
      
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
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
      
      console.log('✅ Service Worker registered successfully');
      
      // Initialize PWA features
      await initializePWAFeatures();
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  } else {
    console.warn('⚠️ Service Worker not supported');
  }
}

// Initialize PWA features
async function initializePWAFeatures(): Promise<void> {
  // Install prompt handling
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
  });
  
  // App installed handler
  window.addEventListener('appinstalled', () => {
    console.log('🎉 CosmicHub PWA installed successfully');
    hideInstallPrompt();
    deferredPrompt = null;
  });
  
  // Handle install button click
  window.addEventListener('install-app', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      
      deferredPrompt = null;
    }
  });
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

// Register when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', registerServiceWorker);
} else {
  registerServiceWorker();
}

export { registerServiceWorker };
