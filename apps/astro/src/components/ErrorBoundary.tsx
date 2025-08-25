import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { isDevelopment, devConsole } from '../config/environment';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced Error Boundary for Astro app with cosmic theming
 * This will be migrated to use @cosmichub/ui ErrorBoundary
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    error: Error;
  } {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    devConsole.error?.('Error:', error);
    devConsole.error?.('Error Info:', errorInfo);

    // Check if this is a serialization error and log additional context
    const message = error.message;
    if (
      typeof message === 'string' &&
      (message.includes('serialization') || message.includes('deserialize'))
    ) {
      devConsole.warn?.('⚠️ Serialization Error Detected', {
        errorType: 'SERIALIZATION_ERROR',
        component: this.props.name ?? 'unknown',
        message: error.message,
        stack: error.stack?.slice(0, 500), // Truncate for logging
      });
    }

    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined && this.props.fallback !== null) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-[200px] flex items-center justify-center p-8'>
          <div className='max-w-md w-full bg-cosmic-dark/80 backdrop-blur-sm rounded-lg border border-cosmic-silver/20 p-6 text-center'>
            <div className='text-4xl mb-4'>⭐</div>
            <h2 className='text-xl font-bold text-cosmic-gold mb-2'>
              Something went wrong
            </h2>
            <p className='text-cosmic-silver text-sm mb-6'>
              {this.props.name !== undefined && this.props.name !== null
                ? `Error in ${this.props.name}`
                : 'An unexpected error occurred'}
            </p>

            {isDevelopment() === true && this.state.error !== null && (
              <details className='mb-6 text-left'>
                <summary className='cursor-pointer text-sm font-medium text-cosmic-silver/80 hover:text-cosmic-silver'>
                  Technical Details
                </summary>
                <div className='mt-2 p-3 bg-cosmic-dark rounded border border-cosmic-silver/10 text-xs font-mono text-red-400 overflow-auto max-h-32'>
                  <div className='font-semibold text-red-300'>
                    {this.state.error.message}
                  </div>
                  {this.state.error.stack !== undefined &&
                    this.state.error.stack !== null && (
                      <pre className='mt-2 whitespace-pre-wrap text-red-400/80'>
                        {this.state.error.stack}
                      </pre>
                    )}
                </div>
              </details>
            )}

            <div className='flex gap-3 justify-center'>
              <button
                onClick={this.handleRetry}
                className='px-4 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white text-sm rounded transition-colors'
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className='px-4 py-2 border border-cosmic-silver/30 hover:bg-cosmic-silver/10 text-cosmic-silver text-sm rounded transition-colors'
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
