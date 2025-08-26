/**
 * Enhanced Chart Display Wrapper
 * Adds UX enhancements to the existing ChartDisplay component
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button, Card, CardContent, LoadingSpinner } from '@cosmichub/ui';
import { ChartDisplay } from './ChartDisplay';
import type { ChartData } from '../../services/api.types';
import type { ChartBirthData } from '@cosmichub/types';
import { fetchChartData } from '../../services/api';
import type { ChartLike } from './normalizeChart';

export interface EnhancedChartWrapperProps {
  birthData?: ChartBirthData;
  savedChartId?: string;
  onChartCalculated?: (data: ChartData) => void;
  className?: string;
  autoSave?: boolean;
  showMobileSettings?: boolean;
}

export const EnhancedChartWrapper: React.FC<EnhancedChartWrapperProps> = ({
  birthData,
  savedChartId,
  onChartCalculated,
  className,
  autoSave = true,
  showMobileSettings = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [chartData, setChartData] = useState<ChartLike | null>(null);

  // Enhanced error handling
  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err);
    } else {
      setError(new Error('An unexpected error occurred while calculating the chart'));
    }
  }, []);

  // Enhanced success feedback
  const handleChartCalculated = useCallback((data: ChartData) => {
    setChartData(data);
    setError(null);
    
    if (onChartCalculated) {
      onChartCalculated(data);
    }
  }, [onChartCalculated]);

  // Calculate chart from birth data
  useEffect(() => {
    if (!birthData && !savedChartId) return;
    if (savedChartId) return; // ChartDisplay will handle saved charts

    const calculateChart = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await fetchChartData(birthData!);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to calculate chart');
        }

        setChartData(result.data);
        handleChartCalculated(result.data);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    calculateChart();
  }, [birthData, savedChartId, handleError, handleChartCalculated]);

  // Error retry handler
  const handleRetry = useCallback(() => {
    setError(null);
    
    if (birthData) {
      const calculateChart = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const result = await fetchChartData(birthData);
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to calculate chart');
          }

          setChartData(result.data);
          handleChartCalculated(result.data);
        } catch (err) {
          handleError(err);
        } finally {
          setIsLoading(false);
        }
      };

      calculateChart();
    }
  }, [birthData, handleError, handleChartCalculated]);

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <LoadingSpinner size="lg" color="cosmic" />
              <div className="text-center space-y-2">
                <div className="text-lg font-medium">
                  Calculating celestial positions...
                </div>
                <div className="text-sm text-gray-600 max-w-md">
                  Processing birth data and generating astrological chart
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <Card className="w-full max-w-4xl mx-auto border-red-200">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-red-600 text-lg font-medium">
                Chart Calculation Error
              </div>
              <div className="text-red-600 text-sm text-center max-w-md">
                {error.message}
              </div>
              <Button
                onClick={handleRetry}
                variant="default"
                className="mt-4"
              >
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
      <div className="min-h-[600px]">
        <ChartDisplay
          chart={chartData}
          chartId={savedChartId}
          onSaveChart={async (data: ChartLike) => {
            // Optional: Add save confirmation or feedback
            console.log('Chart saved:', data);
          }}
        />
      </div>
    </div>
  );
};

// Export enhanced version as default for easy migration
export default EnhancedChartWrapper;
