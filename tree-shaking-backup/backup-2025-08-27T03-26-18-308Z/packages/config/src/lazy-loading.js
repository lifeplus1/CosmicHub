import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
/**
 * React Lazy Loading and Code Splitting Optimization
 * Implements dynamic imports, route-based code splitting, and component lazy loading
 */
import React, { lazy, Suspense } from 'react';
import { performanceMonitor } from './performance';
// Loading components for better UX
export const DefaultLoadingSpinner = () =>
  _jsx('div', {
    className: 'flex items-center justify-center p-8',
    children: _jsx('div', {
      className:
        'animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-purple',
    }),
  });
export const PageLoadingSpinner = () =>
  _jsx('div', {
    className: 'min-h-screen flex items-center justify-center',
    children: _jsxs('div', {
      className: 'text-center',
      children: [
        _jsx('div', {
          className:
            'animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-purple mx-auto mb-4',
        }),
        _jsx('p', { className: 'text-gray-600', children: 'Loading...' }),
      ],
    }),
  });
// Enhanced lazy loading with performance tracking
export function createLazyComponent(importFn, componentName, options = {}) {
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
      const timeoutPromise = new Promise((_, reject) => {
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
  const WrappedComponent = React.forwardRef((props, ref) =>
    _jsx(Suspense, {
      fallback: _jsx(LoadingComponent, {}),
      children: _jsx(LazyComponent, { ...props, ref: ref }),
    })
  );
  WrappedComponent.displayName = `Lazy(${componentName})`;
  return WrappedComponent;
}
// Lazy loading utilities for common patterns
export const lazyLoadRoute = (importFn, routeName) =>
  createLazyComponent(importFn, `Route_${routeName}`, {
    loadingComponent: PageLoadingSpinner,
    preload: false,
    timeout: 15000,
  });
export const lazyLoadModal = (importFn, modalName) =>
  createLazyComponent(importFn, `Modal_${modalName}`, {
    loadingComponent: DefaultLoadingSpinner,
    preload: true,
    timeout: 5000,
  });
export const lazyLoadChart = (importFn, chartName) =>
  createLazyComponent(importFn, `Chart_${chartName}`, {
    loadingComponent: DefaultLoadingSpinner,
    preload: false,
    timeout: 8000,
  });
// HOC for component-level code splitting
export const withLazyLoading = (importFn, componentName, options) => {
  return createLazyComponent(importFn, componentName, options);
};
export const useProgressiveLoading = function (items, options) {
  const [loadedItems, setLoadedItems] = React.useState([]);
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
    const loadBatch = startIndex => {
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
};
// Bundle splitting utilities
export const BundleSplitter = {
  // Vendor libraries (should be loaded first)
  loadVendorBundle: () => import('react').then(() => import('react-dom')),
  // UI components bundle
  loadUIBundle: () => import(/* webpackChunkName: "ui-bundle" */ 'react'),
  // Astrology features bundle
  loadAstrologyBundle: () =>
    import(/* webpackChunkName: "astro-bundle" */ 'react'),
  // Frequency healing bundle
  loadFrequencyBundle: () =>
    import(/* webpackChunkName: "frequency-bundle" */ 'react'),
  // Authentication bundle
  loadAuthBundle: () => import(/* webpackChunkName: "auth-bundle" */ 'react'),
};
// Route-based code splitting for apps
export const createRouteBundle = routes => {
  const routeLoaders = {};
  routes.forEach(route => {
    routeLoaders[route] = () => {
      const startTime = performance.now();
      return import(
        /* webpackChunkName: "[request]" */
        /* @vite-ignore */
        `../pages/${route}Page`
      )
        .then(module => {
          const loadTime = performance.now() - startTime;
          performanceMonitor.recordMetric('RouteLoad', loadTime, {
            route,
            success: true,
          });
          return module;
        })
        .catch(error => {
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
  static instance = null;
  hoverTimeouts = new Map();
  loadedComponents = new Set();
  static getInstance() {
    SmartPreloader.instance ??= new SmartPreloader();
    return SmartPreloader.instance;
  }
  // Preload component on hover with delay
  preloadOnHover(element, importFn, componentName, delay = 200) {
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
  preloadOnIntersection(target, importFn, componentName, threshold = 0.1) {
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
export class LazyLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    performanceMonitor.recordMetric('LazyLoadError', 0, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }
  resetError = () => {
    this.setState({ hasError: false, error: null });
  };
  render() {
    if (this.state.hasError && this.state.error !== null) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback;
      return _jsx(FallbackComponent, {
        error: this.state.error,
        resetError: this.resetError,
      });
    }
    return this.props.children;
  }
}
const DefaultErrorFallback = ({ error, resetError }) =>
  _jsxs('div', {
    className: 'p-4 border border-red-200 rounded-lg bg-red-50',
    children: [
      _jsx('h3', {
        className: 'text-red-800 font-semibold mb-2',
        children: 'Component Loading Error',
      }),
      _jsx('p', {
        className: 'text-red-600 text-sm mb-3',
        children: error.message,
      }),
      _jsx('button', {
        onClick: resetError,
        className:
          'px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700',
        children: 'Retry',
      }),
    ],
  });
// Hook for managing lazy loading state
export function useLazyLoading() {
  const [loadingStates, setLoadingStates] = React.useState({});
  const setLoading = React.useCallback((componentName, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [componentName]: isLoading,
    }));
  }, []);
  const isLoading = React.useCallback(
    componentName => {
      return loadingStates[componentName] ?? false;
    },
    [loadingStates]
  );
  return { setLoading, isLoading, loadingStates };
}
//# sourceMappingURL=lazy-loading.js.map
