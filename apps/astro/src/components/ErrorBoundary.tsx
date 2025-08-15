import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

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

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.group('🚨 Astro Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();
    
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-cosmic-dark/80 backdrop-blur-sm rounded-lg border border-cosmic-silver/20 p-6 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h2 className="text-xl font-bold text-cosmic-gold mb-2">
              Something went wrong
            </h2>
            <p className="text-cosmic-silver text-sm mb-6">
              {this.props.name ? `Error in ${this.props.name}` : 'An unexpected error occurred'}
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-cosmic-silver/80 hover:text-cosmic-silver">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-cosmic-dark rounded border border-cosmic-silver/10 text-xs font-mono text-red-400 overflow-auto max-h-32">
                  <div className="font-semibold text-red-300">
                    {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <pre className="mt-2 whitespace-pre-wrap text-red-400/80">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white text-sm rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-cosmic-silver/30 hover:bg-cosmic-silver/10 text-cosmic-silver text-sm rounded transition-colors"
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