// COMPLETE REWRITE: Previous file was structurally corrupted (missing component wrappers,
// orphaned code blocks). This version provides clean, typed boundary helpers.
import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import type { ErrorInfo as BoundaryErrorInfo } from './errorTypes';

/** Page-level error boundary */
export interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
  onError?: (error: Error, info: BoundaryErrorInfo) => void;
  fallback?:
    | ReactNode
    | ((error: Error, info: BoundaryErrorInfo, retry: () => void) => ReactNode);
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  pageName,
  onError,
  fallback,
}) => {
  const nameProps = pageName ? { name: pageName } : {};
  return (
    <ErrorBoundary
      level='page'
      resetOnPropsChange
      fallback={fallback}
      {...nameProps}
      {...(onError ? { onError } : {})}
    >
      {children}
    </ErrorBoundary>
  );
};

/** Section-level error boundary */
export interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionName?: string;
  onError?: (error: Error, info: BoundaryErrorInfo) => void;
  fallback?:
    | ReactNode
    | ((error: Error, info: BoundaryErrorInfo, retry: () => void) => ReactNode);
}

export const SectionErrorBoundary: React.FC<SectionErrorBoundaryProps> = ({
  children,
  sectionName,
  onError,
  fallback,
}) => {
  const nameProps = sectionName ? { name: sectionName } : {};
  return (
    <ErrorBoundary
      level='section'
      fallback={fallback}
      {...nameProps}
      {...(onError ? { onError } : {})}
    >
      {children}
    </ErrorBoundary>
  );
};

/** Component-level error boundary */
export interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  onError?: (error: Error, info: BoundaryErrorInfo) => void;
  fallback?:
    | ReactNode
    | ((error: Error, info: BoundaryErrorInfo, retry: () => void) => ReactNode);
  resetKeys?: Array<string | number>;
}

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({
  children,
  componentName,
  onError,
  fallback,
  resetKeys,
}) => {
  const nameProps = componentName ? { name: componentName } : {};
  return (
    <ErrorBoundary
      level='component'
      fallback={fallback}
      {...nameProps}
      {...(onError ? { onError } : {})}
      {...(resetKeys ? { resetKeys } : {})}
    >
      {children}
    </ErrorBoundary>
  );
};

/** Async operation boundary */
export interface AsyncErrorBoundaryProps {
  children: ReactNode;
  operationName?: string;
  onError?: (error: Error, info: BoundaryErrorInfo) => void;
  loadingFallback?: ReactNode;
  errorFallback?:
    | ReactNode
    | ((error: Error, info: BoundaryErrorInfo, retry: () => void) => ReactNode);
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  operationName,
  onError,
  loadingFallback,
  errorFallback,
}) => {
  const fallback =
    errorFallback ??
    ((error: Error, _info: BoundaryErrorInfo, retry: () => void) => (
      <div className='p-4 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center'>
        <div className='text-amber-400 mb-2'>⚠️</div>
        <p className='text-cosmic-silver text-sm'>
          Failed to load {operationName ?? 'content'}
        </p>
        <div className='flex justify-center gap-2 mt-3'>
          <button
            onClick={retry}
            className='px-3 py-1 bg-cosmic-purple text-white text-xs rounded hover:bg-cosmic-purple/80'
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            className='px-3 py-1 border border-cosmic-silver/30 text-cosmic-silver text-xs rounded hover:bg-cosmic-silver/10'
          >
            Reload
          </button>
        </div>
        {loadingFallback && (
          <div className='mt-4 text-xs text-cosmic-silver/60'>
            {loadingFallback}
          </div>
        )}
        {error.message && (
          <div className='mt-3 text-[10px] text-red-400/70 break-all'>
            {error.message}
          </div>
        )}
      </div>
    ));

  const nameProps = operationName
    ? { name: `async-${operationName}` }
    : { name: 'async-operation' };
  return (
    <ErrorBoundary
      level='component'
      fallback={fallback as AsyncErrorBoundaryProps['errorFallback']}
      {...nameProps}
      {...(onError ? { onError } : {})}
    >
      {children}
    </ErrorBoundary>
  );
};

/** Form boundary */
export interface FormErrorBoundaryProps {
  children: ReactNode;
  formName?: string;
  onError?: (error: Error, info: BoundaryErrorInfo) => void;
}

export const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({
  children,
  formName,
  onError,
}) => {
  const fallback = (
    error: Error,
    _info: BoundaryErrorInfo,
    retry: () => void
  ) => (
    <div className='p-4 bg-red-500/10 border border-red-500/20 rounded-lg'>
      <div className='text-red-400 mb-2'>📝</div>
      <h3 className='text-red-400 font-medium mb-1'>Form Error</h3>
      <p className='text-cosmic-silver text-sm mb-3'>
        There was an issue with the form. Your data has been preserved.
      </p>
      <div className='flex gap-2'>
        <button
          onClick={retry}
          className='px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600'
        >
          Retry
        </button>
        <button
          onClick={() => window.location.reload()}
          className='px-3 py-1 border border-red-500 text-red-400 text-sm rounded hover:bg-red-500/10'
        >
          Refresh
        </button>
      </div>
      {error.message && (
        <div className='mt-3 text-xs text-red-400/70 break-all'>
          {error.message}
        </div>
      )}
    </div>
  );
  const nameProps = formName ? { name: `form-${formName}` } : { name: 'form' };
  return (
    <ErrorBoundary
      level='component'
      fallback={fallback}
      {...nameProps}
      {...(onError ? { onError } : {})}
    >
      {children}
    </ErrorBoundary>
  );
};

/** Chart / visualization boundary */
export interface ChartErrorBoundaryProps {
  children: ReactNode;
  chartType?: string;
  onError?: (error: Error, info: BoundaryErrorInfo) => void;
}

export const ChartErrorBoundary: React.FC<ChartErrorBoundaryProps> = ({
  children,
  chartType,
  onError,
}) => {
  const fallback = (
    error: Error,
    _info: BoundaryErrorInfo,
    retry: () => void
  ) => {
    const msg = error.message ?? '';
    const isChunkError =
      msg.includes('Loading chunk') || msg.includes('Loading CSS chunk');
    if (isChunkError) {
      return (
        <div className='p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center'>
          <div className='text-cosmic-blue text-3xl mb-3'>⚡</div>
          <h3 className='text-cosmic-gold font-medium mb-2'>Loading Error</h3>
          <p className='text-cosmic-silver text-sm mb-4'>
            Failed to load {chartType ?? 'chart'}. This usually happens after an
            app update.
          </p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-cosmic-blue text-white text-sm rounded hover:bg-cosmic-blue/80'
          >
            Reload App
          </button>
        </div>
      );
    }
    return (
      <div className='p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center'>
        <div className='text-red-400 text-3xl mb-3'>🔧</div>
        <h3 className='text-cosmic-gold font-medium mb-2'>Component Error</h3>
        <p className='text-cosmic-silver text-sm mb-4'>
          {chartType ?? 'Component'} failed to load properly.
        </p>
        <div className='flex gap-2 justify-center'>
          <button
            onClick={retry}
            className='px-4 py-2 bg-cosmic-purple text-white text-sm rounded hover:bg-cosmic-purple/80'
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 border border-cosmic-silver/30 text-cosmic-silver text-sm rounded hover:bg-cosmic-silver/10'
          >
            Reload
          </button>
        </div>
        {error.message && (
          <div className='mt-3 text-xs text-red-400/70 break-all'>
            {error.message}
          </div>
        )}
      </div>
    );
  };
  const nameProps = chartType
    ? { name: `chart-${chartType}` }
    : { name: 'chart' };
  return (
    <ErrorBoundary
      level='component'
      fallback={fallback}
      {...nameProps}
      {...(onError ? { onError } : {})}
    >
      {children}
    </ErrorBoundary>
  );
};

/** Lazy-loaded components boundary */
export interface LazyErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  onError?: (error: Error, info: BoundaryErrorInfo) => void;
  loadingFallback?: ReactNode;
}

export const LazyErrorBoundary: React.FC<LazyErrorBoundaryProps> = ({
  children,
  componentName,
  onError,
  loadingFallback,
}) => {
  const fallback = (
    error: Error,
    _info: BoundaryErrorInfo,
    retry: () => void
  ) => {
    const msg = error.message ?? '';
    const isChunkError =
      msg.includes('Loading chunk') || msg.includes('Loading CSS chunk');
    if (isChunkError) {
      return (
        <div className='p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center'>
          <div className='text-cosmic-blue text-3xl mb-3'>⚡</div>
          <h3 className='text-cosmic-gold font-medium mb-2'>Loading Error</h3>
          <p className='text-cosmic-silver text-sm mb-4'>
            Failed to load {componentName ?? 'component'}. This usually happens
            after an app update.
          </p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-cosmic-blue text-white text-sm rounded hover:bg-cosmic-blue/80'
          >
            Reload App
          </button>
        </div>
      );
    }
    return (
      <div className='p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20 text-center'>
        <div className='text-red-400 text-3xl mb-3'>🔧</div>
        <h3 className='text-cosmic-gold font-medium mb-2'>Component Error</h3>
        <p className='text-cosmic-silver text-sm mb-4'>
          {componentName ?? 'Component'} failed to load properly.
        </p>
        <div className='flex gap-2 justify-center'>
          <button
            onClick={retry}
            className='px-4 py-2 bg-cosmic-purple text-white text-sm rounded hover:bg-cosmic-purple/80'
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 border border-cosmic-silver/30 text-cosmic-silver text-sm rounded hover:bg-cosmic-silver/10'
          >
            Reload
          </button>
        </div>
        {loadingFallback && (
          <div className='mt-4 text-xs text-cosmic-silver/60'>
            {loadingFallback}
          </div>
        )}
        {error.message && (
          <div className='mt-3 text-[10px] text-red-400/70 break-all'>
            {error.message}
          </div>
        )}
      </div>
    );
  };
  const nameProps = componentName
    ? { name: `lazy-${componentName}` }
    : { name: 'lazy-component' };
  return (
    <ErrorBoundary
      level='component'
      fallback={fallback}
      {...nameProps}
      {...(onError ? { onError } : {})}
    >
      {children}
    </ErrorBoundary>
  );
};

/** Generic HOC wrapper */
export interface WithErrorBoundaryOptions {
  level?: 'page' | 'section' | 'component';
  name?: string;
  fallback?:
    | ReactNode
    | ((error: Error, info: BoundaryErrorInfo, retry: () => void) => ReactNode);
  onError?: (error: Error, info: BoundaryErrorInfo) => void;
}

export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  options: WithErrorBoundaryOptions = {}
): React.FC<T> {
  const { level = 'component', name, fallback, onError } = options;
  const nameProps = name ? { name } : {};
  const Wrapped: React.FC<T> = props => (
    <ErrorBoundary
      level={level}
      fallback={fallback}
      {...nameProps}
      {...(onError ? { onError } : {})}
    >
      <Component {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `withErrorBoundary(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Wrapped;
}

export default {
  PageErrorBoundary,
  SectionErrorBoundary,
  ComponentErrorBoundary,
  AsyncErrorBoundary,
  FormErrorBoundary,
  ChartErrorBoundary,
  LazyErrorBoundary,
  withErrorBoundary,
};
