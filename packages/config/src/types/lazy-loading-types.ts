/**
 * Type definitions for lazy-loading components and utilities
 * Provides strong TypeScript typing for dynamic imports and lazy loading
 */

import { ComponentType, ComponentProps, RefObject, ReactNode } from 'react';

/**
 * Module import result with default export - using safer constraints
 */
export interface ImportModule<T = ComponentType<Record<string, never>>> {
  default: T;
  [key: string]: unknown;
}

// Define what can be exported from a module
export type ModuleExport = unknown;

/**
 * Dynamic import function type - permissive for better compatibility
 */
export type ImportFunction<T = ComponentType<Record<string, never>>> = () => Promise<
  ImportModule<T>
>;

/**
 * Options for lazy component loading with specific error types
 */
export interface LazyComponentOptions<E extends Error = Error> {
  /** Fallback component to show while loading */
  fallback?: ComponentType<Record<string, never>>;
  /** Component to show when loading fails */
  errorBoundary?: ComponentType<{ error: E; retry: () => void }>;
  /** Maximum time to wait for import in milliseconds */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
  };
  /** Preload configuration */
  preload?: 
    | boolean
    | {
        on: 'hover' | 'visible' | 'immediate';
        threshold?: number;
      };
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
export interface ProgressiveLoadingOptions {
  /** Number of items to load per batch */
  batchSize: number;
  /** Delay between batches in milliseconds */
  delay: number;
  /** Component to show while loading */
  loadingComponent?: ComponentType<{ progress: number }>;
}

/**
 * Result of progressive loading
 */
export interface ProgressiveLoadingResult<T> {
  /** Loaded items */
  items: T[];
  /** Whether loading is in progress */
  isLoading: boolean;
  /** Loading progress as a percentage */
  progress: number;
}

/**
 * Smart preloading functions
 */
export interface SmartPreloader {
  /** Preload a component when an element becomes visible */
  preloadOnIntersection: <T extends ComponentType<Record<string, unknown>>>(
    _elementRef: RefObject<HTMLElement>,
    _componentImport: ImportFunction<T>,
    _componentName: string
  ) => (() => void) | undefined;
}

/**
 * Props for the LazyComponentWrapper
 */
export interface LazyComponentWrapperProps<
  K extends keyof T,
  T extends Record<string, unknown>,
> {
  /** Key of the component in the registry */
  componentKey: K;
  /** Props to pass to the loaded component */
  props?: ComponentPropsType;
  /** Component to show while loading */
  fallback?: ComponentType<Record<string, never>>;
}

// Define specific types for component props rather than generic unknown
export type ComponentPropsType = 
  | AstrologyChartProps
  | FrequencyVisualizerProps
  | TransitChartProps
  | ChartComponentProps
  | ModalComponentProps
  | FormComponentProps
  | Record<string, ComponentPropValue>;

export type ComponentPropValue = 
  | string
  | number
  | boolean
  | Date
  | ComponentPropValue[]
  | { [key: string]: ComponentPropValue }
  | ((...args: unknown[]) => unknown);

// Specific component prop interfaces
export interface AstrologyChartProps {
  birthData: {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
  };
  chartType: 'natal' | 'transit' | 'synastry';
  theme?: string;
  onChartLoad?: (chartData: unknown) => void;
}

export interface FrequencyVisualizerProps {
  frequency: number;
  amplitude: number;
  visualType: 'waveform' | 'spectrum' | 'mandala';
  colorScheme?: string;
  onFrequencyChange?: (frequency: number) => void;
}

export interface TransitChartProps {
  natalChart: unknown;
  transitDate: string;
  aspects: string[];
  onTransitUpdate?: (transits: unknown) => void;
}

export interface ChartComponentProps {
  data: unknown;
  width?: number;
  height?: number;
  theme?: string;
  interactive?: boolean;
}

export interface ModalComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  children?: ReactNode;
}

export interface FormComponentProps {
  onSubmit: (data: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
  validation?: Record<string, (value: unknown) => string | undefined>;
}

/**
 * Result of the useDynamicComponent hook
 */
export interface DynamicComponentResult<T extends ComponentType<Record<string, unknown>>> {
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
  T extends Record<string, ImportFunction<ComponentType<Record<string, unknown>>>>,
> = T;

/**
 * Creates a type-safe lazy component
 */
export type LazyComponentCreator = <T extends ComponentType<Record<string, unknown>>>(
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
export interface UseLazyLoadingState {
  /** Check if a component is loading */
  isLoading: (_componentName: string) => boolean;
  /** Current loading states for all components */
  loadingStates: Record<string, boolean>;
}
