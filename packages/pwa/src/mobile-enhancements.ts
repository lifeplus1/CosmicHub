/**
 * UX-021: Mobile PWA Enhancements
 * Enhanced mobile-specific PWA features including touch interactions,
 * viewport optimization, and platform-specific behaviors
 */

// Touch interaction enhancements
interface TouchEventWithCoords extends TouchEvent {
  coordinates?: { x: number; y: number };
}

// PWA mobile capabilities detection
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

// BeforeInstallPrompt event interface
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Platform-specific install message
interface InstallMessage {
  title: string;
  description: string;
  action: string;
}

// Mobile gesture handler
class MobileGestureHandler {
  private startX = 0;
  private startY = 0;
  private threshold = 50; // Minimum swipe distance
  private maxTime = 300; // Maximum swipe time in ms
  private startTime = 0;

  private callbacks = {
    swipeLeft: [] as Array<(e: TouchEvent) => void>,
    swipeRight: [] as Array<(e: TouchEvent) => void>,
    swipeUp: [] as Array<(e: TouchEvent) => void>,
    swipeDown: [] as Array<(e: TouchEvent) => void>,
    doubleTap: [] as Array<(e: TouchEvent) => void>,
    longPress: [] as Array<(e: TouchEvent) => void>,
  };

  private longPressTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private element: HTMLElement) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Passive touch events for better performance
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });

    // Double tap handling
    let tapCount = 0;
    let singleTapTimer: ReturnType<typeof setTimeout> | null = null;

    this.element.addEventListener('touchend', (e: TouchEvent) => {
      tapCount++;
      if (tapCount === 1) {
        singleTapTimer = setTimeout(() => {
          tapCount = 0;
        }, 300);
      } else if (tapCount === 2) {
        if (singleTapTimer) {
          clearTimeout(singleTapTimer);
        }
        tapCount = 0;
        this.callbacks.doubleTap.forEach(callback => callback(e));
      }
    }, { passive: true });
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (!touch) return;
    
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();

    // Setup long press detection
    this.longPressTimer = setTimeout(() => {
      this.callbacks.longPress.forEach(callback => callback(e));
    }, 500);
  }

  private handleTouchMove(): void {
    // Cancel long press if finger moves
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private handleTouchEnd(e: TouchEvent): void {
    // Cancel long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    const touch = e.changedTouches[0];
    if (!touch) return;
    
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const deltaTime = Date.now() - this.startTime;

    // Check if swipe meets criteria
    if (deltaTime <= this.maxTime) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > this.threshold || absY > this.threshold) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0) {
            this.callbacks.swipeRight.forEach(callback => callback(e));
          } else {
            this.callbacks.swipeLeft.forEach(callback => callback(e));
          }
        } else {
          // Vertical swipe
          if (deltaY > 0) {
            this.callbacks.swipeDown.forEach(callback => callback(e));
          } else {
            this.callbacks.swipeUp.forEach(callback => callback(e));
          }
        }
      }
    }
  }

  // Public API for registering callbacks
  onSwipeLeft(callback: (e: TouchEvent) => void): void {
    this.callbacks.swipeLeft.push(callback);
  }

  onSwipeRight(callback: (e: TouchEvent) => void): void {
    this.callbacks.swipeRight.push(callback);
  }

  onSwipeUp(callback: (e: TouchEvent) => void): void {
    this.callbacks.swipeUp.push(callback);
  }

  onSwipeDown(callback: (e: TouchEvent) => void): void {
    this.callbacks.swipeDown.push(callback);
  }

  onDoubleTap(callback: (e: TouchEvent) => void): void {
    this.callbacks.doubleTap.push(callback);
  }

  onLongPress(callback: (e: TouchEvent) => void): void {
    this.callbacks.longPress.push(callback);
  }

  destroy(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }
}

// PWA mobile capabilities detector
class PWACapabilitiesDetector {
  static detect(): PWACapabilities {
    return {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator as Navigator & { standalone?: boolean }).standalone === true,
      hasPushNotifications: 'PushManager' in window && 'Notification' in window,
      hasBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
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

// Mobile viewport optimizer
class MobileViewportOptimizer {
  private static initialViewportHeight = 0;
  private static isKeyboardOpen = false;

  static initialize(): void {
    this.initialViewportHeight = window.visualViewport?.height ?? window.innerHeight;
    this.setupViewportHandlers();
    this.optimizeForMobile();
  }

  private static setupViewportHandlers(): void {
    // Handle viewport changes (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleViewportResize();
      });
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', () => {
        this.handleViewportResize();
      });
    }

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
  }

  private static handleViewportResize(): void {
    const currentHeight = window.visualViewport?.height ?? window.innerHeight;
    const heightDiff = this.initialViewportHeight - currentHeight;
    
    // Detect if keyboard is likely open (height reduced by more than 150px)
    const keyboardOpen = heightDiff > 150;
    
    if (keyboardOpen !== this.isKeyboardOpen) {
      this.isKeyboardOpen = keyboardOpen;
      document.body.classList.toggle('keyboard-open', keyboardOpen);
      
      // Emit custom event
      window.dispatchEvent(new CustomEvent('keyboardToggle', {
        detail: { isOpen: keyboardOpen, heightDiff }
      }));
    }
  }

  private static handleOrientationChange(): void {
    // Force viewport recalculation after orientation change
    this.initialViewportHeight = window.visualViewport?.height ?? window.innerHeight;
    
    // Emit custom event
    window.dispatchEvent(new CustomEvent('orientationChanged', {
      detail: { 
        orientation: screen.orientation?.angle || 0,
        height: this.initialViewportHeight 
      }
    }));
  }

  private static optimizeForMobile(): void {
    // Add mobile-specific CSS classes
    const capabilities = PWACapabilitiesDetector.detect();
    
    document.documentElement.classList.toggle('has-touch', capabilities.hasTouch);
    document.documentElement.classList.toggle('is-standalone', capabilities.hasStandalone);
    document.documentElement.classList.add(`platform-${capabilities.platform}`);
    
    // Set CSS custom properties for dynamic viewport units
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100);
    });
  }
}

// Enhanced PWA install experience for mobile
class MobilePWAInstaller {
  private static deferredPrompt: BeforeInstallPromptEvent | null = null;
  private static installAttempts = 0;
  private static maxAttempts = 3;

  static initialize(): void {
    this.setupInstallPromptHandling();
    this.setupInstallTracking();
  }

  private static setupInstallPromptHandling(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Show custom install prompt after user engagement
      this.scheduleInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.deferredPrompt = null;
      this.trackInstallSuccess();
      
      // Show success message
      this.showInstallSuccessMessage();
    });
  }

  private static scheduleInstallPrompt(): void {
    // Don't show if already attempted too many times
    if (this.installAttempts >= this.maxAttempts) {
      return;
    }

    // Wait for user engagement before showing prompt
    const engagementEvents = ['click', 'touch', 'scroll'];
    const triggerPrompt = () => {
      setTimeout(() => {
        this.showEnhancedInstallPrompt();
      }, 2000); // Delay to ensure user is engaged
      
      // Remove listeners after first trigger
      engagementEvents.forEach(event => {
        document.removeEventListener(event, triggerPrompt);
      });
    };

    engagementEvents.forEach(event => {
      document.addEventListener(event, triggerPrompt, { once: true, passive: true });
    });
  }

  private static showEnhancedInstallPrompt(): void {
    const capabilities = PWACapabilitiesDetector.detect();
    
    // Platform-specific messaging
    const messages = {
      ios: {
        title: 'Add CosmicHub to Home Screen',
        description: 'Tap the Share button, then "Add to Home Screen" for the best experience.',
        action: 'Show Instructions'
      },
      android: {
        title: 'Install CosmicHub App',
        description: 'Get faster access and offline features with our app.',
        action: 'Install Now'
      },
      desktop: {
        title: 'Install CosmicHub',
        description: 'Install for faster loading and desktop integration.',
        action: 'Install App'
      },
      unknown: {
        title: 'Install CosmicHub',
        description: 'Install for faster loading and offline features.',
        action: 'Install App'
      }
    };

    const message = messages[capabilities.platform];
    
    // Create enhanced install banner
    const banner = this.createInstallBanner(message);
    document.body.appendChild(banner);

    this.installAttempts++;
  }

  private static createInstallBanner(message: InstallMessage): HTMLElement {
    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner-enhanced';
    
    banner.innerHTML = `
      <div class="install-banner-content">
        <div class="install-banner-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div class="install-banner-text">
          <h3>${message.title}</h3>
          <p>${message.description}</p>
        </div>
        <div class="install-banner-actions">
          <button class="install-btn primary">${message.action}</button>
          <button class="install-btn secondary">Later</button>
        </div>
      </div>
    `;

    // Add styles
    this.injectInstallBannerStyles();

    // Setup event handlers
    const installBtn = banner.querySelector('.install-btn.primary') as HTMLButtonElement;
    const laterBtn = banner.querySelector('.install-btn.secondary') as HTMLButtonElement;

    installBtn.addEventListener('click', () => {
      this.handleInstallClick();
      banner.remove();
    });

    laterBtn.addEventListener('click', () => {
      banner.remove();
    });

    return banner;
  }

  private static injectInstallBannerStyles(): void {
    if (document.querySelector('#pwa-install-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'pwa-install-styles';
    styles.textContent = `
      .pwa-install-banner-enhanced {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: rgba(26, 26, 46, 0.98);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 24px;
        z-index: 10000;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        transform: translateY(100%);
        animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      @keyframes slideUp {
        to {
          transform: translateY(0);
        }
      }

      .install-banner-content {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }

      .install-banner-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #553c9a, #f6ad55);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .install-banner-text {
        flex: 1;
        min-width: 0;
      }

      .install-banner-text h3 {
        margin: 0 0 8px 0;
        color: white;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.3;
      }

      .install-banner-text p {
        margin: 0 0 16px 0;
        color: #cbd5e1;
        font-size: 14px;
        line-height: 1.5;
      }

      .install-banner-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .install-btn {
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        flex: 1;
        min-width: 80px;
      }

      .install-btn.primary {
        background: linear-gradient(135deg, #553c9a, #f6ad55);
        color: white;
      }

      .install-btn.primary:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 25px rgba(85, 60, 154, 0.3);
      }

      .install-btn.secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .install-btn.secondary:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      /* Mobile-specific adjustments */
      @media (max-width: 480px) {
        .pwa-install-banner-enhanced {
          left: 16px;
          right: 16px;
          bottom: 16px;
          padding: 20px;
        }

        .install-banner-content {
          gap: 12px;
        }

        .install-banner-text h3 {
          font-size: 16px;
        }

        .install-banner-text p {
          font-size: 13px;
        }

        .install-banner-actions {
          flex-direction: column;
          gap: 8px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  private static handleInstallClick(): void {
    const capabilities = PWACapabilitiesDetector.detect();

    if (capabilities.platform === 'ios') {
      this.showIOSInstructions();
    } else if (this.deferredPrompt) {
      void this.deferredPrompt.prompt();
      void this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.trackInstallSuccess();
        } else {
          this.trackInstallDismissal();
        }
        this.deferredPrompt = null;
      });
    }
  }

  private static showIOSInstructions(): void {
    const modal = document.createElement('div');
    modal.className = 'ios-install-modal';
    
    modal.innerHTML = `
      <div class="ios-install-content">
        <div class="ios-install-header">
          <h3>Add to Home Screen</h3>
          <button class="close-btn">×</button>
        </div>
        <div class="ios-install-steps">
          <div class="ios-step">
            <div class="step-number">1</div>
            <div class="step-text">Tap the Share button <span class="share-icon">⬆️</span> at the bottom of Safari</div>
          </div>
          <div class="ios-step">
            <div class="step-number">2</div>
            <div class="step-text">Scroll down and tap "Add to Home Screen"</div>
          </div>
          <div class="ios-step">
            <div class="step-number">3</div>
            <div class="step-text">Tap "Add" to install CosmicHub</div>
          </div>
        </div>
      </div>
    `;

    // Add iOS modal styles
    this.injectIOSModalStyles();

    document.body.appendChild(modal);

    // Handle close
    modal.querySelector('.close-btn')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  private static injectIOSModalStyles(): void {
    if (document.querySelector('#ios-install-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'ios-install-styles';
    styles.textContent = `
      .ios-install-modal {
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
      }

      .ios-install-content {
        background: white;
        border-radius: 20px;
        max-width: 400px;
        width: 100%;
        overflow: hidden;
      }

      .ios-install-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e5e5;
      }

      .ios-install-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }

      .close-btn {
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
      }

      .close-btn:hover {
        background-color: #f0f0f0;
      }

      .ios-install-steps {
        padding: 24px;
      }

      .ios-step {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 20px;
      }

      .ios-step:last-child {
        margin-bottom: 0;
      }

      .step-number {
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
      }

      .step-text {
        color: #333;
        font-size: 15px;
        line-height: 1.5;
        padding-top: 4px;
      }

      .share-icon {
        display: inline-block;
        margin: 0 4px;
        font-size: 18px;
      }
    `;

    document.head.appendChild(styles);
  }

  private static showInstallSuccessMessage(): void {
    const message = document.createElement('div');
    message.className = 'install-success-message';
    message.innerHTML = `
      <div class="success-content">
        <div class="success-icon">✅</div>
        <div class="success-text">
          <h4>App Installed Successfully!</h4>
          <p>CosmicHub is now available from your home screen.</p>
        </div>
      </div>
    `;

    // Add styles for success message
    this.injectSuccessStyles();

    document.body.appendChild(message);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      message.remove();
    }, 4000);
  }

  private static injectSuccessStyles(): void {
    if (document.querySelector('#install-success-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'install-success-styles';
    styles.textContent = `
      .install-success-message {
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        background: rgba(34, 197, 94, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 16px 20px;
        z-index: 10002;
        color: white;
        transform: translateY(-100%);
        animation: slideDown 0.4s ease-out forwards, fadeOut 0.3s ease-in 3.7s forwards;
      }

      @keyframes slideDown {
        to { transform: translateY(0); }
      }

      @keyframes fadeOut {
        to { opacity: 0; transform: translateY(-100%); }
      }

      .success-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .success-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .success-text h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
      }

      .success-text p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }
    `;

    document.head.appendChild(styles);
  }

  private static setupInstallTracking(): void {
    // Track install attempts and outcomes for analytics
    // This could integrate with your analytics service
  }

  private static trackInstallSuccess(): void {
    // Track successful installation
    console.log('PWA install success tracked');
  }

  private static trackInstallDismissal(): void {
    // Track when user dismisses install prompt
    console.log('PWA install dismissal tracked');
  }
}

// Mobile-specific PWA feature manager
class MobilePWAFeatures {
  private static capabilities: PWACapabilities;
  private static gestureHandlers = new Map<HTMLElement, MobileGestureHandler>();

  static initialize(): void {
    this.capabilities = PWACapabilitiesDetector.detect();
    
    // Initialize mobile-specific features based on capabilities
    this.setupPlatformFeatures();
    MobileViewportOptimizer.initialize();
    MobilePWAInstaller.initialize();
  }

  private static setupPlatformFeatures(): void {
    // Setup vibration feedback for touch interactions
    if (this.capabilities.hasVibration) {
      this.setupVibrationFeedback();
    }

    // Setup web share API
    if (this.capabilities.hasWebShare) {
      this.setupWebShare();
    }

    // Setup device motion for advanced interactions
    if (this.capabilities.hasDeviceMotion) {
      this.setupDeviceMotion();
    }

    // Setup platform-specific behaviors
    this.setupPlatformSpecificBehaviors();
  }

  private static setupVibrationFeedback(): void {
    // Add subtle vibration feedback to button presses
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, .btn, [role="button"]')) {
        navigator.vibrate([10]); // Short vibration
      }
    }, { passive: true });
  }

  private static setupWebShare(): void {
    // Enhance share functionality with native sharing
    window.addEventListener('share-chart', () => {
      if (navigator.share) {
        void navigator.share({
          title: 'My Cosmic Chart - CosmicHub',
          text: 'Check out my astrological chart from CosmicHub!',
          url: window.location.href
        }).catch(error => {
          console.log('Share cancelled or failed:', error);
        });
      }
    });
  }

  private static setupDeviceMotion(): void {
    // Setup shake gesture for refresh functionality
    let lastShake = 0;
    const shakeThreshold = 15;
    
    window.addEventListener('devicemotion', (e) => {
      const acceleration = e.accelerationIncludingGravity;
      if (!acceleration) return;

      const { x, y, z } = acceleration;
      if (x === null || y === null || z === null) return;
      
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
      
      if (totalAcceleration > shakeThreshold) {
        const now = Date.now();
        if (now - lastShake > 1000) { // Prevent rapid shake triggers
          lastShake = now;
          window.dispatchEvent(new CustomEvent('shake-gesture'));
          
          if (this.capabilities.hasVibration) {
            navigator.vibrate([100, 50, 100]); // Shake feedback pattern
          }
        }
      }
    });
  }

  private static setupPlatformSpecificBehaviors(): void {
    const { platform } = this.capabilities;

    if (platform === 'ios') {
      // iOS-specific enhancements
      this.setupIOSEnhancements();
    } else if (platform === 'android') {
      // Android-specific enhancements
      this.setupAndroidEnhancements();
    }
  }

  private static setupIOSEnhancements(): void {
    // Handle iOS safe areas
    document.documentElement.style.setProperty(
      '--safe-area-inset-top',
      'env(safe-area-inset-top, 0px)'
    );
    document.documentElement.style.setProperty(
      '--safe-area-inset-bottom',
      'env(safe-area-inset-bottom, 0px)'
    );

    // Disable rubber band scrolling where inappropriate
    document.body.addEventListener('touchmove', (e) => {
      if (e.target === document.body) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  private static setupAndroidEnhancements(): void {
    // Handle Android-specific behaviors
    // Add theme color meta tag for Android Chrome
    const existingTheme = document.querySelector('meta[name="theme-color"]');
    if (!existingTheme) {
      const themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      themeColor.content = '#553c9a';
      document.head.appendChild(themeColor);
    }
  }

  // Public API for adding gesture support to elements
  static addGestureSupport(element: HTMLElement): MobileGestureHandler {
    if (this.gestureHandlers.has(element)) {
      return this.gestureHandlers.get(element)!;
    }

    const handler = new MobileGestureHandler(element);
    this.gestureHandlers.set(element, handler);
    return handler;
  }

  static removeGestureSupport(element: HTMLElement): void {
    const handler = this.gestureHandlers.get(element);
    if (handler) {
      handler.destroy();
      this.gestureHandlers.delete(element);
    }
  }

  static getCapabilities(): PWACapabilities {
    return { ...this.capabilities };
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      MobilePWAFeatures.initialize();
    });
  } else {
    MobilePWAFeatures.initialize();
  }
}

export {
  MobileGestureHandler,
  PWACapabilitiesDetector,
  MobileViewportOptimizer,
  MobilePWAInstaller,
  MobilePWAFeatures,
};

export type {
  PWACapabilities,
  TouchEventWithCoords
};
