/**
 * Type definitions for lazy-loading components and utilities
 * Provides strong TypeScript typing for dynamic imports and lazy loading
 */
import { ComponentType, ComponentProps } from 'react';
/**
 * Module import result with default export
 */
  [key: string]: any;
};
/**
 * Dynamic import function type
 */
export type ImportFunction<T extends ComponentType<any>> = () => Promise<
  ImportModule<T>
>;
/**
 * Options for lazy component loading
 */
export interface LazyComponentOptions<E extends Error = Error> {
  /** Component to show while loading */
  loadingComponent?: ComponentType;
  /** Error boundary component */
  errorBoundary?: ComponentType<ErrorBoundaryProps<E>>;
  /** Whether to preload the component */
  preload?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
}
/**
 * Props for error boundary components
 */
export interface ErrorBoundaryProps<E extends Error = Error> {
  /** The error that occurred */
  error: E;
  /** Function to reset the error state */
  resetError: () => void;
}
/**
 * Progressive loading options for large datasets
 */
  /** Delay between batches in milliseconds */
  delay: number;
  /** Component to show while loading */
  loadingComponent?: ComponentType<{
    progress: number;
  }>;
}
/**
 * Result of progressive loading
 */
  /** Whether loading is in progress */
  isLoading: boolean;
  /** Loading progress as a percentage */
  progress: number;
}
/**
 * Smart preloading functions
 */
  /** Preload a component when an element becomes visible */
  preloadOnIntersection: <T extends ComponentType<any>>(
    elementRef: React.RefObject<HTMLElement>,
    componentImport: ImportFunction<T>,
    componentName: string
  ) => (() => void) | undefined;
}
/**
 * Props for the LazyComponentWrapper
 */
export interface LazyComponentWrapperProps<
  K extends keyof T,
  T extends Record<string, any>,
> {
  /** Key of the component in the registry */
  componentKey: K;
  /** Props to pass to the loaded component */
  props?: any;
  /** Component to show while loading */
  fallback?: ComponentType;
}
/**
 * Result of the useDynamicComponent hook
 */
export interface DynamicComponentResult<T extends ComponentType<any>> {
  /** The loaded component */
  Component: T | null;
  /** Whether loading is in progress */
  loading: boolean;
  /** Error that occurred during loading, if any */
  error: Error | null;
}
/**
 * Type-safe component registry
 */
export type ComponentRegistry<
  T extends Record<string, ImportFunction<ComponentType<any>>>,
> = T;
/**
 * Creates a type-safe lazy component
 */
export type LazyComponentCreator = <T extends ComponentType<any>>(
  importFn: ImportFunction<T>,
  componentName: string,
  options?: LazyComponentOptions
) => ComponentType<ComponentProps<T>>;
/**
 * Creates a type-safe lazy route
 */
/**
 * Creates a type-safe lazy modal
 */
/**
 * Creates a type-safe lazy chart
 */
/**
 * Higher-order component for lazy loading
 */
/**
 * Hook for progressive loading
 */
export type UseProgressiveLoading = <T>(
  items: T[],
  options: ProgressiveLoadingOptions
) => ProgressiveLoadingResult<T>;
/**
 * Hook for managing lazy loading state
 */
  /** Check if a component is loading */
  isLoading: (componentName: string) => boolean;
  /** Current loading states for all components */
  loadingStates: Record<string, boolean>;
}
//# sourceMappingURL=lazy-loading-types.d.ts.map
