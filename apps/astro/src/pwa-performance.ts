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
    void import('./config/environment')
      .then(({ devConsole }: { devConsole: DevConsole }) => {
        devConsole.log?.(message);
      })
      .catch(() => {
        // Fallback - no logging in production
      });
  } catch {
    // Silent fallback for production
  }
}

function _safeWarn(message: string, ...args: unknown[]): void {
  try {
    void import('./config/environment')
      .then(({ devConsole }: { devConsole: DevConsole }) => {
        devConsole.warn?.(message, ...args);
      })
      .catch(() => {
        // Fallback - no logging in production
      });
  } catch {
    // Silent fallback for production
  }
}

function _safeError(message: string, ...args: unknown[]): void {
  try {
    void import('./config/environment')
      .then(({ devConsole }: { devConsole: DevConsole }) => {
        devConsole.error?.(message, ...args);
      })
      .catch(() => {
        // Silent fallback - errors logged through devConsole only
      });
  } catch {
    // Silent fallback - errors logged through devConsole only
  }
}

// Critical Resource Prioritization

// Connection-aware loading (builds on existing lazy loading)
// Local fallback type for NetworkInformation (not in standard lib in some TS configs)
// Minimal subset used by this file
interface _NetworkInformationFallback {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
}

// Type guard for navigator with connection property
interface NavigatorWithConnection extends Navigator {
  connection?: _NetworkInformationFallback;
}

function hasConnection(nav: Navigator): nav is NavigatorWithConnection {
  return 'connection' in nav;
}

// Performance monitoring for PWA
interface PerformanceMetrics {
  componentLoadTime: Map<string, number>;
  bundleLoadTime: Map<string, number>;
  totalLazyLoadTime: number;
  failedComponents: string[];
}

// Enhanced lazy loading orchestrator with type safety
class LazyLoadOrchestrator {
  private metrics: PerformanceMetrics = {
    componentLoadTime: new Map(),
    bundleLoadTime: new Map(),
    totalLazyLoadTime: 0,
    failedComponents: []
  };

  private networkInfo: _NetworkInformationFallback | null = null;

  constructor() {
    this.initializeNetworkDetection();
  }

  private initializeNetworkDetection(): void {
    // Safely access navigator with type checking
    if (typeof navigator !== 'undefined' && hasConnection(navigator)) {
      this.networkInfo = navigator.connection ?? null;
    }
  }

  // Smart preloading based on network conditions
  shouldPreloadComponent(priority: 'high' | 'medium' | 'low'): boolean {
    if (!this.networkInfo) return true; // Default to preload if no network info

    const { effectiveType, saveData } = this.networkInfo;
    
    if (saveData) return false; // Respect user's data saving preference
    
    switch (priority) {
      case 'high':
        return true; // Always preload high priority
      case 'medium':
        return effectiveType !== 'slow-2g' && effectiveType !== '2g';
      case 'low':
        return effectiveType === '4g'; // Only on fast connections
      default:
        return false;
    }
  }

  // Track component loading performance
  trackComponentLoad(componentName: string, startTime: number): void {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    this.metrics.componentLoadTime.set(componentName, loadTime);
    safeLog(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
  }

  // Get performance insights
  getPerformanceInsights(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Adaptive loading strategy
  getLoadingStrategy(): 'aggressive' | 'balanced' | 'conservative' {
    if (!this.networkInfo) return 'balanced';

    const { effectiveType, downlink, saveData } = this.networkInfo;
    
    if (saveData) return 'conservative';
    if (effectiveType === '4g' && (downlink ?? 0) > 1.5) return 'aggressive';
    if (effectiveType === '3g') return 'balanced';
    
    return 'conservative';
  }
}

// Global orchestrator instance
const lazyLoadOrchestrator = new LazyLoadOrchestrator();

// Stub implementation for PWA performance initialization
function initializePWAPerformance(): void {
  safeLog('PWA Performance initialization called');
  
  // Initialize lazy loading strategy based on network conditions
  const strategy = lazyLoadOrchestrator.getLoadingStrategy();
  safeLog(`Using ${strategy} loading strategy`);
  
  // TODO: Implement PWA performance optimizations
}

// Initialize PWA performance when DOM is ready
export function initPWAPerformance(): void {
  const doc = typeof document !== 'undefined' ? document : null;
  if (doc === null) return;

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', () => {
      initializePWAPerformance();
    });
  } else {
    initializePWAPerformance();
  }
}

// Export orchestrator for use by lazy loading utilities
export { lazyLoadOrchestrator };
export type { PerformanceMetrics };
