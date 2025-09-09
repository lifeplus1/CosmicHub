/**
 * Enhanced Error Boundary for Dynamic Import Issues
 * Handles module loading failures and provides fallback UI
 */

import React, { Component, ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@cosmichub/ui';
import { logger } from '@cosmichub/config';

interface DynamicImportErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onRetry?: () => void;
}

interface DynamicImportErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

/**
 * Error boundary specifically designed to handle dynamic import failures
 * Provides retry functionality and user-friendly error messages
 */
export class DynamicImportErrorBoundary extends Component<
  DynamicImportErrorBoundaryProps,
  DynamicImportErrorBoundaryState
> {
  private maxRetries = 3;
  private retryTimeout: number | null = null;

  constructor(props: DynamicImportErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<DynamicImportErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Log the error with context
    logger.error('Dynamic Import Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName,
      retryCount: this.state.retryCount,
    });

    // Auto-retry for dynamic import failures
    if (this.isDynamicImportError(error) && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  override componentWillUnmount(): void {
    if (this.retryTimeout) {
      window.clearTimeout(this.retryTimeout);
    }
  }

  private isDynamicImportError(error: Error): boolean {
    const importErrorIndicators = [
      'Failed to fetch dynamically imported module',
      'Loading chunk',
      'ChunkLoadError',
      'NetworkError',
      'Loading CSS chunk',
    ];

    return importErrorIndicators.some(indicator =>
      error.message.includes(indicator) || error.name.includes('ChunkLoadError')
    );
  }

  private scheduleRetry = (): void => {
    const retryDelay = Math.min(1000 * Math.pow(2, this.state.retryCount), 5000); // Exponential backoff, max 5s

    this.retryTimeout = window.setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }, retryDelay);
  };

  private handleManualRetry = (): void => {
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      // Force reload the page as last resort
      window.location.reload();
    }
  };

  private handleResetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  private getErrorMessage(): string {
    const { error } = this.state;
    
    if (!error) return 'An unknown error occurred';

    if (this.isDynamicImportError(error)) {
      return 'Failed to load application module. This might be due to a network issue or deployment update.';
    }

    return error.message || 'Component failed to render';
  }

  private getErrorType(): 'network' | 'component' | 'unknown' {
    const { error } = this.state;
    
    if (!error) return 'unknown';
    
    if (this.isDynamicImportError(error)) {
      return 'network';
    }
    
    return 'component';
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorType = this.getErrorType();
      const errorMessage = this.getErrorMessage();
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div 
          className="min-h-screen flex items-center justify-center bg-cosmic-dark p-4"
          role="alert"
          aria-live="polite"
        >
          <Card className="max-w-md w-full bg-cosmic-blue/20 border-cosmic-purple/30">
            <CardHeader>
              <CardTitle className="text-cosmic-gold flex items-center gap-2">
                {errorType === 'network' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {errorType === 'network' ? 'Loading Error' : 'Component Error'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-cosmic-silver/80 text-sm leading-relaxed">
                {errorMessage}
              </p>

              {this.state.retryCount > 0 && (
                <p className="text-cosmic-silver/60 text-xs">
                  Retry attempt: {this.state.retryCount}/{this.maxRetries}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {canRetry && errorType === 'network' && (
                  <Button
                    onClick={this.handleResetError}
                    variant="cosmic"
                    className="bg-cosmic-purple hover:bg-cosmic-purple/80"
                    size="sm"
                  >
                    Try Again
                  </Button>
                )}
                
                <Button
                  onClick={this.handleManualRetry}
                  variant="outline"
                  className="border-cosmic-silver/30 text-cosmic-silver hover:bg-cosmic-silver/10"
                  size="sm"
                >
                  Reload Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer text-cosmic-silver/60 hover:text-cosmic-silver">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-2 bg-cosmic-dark/50 rounded text-red-400 overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DynamicImportErrorBoundary;
