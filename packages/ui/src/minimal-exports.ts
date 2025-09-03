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
export * from './components/modals/UpgradeModal';
export * from './components/analytics/PerformanceDashboard';

// UX Enhancement components
export * from './components/feedback/LoadingStates';
export * from './components/feedback/ErrorHandling';
export * from './components/layout/MobileResponsive';
export * from './components/feedback/UserFeedback';

// Accessibility components for ALLY-030
export * from './components/accessibility/AccessibilityUtils';

// Error handling components
export { default as ErrorBoundary } from './components/feedback/ErrorBoundary';
export * from './components/feedback/ErrorBoundaries';

// Re-export specific error boundary types for compatibility
export {
  PageErrorBoundary,
  ComponentErrorBoundary,
  FormErrorBoundary,
  withErrorBoundary,
} from './components/feedback/ErrorBoundaries';
