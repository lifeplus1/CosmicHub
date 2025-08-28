import React, { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * HealWave-specific error boundary with custom theming
 * Falls back to shared ErrorBoundary from @cosmichub/ui for most functionality
 */
interface HealWaveErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface HealWaveErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class HealWaveErrorBoundary extends Component<HealWaveErrorBoundaryProps, HealWaveErrorBoundaryState> {
  constructor(props: HealWaveErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): HealWaveErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    this.props.onError?.(error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Something went wrong in HealWave
          </h2>
          <p className="text-gray-600 mb-4">
            We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HealWaveErrorBoundary;
