/**
 * Enhanced Chart Display Component
 * (Reconstructed) – Demonstrates loading stages, error handling and responsiveness.
 */
import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ProgressiveLoading } from '../feedback/LoadingStates';
import { ErrorMessage, type EnhancedError } from '../feedback/ErrorHandling';
import {
  ResponsiveContainer,
  ResponsiveGrid,
  TouchButton,
  MobileCard,
} from '../layout/MobileResponsive';
import { StatusIndicator, useToastHelpers } from '../feedback/UserFeedback';
// (Merged above) - EnhancedError type already available via type-only import if needed

interface ChartData {
  id: string;
  title: string;
  description: string;
  data: Array<{ label: string; value: number }>;
  lastUpdated: Date;
}

export interface EnhancedChartDisplayProps {
  chartId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
  className?: string;
  onError?: (error: Error) => void;
}

type LoadingStage = 'initializing' | 'processing' | 'finalizing' | 'complete';

export const EnhancedChartDisplay: React.FC<
  EnhancedChartDisplayProps
> = props => {
  const {
    chartId,
    autoRefresh = false,
    refreshInterval = 30_000,
    className,
    onError,
  } = props;
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] =
    useState<LoadingStage>('initializing');
  const [error, setError] = useState<EnhancedError | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const {
    success,
    error: showError,
    info,
    loading: showLoading,
  } = useToastHelpers();

  // Simulate API call with different stages
  const fetchChartData = async (showToast = false): Promise<ChartData> => {
    if (showToast) {
      showLoading('Loading Chart', 'Fetching latest data...');
    }

    // Stage 1: Initializing
    setLoadingStage('initializing');
    await new Promise(resolve => setTimeout(resolve, 800));

    // Stage 2: Processing
    setLoadingStage('processing');
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Stage 3: Finalizing
    setLoadingStage('finalizing');
    await new Promise(resolve => setTimeout(resolve, 600));

    // Simulate occasional failures for demo
    if (Math.random() < 0.2) {
      throw new Error(
        'Network connection failed. Please check your internet connection.'
      );
    }

    // Stage 4: Complete
    setLoadingStage('complete');

    // Mock data
    const mockData: ChartData = {
      id: chartId ?? 'demo-chart',
      title: 'Astrological Transits',
      description: 'Current planetary positions and their influences',
      data: [
        { label: 'Sun in Sagittarius', value: 85 },
        { label: 'Moon in Pisces', value: 62 },
        { label: 'Mercury Retrograde', value: 38 },
        { label: 'Venus in Capricorn', value: 74 },
        { label: 'Mars in Scorpio', value: 91 },
      ],
      lastUpdated: new Date(),
    };

    return mockData;
  };

  // Load chart data
  const loadChart = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchChartData(showToast);
      setChartData(data);
      setLastRefresh(new Date());

      if (showToast) {
        success(
          'Chart Updated',
          'Latest astrological data loaded successfully'
        );
      }
    } catch (err) {
      const enhancedError: EnhancedError = {
        message:
          err instanceof Error ? err.message : 'Failed to load chart data',
        type: 'network',
        severity: 'error',
        timestamp: new Date(),
        retryable: true,
        recoveryActions: [
          {
            label: 'Try Again',
            action: () => loadChart(true),
            primary: true,
          },
          {
            label: 'Use Cached Data',
            action: () => {
              info(
                'Using Cached Data',
                'Displaying previously saved chart information'
              );
              // In real app, load from cache
            },
          },
        ],
      };

      setError(enhancedError);

      if (showToast) {
        showError('Failed to Load Chart', String(enhancedError.message));
      }

      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    void loadChart();
  }, [chartId]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void loadChart(false);
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Get time since last refresh
  const getTimeSinceRefresh = () => {
    if (!lastRefresh) return 'Never';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  // Get appropriate width class for progress bar based on percentage
  const getProgressWidthClass = (value: number): string => {
    const roundedValue = Math.round(value / 5) * 5;
    return `w-step-${Math.min(100, Math.max(0, roundedValue))}`;
  };

  // Loading state
  if (loading && !chartData) {
    return (
      <ResponsiveContainer className={className}>
        <MobileCard padding='lg'>
          <ProgressiveLoading
            stage={loadingStage}
            message={
              loadingStage === 'initializing'
                ? 'Connecting to ephemeris server...'
                : loadingStage === 'processing'
                  ? 'Calculating planetary positions...'
                  : loadingStage === 'finalizing'
                    ? 'Preparing chart display...'
                    : 'Chart ready!'
            }
            showProgress
          />
        </MobileCard>
      </ResponsiveContainer>
    );
  }

  // Error state
  if (error && !chartData) {
    return (
      <ResponsiveContainer className={className}>
        <MobileCard padding='lg'>
          <ErrorMessage
            error={error}
            onRetry={() => loadChart(true)}
            showDetails
            showTimestamp
          />
        </MobileCard>
      </ResponsiveContainer>
    );
  }

  // Main content
  return (
    <ResponsiveContainer className={className}>
      <div className='space-y-6'>
        {/* Header with status */}
        <MobileCard>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-xl font-semibold text-cosmic-gold'>
                {chartData?.title ?? 'Loading Chart...'}
              </h1>
              {chartData?.description && (
                <p className='text-cosmic-silver/80 text-sm mt-1'>
                  {chartData.description}
                </p>
              )}
            </div>

            <div className='flex items-center gap-3'>
              <StatusIndicator
                status={loading ? 'loading' : error ? 'error' : 'success'}
                message={`Updated ${getTimeSinceRefresh()}`}
                inline
                size='sm'
              />

              <TouchButton
                variant='secondary'
                size='sm'
                onClick={() => void loadChart(true)}
                loading={loading}
                haptic
              >
                🔄 Refresh
              </TouchButton>
            </div>
          </div>
        </MobileCard>

        {/* Chart content */}
        {chartData && (
          <ResponsiveGrid cols={{ xs: 1, sm: 1, md: 2, lg: 3 }} gap='md'>
            {chartData.data.map((item, index) => (
              <MobileCard
                key={item.label}
                interactive
                className={cn(
                  'transition-all duration-200',
                  loading && 'opacity-50'
                )}
              >
                <div className='space-y-3'>
                  {/* Label */}
                  <div className='flex items-center justify-between'>
                    <h3 className='font-medium text-cosmic-silver'>
                      {item.label}
                    </h3>
                    <span className='text-sm text-cosmic-gold font-semibold'>
                      {item.value}%
                    </span>
                  </div>

                  {/* Progress visualization */}
                  <div className='w-full bg-gray-700 rounded-full h-2'>
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        getProgressWidthClass(item.value),
                        item.value > 75
                          ? 'bg-green-500'
                          : item.value > 50
                            ? 'bg-yellow-500'
                            : item.value > 25
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                      )}
                      data-progress={item.value}
                    />
                  </div>

                  {/* Additional info */}
                  <div className='text-xs text-cosmic-silver/60'>
                    Position #{index + 1} • Influence Level
                  </div>
                </div>
              </MobileCard>
            ))}
          </ResponsiveGrid>
        )}

        {/* Footer with auto-refresh status */}
        {autoRefresh && (
          <MobileCard padding='sm'>
            <div className='flex items-center justify-between text-xs text-cosmic-silver/60'>
              <span>Auto-refresh enabled</span>
              <span>Every {Math.round(refreshInterval / 1000)}s</span>
            </div>
          </MobileCard>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default EnhancedChartDisplay;
