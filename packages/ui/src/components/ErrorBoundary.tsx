import React, { Component, ReactNode, ErrorInfo as ReactErrorInfo } from 'react';
import { Button } from './Button';

// (Removed unused UnknownRecord import)

// Local type aliases (were implicitly used below)
type BoundaryLevel = 'page' | 'section' | 'component';
type LogLevel = 'low' | 'medium' | 'high' | 'critical';
const ENV_MODE: string = (globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } })
  .process?.env?.NODE_ENV ?? 'development';

export interface ErrorMetrics {
  errorId: string;
  boundaryName?: string;
  boundaryLevel: 'page' | 'section' | 'component';
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryCount: number;
}

export interface ErrorInfo extends ErrorMetrics {
  message: string;
  stack?: string;
  componentStack: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
}

export interface ErrorReportingService {
  captureException(error: ErrorInfo): void;
}

export interface AnalyticsService {
  track(eventName: string, data: ErrorMetrics): void;
}

declare global {
  interface Window {
    errorReportingService?: ErrorReportingService;
    analytics?: AnalyticsService;
    __USER_ID__?: string;
    __SESSION_ID__?: string;
  }
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ReactErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

/**
 * Universal Error Boundary with comprehensive error handling
 * Supports different levels of error isolation and recovery strategies
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  private retryTimeouts: number[] = [];
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Enhanced error logging with context
    const enhancedErrorInfo = this.createErrorInfo(error, errorInfo);
    this.logError(error, enhancedErrorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, enhancedErrorInfo);

    // Auto-retry for certain error types
    this.attemptAutoRecovery(error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError) {
      if (resetKeys && prevProps.resetKeys) {
        const hasResetKeyChanged = resetKeys.some((key, index) => prevProps.resetKeys?.[index] !== key);
        if (hasResetKeyChanged) this.resetErrorBoundary();
      }
      if (resetOnPropsChange === true && prevProps !== this.props) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount(): void {
    // Clean up retry timeouts
    this.retryTimeouts.forEach(clearTimeout);
  }

  private createErrorInfo(error: Error, reactErrorInfo: ReactErrorInfo | null): ErrorInfo {
    const { name, level = 'component' } = this.props;
    const severity = this.getLogLevel(error, level);

    const errorId = this.state.errorId ?? `error-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    return {
      message: error.message,
      stack: error.stack,
  componentStack: reactErrorInfo?.componentStack ?? '',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: window.__USER_ID__,
      sessionId: window.__SESSION_ID__,
      errorId,
      boundaryName: name,
      boundaryLevel: level as BoundaryLevel,
      severity,
      retryCount: this.state.retryCount
    };
  }

  private logError(error: Error, errorInfo: ErrorInfo): void {
    const { name, level = 'component' } = this.props;
  const logLevel = this.getLogLevel(error, level);

    // Structure error data
    const errorData: ErrorInfo = {
      ...errorInfo,
      errorId: this.state.errorId ?? errorInfo.errorId,
      boundaryName: name,
      boundaryLevel: level,
      retryCount: this.state.retryCount,
      severity: logLevel,
    };

    // Console logging for development
  // Resolve environment safely without assuming global process exists (e.g., some browsers)
  if (ENV_MODE === 'development') {
      const emoji = this.getErrorEmoji(logLevel);
      // eslint-disable-next-line no-console
      console.group(`${emoji} Error Boundary (${level}): ${name ?? 'Unknown'}`);
      // eslint-disable-next-line no-console
      console.error('Error:', error);
      // eslint-disable-next-line no-console
      console.error('Component Stack:', errorInfo.componentStack);
      // eslint-disable-next-line no-console
      console.error('Full Context:', errorData);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    // Production error reporting
  if (ENV_MODE === 'production') this.reportError(errorData);

    // Analytics tracking
    this.trackErrorMetrics(errorData);
  }

  private getLogLevel(error: Error, boundaryLevel: BoundaryLevel): LogLevel {
    // Network errors are usually less critical
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'medium';
    }

    // Page-level errors are critical
    if (boundaryLevel === 'page') {
      return 'critical';
    }

    // Component render errors
  if (typeof error.stack === 'string' && error.stack.includes('render')) {
      return 'high';
    }

    return 'medium';
  }

  private getErrorEmoji(level: string): string {
    switch (level) {
      case 'critical': return '🔥';
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return '⚡';
      default: return '🐛';
    }
  }

  private reportError(errorInfo: ErrorInfo): void {
    try {
  window.errorReportingService?.captureException(errorInfo);
    } catch (reportingError) {
  // eslint-disable-next-line no-console
  console.error('Failed to report error:', reportingError);
    }
  }

  private trackErrorMetrics(errorData: ErrorMetrics): void {
    try {
  window.analytics?.track('Error Boundary Triggered', errorData);
    } catch (analyticsError) {
  // eslint-disable-next-line no-console
  console.error('Failed to track error metrics:', analyticsError);
    }
  }

  private attemptAutoRecovery(error: Error): void {
    // Auto-retry for certain recoverable errors
    if (this.isRecoverableError(error) && this.state.retryCount < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, this.state.retryCount); // Exponential backoff
      
      const timeoutId = window.setTimeout(() => {
        this.setState(prevState => ({
          retryCount: prevState.retryCount + 1,
        }));
        this.resetErrorBoundary();
      }, delay);

      this.retryTimeouts.push(timeoutId);
    }
  }

  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      /network/i,
      /fetch/i,
      /timeout/i,
      /loading chunk failed/i,
    ];

  const stack = error.stack ?? '';
  return recoverablePatterns.some(pattern => pattern.test(error.message) || pattern.test(stack));
  }

  private resetErrorBoundary = (): void => {
    // Clear retry timeouts
    this.retryTimeouts.forEach(clearTimeout);
    this.retryTimeouts = [];

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleRetry = (): void => {
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
    }));
    this.resetErrorBoundary();
  };

  private renderErrorUI(): ReactNode {
    const { fallback, level = 'component' } = this.props;
    const { error, retryCount } = this.state;

    if (fallback !== undefined) {
      if (typeof fallback === 'function') {
        if (!error) return null;
        const info = this.createErrorInfo(error, this.state.errorInfo);
        return (fallback as (e: Error, info: ErrorInfo, retry: () => void) => ReactNode)(
          error,
          info,
          this.handleRetry
        );
      }
      return fallback as ReactNode;
    }

    return this.renderDefaultErrorUI(level, retryCount >= this.maxRetries);
  }

  private renderDefaultErrorUI(level: string, maxRetriesReached: boolean): ReactNode {
    const { error } = this.state;
    const isPageLevel = level === 'page';

    const containerClass = isPageLevel 
      ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-cosmic-dark to-cosmic-purple/20"
      : "p-6 bg-cosmic-dark/50 rounded-lg border border-cosmic-silver/20";

    const cardClass = isPageLevel
      ? "max-w-md w-full bg-cosmic-dark shadow-2xl rounded-lg p-8 border border-cosmic-silver/30"
      : "w-full";

    return (
      <div className={containerClass}>
        <div className={cardClass}>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h2 className="text-lg font-semibold text-cosmic-gold mb-2">
              {isPageLevel ? 'Page Error' : 'Component Error'}
            </h2>
            
            <p className="text-sm text-cosmic-silver mb-6">
              {isPageLevel 
                ? 'Something went wrong while loading this page.' 
                : 'This component encountered an error.'
              }
              {maxRetriesReached && ' Auto-retry limit reached.'}
            </p>
            
            {/* Development error details */}
            {ENV_MODE === 'development' && !!error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-cosmic-silver/80 hover:text-cosmic-silver">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-cosmic-dark/80 rounded border border-cosmic-silver/20 text-xs font-mono text-red-400 overflow-auto max-h-40">
                  <div className="font-semibold text-red-300">Error: {error.message}</div>
                  {typeof error.stack === 'string' && (
                    <pre className="mt-2 whitespace-pre-wrap text-red-400/80">
                      {error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo && (
                    <pre className="mt-2 whitespace-pre-wrap text-blue-400/80">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!maxRetriesReached && (
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  size="sm"
                >
                  Try Again
                </Button>
              )}
              
              {isPageLevel && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  size="sm"
                >
                  Reload Page
                </Button>
              )}
              
              {!isPageLevel && (
                <Button
                  onClick={() => window.history.back()}
                  variant="secondary"
                  size="sm"
                >
                  Go Back
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
