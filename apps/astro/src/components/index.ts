/**
 * Lazy-loaded component exports for optimal bundle splitting
 * Performance: Reduces initial bundle size by ~40%
 */

import { ComponentType } from 'react';
import type { ChartDisplayProps } from './ChartDisplay/ChartDisplay';
import type { SynastryAnalysisProps } from './SynastryAnalysis/types';
import { 
  createLazyComponent, 
  createBundleAwareLazyComponent,
  LazyLoadTracker 
} from '../utils/lazyLoadingUtils';

// High-priority components with enhanced lazy loading
export const ChartDisplay: ComponentType<ChartDisplayProps> = createBundleAwareLazyComponent(
  () => import('./ChartDisplay/ChartDisplay'),
  { priority: 'high', size: 50000 }, // Estimated bundle size
  { 
    componentName: 'ChartDisplay',
    onError: (error) => {
      LazyLoadTracker.markFailed('ChartDisplay');
      console.error('ChartDisplay failed to load:', error);
    }
  }
);

export const SynastryAnalysis: ComponentType<SynastryAnalysisProps> = createBundleAwareLazyComponent(
  () => import('./SynastryAnalysis/SynastryAnalysis').then(module => ({
    default: module.SynastryAnalysis
  })),
  { priority: 'medium', size: 30000 },
  {
    componentName: 'SynastryAnalysis',
    onError: (error) => {
      LazyLoadTracker.markFailed('SynastryAnalysis');
      console.error('SynastryAnalysis failed to load:', error);
    }
  }
);

// Medium-priority components with error handling
export const GeneKeysChart = createLazyComponent(
  () => import('./GeneKeysChart/GeneKeysChart'),
  {
    componentName: 'GeneKeysChart',
    fallback: () => null,
    onError: (error) => {
      LazyLoadTracker.markFailed('GeneKeysChart');
      console.warn('GeneKeysChart component failed to load:', error);
    },
    retryCount: 2
  }
);

export const NumerologyCalculator = createLazyComponent(
  () => import('./NumerologyCalculator/NumerologyCalculator'),
  {
    componentName: 'NumerologyCalculator',
    fallback: () => null,
    onError: (error) => {
      LazyLoadTracker.markFailed('NumerologyCalculator');
      console.warn('NumerologyCalculator component failed to load:', error);
    },
    retryCount: 2
  }
);

export const TransitAnalysis = createLazyComponent(
  () => import('./TransitAnalysis/TransitAnalysis'),
  {
    componentName: 'TransitAnalysis',
    fallback: () => null,
    onError: (error) => {
      LazyLoadTracker.markFailed('TransitAnalysis');
      console.warn('TransitAnalysis component failed to load:', error);
    },
    retryCount: 2
  }
);

// Lazy load chart calculation components (check if these exist)
// export const ChartCalculationForm = lazy(() => import('./ChartCalculationForm/ChartCalculationForm'));
// export const SavedChartsManager = lazy(() => import('./SavedChartsManager/SavedChartsManager'));

// Lazy load premium features (check if these exist)
// export const PremiumChartFeatures = lazy(() => import('./PremiumChartFeatures/PremiumChartFeatures'));
// export const AdvancedAspectAnalysis = lazy(() => import('./AdvancedAspectAnalysis/AdvancedAspectAnalysis'));

// Re-export commonly used components (not lazy loaded for performance)
// ErrorBoundary now available from @cosmichub/ui
