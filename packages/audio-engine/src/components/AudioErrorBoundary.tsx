/**
 * Audio Engine Error Boundary
 * Following Component Best Practices Checklist:
 * ✅ Error Boundaries - Component and Page Level
 * ✅ Error Recovery - Reset/retry mechanisms  
 * ✅ Error Reporting - Structured logging with context
 * ✅ Fallback UI - User-friendly error displays
 * ✅ Accessibility - WCAG 2.1 AA compliant error messages
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AudioEngineErrorSchema } from '../validation/schemas';

interface AudioErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number;
}

interface AudioErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Maximum retry attempts before showing permanent error */
  maxRetries?: number;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  /** Component context for error reporting */
  componentContext?: string;
  /** Reset error state after this duration (ms) */
  resetAfter?: number;
}

/**
 * Enhanced Error Boundary for Audio Engine Components
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Structured error logging
 * - Accessibility-compliant error UI
 * - Context-aware error reporting
 * - Recovery mechanisms
 */
export class AudioErrorBoundary extends Component<AudioErrorBoundaryProps, AudioErrorBoundaryState> {
  private resetTimer: number | null = null;
  private readonly maxRetries: number;
  private readonly resetAfter: number;

  constructor(props: AudioErrorBoundaryProps) {
    super(props);
    
    this.maxRetries = props.maxRetries ?? 3;
    this.resetAfter = props.resetAfter ?? 30000; // 30 seconds
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AudioErrorBoundaryState> {
    const errorId = `audio-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, componentContext } = this.props;
    const { errorId } = this.state;

    // Validate and structure error data
    const structuredError = this.createStructuredError(error, errorInfo, componentContext);
    
    // Log structured error
    this.logError(structuredError, errorInfo);
    
    // Call custom error handler
    if (onError && errorId) {
      onError(error, errorInfo, errorId);
    }

    // Update state with error info
    this.setState({ errorInfo });
    
    // Set up automatic reset if within retry limit
    this.scheduleReset();
  }

  componentWillUnmount() {
    if (this.resetTimer) {
      window.clearTimeout(this.resetTimer);
    }
  }

  private createStructuredError(error: Error, errorInfo: ErrorInfo, context?: string) {
    try {
      return AudioEngineErrorSchema.parse({
        code: this.getErrorCode(error),
        message: error.message,
        details: {
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          context: context ?? 'AudioEngine',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href
        },
        timestamp: Date.now(),
        recoverable: this.isRecoverableError(error)
      });
    } catch (validationError) {
      // Fallback if validation fails
      return {
        code: 'VALIDATION_ERROR',
        message: 'Failed to structure error data',
        details: { originalError: error.message, validationError },
        timestamp: Date.now(),
        recoverable: false
      };
    }
  }

  private getErrorCode(error: Error): string {
    // Map common audio errors to specific codes
    if (error.name === 'NotAllowedError') return 'AUDIO_PERMISSION_DENIED';
    if (error.name === 'NotSupportedError') return 'AUDIO_NOT_SUPPORTED';
    if (error.name === 'AbortError') return 'AUDIO_OPERATION_ABORTED';
    if (error.message.includes('AudioContext')) return 'AUDIO_CONTEXT_ERROR';
    if (error.message.includes('oscillator')) return 'OSCILLATOR_ERROR';
    if (error.message.includes('gain')) return 'GAIN_NODE_ERROR';
    
    return 'UNKNOWN_AUDIO_ERROR';
  }

  private isRecoverableError(error: Error): boolean {
    // Determine if error is recoverable based on type
    const recoverableErrors = [
      'AUDIO_CONTEXT_ERROR',
      'OSCILLATOR_ERROR', 
      'GAIN_NODE_ERROR',
      'AUDIO_OPERATION_ABORTED'
    ];
    
    return recoverableErrors.includes(this.getErrorCode(error));
  }

  private logError(structuredError: { code: string; message: string; details?: unknown }, errorInfo: ErrorInfo) {
    // In production, this would integrate with monitoring service
    if (process.env.NODE_ENV === 'development') {
      console.group('🎵 Audio Engine Error');
      console.error('Error Code:', structuredError.code);
      console.error('Message:', structuredError.message);
      console.error('Details:', structuredError.details);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  private scheduleReset() {
    const { retryCount } = this.state;
    
    if (retryCount < this.maxRetries) {
      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = Math.min(Math.pow(2, retryCount) * 1000, this.resetAfter);
      
      this.resetTimer = window.setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          errorId: null,
          retryCount: prevState.retryCount + 1
        }));
      }, delay);
    }
  }

  private handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0
    });
  };

  private renderErrorFallback() {
    const { error, errorId, retryCount } = this.state;
    const canRetry = retryCount < this.maxRetries;
    
    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div 
        role="alert"
        aria-live="assertive"
        className="cosmic-error-boundary p-6 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-600"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg 
              className="h-5 w-5 text-red-400" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Audio Engine Error
            </h3>
            
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>
                The audio system encountered an error and couldn&apos;t continue. 
                {canRetry && " We'll automatically retry in a moment."}
              </p>
              
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">
                    Technical Details (Development)
                  </summary>
                  <pre className="mt-1 text-xs whitespace-pre-wrap">
                    {error.message}
                  </pre>
                  {errorId && (
                    <p className="mt-1 text-xs">Error ID: {errorId}</p>
                  )}
                </details>
              )}
            </div>
            
            {canRetry && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={this.handleManualRetry}
                  className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                  aria-describedby="error-retry-description"
                >
                  Try Again
                </button>
                <p id="error-retry-description" className="sr-only">
                  Retry the audio operation that failed
                </p>
                
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  Attempt {retryCount + 1} of {this.maxRetries + 1}
                </p>
              </div>
            )}
            
            {!canRetry && (
              <div className="mt-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  Please refresh the page to try again, or contact support if the problem persists.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping audio components with error boundaries
 */
export function withAudioErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<AudioErrorBoundaryProps, 'children'>
) {
  const displayName = WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component';
  
  const WithAudioErrorBoundary = (props: P) => (
    <AudioErrorBoundary
      {...errorBoundaryProps}
      componentContext={`${displayName}Wrapper`}
    >
      <WrappedComponent {...props} />
    </AudioErrorBoundary>
  );
  
  WithAudioErrorBoundary.displayName = `withAudioErrorBoundary(${displayName})`;
  
  return WithAudioErrorBoundary;
}

/**
 * React Hook for error boundary context
 * Provides error reporting capabilities to child components
 */
export const useAudioErrorReporter = () => {
  const reportError = React.useCallback((error: Error, context?: string) => {
    // This would integrate with your error reporting service
    const structuredError = {
      code: 'MANUAL_ERROR_REPORT',
      message: error.message,
      details: {
        stack: error.stack,
        context: context ?? 'ManualReport',
        timestamp: new Date().toISOString()
      },
      timestamp: Date.now(),
      recoverable: false
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Manual Error Report:', structuredError);
    }
    
    // In production, send to monitoring service
    // Example: errorReportingService.report(structuredError);
  }, []);
  
  return { reportError };
};
