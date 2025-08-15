import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

/**
 * HealWave-specific error boundary with custom theming
 * Falls back to shared ErrorBoundary from @cosmichub/ui for most functionality
 */
interface HealWaveErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class HealWaveErrorBoundary extends Component<HealWaveErrorBoundaryProps, State> {
  constructor(props: HealWaveErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // HealWave-specific logging
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.group('🎵 HealWave Error Boundary');
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      // eslint-disable-next-line no-console
      console.error('Error Info:', errorInfo);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-cyan-900/20">
          <div className="max-w-md w-full bg-black/50 backdrop-blur-md shadow-2xl rounded-lg p-8 border border-white/10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 mb-6">
                <svg
                  className="h-8 w-8 text-cyan-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-3">
                Something went wrong
              </h2>
              
              <p className="text-gray-300 text-sm mb-6">
                The healing frequency was interrupted. Let's restore harmony to your experience.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-400 hover:text-gray-300">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-black/30 rounded border border-white/10 text-xs font-mono text-red-400 overflow-auto max-h-40">
                    <div className="font-semibold text-red-300">Error: {this.state.error.message}</div>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="mt-2 whitespace-pre-wrap text-blue-400">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={this.handleRetry}
                  className="inline-flex justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                >
                  🔄 Restore Harmony
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex justify-center w-full sm:w-auto px-6 py-3 border border-white/20 text-sm font-medium rounded-md text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/25 transition-all duration-200"
                >
                  🔄 Reload App
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HealWaveErrorBoundary;
