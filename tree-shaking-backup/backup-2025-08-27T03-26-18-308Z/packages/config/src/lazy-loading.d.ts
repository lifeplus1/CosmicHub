/**
 * React Lazy Loading and Code Splitting Optimization
 * Implements dynamic imports, route-based code splitting, and component lazy loading
 */
import React, { ComponentType } from 'react';
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
} from './types/lazy-loading-types';
export declare const DefaultLoadingSpinner: React.FC;
export declare const PageLoadingSpinner: React.FC;
export declare function createLazyComponent<T extends object>(
  importFn: ImportFunction<ComponentType<T>>,
  componentName: string,
  options?: LazyComponentOptions
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<T> & React.RefAttributes<unknown>
>;
export declare const lazyLoadRoute: <P extends object>(
  importFn: ImportFunction<ComponentType<P>>,
  routeName: string
) => React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<unknown>
>;
export declare const lazyLoadModal: <P extends object>(
  importFn: ImportFunction<ComponentType<P>>,
  modalName: string
) => React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<unknown>
>;
export declare const lazyLoadChart: <P extends object>(
  importFn: ImportFunction<ComponentType<P>>,
  chartName: string
) => React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<unknown>
>;
export declare const withLazyLoading: <P extends object>(
  importFn: ImportFunction<ComponentType<P>>,
  componentName: string,
  options?: Pick<LazyComponentOptions, 'loadingComponent' | 'preload'>
) => React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<unknown>
>;
export interface ProgressiveLoadingOptions {
  batchSize: number;
  delay: number;
  loadingComponent?: ComponentType<{
    progress: number;
  }>;
}
export declare const useProgressiveLoading: UseProgressiveLoading;
interface BundleImport {
  default: unknown;
  [key: string]: unknown;
}
export declare const BundleSplitter: Record<
  string,
  () => Promise<BundleImport>
>;
export declare const createRouteBundle: (
  routes: string[]
) => Record<string, () => Promise<BundleImport>>;
export declare class SmartPreloader {
  private static instance;
  private hoverTimeouts;
  private loadedComponents;
  static getInstance(): SmartPreloader;
  preloadOnHover<K extends ComponentRegistryKeys>(
    element: HTMLElement,
    importFn: () => Promise<LazyLoadedModule<LazyComponentPropsMap[K]>>,
    componentName: K,
    delay?: number
  ): (() => void) | undefined;
  preloadOnIntersection<K extends ComponentRegistryKeys>(
    target: HTMLElement,
    importFn: () => Promise<LazyLoadedModule<LazyComponentPropsMap[K]>>,
    componentName: K,
    threshold?: number
  ): (() => void) | undefined;
}
export declare class LazyLoadErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: ComponentType<ErrorBoundaryProps>;
  },
  {
    hasError: boolean;
    error: Error | null;
  }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: ComponentType<ErrorBoundaryProps>;
  });
  static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    error: Error;
  };
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
  resetError: () => void;
  render():
    | string
    | number
    | boolean
    | Iterable<React.ReactNode>
    | import('react/jsx-runtime').JSX.Element
    | null
    | undefined;
}
export declare function useLazyLoading(): {
  setLoading: (componentName: string, isLoading: boolean) => void;
  isLoading: (componentName: string) => boolean;
  loadingStates: Record<string, boolean>;
};
export {};
//# sourceMappingURL=lazy-loading.d.ts.map
