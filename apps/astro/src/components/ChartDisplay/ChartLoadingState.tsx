import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';

export interface ChartLoadingStateProps {
  /** Optional custom loading message */
  message?: string;
  /** Show progress indicator */
  showProgress?: boolean;
}

/**
 * Loading state component for chart calculations
 * Displays animated spinner with cosmic theme
 */
export const ChartLoadingState: React.FC<ChartLoadingStateProps> = memo(({
  message = "Calculating celestial positions...",
  showProgress = true
}) => {
  return (
    <Card className='w-full max-w-4xl mx-auto cosmic-glass border border-cosmic-purple/30'>
      <CardHeader className='bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-cosmic-gold rounded-t-xl'>
        <CardTitle className='text-xl font-bold flex items-center gap-2'>
          ✨ Loading Chart Data
        </CardTitle>
      </CardHeader>
      <CardContent className='p-6'>
        <div
          className='flex flex-col items-center justify-center py-12 space-y-6'
          role='status'
          aria-label='Loading chart data'
          aria-busy='true'
        >
          {/* Animated loading spinner */}
          <div className='relative'>
            <div className='w-16 h-16 border-4 border-cosmic-purple/30 border-t-cosmic-purple rounded-full animate-spin'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-8 h-8 bg-cosmic-purple/20 rounded-full animate-pulse'></div>
            </div>
          </div>

          {/* Loading message */}
          <div className='text-center space-y-2'>
            <div className='text-lg font-medium text-cosmic-silver'>
              {message}
            </div>
            <div className='text-sm text-cosmic-silver/70 max-w-md'>
              Connecting to ephemeris server and processing celestial bodies
            </div>
          </div>

          {/* Progress dots */}
          {showProgress && (
            <div className='flex space-x-2'>
              <div className='w-2 h-2 bg-cosmic-purple rounded-full animate-bounce [animation-delay:0ms]'></div>
              <div className='w-2 h-2 bg-cosmic-purple rounded-full animate-bounce [animation-delay:150ms]'></div>
              <div className='w-2 h-2 bg-cosmic-purple rounded-full animate-bounce [animation-delay:300ms]'></div>
            </div>
          )}

          {/* Timeout warning */}
          <div className='text-xs text-cosmic-silver/50 text-center max-w-sm'>
            This may take a moment for complex charts with many celestial bodies
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ChartLoadingState.displayName = 'ChartLoadingState';
