import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';

export interface ChartErrorStateProps {
  /** The error message to display */
  error: string;
  /** Optional retry function */
  onRetry?: () => void;
  /** Optional error details for debugging */
  details?: string;
  /** Show debug information in development */
  showDebug?: boolean;
}

/**
 * Error state component for chart calculation failures
 * Provides user-friendly error messages with retry options
 */
export const ChartErrorState: React.FC<ChartErrorStateProps> = memo(({
  error,
  onRetry,
  details,
  showDebug = process.env.NODE_ENV === 'development'
}) => {
  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  // Parse common error types for better UX
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    }
    if (errorMessage.includes('coordinate') || errorMessage.includes('location')) {
      return 'location';
    }
    if (errorMessage.includes('ephemeris') || errorMessage.includes('celestial')) {
      return 'ephemeris';
    }
    return 'unknown';
  };

  const errorType = getErrorType(error);

  const getErrorIcon = () => {
    switch (errorType) {
      case 'network': return '🌐';
      case 'location': return '📍';
      case 'ephemeris': return '🌟';
      default: return '⚠️';
    }
  };

  const getSuggestion = () => {
    switch (errorType) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'location':
        return 'Please verify the location coordinates and time zone.';
      case 'ephemeris':
        return 'There may be an issue with celestial calculations. Please try again.';
      default:
        return 'Please try again or contact support if the issue persists.';
    }
  };

  return (
    <Card className='w-full max-w-4xl mx-auto cosmic-glass border border-red-500/30'>
      <CardHeader className='bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-xl'>
        <CardTitle className='text-xl font-bold flex items-center gap-2'>
          {getErrorIcon()} Chart Calculation Error
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <div className='space-y-6'>
          {/* Error Message */}
          <div className='text-center space-y-3'>
            <div className='text-lg font-medium text-red-600 dark:text-red-400'>
              Failed to Generate Chart
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto'>
              {error}
            </div>
            <div className='text-xs text-gray-500 dark:text-gray-500 max-w-lg mx-auto'>
              {getSuggestion()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-center gap-3'>
            {onRetry && (
              <button
                onClick={handleRetry}
                className='px-4 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white rounded-lg transition-colors duration-200 flex items-center gap-2'
                aria-label='Retry chart calculation'
              >
                🔄 Try Again
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200'
              aria-label='Refresh page'
            >
              🔄 Refresh Page
            </button>
          </div>

          {/* Debug Information */}
          {showDebug && details && (
            <details className='mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600'>
              <summary className='cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Debug Information
              </summary>
              <pre className='text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-auto max-h-40'>
                {details}
              </pre>
            </details>
          )}

          {/* Help Text */}
          <div className='text-center'>
            <div className='text-xs text-gray-500 dark:text-gray-500'>
              Need help? Check our{' '}
              <a href='/help' className='text-cosmic-purple hover:underline'>
                troubleshooting guide
              </a>{' '}
              or{' '}
              <a href='/contact' className='text-cosmic-purple hover:underline'>
                contact support
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ChartErrorState.displayName = 'ChartErrorState';
