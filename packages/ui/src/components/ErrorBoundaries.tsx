import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import type { ErrorInfo as BoundaryErrorInfo } from './errorTypes';

/**
 * Page-level error boundary for critical application errors
 */
interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string | undefined;
  onError?: ((error: Error, errorInfo: BoundaryErrorInfo) => void) | undefined;
}

export function PageErrorBoundary({ children, pageName, onError }: PageErrorBoundaryProps) {
  const nameProps = pageName !== undefined ? { name: pageName } : {};
  return (
    <ErrorBoundary
      level="page"
      resetOnPropsChange={true}
      {...nameProps}
      {...(onError ? { onError } : {})}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Section-level error boundary for isolated component groups
 */
interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName?: string | undefined;
  fallback?: ReactNode | ((error: Error, errorInfo: BoundaryErrorInfo, retry: () => void) => ReactNode) | undefined;
  onError?: ((error: Error, errorInfo: BoundaryErrorInfo) => void) | undefined;
}

export function SectionErrorBoundary({ children, sectionName, fallback, onError }: SectionErrorBoundaryProps) {
  const nameProps = sectionName !== undefined ? { name: sectionName } : {};
  return (
    <ErrorBoundary
      level="section"
      fallback={fallback}
      {...nameProps}
      {...(onError ? { onError } : {})}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-level error boundary for individual components
 */
interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string | undefined;
  fallback?: ReactNode | ((error: Error, errorInfo: BoundaryErrorInfo, retry: () => void) => ReactNode) | undefined;
  onError?: ((error: Error, errorInfo: BoundaryErrorInfo) => void) | undefined;
  resetKeys?: Array<string | number> | undefined;
}

export function ComponentErrorBoundary({ children, componentName, fallback, onError, resetKeys }: ComponentErrorBoundaryProps) {
  const nameProps = componentName !== undefined ? { name: componentName } : {};
  return (
    <ErrorBoundary
      level="component"
      fallback={fallback}
      {...nameProps}
      {...(onError ? { onError } : {})}
      {...(resetKeys ? { resetKeys } : {})}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Async operation error boundary with loading states
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  operationName?: string | undefined;
  loadingFallback?: ReactNode | undefined;
  errorFallback?: ReactNode | ((error: Error, errorInfo: BoundaryErrorInfo, retry: () => void) => ReactNode) | undefined;
  onError?: ((error: Error, errorInfo: BoundaryErrorInfo) => void) | undefined;
}

export function AsyncErrorBoundary({ children, operationName, loadingFallback: _loadingFallback, errorFallback, onError }: AsyncErrorBoundaryProps) {
  const asyncFallback = errorFallback ?? (
    <div className="p-4 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center">
      <div className="text-amber-400 mb-2">⚠️</div>
      <p className="text-cosmic-silver text-sm">Failed to load {operationName ?? 'content'}</p>
      <button onClick={() => window.location.reload()} className="mt-2 px-3 py-1 bg-cosmic-purple text-white text-sm rounded hover:bg-cosmic-purple/80">Retry</button>
    </div>
  );
  const nameProps = operationName ? { name: `async-${operationName}` } : { name: 'async-operation' };
  return (
    <ErrorBoundary level="component" fallback={asyncFallback} {...nameProps} {...(onError ? { onError } : {})}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Form error boundary with validation error handling
 */
interface FormErrorBoundaryProps {
  children: ReactNode;
  formName?: string | undefined;
  onError?: ((error: Error, errorInfo: BoundaryErrorInfo) => void) | undefined;
}

export function FormErrorBoundary({ children, formName, onError }: FormErrorBoundaryProps) {
  const formFallback = (_error: Error, _errorInfo: unknown, retry: () => void) => (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div className="text-red-400 mb-2">📝</div>
      <h3 className="text-red-400 font-medium mb-1">Form Error</h3>
      <p className="text-cosmic-silver text-sm mb-3">There was an issue with the form. Your data has been preserved.</p>
      <div className="flex gap-2">
        <button onClick={retry} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Retry</button>
        <button onClick={() => window.location.reload()} className="px-3 py-1 border border-red-500 text-red-400 text-sm rounded hover:bg-red-500/10">Refresh</button>
      </div>
    </div>
  );
  const nameProps = formName ? { name: `form-${formName}` } : { name: 'form' };
  return (
    <ErrorBoundary level="component" fallback={formFallback} {...nameProps} {...(onError ? { onError } : {})}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Chart/visualization error boundary
 */
interface ChartErrorBoundaryProps {
  children: ReactNode;
  chartType?: string | undefined;
  onError?: ((error: Error, errorInfo: BoundaryErrorInfo) => void) | undefined;
}

export function ChartErrorBoundary({ children, chartType, onError }: ChartErrorBoundaryProps) {
  const chartFallback = (_error: Error, _errorInfo: unknown, retry: () => void) => {
    const msg = _error?.message ?? '';
    const isChunkError = msg.includes('Loading chunk') || msg.includes('Loading CSS chunk');
    if (isChunkError) {
      return (
        <div className="p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center">
          <div className="text-cosmic-blue text-3xl mb-3">⚡</div>
          <h3 className="text-cosmic-gold font-medium mb-2">Loading Error</h3>
          <p className="text-cosmic-silver text-sm mb-4">Failed to load {chartType ?? 'chart'}. This usually happens after an app update.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-cosmic-blue text-white text-sm rounded hover:bg-cosmic-blue/80">Reload App</button>
        </div>
      );
    }
    return (
      <div className="p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center">
        <div className="text-red-400 text-3xl mb-3">🔧</div>
        <h3 className="text-cosmic-gold font-medium mb-2">Component Error</h3>
        <p className="text-cosmic-silver text-sm mb-4">{chartType ?? 'Component'} failed to load properly.</p>
        <div className="flex gap-2 justify-center">
          <button onClick={retry} className="px-4 py-2 bg-cosmic-purple text-white text-sm rounded hover:bg-cosmic-purple/80">Try Again</button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 border border-cosmic-silver/30 text-cosmic-silver text-sm rounded hover:bg-cosmic-silver/10">Reload</button>
        </div>
      </div>
    );
  };
  const nameProps = chartType ? { name: `chart-${chartType}` } : { name: 'chart' };
  return (
    <ErrorBoundary level="component" fallback={chartFallback} {...nameProps} {...(onError ? { onError } : {})}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * HOC for wrapping components with error boundaries
 */
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  options: { level?: 'page' | 'section' | 'component'; name?: string | undefined; fallback?: ReactNode; onError?: ((error: Error, errorInfo: BoundaryErrorInfo) => void) | undefined } = {}
) {
  const { level = 'component', name, fallback, onError } = options;
  const nameProps = name ? { name } : {};
  const WrappedComponent = (props: T) => (
    <ErrorBoundary level={level} fallback={fallback} {...nameProps} {...(onError ? { onError } : {})}>
      <Component {...props} />
    </ErrorBoundary>
  );
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;
  return WrappedComponent;
}

/**
 * Error boundary for lazy-loaded components
 */
interface LazyErrorBoundaryProps {
  children: ReactNode;
  componentName?: string | undefined;
  loadingFallback?: ReactNode | undefined;
}

export function LazyErrorBoundary({ children, componentName, loadingFallback: _loadingFallback }: LazyErrorBoundaryProps) {
  const lazyFallback = (_error: Error, _errorInfo: unknown, retry: () => void) => {
    const msg = _error?.message ?? '';
    const isChunkError = msg.includes('Loading chunk') || msg.includes('Loading CSS chunk');
    if (isChunkError) {
      return (
        <div className="p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center">
          <div className="text-cosmic-blue text-3xl mb-3">⚡</div>
          <h3 className="text-cosmic-gold font-medium mb-2">Loading Error</h3>
          <p className="text-cosmic-silver text-sm mb-4">Failed to load {componentName ?? 'component'}. This usually happens after an app update.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-cosmic-blue text-white text-sm rounded hover:bg-cosmic-blue/80">Reload App</button>
        </div>
      );
    }
    return (
      <div className="p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center">
        <div className="text-red-400 text-3xl mb-3">🔧</div>
        <h3 className="text-cosmic-gold font-medium mb-2">Component Error</h3>
        <p className="text-cosmic-silver text-sm mb-4">{componentName ?? 'Component'} failed to load properly.</p>
        <div className="flex gap-2 justify-center">
          <button onClick={retry} className="px-4 py-2 bg-cosmic-purple text-white text-sm rounded hover:bg-cosmic-purple/80">Try Again</button>
          <button onClick={() => window.location.reload()} className="px-4 py-2 border border-cosmic-silver/30 text-cosmic-silver text-sm rounded hover:bg-cosmic-silver/10">Reload</button>
        </div>
      </div>
    );
  };
  const nameProps = componentName ? { name: `lazy-${componentName}` } : { name: 'lazy-component' };
  return (
    <ErrorBoundary level="component" fallback={lazyFallback} {...nameProps}>
      {children}
    </ErrorBoundary>
  );
}
