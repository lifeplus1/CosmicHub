import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, Button } from '@cosmichub/ui';
import { useAuth } from '@cosmichub/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBirthData } from '../contexts/BirthDataContext';
import ChartDisplay from '../components/ChartDisplay/ChartDisplay';
import type { ChartLike } from '../components/ChartDisplay/normalizeChart';
import { CosmicLoading } from '../components/CosmicLoading';
import {
  fetchChartDataUnified,
  saveChart,
  fetchSavedChartById,
} from '../services/api';
import type {
  ChartData,
  SaveChartRequest,
  SaveChartResponse,
} from '../services/api.types';
// NOTE: There is a naming collision for ChartBirthData between context usage (year/month/day form)
// and the types package (birth_date/birth_time form). We support both shapes here.
import { 
  extractNumericBirthData 
} from '../utils/birthDataNormalization';
import { 
  toTextBirthData,
  type ChartBirthData as LibraryChartBirthData 
} from '@cosmichub/types';

import { componentLogger } from '../utils/componentLogger';
import { useChartProcessing } from '@cosmichub/hooks';
import { devConsole } from '../config/environment';

interface SavedChartResponse {
  chart_data?: ChartData;
  // Accept any stored birth data shape (legacy or new)
  birth_data?: Record<string, unknown>;
  error?: string;
}

/**
 * Unified Chart Page that handles all chart scenarios:
 * 1. New chart calculations (from /chart?calculate=true)
 * 2. Saved chart display (from /chart/:chartId)
 * 3. Direct chart creation (from /chart with session storage data)
 * 4. URL-based chart loading (from search params)
 */
const UnifiedChart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { birthData, setBirthData } = useBirthData();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<
    'new_calculation' | 'saved_chart' | 'url_param' | null
  >(null);
  const isLoadingFromSavedRef = useRef(false);

  // Extract chartId from URL path params
  const chartId =
    location.pathname.split('/chart/')[1] ??
    searchParams.get('id') ??
    searchParams.get('chartId');
  const shouldCalculate = searchParams.get('calculate') === 'true';

  // Chart processing hook for consistent data handling
  const processedChart = useChartProcessing(chartData, {
    enableDebug: true,
  });

  componentLogger.info('UnifiedChart', 'Chart processing hook result', {
    source: processedChart.source,
    hasRawBackend: processedChart.hasRawBackend,
    planetsCount: processedChart.planets.length,
    asteroidsCount: processedChart.asteroids.length,
    pointsCount: processedChart.points.length,
    dataSource,
  });

  // Save chart mutation
  const saveChartMutation = useMutation<
    SaveChartResponse,
    unknown,
    SaveChartRequest
  >({
    mutationFn: async (payload: SaveChartRequest) => {
      const result = await saveChart(payload);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: data => {
      devConsole.log?.('✅ Chart saved successfully:', data);
      void queryClient.invalidateQueries({ queryKey: ['savedCharts'] });
    },
    onError: error => {
      devConsole.error?.('❌ Failed to save chart:', error);
    },
  });

  // Handle chart saving
  const handleSaveChart = useCallback(async () => {
    if (!chartData || !user?.uid) {
      componentLogger.warn('UnifiedChart', 'Cannot save chart - missing data', {
        hasChartData: !!chartData,
        hasUser: !!user?.uid,
      });
      return;
    }

    if (!birthData) {
      componentLogger.warn(
        'UnifiedChart',
        'No birth data available for saving'
      );
      return;
    }

    // Debug birth data structure
    componentLogger.info('UnifiedChart', 'Birth data debug', {
      birthData,
      birthDataKeys: Object.keys(birthData),
      birthDataType: typeof birthData,
    });

    try {
      // Normalize birth data into numeric parts
      const normalized = extractNumericBirthData(
        birthData as Record<string, unknown>
      );
      componentLogger.info('UnifiedChart', 'Attempting to save chart', {
        birthData: normalized,
      });

      const saveRequest: SaveChartRequest = {
        year: normalized?.year ?? new Date().getFullYear(),
        month: normalized?.month ?? 1,
        day: normalized?.day ?? 1,
        hour: normalized?.hour ?? 12,
        minute: normalized?.minute ?? 0,
        city: normalized?.city ?? 'Unknown',
        house_system: 'placidus',
        chart_name: `Chart ${new Date().toLocaleDateString()}`,
        timezone: normalized?.timezone ?? 'UTC',
        lat: normalized?.lat ?? 0,
        lon: normalized?.lon ?? 0,
      };

      componentLogger.info('UnifiedChart', 'Save request prepared', {
        saveRequest,
      });
      await saveChartMutation.mutateAsync(saveRequest);
      componentLogger.info('UnifiedChart', 'Chart saved successfully');
    } catch (err) {
      componentLogger.error(
        'UnifiedChart',
        'Failed to save chart',
        err as Error
      );
    }
  }, [chartData, user?.uid, birthData, saveChartMutation]);

  // Data loading logic - handles multiple sources with unified approach
  useEffect(() => {
    const loadChartData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        componentLogger.info(
          'UnifiedChart',
          'Starting unified data load process',
          {
            chartId,
            shouldCalculate,
            hasSessionStorage: !!sessionStorage.getItem('birthData'),
            hasLocationState: !!location.state,
            hasBirthData: !!birthData,
            pathname: location.pathname,
            searchParams: Object.fromEntries(searchParams.entries()),
          }
        );

        // Priority 1: Load saved chart by ID (from /chart/:chartId or ?id=chartId)
        if (chartId && !shouldCalculate) {
          setDataSource('saved_chart');
          componentLogger.info('UnifiedChart', 'Loading saved chart by ID', {
            chartId,
          });
          try {
            const result = await fetchSavedChartById(chartId);
            if (result.success) {
              setChartData(result.data.chart_data);
              // Derive numeric birth data if possible
              const restored = extractNumericBirthData(
                result.data.birth_data as unknown as Record<string, unknown>
              );
              if (restored && setBirthData) {
                // Convert numeric data to TextBirthData format
                const textBirthData = toTextBirthData({
                  year: restored.year,
                  month: restored.month,
                  day: restored.day,
                  hour: restored.hour,
                  minute: restored.minute,
                  city: restored.city,
                  latitude: restored.lat,
                  longitude: restored.lon,
                  timezone: restored.timezone,
                });
                setBirthData(textBirthData);
              }
              componentLogger.info(
                'UnifiedChart',
                'Saved chart loaded successfully'
              );
            } else {
              componentLogger.warn(
                'UnifiedChart',
                'Failed to load saved chart by ID',
                { chartId, error: result.error }
              );
              setError(result.error ?? 'Failed to load saved chart');
            }
          } catch (err) {
            componentLogger.error(
              'UnifiedChart',
              'Exception loading saved chart',
              err
            );
            setError(
              err instanceof Error ? err.message : 'Failed to load saved chart'
            );
          }
          return;
        }

        // Priority 2: Calculate new chart (from ?calculate=true or session storage)
        if (shouldCalculate || sessionStorage.getItem('birthData')) {
          setDataSource('new_calculation');

          // Try to get birth data from session storage first
          const storedBirthData = sessionStorage.getItem('birthData');
          // Will hold transformed data for API (library ChartBirthData expects birth_date & birth_time)
          let chartBirthData: LibraryChartBirthData | undefined;

          if (storedBirthData) {
            try {
              const parsed = JSON.parse(storedBirthData) as {
                date: string;
                time: string;
                location: string;
                lat?: number;
                lon?: number;
                timezone?: string;
              };
              // Convert stored format to ChartBirthData format
              const dateParts = parsed.date.split('-').map(Number);
              const timeParts = parsed.time.split(':').map(Number);
              const [year = new Date().getFullYear(), month = 1, day = 1] =
                dateParts;
              const [hour = 12, minute = 0] = timeParts;

              chartBirthData = {
                birth_date: `${year.toString().padStart(4, '0')}-${month
                  .toString()
                  .padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                birth_time: `${hour.toString().padStart(2, '0')}:${minute
                  .toString()
                  .padStart(2, '0')}`,
                latitude: parsed.lat ?? 0,
                longitude: parsed.lon ?? 0,
                city: parsed.location,
                timezone: parsed.timezone ?? 'UTC',
              };

              // Update birth data context once without triggering re-render
              if (setBirthData) {
                // Convert numeric data to TextBirthData format
                const textBirthData = toTextBirthData({
                  year,
                  month,
                  day,
                  hour,
                  minute,
                  city: parsed.location,
                  latitude: parsed.lat ?? 0,
                  longitude: parsed.lon ?? 0,
                  timezone: parsed.timezone ?? 'UTC',
                });
                setBirthData(textBirthData);
              }

              componentLogger.info(
                'UnifiedChart',
                'Using birth data from session storage',
                {
                  originalData: parsed,
                  convertedData: chartBirthData,
                }
              );
            } catch (parseError) {
              componentLogger.error(
                'UnifiedChart',
                'Failed to parse stored birth data',
                parseError
              );
            }
          }

          // Calculate chart if we have birth data
          if (chartBirthData?.birth_date && chartBirthData?.birth_time) {
            componentLogger.info('UnifiedChart', 'Calculating new chart', {
              chartBirthData,
            });

            const result = await fetchChartDataUnified(chartBirthData);

            if (result.success && result.data) {
              setChartData(result.data);
              componentLogger.info(
                'UnifiedChart',
                'Chart calculated successfully with unified endpoint'
              );

              // Clear session storage after successful calculation
              sessionStorage.removeItem('birthData');
            } else {
              const errorMessage = !result.success
                ? result.error
                : 'Failed to calculate chart';
              componentLogger.error(
                'UnifiedChart',
                'Unified chart calculation failed',
                errorMessage
              );
              throw new Error(errorMessage);
            }
          } else {
            throw new Error('No birth data available for chart calculation');
          }
        }

        // Priority 3: Check for stored chart data (legacy support)
        else if (!chartData) {
          let savedChartData = sessionStorage.getItem('selectedChart');
          let storageType = 'sessionStorage';

          if (!savedChartData) {
            savedChartData = localStorage.getItem('tempSelectedChart');
            storageType = 'localStorage';
          }

          if (savedChartData) {
            setDataSource('saved_chart');
            componentLogger.info(
              'UnifiedChart',
              `Loading chart from ${storageType}`
            );

            try {
              const parsedData = JSON.parse(
                savedChartData
              ) as SavedChartResponse;

              if (parsedData.chart_data) {
                setChartData(parsedData.chart_data);

                // Restore birth data if available (but don't trigger re-render)
                if (parsedData.birth_data && setBirthData) {
                  const raw = parsedData.birth_data;
                  let year: number | undefined =
                    typeof raw.year === 'number' ? raw.year : undefined;
                  let month: number | undefined =
                    typeof raw.month === 'number' ? raw.month : undefined;
                  let day: number | undefined =
                    typeof raw.day === 'number' ? raw.day : undefined;
                  let hour: number | undefined =
                    typeof raw.hour === 'number' ? raw.hour : undefined;
                  let minute: number | undefined =
                    typeof raw.minute === 'number' ? raw.minute : undefined;

                  // If missing numeric fields but birth_date/time present, parse them
                  if (
                    (year === undefined ||
                      month === undefined ||
                      day === undefined) &&
                    typeof raw.birth_date === 'string'
                  ) {
                    const [y, m, d] = raw.birth_date
                      .split('-')
                      .map((n: string) => Number(n));
                    year = year ?? y;
                    month = month ?? m;
                    day = day ?? d;
                  }
                  if (
                    (hour === undefined || minute === undefined) &&
                    typeof raw.birth_time === 'string'
                  ) {
                    const [h, min] = raw.birth_time
                      .split(':')
                      .map((n: string) => Number(n));
                    hour = hour ?? h;
                    minute = minute ?? min;
                  }

                  // Convert numeric data to TextBirthData format
                  const textBirthData = toTextBirthData({
                    year: year ?? new Date().getFullYear(),
                    month: month ?? 1,
                    day: day ?? 1,
                    hour: hour ?? 12,
                    minute: minute ?? 0,
                    city:
                      typeof raw.city === 'string'
                        ? raw.city
                        : typeof raw.location === 'string'
                          ? raw.location
                          : '',
                    latitude:
                      typeof raw.latitude === 'number'
                        ? raw.latitude
                        : typeof raw.lat === 'number'
                          ? raw.lat
                          : 0,
                    longitude:
                      typeof raw.longitude === 'number'
                        ? raw.longitude
                        : typeof raw.lon === 'number'
                          ? raw.lon
                          : 0,
                    timezone:
                      typeof raw.timezone === 'string' ? raw.timezone : 'UTC',
                  });
                  setBirthData(textBirthData);
                }

                componentLogger.info(
                  'UnifiedChart',
                  'Chart data loaded successfully from storage'
                );
              } else {
                throw new Error('No chart data found in stored object');
              }
            } catch (parseError) {
              componentLogger.error(
                'UnifiedChart',
                'Failed to parse stored chart data',
                parseError
              );
              setError('Failed to load chart data');
            }
          }
        }

        // If no chart data is available and no specific action was requested, show the calculator
        if (
          !chartData &&
          !chartId &&
          !shouldCalculate &&
          !sessionStorage.getItem('birthData')
        ) {
          componentLogger.info(
            'UnifiedChart',
            'No chart data available, redirecting to calculator'
          );
          navigate('/calculator');
          return;
        }
      } catch (error) {
        componentLogger.error(
          'UnifiedChart',
          'Failed to load chart data',
          error
        );
        setError(
          error instanceof Error ? error.message : 'Failed to load chart data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Skip loading if we're in the middle of a saved chart operation
    if (!isLoadingFromSavedRef.current) {
      void loadChartData();
    }
    // Added missing dependencies (birthData, searchParams, chartData, setBirthData) to satisfy exhaustive-deps rule.
    // searchParams is stable per react-router docs; including it for completeness.
  }, [
    chartId,
    shouldCalculate,
    location.pathname,
    navigate,
    birthData,
    searchParams,
    chartData,
    setBirthData,
  ]);

  // Navigation handlers
  const handleBackToDashboard = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleCreateNewChart = useCallback(() => {
    // Clear stored data
    sessionStorage.removeItem('selectedChart');
    localStorage.removeItem('tempSelectedChart');
    navigate('/', { replace: true });
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className='container p-6 mx-auto'>
        <CosmicLoading size='lg' message='Loading your cosmic chart...' />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='container p-6 mx-auto'>
        <Card className='p-8 mx-auto max-w-2xl cosmic-glass border-red-500/30'>
          <div className='text-center'>
            <div className='text-6xl mb-4'>⚠️</div>
            <h1 className='text-2xl font-bold mb-4 text-red-400'>
              Chart Loading Error
            </h1>
            <p className='text-cosmic-silver mb-6'>{error}</p>
            <div className='flex gap-4 justify-center'>
              <Button onClick={handleBackToDashboard} variant='outline'>
                Back to Dashboard
              </Button>
              <Button onClick={handleCreateNewChart}>Create New Chart</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // No data state
  if (!chartData) {
    return (
      <div className='container p-6 mx-auto'>
        <Card className='p-8 mx-auto max-w-2xl cosmic-glass'>
          <div className='text-center'>
            <div className='text-6xl mb-4'>🌟</div>
            <h1 className='text-2xl font-bold mb-4 text-cosmic-gold'>
              No Chart Data
            </h1>
            <p className='text-cosmic-silver mb-6'>
              No chart data is available. Would you like to create a new chart?
            </p>
            <Button onClick={handleCreateNewChart}>Create New Chart</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main chart display
  return (
    <div className='container p-6 mx-auto'>
      <div className='space-y-6'>
        {/* Header with navigation and save options */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-cosmic-gold mb-2'>
              Astrological Chart
            </h1>
            <p className='text-cosmic-silver text-sm'>
              Data source: {dataSource?.replace('_', ' ') ?? 'unknown'}
            </p>
          </div>

          <div className='flex gap-3'>
            <Button onClick={handleBackToDashboard} variant='outline' size='sm'>
              ← Dashboard
            </Button>

            {user && chartData && birthData && (
              <Button
                onClick={() => void handleSaveChart()}
                disabled={saveChartMutation.isPending}
                size='sm'
              >
                {saveChartMutation.isPending ? 'Saving...' : 'Save Chart'}
              </Button>
            )}

            <Button onClick={handleCreateNewChart} variant='outline' size='sm'>
              New Chart
            </Button>
          </div>
        </div>

        {/* Main chart display */}
        <ChartDisplay
          chart={chartData as unknown as ChartLike}
          chartType='natal'
          onSaveChart={user ? () => void handleSaveChart() : undefined}
        />
      </div>
    </div>
  );
};

export default UnifiedChart;
