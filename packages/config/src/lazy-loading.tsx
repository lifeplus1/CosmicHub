/**
 * React Lazy Loading and Code Splitting Optimization
 * Implements dynamic imports, route-based code splitting, and component lazy loading
 */

import React, { lazy, Suspense, ComponentType } from 'react';
import { performanceMonitor } from './performance';
import type {
  ComponentRegistryKeys,
  LazyComponentPropsMap,
  LazyLoadedModule,
} from './types/component-registry';
import {
  ImportFunction,
  LazyComponentOptions,
  ErrorBoundaryProps,
  UseProgressiveLoading,
  ProgressiveLoadingOptions,
  ProgressiveLoadingResult,
  LazyLoadingState,
  WithLazyLoading,
} from './types/lazy-loading-types';

// Loading components for better UX
export const DefaultLoadingSpinner: React.FC = () => (
  <div className='flex items-center justify-center p-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-purple'></div>
  </div>
);

// Enhanced lazy loading with performance tracking
export function createLazyComponent<T extends object>(
  importFn: ImportFunction<ComponentType<T>>,
  componentName: string,
  options: LazyComponentOptions = {}
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<T> & React.RefAttributes<unknown>
> {
  const {
    loadingComponent: LoadingComponent = DefaultLoadingSpinner,
    preload = false,
    timeout = 10000,
  } = options;

  // Create lazy component with performance tracking
  const LazyComponent = lazy(async () => {
    const startTime = performance.now();

    try {
      // Add timeout to prevent hanging
      const importPromise = importFn();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Component ${componentName} loading timeout`)),
          timeout
        );
      });

      const module = await Promise.race([importPromise, timeoutPromise]);
      const loadTime = performance.now() - startTime;

      // Track loading performance
      performanceMonitor.recordMetric('ComponentLazyLoad', loadTime, {
        componentName,
        success: true,
      });

      return module;
    } catch (error) {
      const loadTime = performance.now() - startTime;

      performanceMonitor.recordMetric('ComponentLazyLoad', loadTime, {
        componentName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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
  const WrappedComponent = React.forwardRef<unknown, T>((props, ref) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} ref={ref} />
    </Suspense>
  ));

  WrappedComponent.displayName = `Lazy(${componentName})`;

  return WrappedComponent;
}

// Lazy loading utilities for common patterns
export const lazyLoadRoute = <P extends object>(
  importFn: ImportFunction<ComponentType<P>>,
  routeName: string
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<unknown>
> =>
  createLazyComponent<P>(importFn, `Route_${routeName}`, {
  loadingComponent: PageLoadingSpinner,
    preload: false,
    timeout: 15000,
  });

export const lazyLoadModal = <P extends object>(
  importFn: ImportFunction<ComponentType<P>>,
  modalName: string
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<unknown>
> =>
  createLazyComponent<P>(importFn, `Modal_${modalName}`, {
    loadingComponent: DefaultLoadingSpinner,
    preload: true,
    timeout: 5000,
  });

export const lazyLoadChart = <P extends object>(
  importFn: ImportFunction<ComponentType<P>>,
  chartName: string
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<unknown>
> =>
  createLazyComponent<P>(importFn, `Chart_${chartName}`, {
    loadingComponent: DefaultLoadingSpinner,
    preload: false,
    timeout: 8000,
  });

// HOC for component-level code splitting
export const withLazyLoading = (<P extends object>(
  importFn: ImportFunction<ComponentType<P>>,
  componentName: string,
  options?: Pick<LazyComponentOptions, 'loadingComponent' | 'preload'>
) => createLazyComponent<P>(importFn, componentName, options ?? {})) as WithLazyLoading;

// Progressive loading for large datasets
export const useProgressiveLoading: UseProgressiveLoading = <T,>(
  items: T[],
  options: ProgressiveLoadingOptions
): ProgressiveLoadingResult<T> => {
  const [loadedItems, setLoadedItems] = React.useState<T[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!items || items.length === 0) {
      setLoadedItems([]);
      setIsLoading(false);
      setProgress(0);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setLoadedItems([]);
    setProgress(0);

    const loadBatch = (start: number) => {
      if (cancelled) return;
      const end = Math.min(start + options.batchSize, items.length);
      const batch = items.slice(start, end);
      setLoadedItems(prev => [...prev, ...batch]);
      setProgress(Math.round((end / items.length) * 100));
      if (end < items.length) {
        setTimeout(() => loadBatch(end), options.delay);
      } else {
        setIsLoading(false);
      }
    };
    loadBatch(0);
    return () => {
      cancelled = true;
    };
  }, [items, options.batchSize, options.delay]);

  return { loadedItems, isLoading, progress };
};

// Provide compatibility export (deprecated usage path)
export const ProgressiveLoader = { use: useProgressiveLoading };

// Generic page loading spinner (separate from default small spinner)
export const PageLoadingSpinner: React.FC = () => (
  <div className='flex flex-col items-center justify-center min-h-[200px] gap-4'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-gold'></div>
    <span className='text-cosmic-silver text-sm'>Loading page...</span>
  </div>
);

// Bundle import types
interface BundleImport {
  default: unknown;
  [key: string]: unknown;
}

// Bundle splitting utilities
export const createRouteLoaders = (routes: string[]) => {
  const routeLoaders: Record<string, () => Promise<BundleImport>> = {};
  routes.forEach(route => {
    routeLoaders[route] = () => {
      const startTime = performance.now();
      return import(
        /* webpackChunkName: "[request]" */
        /* @vite-ignore */
        `../pages/${route}Page`
      )
        .then((module: BundleImport) => {
          const loadTime = performance.now() - startTime;
            performanceMonitor.recordMetric('RouteLoad', loadTime, {
              route,
              success: true,
            });
          return module;
        })
        .catch((error: Error) => {
          const loadTime = performance.now() - startTime;
          performanceMonitor.recordMetric('RouteLoad', loadTime, {
            route,
            success: false,
            error: error.message,
          });
          throw error;
        });
    };
  });
  return routeLoaders;
};

// Smart preloading based on user behavior
export class SmartPreloader {
  private static instance: SmartPreloader | null = null;
  private hoverTimeouts: Map<
    ComponentRegistryKeys,
    ReturnType<typeof setTimeout>
  > = new Map();
  private loadedComponents: Set<ComponentRegistryKeys> = new Set();

  static getInstance(): SmartPreloader {
    SmartPreloader.instance ??= new SmartPreloader();
    return SmartPreloader.instance;
  }

  // Preload component on hover with delay
  preloadOnHover<K extends ComponentRegistryKeys>(
    element: HTMLElement,
    importFn: () => Promise<LazyLoadedModule<LazyComponentPropsMap[K]>>,
    componentName: K,
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
              success: true,
            });
          })
          .catch(() => {
            performanceMonitor.recordMetric('ComponentPreload', 0, {
              componentName,
              trigger: 'hover',
              success: false,
            });
          });
      }, delay);

      this.hoverTimeouts.set(componentName, timeout);
    };

    const handleMouseLeave = () => {
      const timeout = this.hoverTimeouts.get(componentName);
      if (timeout !== undefined) {
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
      if (timeout !== undefined) {
        clearTimeout(timeout);
        this.hoverTimeouts.delete(componentName);
      }
    };
  }

  // Preload based on intersection observer
  preloadOnIntersection<K extends ComponentRegistryKeys>(
    target: HTMLElement,
    importFn: () => Promise<LazyLoadedModule<LazyComponentPropsMap[K]>>,
    componentName: K,
    threshold: number = 0.1
  ) {
    if (
      this.loadedComponents.has(componentName) ||
      typeof window === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            importFn()
              .then(() => {
                this.loadedComponents.add(componentName);
                performanceMonitor.recordMetric('ComponentPreload', 0, {
                  componentName,
                  trigger: 'intersection',
                  success: true,
                });
              })
              .catch(() => {
                performanceMonitor.recordMetric('ComponentPreload', 0, {
                  componentName,
                  trigger: 'intersection',
                  success: false,
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
  { children: React.ReactNode; fallback?: ComponentType<ErrorBoundaryProps> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: ComponentType<ErrorBoundaryProps>;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    performanceMonitor.recordMetric('LazyLoadError', 0, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError && this.state.error !== null) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => (
  <div className='p-4 border border-red-200 rounded-lg bg-red-50'>
    <h3 className='text-red-800 font-semibold mb-2'>Component Loading Error</h3>
    <p className='text-red-600 text-sm mb-3'>{error.message}</p>
    <button
      onClick={resetError}
      className='px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700'
    >
      Retry
    </button>
  </div>
);

// Hook for managing lazy loading state
export const useLazyLoadingState = (): LazyLoadingState => {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
  const setLoading = React.useCallback((name: string, state: boolean) => {
    setLoadingStates(prev => (prev[name] === state ? prev : { ...prev, [name]: state }));
  }, []);
  const isLoading = React.useCallback(
    (name: string) => loadingStates[name] === true,
    [loadingStates]
  );
  return { setLoading, isLoading, loadingStates };
};
