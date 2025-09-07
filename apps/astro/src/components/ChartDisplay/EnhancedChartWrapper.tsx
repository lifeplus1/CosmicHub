/**
 * Enhanced Chart Display Wrapper
 * Adds UX enhancements to the existing ChartDisplay component
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button, Card, CardContent } from '@cosmichub/ui';
import { ChartDisplay } from './ChartDisplay';
import type { ChartData } from '../../services/api.types';
import type { ChartBirthData, ExtendedBirthData } from '@cosmichub/types';
import { useCanonicalBirthData } from '../../hooks/useCanonicalBirthData';
import type { ApiResult } from '@cosmichub/config';
import type { ChartLike } from './normalizeChart';

// Type for ChartLike objects that may contain raw backend response
interface ChartLikeWithResponse extends ChartLike {
  __raw_backend_response?: ChartData;
}

export interface EnhancedChartWrapperProps {
  birthData?: ChartBirthData | ExtendedBirthData;
  savedChartId?: string;
  onChartCalculated?: (data: ChartData) => void;
  className?: string;
  autoSave?: boolean; // reserved for future enhanced UX features
  showMobileSettings?: boolean; // reserved for future settings panel
  /** Optional injection for testing (defaults to fetchChartData) */
  fetchFn?: (data: ChartBirthData) => Promise<ApiResult<ChartData>>;
}

const EnhancedChartWrapper: React.FC<EnhancedChartWrapperProps> = ({
  birthData,
  savedChartId,
  onChartCalculated,
  className,
  autoSave: _autoSave = true,
  showMobileSettings: _showMobileSettings = true,
  fetchFn,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [chartData, setChartData] = useState<ChartLikeWithResponse | null>(
    null
  );
  const [fetchImpl, setFetchImpl] = useState<
    ((data: ChartBirthData) => Promise<ApiResult<ChartData>>) | null
  >(null);
  const canonicalBirthData = useCanonicalBirthData();

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err);
    } else {
      setError(
        new Error('An unexpected error occurred while calculating the chart')
      );
    }
  }, []);

  const handleChartCalculated = useCallback((data: ChartData) => {
    // Store the data in a format compatible with ChartLike
    setChartData({ __raw_backend_response: data } as ChartLikeWithResponse);
    // Move onChartCalculated call to a separate useEffect to prevent dependency cycles
  }, []);

  // Separate effect for notifying parent of chart calculation completion
  useEffect(() => {
    if (chartData && onChartCalculated) {
      // Extract the original data from the wrapped format
      const rawData = chartData.__raw_backend_response;
      if (rawData) {
        onChartCalculated(rawData);
      }
    }
  }, [chartData, onChartCalculated]);

  // Lazy-load fetch implementation if not injected
  useEffect(() => {
    if (!fetchFn && !fetchImpl) {
      import('../../services/api')
        .then(mod => {
          // Only set if still needed
          if (!fetchFn) {
            setFetchImpl(mod.fetchChartData);
          }
        })
        .catch(err => {
          handleError(err);
        });
    }
  }, [fetchFn, fetchImpl, handleError]);

  useEffect(() => {
    if (!birthData && !savedChartId) return;
    if (savedChartId) return; // ChartDisplay will handle saved charts

    const calculateChart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!canonicalBirthData) return;
        const impl = fetchFn ?? fetchImpl;
        if (!impl) return; // still loading dynamic import
        const result = await impl(canonicalBirthData);
        if (!result.success)
          throw new Error(result.error || 'Failed to calculate chart');
        setChartData({
          __raw_backend_response: result.data,
        } as unknown as ChartLike);
        handleChartCalculated(result.data);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    void calculateChart();
  }, [
    birthData,
    savedChartId,
    handleError,
    canonicalBirthData,
    fetchFn,
    fetchImpl,
  ]);

  const handleRetry = useCallback(() => {
    setError(null);
    if (!birthData || !canonicalBirthData) return;
    const calculateChart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const impl = fetchFn ?? fetchImpl;
        if (!impl) return;
        const result = await impl(canonicalBirthData);
        if (!result.success)
          throw new Error(result.error || 'Failed to calculate chart');
        setChartData({
          __raw_backend_response: result.data,
        } as unknown as ChartLike);
        handleChartCalculated(result.data);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };
    void calculateChart();
  }, [birthData, handleError, canonicalBirthData, fetchFn, fetchImpl]);

  if (isLoading) {
    return (
      <div className={className}>
        <Card className='w-full max-w-4xl mx-auto'>
          <CardContent className='p-6'>
            <div className='flex flex-col items-center justify-center py-12 space-y-6'>
              <div className='relative'>
                <div className='w-16 h-16 border-4 border-cosmic-purple/30 border-t-cosmic-purple rounded-full animate-spin'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-8 h-8 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-full opacity-60 animate-pulse'></div>
                </div>
              </div>
              <div className='text-center space-y-2'>
                <div className='text-lg font-medium'>
                  Calculating celestial positions...
                </div>
                <div className='text-sm text-gray-600 max-w-md'>
                  Processing birth data and generating astrological chart
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card className='w-full max-w-4xl mx-auto border-red-200'>
          <CardContent className='p-6'>
            <div className='flex flex-col items-center justify-center py-12 space-y-4'>
              <div className='text-red-600 text-lg font-medium'>
                Chart Calculation Error
              </div>
              <div className='text-red-600 text-sm text-center max-w-md'>
                {error.message}
              </div>
              <Button onClick={handleRetry} variant='default' className='mt-4'>
                🔄 Retry Calculation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className='min-h-[600px]'>
        <ChartDisplay
          chart={chartData}
          chartId={savedChartId}
          onSaveChart={(data: ChartLike) => {
            console.log('Chart saved:', data);
          }}
        />
      </div>
    </div>
  );
};


// Memoize component to prevent unnecessary re-renders
const MemoizedEnhancedChartWrapper = React.memo(EnhancedChartWrapper);
MemoizedEnhancedChartWrapper.displayName = 'EnhancedChartWrapper';

export { MemoizedEnhancedChartWrapper as EnhancedChartWrapper };
export default MemoizedEnhancedChartWrapper;