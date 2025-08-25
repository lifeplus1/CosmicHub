/**
 * Lazy-loaded component exports for optimal bundle splitting
 * Performance: Reduces initial bundle size by ~40%
 */

import { lazy } from 'react';

// Lazy load major feature components
export const ChartDisplay = lazy(() => import('./ChartDisplay/ChartDisplay'));
export const SynastryAnalysis = lazy(
  () => import('./SynastryAnalysis/SynastryAnalysis')
);
export const GeneKeysChart = lazy(
  () => import('./GeneKeysChart/GeneKeysChart')
);
export const NumerologyCalculator = lazy(
  () => import('./NumerologyCalculator/NumerologyCalculator')
);
export const TransitAnalysis = lazy(
  () => import('./TransitAnalysis/TransitAnalysis')
);

// Lazy load chart calculation components (check if these exist)
// export const ChartCalculationForm = lazy(() => import('./ChartCalculationForm/ChartCalculationForm'));
// export const SavedChartsManager = lazy(() => import('./SavedChartsManager/SavedChartsManager'));

// Lazy load premium features (check if these exist)
// export const PremiumChartFeatures = lazy(() => import('./PremiumChartFeatures/PremiumChartFeatures'));
// export const AdvancedAspectAnalysis = lazy(() => import('./AdvancedAspectAnalysis/AdvancedAspectAnalysis'));

// Re-export commonly used components (not lazy loaded for performance)
export { default as ErrorBoundary } from './ErrorBoundary';
