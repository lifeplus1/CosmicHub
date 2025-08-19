/**
 * Advanced PWA Performance Enhancements
 * Builds on existing CosmicHub performance optimizations
 */

// Type definition for devConsole to fix unsafe access issues
interface DevConsole {
  log?: (message?: unknown, ...optionalParams: unknown[]) => void;
  warn?: (message?: unknown, ...optionalParams: unknown[]) => void;
  error?: (message?: unknown, ...optionalParams: unknown[]) => void;
}

// Safe logging helper to avoid require() and unsafe assignments
function safeLog(message: string): void {
  try {
    // Use dynamic import instead of require for ES modules
    void import('./config/environment').then(({ devConsole }: { devConsole: DevConsole }) => {
      devConsole.log?.(message);
    }).catch(() => {
      // Fallback - no logging in production
    });
  } catch {
    // Silent fallback for production
  }
}

function safeWarn(message: string, ...args: unknown[]): void {
  try {
    void import('./config/environment').then(({ devConsole }: { devConsole: DevConsole }) => {
      devConsole.warn?.(message, ...args);
    }).catch(() => {
      // Fallback - no logging in production
    });
  } catch {
    // Silent fallback for production
  }
}

function safeError(message: string, ...args: unknown[]): void {
  try {
    void import('./config/environment').then(({ devConsole }: { devConsole: DevConsole }) => {
      devConsole.error?.(message, ...args);
    }).catch(() => {
      // Silent fallback - errors logged through devConsole only
    });
  } catch {
    // Silent fallback - errors logged through devConsole only
  }
}

// Critical Resource Prioritization
export class CriticalResourceManager {
  private static readonly CRITICAL_RESOURCES = [
    // Removed CSS preloading since Vite handles this automatically
    // '/src/styles/index.css' - This causes the preload warning
  ];

  private static readonly FONT_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
  ];

  static preloadCriticalResources(): void {
    safeLog('⚡ Preloading critical resources...');

    // Skip critical resource preloading since Vite handles this efficiently
    // Removed manual CSS preloading to fix the preload warning
    safeLog('🎯 Critical resource preloading complete (handled by Vite)');
    return;
  }

  static optimizeFontLoading(): void {
    safeLog('🔤 Optimizing font loading...');

    // Add font-display: swap to improve loading performance
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
      const href = link.getAttribute('href');
      const hrefAttr = href ?? '';
      if (typeof hrefAttr === 'string' && !hrefAttr.includes('display=swap')) {
        try {
          const url = new URL(hrefAttr);
          url.searchParams.set('display', 'swap');
          link.setAttribute('href', url.toString());
        } catch {
          safeWarn('🔤 Invalid font URL, skipping:', hrefAttr);
        }
      }
    });

    // Note: Removed aggressive font preloading to reduce unused resource warnings
    // Font files will load naturally through the Google Fonts CSS
  }

  static enableResourceHints(): void {
    safeLog('🔗 Setting up resource hints...');

    // DNS prefetch for external domains
    const dnsPrefetchDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'api.cosmichub.com', // Future API domain
      'cdn.cosmichub.com'  // Future CDN domain
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `https://${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical third-party origins
    const preconnectDomains = [
      { href: 'https://fonts.googleapis.com', crossorigin: false },
      { href: 'https://fonts.gstatic.com', crossorigin: true }
    ];

    preconnectDomains.forEach(({ href, crossorigin }) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      if (crossorigin) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  static optimizeScriptLoading(): void {
    safeLog('📜 Optimizing script loading...');

    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      const src = scriptElement.src ?? '';
      if (src && !scriptElement.defer && !scriptElement.async) {
        scriptElement.defer = true;
      }
    });
  }
}

// Connection-aware loading (builds on existing lazy loading)
export class ConnectionAwareLoader {
  private static getConnection(): NetworkInformation | null {
    if (globalThis?.navigator === null) return null;
    const nav = navigator as unknown as { connection?: NetworkInformation; mozConnection?: NetworkInformation; webkitConnection?: NetworkInformation };
    return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
  }

  static getConnectionInfo(): { effectiveType: string; downlink: number; saveData: boolean } {
    const connection = this.getConnection();
    if (connection === null) {
      return { effectiveType: '4g', downlink: 10, saveData: false };
    }

    return {
      effectiveType: connection.effectiveType ?? '4g',
      downlink: connection.downlink ?? 10,
      saveData: connection.saveData ?? false,
    };
  }

  static shouldOptimizeForSlowConnection(): boolean {
    const info = this.getConnectionInfo();
    return ['slow-2g', '2g'].includes(info.effectiveType) || 
           info.downlink < 1.5 || 
           info.saveData;
  }

  static adaptResourceLoading(): void {
    const shouldOptimize = this.shouldOptimizeForSlowConnection();
    
    if (shouldOptimize) {
      safeLog('🐌 Slow connection detected, optimizing resource loading...');
      
      // Reduce image quality
      document.documentElement.style.setProperty('--image-quality', '0.7');
      
      // Disable non-critical animations
      document.documentElement.style.setProperty('--reduce-motion', '1');
      
      // Prioritize critical resources only
      this.prioritizeCriticalOnly();
    } else {
      safeLog('🚀 Fast connection detected, enabling full features...');
    }
  }

  private static prioritizeCriticalOnly(): void {
    // Cancel non-critical preloads
    const nonCriticalPreloads = document.querySelectorAll('link[rel="preload"]:not([data-critical])');
    nonCriticalPreloads.forEach(link => link.remove());
    
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script:not([data-critical])');
    scripts.forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      const src = scriptElement.src ?? '';
      if (src && !scriptElement.defer && !scriptElement.async) {
        scriptElement.defer = true;
      }
    });
  }
}

// Performance monitoring for PWA
export class PWAPerformanceMonitor {
  private static metrics: Map<string, number> = new Map();

  static startTiming(label: string): void {
    this.metrics.set(`${label}_start`, performance.now());
  }

  static endTiming(label: string): number {
    const startTime = this.metrics.get(`${label}_start`);
    if (startTime === null) {
      safeWarn(`No start time found for ${label}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.metrics.set(label, duration);
    safeLog(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  static measurePWAMetrics(): void {
    // Measure PWA-specific metrics

    if (globalThis.navigator?.serviceWorker !== null) {
      void navigator.serviceWorker.ready.then(() => {
        const perfNow = globalThis.performance?.now;
      if (perfNow !== null) {
          const swReadyTime = perfNow();
          safeLog(`🔧 Service Worker ready: ${swReadyTime.toFixed(2)}ms`);
        }
      });
    }

    // Measure app shell loading
    if (globalThis.window !== null) {
      window.addEventListener('DOMContentLoaded', () => {
        const perfNow = globalThis.performance?.now;
        if (perfNow !== null) {
          const domReady = perfNow();
          safeLog(`📄 DOM ready: ${domReady.toFixed(2)}ms`);
        }
      });
    }

    // Measure Core Web Vitals
    this.observeWebVitals();
  }

  private static observeWebVitals(): void {
    // Largest Contentful Paint
    if (globalThis.PerformanceObserver !== null) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          const startTime = lastEntry?.startTime;
          if (startTime !== null) {
            safeLog(`📊 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const e = entry as PerformanceEntry & Record<string, unknown>;
            const processingStart = e['processingStart'];
            const startTime = e['startTime'];
            if (typeof processingStart === 'number' && typeof startTime === 'number') {
              safeLog(`⚡ FID: ${processingStart - startTime}ms`);
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry) => {
            const e = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
            const { hadRecentInput, value } = e;
            if (!hadRecentInput) {
              clsValue += value;
            }
          });
          safeLog(`📐 CLS: ${clsValue.toFixed(4)}`);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (err) {
        // PerformanceObserver may not be supported in some environments
        safeWarn('PerformanceObserver not available', err);
      }
    }
  }

  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// Initialize enhanced PWA performance
export function initializePWAPerformance(): void {
  safeLog('🚀 Initializing PWA performance enhancements...');

  // Start overall timing
  PWAPerformanceMonitor.startTiming('pwa_initialization');

  try {
    // Set up connection-aware loading
    ConnectionAwareLoader.adaptResourceLoading();

    // Enable resource hints
    CriticalResourceManager.enableResourceHints();

    // Optimize font loading
    CriticalResourceManager.optimizeFontLoading();

    // Preload critical resources
    CriticalResourceManager.preloadCriticalResources();

    // Start performance monitoring
    PWAPerformanceMonitor.measurePWAMetrics();

    // End timing
    PWAPerformanceMonitor.endTiming('pwa_initialization');

    safeLog('✅ PWA performance enhancements initialized');

  } catch (error) {
    safeError('❌ Failed to initialize PWA performance enhancements:', error);
  }
}

// Auto-initialize when imported
const doc = typeof document !== 'undefined' ? document : null;
if (doc !== null) {
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', () => {
      initializePWAPerformance();
    });
  } else {
    initializePWAPerformance();
  }
}
