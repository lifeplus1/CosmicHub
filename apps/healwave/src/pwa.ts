/**
 * Service Worker Registration for HealWave App
 * Registers the comprehensive service worker system with mobile enhancements
 */

// Simple logger for PWA service worker
class PWALogger {
  private static isDevelopment = import.meta.env.DEV;
  static log(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(
        message,
        ...args
      );  
    }
  }
  static warn(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(
        message,
        ...args
      );  
    }
  }
  static error(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.error(
      message,
      ...args
    );  
  }
}

/**
 * Platform Detection for PWA Capabilities
 */
class PWACapabilitiesDetector {
  private static _instance: PWACapabilitiesDetector | null = null;
  private _capabilities: {
    platform: 'ios' | 'android' | 'desktop' | 'other';
    isStandalone: boolean;
    supportsInstall: boolean;
    supportsPush: boolean;
    isMobile: boolean;
  };

  private constructor() {
    this._capabilities = this.detectCapabilities();
  }

  public static getInstance(): PWACapabilitiesDetector {
    if (!this._instance) {
      this._instance = new PWACapabilitiesDetector();
    }
    return this._instance;
  }

  private detectCapabilities() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
    
    return {
      platform: isIOS ? 'ios' as const : 
                isAndroid ? 'android' as const :
                isMobile ? 'other' as const : 'desktop' as const,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                    // @ts-expect-error - iOS specific property
                    window.navigator.standalone === true,
      supportsInstall: 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window,
      supportsPush: 'serviceWorker' in navigator && 'PushManager' in window,
      isMobile
    };
  }

  public get capabilities() {
    return { ...this._capabilities };
  }

  public get platform() {
    return this._capabilities.platform;
  }

  public get isMobile() {
    return this._capabilities.isMobile;
  }

  public get isStandalone() {
    return this._capabilities.isStandalone;
  }
}

/**
 * Mobile PWA Enhancement System
 */
class MobileGestureHandler {
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;
  private readonly minSwipeDistance = 50;
  private readonly maxTapDuration = 200;
  private touchStartTime = 0;

  constructor() {
    this.attachListeners();
  }

  private attachListeners(): void {
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (!touch) return;
    
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  }

  private handleTouchEnd(e: TouchEvent): void {
    const touch = e.changedTouches[0];
    if (!touch) return;

    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;

    const touchDuration = Date.now() - this.touchStartTime;
    
    if (touchDuration < this.maxTapDuration) {
      this.handleTap();
    } else {
      this.handleSwipe();
    }
  }

  private handleTap(): void {
    // Enhanced tap feedback for mobile
    const target = document.elementFromPoint(this.touchEndX, this.touchEndY);
    if (target instanceof HTMLElement && target.matches('button, [role="button"], a')) {
      target.style.transform = 'scale(0.95)';
      setTimeout(() => {
        target.style.transform = '';
      }, 100);
    }
  }

  private handleSwipe(): void {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Only trigger swipe if movement is primarily horizontal and exceeds minimum distance
    if (absDeltaX > absDeltaY && absDeltaX > this.minSwipeDistance) {
      if (deltaX > 0) {
        this.onSwipeRight();
      } else {
        this.onSwipeLeft();
      }
    }
  }

  private onSwipeLeft(): void {
    // Custom event for swipe left - can be used for navigation
    document.dispatchEvent(new CustomEvent('healwave:swipe-left'));
  }

  private onSwipeRight(): void {
    // Custom event for swipe right - can be used for navigation  
    document.dispatchEvent(new CustomEvent('healwave:swipe-right'));
  }
}

/**
 * Mobile Viewport Optimizer
 */
class MobileViewportOptimizer {
  private viewportHeight = 0;

  constructor() {
    this.initializeViewport();
    this.setupViewportListeners();
  }

  private initializeViewport(): void {
    this.setVHCustomProperty();
    this.preventZoom();
    this.setupSafeAreaSupport();
  }

  private setVHCustomProperty(): void {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.viewportHeight = window.innerHeight;
  }

  private preventZoom(): void {
    // Prevent accidental zoom on mobile
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    
    // Handle viewport meta tag dynamically
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }

  private setupSafeAreaSupport(): void {
    // Set CSS custom properties for safe areas
    const safeAreaTop = 'env(safe-area-inset-top)';
    const safeAreaRight = 'env(safe-area-inset-right)';
    const safeAreaBottom = 'env(safe-area-inset-bottom)';
    const safeAreaLeft = 'env(safe-area-inset-left)';

    document.documentElement.style.setProperty('--safe-area-inset-top', safeAreaTop);
    document.documentElement.style.setProperty('--safe-area-inset-right', safeAreaRight);
    document.documentElement.style.setProperty('--safe-area-inset-bottom', safeAreaBottom);
    document.documentElement.style.setProperty('--safe-area-inset-left', safeAreaLeft);
  }

  private setupViewportListeners(): void {
    let resizeTimeout: number;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.setVHCustomProperty();
      }, 100);
    });

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.setVHCustomProperty();
      }, 500);
    });
  }
}

/**
 * Initialize mobile enhancements
 */
function initializeMobileEnhancements(): void {
  const detector = PWACapabilitiesDetector.getInstance();
  
  if (detector.isMobile) {
    PWALogger.log('🎧 Initializing mobile enhancements for HealWave...');
    
    // Initialize gesture handling
    new MobileGestureHandler();
    
    // Initialize viewport optimization
    new MobileViewportOptimizer();
    
    // Add mobile-specific classes
    document.body.classList.add('healwave-mobile', `healwave-${detector.platform}`);
    
    PWALogger.log('✅ Mobile enhancements initialized');
  }
}

// PWA Service Worker Registration
async function registerServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      PWALogger.log('🔧 Registering Service Worker...');

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module',
      });

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

      // Check for updates periodically
      setInterval(() => {
        void registration.update();
      }, 60000); // Check every minute

      PWALogger.log('✅ Service Worker registered successfully');

      // Initialize PWA features
      // Fire-and-forget; internal logic attaches listeners only
      // Fire-and-forget initialization; internal handlers manage their own errors
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
  // Initialize mobile enhancements first
  initializeMobileEnhancements();

  let deferredPrompt: {
    prompt: () => void;
    userChoice: Promise<{ outcome: string }>;
  } | null = null;

  window.addEventListener('beforeinstallprompt', (e: Event): void => {
    e.preventDefault();
    const evt = e as unknown as {
      prompt: () => void;
      userChoice: Promise<{ outcome: string }>;
    };
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
  window.addEventListener('install-app', () => {
    // Wrap async operations explicitly; ESLint: no-misused-promises satisfied
    void (async () => {
      if (deferredPrompt !== null) {
        try {
          deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          PWALogger.log(
            choiceResult.outcome === 'accepted'
              ? '✅ User accepted the install prompt'
              : '❌ User dismissed the install prompt'
          );
        } finally {
          deferredPrompt = null;
        }
      }
    })();
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

// Show install prompt
function showInstallPrompt(): void {
  const detector = PWACapabilitiesDetector.getInstance();
  
  // Check if already installed
  if (detector.isStandalone) {
    return;
  }

  // Handle iOS separately since it doesn't support BeforeInstallPromptEvent
  if (detector.platform === 'ios') {
    showIOSInstallInstructions();
    return;
  }

  // Get platform-specific messaging
  const platformMessages = {
    android: {
      title: 'Install HealWave App',
      subtitle: 'Get faster access to healing frequencies with enhanced performance and offline capability.',
      icon: '🎧'
    },
    desktop: {
      title: 'Install HealWave Desktop App',
      subtitle: 'Launch HealWave directly from your desktop for a seamless healing experience.',
      icon: '🖥️'
    },
    other: {
      title: 'Install HealWave',
      subtitle: 'Access healing frequencies faster with offline capability and better performance.',
      icon: '🎧'
    }
  };

  const message = platformMessages[detector.platform] || platformMessages.other;

  // Create install prompt
  const installBanner = document.createElement('div');
  installBanner.id = 'pwa-install-banner';
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: ${detector.isMobile ? '20px' : '30px'};
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
      max-width: ${detector.isMobile ? '100%' : '400px'};
      margin: 0 auto;
      transform: translateY(0);
      transition: transform 0.3s ease-in-out;
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
          flex-shrink: 0;
        ">${message.icon}</div>
        <div style="flex: 1; min-width: 0;">
          <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">${message.title}</h3>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.4;">${message.subtitle}</p>
        </div>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
        <button id="install-app-btn" style="
          flex: 1;
          min-width: 120px;
          background: linear-gradient(135deg, #7c3aed, #06b6d4);
          border: none;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: transform 0.2s ease;
        ">Install App</button>
        <button id="dismiss-install-btn" style="
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: #cbd5e1;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        ">Not Now</button>
      </div>
    </div>
  `;

  document.body.appendChild(installBanner);

  // Add mobile-specific animations
  if (detector.isMobile) {
    const banner = installBanner.firstElementChild as HTMLElement;
    banner.style.transform = 'translateY(100%)';
    requestAnimationFrame(() => {
      banner.style.transform = 'translateY(0)';
    });
  }

  // Handle install button
  document.getElementById('install-app-btn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('install-app'));
    installBanner.remove();
  });

  // Handle dismiss button
  document
    .getElementById('dismiss-install-btn')
    ?.addEventListener('click', () => {
      if (detector.isMobile) {
        const banner = installBanner.firstElementChild as HTMLElement;
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => installBanner.remove(), 300);
      } else {
        installBanner.remove();
      }
    });

  // Auto-dismiss after 30 seconds on mobile
  if (detector.isMobile) {
    setTimeout(() => {
      if (installBanner.parentNode) {
        const banner = installBanner.firstElementChild as HTMLElement;
        banner.style.transform = 'translateY(100%)';
        setTimeout(() => installBanner.remove(), 300);
      }
    }, 30000);
  }
}

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
  modal.addEventListener('click', (e) => {
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

// Register when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void registerServiceWorker();
  });
} else {
  void registerServiceWorker();
}

export { registerServiceWorker };
