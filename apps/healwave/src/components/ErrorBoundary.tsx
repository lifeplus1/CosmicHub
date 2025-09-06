import React, { Component, ErrorInfo, ReactNode, useCallback } from 'react';
import { logger } from '@cosmichub/config';

// Create component-specific logger
const errorLogger = logger.child ? logger.child({ module: 'ErrorBoundary' }) : logger;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Separate functional component for the fallback UI to use hooks
const DefaultErrorFallback: React.FC<{ error?: Error }> = React.memo(({ error }) => {
  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRefresh();
    }
  }, [handleRefresh]);

  return (
    <div className='flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-red-900/20 border-red-500/30 backdrop-blur-sm'>
      <div className='mb-4 text-4xl' role='img' aria-label='Error icon'>
        ⚠️
      </div>
      <h2 className='mb-2 text-xl font-semibold text-red-400'>
        Something went wrong
      </h2>
      <p className='mb-4 text-red-300'>
        We encountered an unexpected error. Please try refreshing the page.
      </p>
      <button
        onClick={handleRefresh}
        onKeyDown={handleKeyDown}
        className='px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
        aria-label='Refresh page'
      >
        Refresh Page
      </button>
      {process.env.NODE_ENV === 'development' && error && (
        <details className='max-w-full p-3 mt-4 overflow-auto text-left border rounded bg-black/50 border-red-500/50'>
          <summary className='font-medium text-red-400 cursor-pointer'>
            Error Details (Development)
          </summary>
          <pre className='mt-2 text-xs text-red-300 whitespace-pre-wrap'>
            {error.toString()}
          </pre>
        </details>
      )}
    </div>
  );
});

DefaultErrorFallback.displayName = 'DefaultErrorFallback';

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    errorLogger.error('ErrorBoundary caught an error', { error, errorInfo });
    
    // Call the optional onError callback
    this.props.onError?.(error, errorInfo);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
