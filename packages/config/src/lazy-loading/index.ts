/**
 * Re-export all lazy loading types and utilities for ease of use
 */

// Export types
export * from '../types/lazy-loading-types';

// Export implementations (but exclude types that would cause duplicates)
export {
  DefaultLoadingSpinner,
  PageLoadingSpinner,
  createLazyComponent,
  lazyLoadRoute,
  lazyLoadModal,
  lazyLoadChart,
  withLazyLoading,
  useProgressiveLoading,
  BundleSplitter,
  createRouteBundle,
  SmartPreloader,
  LazyLoadErrorBoundary,
  useLazyLoading
} from '../lazy-loading';
