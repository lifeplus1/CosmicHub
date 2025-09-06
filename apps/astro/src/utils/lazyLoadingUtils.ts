/**
 * Enhanced lazy loading utilities with comprehensive type safety
 * Provides error handling, loading states, and fallback components
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Enhanced lazy loading options
export interface LazyLoadOptions<T = Record<string, unknown>> {
  fallback?: ComponentType<T>;
  onError?: (error: Error) => void;
  componentName?: string;
  retryCount?: number;
  preload?: boolean;
}

// Type-safe lazy loading factory with enhanced error handling
export function createLazyComponent<T = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> } | { [key: string]: ComponentType<T> }>,
  options: LazyLoadOptions<T> = {}
): LazyExoticComponent<ComponentType<T>> {
  const {
    fallback = () => null,
    onError = (error) => console.warn(`Lazy component load failed:`, error),
    componentName = 'Unknown',
    retryCount = 1
  } = options;

  let retries = 0;

  const enhancedImport = async (): Promise<{ default: ComponentType<T> }> => {
    try {
      const module = await importFn();
      
      // Handle different export patterns
      if ('default' in module) {
        return { default: module.default };
      }
      
      // Handle named exports (take first available component)
      const namedExports = Object.values(module).filter(
        (exp): exp is ComponentType<T> => typeof exp === 'function'
      );
      
      if (namedExports.length > 0) {
        const firstComponent = namedExports[0];
        if (firstComponent) {
          return { default: firstComponent };
        }
      }
      
      throw new Error(`No valid React component found in ${componentName} module`);
      
    } catch (error) {
      retries++;
      
      if (retries <= retryCount) {
        console.warn(`Retrying ${componentName} load (${retries}/${retryCount})`);
        return enhancedImport();
      }
      
      onError(error as Error);
      return { default: fallback };
    }
  };

  return lazy(enhancedImport);
}

// Lazy loading with preload capability
export function createPreloadableLazyComponent<T = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyLoadOptions<T> = {}
): LazyExoticComponent<ComponentType<T>> & { preload: () => void } {
  const lazyComponent = createLazyComponent(importFn, options);
  
  const enhancedComponent = lazyComponent as LazyExoticComponent<ComponentType<T>> & { preload: () => void };
  
  // Trigger the import to preload the component
  enhancedComponent.preload = () => {
    void importFn().catch((error) => {
      console.warn(`Preload failed for ${options.componentName ?? 'Unknown'}:`, error);
    });
  };
  
  return enhancedComponent;
}

// Route-based lazy loading with automatic preloading
export function createRouteLazyComponent<T = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  routePath: string,
  options: LazyLoadOptions<T> = {}
): LazyExoticComponent<ComponentType<T>> {
  const component = createLazyComponent(importFn, {
    ...options,
    componentName: options.componentName ?? `Route(${routePath})`
  });

  // Auto-preload on route hover (if available)
  if (typeof window !== 'undefined') {
    const preloadOnHover = () => {
      const links = document.querySelectorAll(`a[href*="${routePath}"]`);
      links.forEach(link => {
        link.addEventListener('mouseenter', () => {
          void importFn().catch(() => {}); // Silent fail on preload
        }, { once: true });
      });
    };

    // Delay to ensure DOM is ready
    setTimeout(preloadOnHover, 1000);
  }

  return component;
}

// Bundle-aware lazy loading
export interface BundleInfo {
  size?: number;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
}

export function createBundleAwareLazyComponent<T = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  bundleInfo: BundleInfo,
  options: LazyLoadOptions<T> = {}
): LazyExoticComponent<ComponentType<T>> {
  const shouldPreload = bundleInfo.priority === 'high' && 
    typeof window !== 'undefined' && 
    'requestIdleCallback' in window;

  const component = createLazyComponent(importFn, options);

  // Preload high-priority components during idle time
  if (shouldPreload) {
    window.requestIdleCallback(() => {
      void importFn().catch(() => {}); // Silent fail on preload
    }, { timeout: 5000 });
  }

  return component;
}

// Type guard for lazy components
export function isLazyComponent<T = Record<string, unknown>>(
  component: unknown
): component is LazyExoticComponent<ComponentType<T>> {
  return component !== null && 
         typeof component === 'object' && 
         component !== undefined &&
         '$$typeof' in component;
}

// Lazy loading status tracker
export class LazyLoadTracker {
  private static loadedComponents = new Set<string>();
  private static failedComponents = new Set<string>();
  private static loadingComponents = new Set<string>();

  static markLoading(componentName: string): void {
    this.loadingComponents.add(componentName);
  }

  static markLoaded(componentName: string): void {
    this.loadingComponents.delete(componentName);
    this.loadedComponents.add(componentName);
  }

  static markFailed(componentName: string): void {
    this.loadingComponents.delete(componentName);
    this.failedComponents.add(componentName);
  }

  static getStatus(componentName: string): 'loading' | 'loaded' | 'failed' | 'pending' {
    if (this.loadingComponents.has(componentName)) return 'loading';
    if (this.loadedComponents.has(componentName)) return 'loaded';
    if (this.failedComponents.has(componentName)) return 'failed';
    return 'pending';
  }

  static getStats(): {
    loaded: number;
    failed: number;
    loading: number;
    pending: number;
  } {
    return {
      loaded: this.loadedComponents.size,
      failed: this.failedComponents.size,
      loading: this.loadingComponents.size,
      pending: 0 // Would need component registry to calculate
    };
  }
}
