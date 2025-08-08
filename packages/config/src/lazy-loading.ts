/**
 * Lazy Loading Configuration and Utilities
 * Advanced lazy loading patterns for React components
 */

import React, { ComponentType, Suspense, ReactElement } from 'react';

// Lazy loading configuration
export interface LazyLoadingConfig {
  // Component loading options
  loadingComponent?: ComponentType;
  errorBoundary?: ComponentType<{ children: React.ReactNode; error?: Error }>;
  
  // Performance options
  preloadOnHover?: boolean;
  preloadOnVisible?: boolean;
  intersectionThreshold?: number;
  
  // Retry options
  retryAttempts?: number;
  retryDelay?: number;
  
  // Bundle splitting
  chunkName?: string;
  webpackMode?: 'lazy' | 'eager' | 'weak';
}

// Default configuration
export const defaultLazyConfig: LazyLoadingConfig = {
  loadingComponent: () => React.createElement('div', { 
    className: 'animate-pulse bg-gray-200 rounded h-8' 
  }, 'Loading...'),
  retryAttempts: 3,
  retryDelay: 1000,
  intersectionThreshold: 0.1,
  preloadOnHover: true,
  preloadOnVisible: false,
  webpackMode: 'lazy'
};

// Loading states
export const LoadingSpinner = () => React.createElement('div', {
  className: 'inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600',
  role: 'status',
  'aria-label': 'Loading'
});

export const LoadingCard = () => React.createElement('div', {
  className: 'animate-pulse bg-gray-200 rounded-lg p-4 h-32'
});

export const LoadingForm = () => React.createElement('div', {
  className: 'space-y-4'
}, [
  React.createElement('div', { key: '1', className: 'animate-pulse bg-gray-200 rounded h-4' }),
  React.createElement('div', { key: '2', className: 'animate-pulse bg-gray-200 rounded h-10' }),
  React.createElement('div', { key: '3', className: 'animate-pulse bg-gray-200 rounded h-4' }),
]);

export const LoadingChart = () => React.createElement('div', {
  className: 'animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center'
}, React.createElement('span', { className: 'text-gray-500' }, 'Loading chart...'));

// Error boundaries
export class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return React.createElement(FallbackComponent, { error: this.state.error! });
    }

    return this.props.children;
  }
}

const DefaultErrorFallback = ({ error }: { error: Error }) => React.createElement('div', {
  className: 'p-4 border border-red-200 rounded-lg bg-red-50'
}, [
  React.createElement('h3', { key: 'title', className: 'text-red-800 font-medium' }, 'Loading Error'),
  React.createElement('p', { key: 'message', className: 'text-red-600 text-sm mt-2' }, error.message),
  React.createElement('button', { 
    key: 'retry',
    className: 'mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700',
    onClick: () => window.location.reload()
  }, 'Retry')
]);

// Lazy component wrapper with configuration
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyLoadingConfig = {}
): ComponentType<React.ComponentProps<T>> => {
  const mergedConfig = { ...defaultLazyConfig, ...config };
  
  const LazyComponent = React.lazy(() => {
    let retryCount = 0;
    
    const retry = (): Promise<{ default: T }> => {
      return importFn().catch((error) => {
        if (retryCount < (mergedConfig.retryAttempts || 3)) {
          retryCount++;
          console.warn(`Retry attempt ${retryCount} for lazy component`);
          return new Promise((resolve) => {
            setTimeout(() => resolve(retry()), mergedConfig.retryDelay);
          });
        }
        throw error;
      });
    };
    
    return retry();
  });

  const WrappedComponent = React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    return React.createElement(LazyLoadErrorBoundary, {
      fallback: mergedConfig.errorBoundary
    }, React.createElement(Suspense, {
      fallback: React.createElement(mergedConfig.loadingComponent || LoadingSpinner)
    }, React.createElement(LazyComponent, { ...props, ref })));
  });

  WrappedComponent.displayName = `LazyComponent(${LazyComponent.displayName || 'Component'})`;
  
  return WrappedComponent;
};

// Preloading utilities
export const preloadComponent = (importFn: () => Promise<any>): void => {
  importFn().catch(() => {
    // Silently catch preload errors
  });
};

// Intersection observer for visible preloading
export const useVisibilityPreload = (
  importFn: () => Promise<any>,
  threshold: number = 0.1
) => {
  const ref = React.useRef<HTMLElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || isLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preloadComponent(importFn);
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [importFn, threshold, isLoaded]);

  return ref;
};

// Hover preloading hook
export const useHoverPreload = (importFn: () => Promise<any>) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    if (!isLoaded) {
      preloadComponent(importFn);
      setIsLoaded(true);
    }
  }, [importFn, isLoaded]);

  return { onMouseEnter: handleMouseEnter };
};

// Bundle analysis utilities
export const getBundleInfo = (chunkName: string) => {
  return {
    chunkName,
    webpackChunkName: `/* webpackChunkName: "${chunkName}" */`,
    preloadComment: `/* webpackPreload: true */`,
    prefetchComment: `/* webpackPrefetch: true */`
  };
};

// Component categories for organized lazy loading
export const ComponentCategories = {
  CHARTS: 'charts',
  MODALS: 'modals', 
  FORMS: 'forms',
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
  TOOLS: 'tools',
  CALCULATORS: 'calculators'
} as const;

export type ComponentCategory = typeof ComponentCategories[keyof typeof ComponentCategories];
