/**
 * React Lazy Loading and Code Splitting Optimization
 * Implements dynamic imports, route-based code splitting, and component lazy loading
 */

import React, { lazy, Suspense, ComponentType } from 'react';
import { performanceMonitor } from './performance';

// Loading components for better UX
export const DefaultLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-purple"></div>
  </div>
);

export const PageLoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-purple mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Enhanced lazy loading with performance tracking
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  options: {
    loadingComponent?: ComponentType;
    errorBoundary?: ComponentType<{ error: Error; resetError: () => void }>;
    preload?: boolean;
    timeout?: number;
  } = {}
): ComponentType<React.ComponentProps<T>> {
  const {
    loadingComponent: LoadingComponent = DefaultLoadingSpinner,
    preload = false,
    timeout = 10000
  } = options;

  // Create lazy component with performance tracking
  const LazyComponent = lazy(async () => {
    const startTime = performance.now();
    
    try {
      // Add timeout to prevent hanging
      const importPromise = importFn();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Component ${componentName} loading timeout`)), timeout);
      });

      const module = await Promise.race([importPromise, timeoutPromise]);
      const loadTime = performance.now() - startTime;

      // Track loading performance
      performanceMonitor.recordMetric('ComponentLazyLoad', loadTime, {
        componentName,
        success: true
      });

      return module;
    } catch (error) {
      const loadTime = performance.now() - startTime;
      
      performanceMonitor.recordMetric('ComponentLazyLoad', loadTime, {
        componentName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  });

  // Preload component if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch(() => {
        // Silently ignore preload errors
      });
    }, 100);
  }

  // Return wrapped component with Suspense
  const WrappedComponent: ComponentType<React.ComponentProps<T>> = (props) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `Lazy(${componentName})`;
  
  return WrappedComponent;
}

// Lazy loading utilities for common patterns
export const lazyLoadRoute = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  routeName: string
) => createLazyComponent(importFn, `Route_${routeName}`, {
  loadingComponent: PageLoadingSpinner,
  preload: false,
  timeout: 15000
});

export const lazyLoadModal = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  modalName: string
) => createLazyComponent(importFn, `Modal_${modalName}`, {
  loadingComponent: DefaultLoadingSpinner,
  preload: true, // Modals are often triggered by user interaction
  timeout: 5000
});

export const lazyLoadChart = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  chartName: string
) => createLazyComponent(importFn, `Chart_${chartName}`, {
  loadingComponent: DefaultLoadingSpinner,
  preload: false,
  timeout: 8000
});

// HOC for component-level code splitting
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  componentName: string,
  options?: {
    loadingComponent?: ComponentType;
    preload?: boolean;
  }
) {
  return createLazyComponent(importFn, componentName, options);
}

// Progressive loading for large datasets
export interface ProgressiveLoadingOptions {
  batchSize: number;
  delay: number;
  loadingComponent?: ComponentType<{ progress: number }>;
}

export function useProgressiveLoading<T>(
  items: T[],
  options: ProgressiveLoadingOptions
) {
  const [loadedItems, setLoadedItems] = React.useState<T[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (items.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadedItems([]);
    setProgress(0);

    const loadBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + options.batchSize, items.length);
      const batch = items.slice(startIndex, endIndex);
      
      setLoadedItems(prev => [...prev, ...batch]);
      setProgress((endIndex / items.length) * 100);

      if (endIndex < items.length) {
        setTimeout(() => loadBatch(endIndex), options.delay);
      } else {
        setIsLoading(false);
      }
    };

    // Start loading batches
    setTimeout(() => loadBatch(0), 0);
  }, [items, options.batchSize, options.delay]);

  return { loadedItems, isLoading, progress };
}

// Bundle splitting utilities
export const BundleSplitter = {
  // Vendor libraries (should be loaded first)
  loadVendorBundle: () => import('react').then(() => import('react-dom')),
  
  // UI components bundle
  loadUIBundle: () => import(/* webpackChunkName: "ui-bundle" */ 'react'),
  
  // Astrology features bundle  
  loadAstrologyBundle: () => import(/* webpackChunkName: "astro-bundle" */ 'react'),
  
  // Frequency healing bundle
  loadFrequencyBundle: () => import(/* webpackChunkName: "frequency-bundle" */ 'react'),
  
  // Authentication bundle
  loadAuthBundle: () => import(/* webpackChunkName: "auth-bundle" */ 'react')
};

// Route-based code splitting for apps
export const createRouteBundle = (routes: string[]) => {
  const routeLoaders: Record<string, () => Promise<any>> = {};

  routes.forEach(route => {
    routeLoaders[route] = () => {
      const startTime = performance.now();
      
      return import(/* webpackChunkName: "[request]" */ `../pages/${route}Page`)
        .then(module => {
          const loadTime = performance.now() - startTime;
          performanceMonitor.recordMetric('RouteLoad', loadTime, {
            route,
            success: true
          });
          return module;
        })
        .catch(error => {
          const loadTime = performance.now() - startTime;
          performanceMonitor.recordMetric('RouteLoad', loadTime, {
            route,
            success: false,
            error: error.message
          });
          throw error;
        });
    };
  });

  return routeLoaders;
};

// Smart preloading based on user behavior
export class SmartPreloader {
  private static instance: SmartPreloader;
  private hoverTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private loadedComponents: Set<string> = new Set();

  static getInstance(): SmartPreloader {
    if (!SmartPreloader.instance) {
      SmartPreloader.instance = new SmartPreloader();
    }
    return SmartPreloader.instance;
  }

  // Preload component on hover with delay
  preloadOnHover(
    element: HTMLElement,
    importFn: () => Promise<any>,
    componentName: string,
    delay: number = 200
  ) {
    if (this.loadedComponents.has(componentName)) {
      return;
    }

    const handleMouseEnter = () => {
      const timeout = setTimeout(() => {
        importFn()
          .then(() => {
            this.loadedComponents.add(componentName);
            performanceMonitor.recordMetric('ComponentPreload', 0, {
              componentName,
              trigger: 'hover',
              success: true
            });
          })
          .catch(() => {
            performanceMonitor.recordMetric('ComponentPreload', 0, {
              componentName,
              trigger: 'hover',
              success: false
            });
          });
      }, delay);

      this.hoverTimeouts.set(componentName, timeout);
    };

    const handleMouseLeave = () => {
      const timeout = this.hoverTimeouts.get(componentName);
      if (timeout) {
        clearTimeout(timeout);
        this.hoverTimeouts.delete(componentName);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      const timeout = this.hoverTimeouts.get(componentName);
      if (timeout) {
        clearTimeout(timeout);
        this.hoverTimeouts.delete(componentName);
      }
    };
  }

  // Preload based on intersection observer
  preloadOnIntersection(
    target: HTMLElement,
    importFn: () => Promise<any>,
    componentName: string,
    threshold: number = 0.1
  ) {
    if (this.loadedComponents.has(componentName) || typeof window === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            importFn()
              .then(() => {
                this.loadedComponents.add(componentName);
                performanceMonitor.recordMetric('ComponentPreload', 0, {
                  componentName,
                  trigger: 'intersection',
                  success: true
                });
              })
              .catch(() => {
                performanceMonitor.recordMetric('ComponentPreload', 0, {
                  componentName,
                  trigger: 'intersection',
                  success: false
                });
              });
            
            observer.unobserve(target);
          }
        });
      },
      { threshold }
    );

    observer.observe(target);

    return () => observer.unobserve(target);
  }
}

// Error boundary for lazy loaded components
export class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: ComponentType<{ error: Error; resetError: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    performanceMonitor.recordMetric('LazyLoadError', 0, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ error, resetError }) => (
  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
    <h3 className="text-red-800 font-semibold mb-2">Component Loading Error</h3>
    <p className="text-red-600 text-sm mb-3">{error.message}</p>
    <button
      onClick={resetError}
      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
    >
      Retry
    </button>
  </div>
);

// Hook for managing lazy loading state
export function useLazyLoading() {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});

  const setLoading = React.useCallback((componentName: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [componentName]: isLoading
    }));
  }, []);

  const isLoading = React.useCallback((componentName: string) => {
    return loadingStates[componentName] || false;
  }, [loadingStates]);

  return { setLoading, isLoading, loadingStates };
}
