/**
 * Minimal UI exports for Docker build compatibility
 */

// Export all UI components
export * from './components/ui/Button';
export * from './components/ui/Card';
export * from './components/ui/Input';
export * from './components/ui/Tooltip';
export * from './components/ui/Table';
export * from './components/ui/Accordion';
export * from './components/ui/Tabs';
export * from './components/ui/Modal';
export * from './components/ui/Loading';
export * from './components/ui/Badge';
export * from './components/ui/Spinner';
export * from './components/ui/Progress';

// Consolidated shared components
export { default as ProgressBar } from './components/ProgressBar';
export * from './components/modals/UpgradeModal';
export * from './components/analytics/PerformanceDashboard';

// UX Enhancement components
export * from './components/feedback/LoadingStates';
export * from './components/feedback/ErrorHandling';
export * from './components/layout/MobileResponsive';
export * from './components/feedback/UserFeedback';

// Accessibility components for ALLY-030
export * from './components/accessibility/AccessibilityUtils';

// Sacred Geometry Visualization - SPIRITUAL-003.5
export * from './components/SacredGeometryVisualizer';
export * from './components/FlowerOfLifeViewer';
export * from './components/SacredGeometry/SacredGeometryComponents';

// Error handling components
export { default as ErrorBoundary } from './components/feedback/ErrorBoundary';
export * from './components/feedback/ErrorBoundaries';

// Import ErrorMessage from the default export of ErrorHandling
import ErrorHandling from './components/feedback/ErrorHandling';
export const ErrorMessage = ErrorHandling.ErrorMessage;

// Re-export specific error boundary types for compatibility
export {
  SectionErrorBoundary,
  ComponentErrorBoundary,
  FormErrorBoundary,
  withErrorBoundary,
} from './components/feedback/ErrorBoundaries';

// Frequency visualization components  
export {
  FrequencyVisualization,
  FrequencyWaveform,
  type FrequencyData,
  type FrequencyVisualizationConfig,
  type FrequencyVisualizationProps
} from './components/charts/SharedFrequencyVisualization';

// Export centralized CSS modules
export * as stylesModules from './styles/modules';

// Performance monitoring utilities
export * from './utils/performance';
export * from './utils/lazy-loading';
export * from './utils/type-guards';
export * from './utils/api-validation';
