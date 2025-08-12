/**
 * Advanced PWA Performance Enhancements
 * Builds on existing CosmicHub performance optimizations
 */

// Critical Resource Prioritization
export class CriticalResourceManager {
  private static readonly CRITICAL_RESOURCES = [
    '/src/main.tsx',
    '/src/styles/index.css'
  ];

  private static readonly FONT_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
  ];

  static async preloadCriticalResources(): Promise<void> {
    console.log('⚡ Preloading critical resources...');

    // Only preload resources that exist and are needed immediately
    const preloadPromises = this.CRITICAL_RESOURCES.map(resource => {
      return new Promise<void>((resolve) => {
        // Skip preloading .tsx files since they're handled by Vite
        if (resource.endsWith('.tsx')) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        
        link.onload = () => {
          console.log(`✅ Preloaded: ${resource}`);
          resolve();
        };
        link.onerror = () => {
          console.warn(`⚠️ Failed to preload: ${resource}`);
          resolve(); // Don't block on failed preloads
        };
        
        document.head.appendChild(link);
      });
    });

    await Promise.allSettled(preloadPromises);
    console.log('🎯 Critical resource preloading complete');
  }

  static optimizeFontLoading(): void {
    console.log('🔤 Optimizing font loading...');

    // Add font-display: swap to improve loading performance
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.includes('display=swap')) {
        try {
          const url = new URL(href);
          url.searchParams.set('display', 'swap');
          link.setAttribute('href', url.toString());
        } catch (error) {
          console.warn('🔤 Invalid font URL, skipping:', href);
        }
      }
    });

    // Note: Removed aggressive font preloading to reduce unused resource warnings
    // Font files will load naturally through the Google Fonts CSS
  }

  static async enableResourceHints(): Promise<void> {
    console.log('🔗 Setting up resource hints...');

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
    console.log('📜 Optimizing script loading...');

    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      if (scriptElement.src && !scriptElement.defer && !scriptElement.async) {
        scriptElement.defer = true;
      }
    });
  }
}

// Connection-aware loading (builds on existing lazy loading)
export class ConnectionAwareLoader {
  private static connection = (navigator as any).connection || 
                              (navigator as any).mozConnection || 
                              (navigator as any).webkitConnection;

  static getConnectionInfo(): {
    effectiveType: string;
    downlink: number;
    saveData: boolean;
  } {
    if (!this.connection) {
      return {
        effectiveType: '4g',
        downlink: 10,
        saveData: false
      };
    }

    return {
      effectiveType: this.connection.effectiveType || '4g',
      downlink: this.connection.downlink || 10,
      saveData: this.connection.saveData || false
    };
  }

  static shouldOptimizeForSlowConnection(): boolean {
    const info = this.getConnectionInfo();
    return info.effectiveType === 'slow-2g' || 
           info.effectiveType === '2g' || 
           info.downlink < 1.5 || 
           info.saveData;
  }

  static adaptResourceLoading(): void {
    const shouldOptimize = this.shouldOptimizeForSlowConnection();
    
    if (shouldOptimize) {
      console.log('🐌 Slow connection detected, optimizing resource loading...');
      
      // Reduce image quality
      document.documentElement.style.setProperty('--image-quality', '0.7');
      
      // Disable non-critical animations
      document.documentElement.style.setProperty('--reduce-motion', '1');
      
      // Prioritize critical resources only
      this.prioritizeCriticalOnly();
    } else {
      console.log('🚀 Fast connection detected, enabling full features...');
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
      if (scriptElement.src && !scriptElement.defer && !scriptElement.async) {
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
    if (startTime === undefined) {
      console.warn(`No start time found for ${label}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.metrics.set(label, duration);
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  static measurePWAMetrics(): void {
    // Measure PWA-specific metrics
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        const swReadyTime = performance.now();
        console.log(`🔧 Service Worker ready: ${swReadyTime.toFixed(2)}ms`);
      });
    }

    // Measure app shell loading
    window.addEventListener('DOMContentLoaded', () => {
      const domReady = performance.now();
      console.log(`📄 DOM ready: ${domReady.toFixed(2)}ms`);
    });

    // Measure Core Web Vitals
    this.observeWebVitals();
  }

  private static observeWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`📊 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as any; // Type assertion for FID properties
          console.log(`⚡ FID: ${fidEntry.processingStart - fidEntry.startTime}ms`);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach(entry => {
          const clsEntry = entry as any; // Type assertion for CLS properties
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        });
        console.log(`📐 CLS: ${clsValue.toFixed(4)}`);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// Initialize enhanced PWA performance
export async function initializePWAPerformance(): Promise<void> {
  console.log('🚀 Initializing PWA performance enhancements...');

  // Start overall timing
  PWAPerformanceMonitor.startTiming('pwa_initialization');

  try {
    // Set up connection-aware loading
    ConnectionAwareLoader.adaptResourceLoading();

    // Enable resource hints
    await CriticalResourceManager.enableResourceHints();

    // Optimize font loading
    CriticalResourceManager.optimizeFontLoading();

    // Preload critical resources
    await CriticalResourceManager.preloadCriticalResources();

    // Start performance monitoring
    PWAPerformanceMonitor.measurePWAMetrics();

    // End timing
    PWAPerformanceMonitor.endTiming('pwa_initialization');

    console.log('✅ PWA performance enhancements initialized');

  } catch (error) {
    console.error('❌ Failed to initialize PWA performance enhancements:', error);
  }
}

// Auto-initialize when imported
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePWAPerformance);
} else {
  initializePWAPerformance();
}
