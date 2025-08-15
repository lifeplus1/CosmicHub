/**
 * Minimal UI exports for Docker build compatibility
 */

// Export all UI components
export * from './components/Button';
export * from './components/Card';
export * from './components/Input';
export * from './components/Tooltip';
export * from './components/Table';
export * from './components/Accordion';
export * from './components/Tabs';
export * from './components/Modal';
export * from './components/Loading';
export * from './components/Badge';
export * from './components/Spinner';
export * from './components/UpgradeModal';
export * from './components/PerformanceDashboard';

// Error handling components
export { default as ErrorBoundary } from './components/ErrorBoundary';
export * from './components/ErrorBoundaries';
export * from './hooks/useErrorHandling';

// Re-export specific error boundary types for compatibility
export { 
  PageErrorBoundary,
  ComponentErrorBoundary, 
  FormErrorBoundary,
  withErrorBoundary
} from './components/ErrorBoundaries';