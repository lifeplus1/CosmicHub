import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ErrorContext } from '../hooks/useErrorHandling';

/**
 * Page-level error boundary for critical application errors
 */
interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
  onError?: (error: Error, errorInfo: any) => void;
}

export function PageErrorBoundary({ 
  children, 
  pageName,
  onError 
}: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="page"
      name={pageName}
      onError={onError}
      resetOnPropsChange={true}
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
  sectionName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export function SectionErrorBoundary({ 
  children, 
  sectionName,
  fallback,
  onError 
}: SectionErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="section"
      name={sectionName}
      fallback={fallback}
      onError={onError}
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
  componentName?: string;
  fallback?: ReactNode | ((error: Error, errorInfo: any, retry: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: any) => void;
  resetKeys?: Array<string | number>;
}

export function ComponentErrorBoundary({ 
  children, 
  componentName,
  fallback,
  onError,
  resetKeys 
}: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="component"
      name={componentName}
      fallback={fallback}
      onError={onError}
      resetKeys={resetKeys}
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
  operationName?: string;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export function AsyncErrorBoundary({
  children,
  operationName,
  loadingFallback,
  errorFallback,
  onError
}: AsyncErrorBoundaryProps) {
  const asyncFallback = errorFallback || (
    <div className="p-4 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center">
      <div className="text-amber-400 mb-2">⚠️</div>
      <p className="text-cosmic-silver text-sm">
        Failed to load {operationName || 'content'}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 px-3 py-1 bg-cosmic-purple text-white text-sm rounded hover:bg-cosmic-purple/80"
      >
        Retry
      </button>
    </div>
  );

  return (
    <ErrorBoundary
      level="component"
      name={`async-${operationName}`}
      fallback={asyncFallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Form error boundary with validation error handling
 */
interface FormErrorBoundaryProps {
  children: ReactNode;
  formName?: string;
  onError?: (error: Error, errorInfo: any) => void;
}

export function FormErrorBoundary({ 
  children, 
  formName,
  onError 
}: FormErrorBoundaryProps) {
  const formFallback = (error: Error, errorInfo: any, retry: () => void) => (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div className="text-red-400 mb-2">📝</div>
      <h3 className="text-red-400 font-medium mb-1">Form Error</h3>
      <p className="text-cosmic-silver text-sm mb-3">
        There was an issue with the form. Your data has been preserved.
      </p>
      <div className="flex gap-2">
        <button 
          onClick={retry}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Retry
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-3 py-1 border border-red-500 text-red-400 text-sm rounded hover:bg-red-500/10"
        >
          Refresh
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      level="component"
      name={`form-${formName}`}
      fallback={formFallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Chart/visualization error boundary
 */
interface ChartErrorBoundaryProps {
  children: ReactNode;
  chartType?: string;
  onError?: (error: Error, errorInfo: any) => void;
}

export function ChartErrorBoundary({ 
  children, 
  chartType,
  onError 
}: ChartErrorBoundaryProps) {
  const chartFallback = (error: Error, errorInfo: any, retry: () => void) => (
    <div className="p-8 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center">
      <div className="text-cosmic-purple text-4xl mb-4">📊</div>
      <h3 className="text-cosmic-gold font-medium mb-2">Chart Error</h3>
      <p className="text-cosmic-silver text-sm mb-4">
        Unable to render {chartType || 'chart'}. This might be due to invalid data or a rendering issue.
      </p>
      <div className="flex gap-2 justify-center">
        <button 
          onClick={retry}
          className="px-4 py-2 bg-cosmic-purple text-white text-sm rounded hover:bg-cosmic-purple/80"
        >
          Retry Chart
        </button>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-cosmic-silver/30 text-cosmic-silver text-sm rounded hover:bg-cosmic-silver/10"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      level="component"
      name={`chart-${chartType}`}
      fallback={chartFallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * HOC for wrapping components with error boundaries
 */
export function withErrorBoundary<T extends {}>(
  Component: React.ComponentType<T>,
  options: {
    level?: 'page' | 'section' | 'component';
    name?: string;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: any) => void;
  } = {}
) {
  const { level = 'component', name, fallback, onError } = options;
  
  const WrappedComponent = (props: T) => (
    <ErrorBoundary
      level={level}
      name={name || Component.displayName || Component.name}
      fallback={fallback}
      onError={onError}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Error boundary for lazy-loaded components
 */
interface LazyErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  loadingFallback?: ReactNode;
}

export function LazyErrorBoundary({ 
  children, 
  componentName,
  loadingFallback 
}: LazyErrorBoundaryProps) {
  const lazyFallback = (error: Error, errorInfo: any, retry: () => void) => {
    // Check if this is a chunk loading error
    const isChunkError = error.message.includes('Loading chunk') || 
                        error.message.includes('Loading CSS chunk');
    
    if (isChunkError) {
      return (
        <div className="p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center">
          <div className="text-cosmic-blue text-3xl mb-3">⚡</div>
          <h3 className="text-cosmic-gold font-medium mb-2">Loading Error</h3>
          <p className="text-cosmic-silver text-sm mb-4">
            Failed to load {componentName || 'component'}. This usually happens after an app update.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cosmic-blue text-white text-sm rounded hover:bg-cosmic-blue/80"
          >
            Reload App
          </button>
        </div>
      );
    }

    return (
      <div className="p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center">
        <div className="text-red-400 text-3xl mb-3">🔧</div>
        <h3 className="text-cosmic-gold font-medium mb-2">Component Error</h3>
        <p className="text-cosmic-silver text-sm mb-4">
          {componentName || 'Component'} failed to load properly.
        </p>
        <div className="flex gap-2 justify-center">
          <button 
            onClick={retry}
            className="px-4 py-2 bg-cosmic-purple text-white text-sm rounded hover:bg-cosmic-purple/80"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-cosmic-silver/30 text-cosmic-silver text-sm rounded hover:bg-cosmic-silver/10"
          >
            Reload
          </button>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary
      level="component"
      name={`lazy-${componentName}`}
      fallback={lazyFallback}
    >
      {children}
    </ErrorBoundary>
  );
}
