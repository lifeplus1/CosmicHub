/**
 * Performance Error Boundary Component
 * 
 * React component for catching and tracking component errors with performance metrics
 */

import React, { Component, type ErrorInfo, type PropsWithChildren } from 'react';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  RENDER_WARNING: 16, // 60fps threshold
  RENDER_CRITICAL: 33, // 30fps threshold
} as const;

interface PerformanceErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: { componentStack: string };
  renderCount: number;
  averageRenderTime: number;
}

interface PerformanceErrorBoundaryProps {
  name: string;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class PerformanceErrorBoundary extends Component<
  PropsWithChildren<PerformanceErrorBoundaryProps>,
  PerformanceErrorBoundaryState
> {
  private renderTimes: number[] = [];
  private renderStartTime = 0;

  constructor(props: PropsWithChildren<PerformanceErrorBoundaryProps>) {
    super(props);
    this.state = {
      hasError: false,
      renderCount: 0,
      averageRenderTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PerformanceErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`🚨 Error in ${this.props.name}:`, error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo: { componentStack: errorInfo.componentStack ?? '' }
    });
  }

  override componentDidMount() {
    this.trackRenderTime();
  }

  override componentDidUpdate() {
    this.trackRenderTime();
  }

  private trackRenderTime() {
    const renderTime = performance.now() - this.renderStartTime;
    this.renderTimes.push(renderTime);
    
    // Keep only last 10 render times
    if (this.renderTimes.length > 10) {
      this.renderTimes.shift();
    }
    
    const averageRenderTime = this.renderTimes.reduce((sum, time) => sum + time, 0) / this.renderTimes.length;
    
    this.setState(prevState => ({
      renderCount: prevState.renderCount + 1,
      averageRenderTime
    }));

    if (averageRenderTime > PERFORMANCE_THRESHOLDS.RENDER_WARNING) {
      console.warn(`⚠️ ${this.props.name} average render time: ${averageRenderTime.toFixed(2)}ms`);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  override render() {
    this.renderStartTime = performance.now();

    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <div className="p-4 border border-red-300 rounded-lg error-boundary bg-red-50">
          <h2 className="mb-2 text-lg font-semibold text-red-800">
            Something went wrong in {this.props.name}
          </h2>
          <details className="mb-4">
            <summary className="text-red-700 cursor-pointer hover:text-red-900">
              Error Details
            </summary>
            <pre className="p-2 mt-2 overflow-auto text-sm bg-red-100 rounded">
              {this.state.error?.message}
            </pre>
            {this.state.errorInfo && (
              <pre className="p-2 mt-2 overflow-auto text-sm bg-red-100 rounded">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <div className="mb-4 text-sm text-red-600">
            <p>Render count: {this.state.renderCount}</p>
            <p>Average render time: {this.state.averageRenderTime.toFixed(2)}ms</p>
          </div>
          <button 
            onClick={this.handleRetry}
            className="px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-700"
           aria-label="Interactive button">
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with performance monitoring
 */
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const ComponentWithPerformance = (props: P) => {
    const name = componentName ?? WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component';

    return (
      <PerformanceErrorBoundary name={name}>
        <WrappedComponent {...props} />
      </PerformanceErrorBoundary>
    );
  };

  ComponentWithPerformance.displayName = `withPerformanceMonitoring(${componentName ?? WrappedComponent.displayName ?? WrappedComponent.name})`;
  
  return ComponentWithPerformance;
};

export default PerformanceErrorBoundary;
