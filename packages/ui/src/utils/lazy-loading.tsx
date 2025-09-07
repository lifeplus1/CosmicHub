// Lazy Loading Framework
// Advanced lazy loading utilities for performance optimization

import React, { Suspense, ComponentType, lazy } from 'react';

// Lazy loading configuration
export interface LazyConfig {
  fallback?: React.ReactElement;
  errorBoundary?: boolean;
  preload?: boolean;
  timeout?: number;
}

// Default loading fallback
const DefaultFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-purple"></div>
    <span className="ml-2 text-cosmic-silver">Loading...</span>
  </div>
);

// Enhanced lazy wrapper with performance monitoring
export const createLazyComponent = (
  importFunc: () => Promise<{ default: ComponentType<Record<string, unknown>> }>,
  config: LazyConfig = {}
) => {
  const LazyComponent = lazy(importFunc);

  const {
    fallback = <DefaultFallback />,
    errorBoundary = true,
    preload = false,
    timeout = 10000
  } = config;

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    importFunc().catch(() => {
      // Silently handle preload failures
    });
  }

  const ComponentWithSuspense: React.FC<Record<string, unknown>> = (props) => {
    const [_hasError, _setHasError] = React.useState(false);
    const [isTimeout, setIsTimeout] = React.useState(false);

    React.useEffect(() => {
      if (timeout > 0) {
        const timer = setTimeout(() => setIsTimeout(true), timeout);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [timeout]);

    if (isTimeout) {
      return (
        <div className="flex items-center justify-center p-8 text-red-400">
          <span>Failed to load component</span>
        </div>
      );
    }

    return (
      <Suspense fallback={fallback}>
        {errorBoundary ? (
          <ErrorBoundary fallback={<div className="text-red-400 p-4">Component error</div>}>
            <LazyComponent {...props} />
          </ErrorBoundary>
        ) : (
          <LazyComponent {...props} />
        )}
      </Suspense>
    );
  };

  // Add display name for debugging
  ComponentWithSuspense.displayName = `LazyComponent`;

  return ComponentWithSuspense;
};

// Error boundary for lazy components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Intersection Observer based lazy loading
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasBeenVisible, setHasBeenVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, hasBeenVisible]);

  return { ref, isVisible, hasBeenVisible };
};

// Lazy load wrapper component
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
  className?: string;
}> = ({ children, fallback, threshold = 0.1, className }) => {
  const { ref, hasBeenVisible } = useLazyLoad(threshold);

  return (
    <div ref={ref} className={className}>
      {hasBeenVisible ? children : fallback}
    </div>
  );
};

// Preload utilities
export const preloadComponent = (
  importFunc: () => Promise<{ default: ComponentType<Record<string, unknown>> }>
) => {
  if (typeof window !== 'undefined') {
    importFunc().catch(() => {
      // Silently handle preload failures
    });
  }
};

// Batch preload multiple components
export const preloadComponents = (
  imports: Array<() => Promise<Record<string, unknown>>>
) => {
  if (typeof window !== 'undefined') {
    imports.forEach(importFunc => {
      importFunc().catch(() => {
        // Silently handle preload failures
      });
    });
  }
};

// Resource hints for critical components
export const useResourceHints = (urls: string[], as: 'script' | 'style' = 'script') => {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = as;
      link.href = url;
      document.head.appendChild(link);
    });

    return () => {
      urls.forEach(url => {
        const links = document.querySelectorAll(`link[href="${url}"]`);
        links.forEach(link => link.remove());
      });
    };
  }, [urls, as]);
};
