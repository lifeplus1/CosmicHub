import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button } from '@cosmichub/ui';
import { useBirthData } from '../contexts/BirthDataContext';
import ChartDisplay from '../components/ChartDisplay/ChartDisplay';
import { fetchChartData, ChartData, ChartBirthData } from '../services/api';
import { componentLogger } from '../utils/componentLogger';

interface StoredBirthData {
  date: string;
  time: string;
  location: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

function isChartBirthData(data: unknown): data is ChartBirthData {
  if (data === null || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.year === 'number' && Number.isInteger(obj.year) &&
    typeof obj.month === 'number' && obj.month >= 1 && obj.month <= 12 &&
    typeof obj.day === 'number' && obj.day >= 1 && obj.day <= 31 &&
    typeof obj.hour === 'number' && obj.hour >= 0 && obj.hour <= 23 &&
    typeof obj.minute === 'number' && obj.minute >= 0 && obj.minute <= 59 &&
    typeof obj.city === 'string' && obj.city.length > 0 &&
    (obj.lat === undefined || typeof obj.lat === 'number') &&
    (obj.lon === undefined || typeof obj.lon === 'number') &&
    (obj.timezone === undefined || typeof obj.timezone === 'string')
  );
}

// Parse birth data parameters from URL; returns null if any required part missing / invalid.
function parseBirthParams(sp: URLSearchParams): ChartBirthData | null {
  const required = ['year', 'month', 'day', 'hour', 'minute', 'city'] as const;
  // Fast pre-check: ensure all required params exist with non-empty value.
  for (const key of required) {
    const v = sp.get(key);
    if (v === null || v.length === 0) return null; // missing or empty
  }
  const year = Number.parseInt(sp.get('year') as string, 10);
  const month = Number.parseInt(sp.get('month') as string, 10);
  const day = Number.parseInt(sp.get('day') as string, 10);
  const hour = Number.parseInt(sp.get('hour') as string, 10);
  const minute = Number.parseInt(sp.get('minute') as string, 10);
  const city = sp.get('city') as string;
  const latRaw = sp.get('lat');
  const lonRaw = sp.get('lon');
  const timezone = sp.get('timezone') ?? 'UTC';
  const lat = latRaw !== null ? Number.parseFloat(latRaw) : undefined;
  const lon = lonRaw !== null ? Number.parseFloat(lonRaw) : undefined;
  const candidate = { year, month, day, hour, minute, city, lat, lon, timezone };
  return isChartBirthData(candidate) ? candidate : null;
}

// Build a serializable object for sessionStorage without leaking internal fields.
function toStoredBirthData(bd: ChartBirthData): StoredBirthData {
  return {
    date: `${bd.year}-${bd.month.toString().padStart(2, '0')}-${bd.day.toString().padStart(2, '0')}`,
    time: `${bd.hour.toString().padStart(2, '0')}:${bd.minute.toString().padStart(2, '0')}`,
    location: bd.city ?? '',
    lat: typeof bd.lat === 'number' ? bd.lat : undefined,
    lon: typeof bd.lon === 'number' ? bd.lon : undefined,
    timezone: bd.timezone ?? undefined
  };
}

const Chart: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { birthData, setBirthData } = useBirthData();
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle URL parameters on component mount
  useEffect(() => {
    // Single parse pass; avoids multiple get() calls & centralizes validation.
    const parsed = parseBirthParams(searchParams);
    if (parsed === null) {
      return; // Missing or invalid param set -> leave existing state untouched.
    }
    setBirthData(parsed);
  }, [searchParams, setBirthData]);

  const calculateChartData = useCallback(async (): Promise<void> => {
    if (birthData === null || birthData === undefined) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the API function to calculate chart
      const chartResult = await fetchChartData(birthData);
      setChartData(chartResult);

    } catch (err) {
      componentLogger.error('Chart', 'Error calculating chart', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'string'
          ? err
          : 'An error occurred while calculating the chart';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
    // deps: birthData (used for API call). setChartData/setError/setIsLoading are stable from React.
  }, [birthData]);

  // Calculate chart when birth data changes
  useEffect(() => {
    if (birthData !== null && birthData !== undefined) {
      void calculateChartData();
    }
    // deps: birthData triggers recalculation; calculateChartData memoized on birthData only.
  }, [birthData, calculateChartData]);

  const handleRecalculate = useCallback((): void => {
    if (birthData !== null && birthData !== undefined) {
      void calculateChartData();
    }
    // deps: birthData (guard) + calculateChartData (invoked)
  }, [birthData, calculateChartData]);

  const handleEditBirthData = useCallback((): void => {
    navigate('/');
    // deps: navigate (router hook)
  }, [navigate]);

  const handleViewWithSave = useCallback((): void => {
    if (birthData === null || birthData === undefined) return;
    const storedBirthData = toStoredBirthData(birthData);
    try {
      sessionStorage.setItem('birthData', JSON.stringify(storedBirthData));
      componentLogger.info('Chart', 'Birth data stored for chart-results page', storedBirthData);
    } catch (err) {
      componentLogger.error('Chart', 'Failed to store birth data', err);
    }
    navigate('/chart-results');
  }, [birthData, navigate]);

  if (birthData === null || birthData === undefined) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">No Birth Data Available</h2>
          <p className="text-gray-600 mb-4">
            Please provide your birth information to generate a natal chart.
          </p>
          <Button onClick={handleEditBirthData} aria-label="Enter birth information">
            Enter Birth Data
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" role="main" aria-labelledby="chart-page-heading">
      {/* Header with birth data summary */}
      <Card className="p-6" aria-describedby="birth-data-summary">
        <div className="flex justify-between items-start">
          <div>
            <h1 id="chart-page-heading" className="text-2xl font-bold mb-2">Natal Chart</h1>
            <div id="birth-data-summary" className="text-sm text-gray-600 space-y-1">
              <p>Born: {birthData.year}-{birthData.month.toString().padStart(2, '0')}-{birthData.day.toString().padStart(2, '0')} at {birthData.hour.toString().padStart(2, '0')}:{birthData.minute.toString().padStart(2, '0')}</p>
              <p>Location: {birthData.city}</p>
              {typeof birthData.lat === 'number' && typeof birthData.lon === 'number' && (
                <p>Coordinates: {birthData.lat.toFixed(4)}°, {birthData.lon.toFixed(4)}°</p>
              )}
            </div>
          </div>
          <div className="space-x-2">
            <Button 
              variant="secondary" 
              onClick={handleEditBirthData}
              aria-label="Edit birth data"
            >
              Edit Birth Data
            </Button>
            <Button 
              onClick={handleRecalculate} 
              disabled={isLoading}
              aria-label={isLoading ? 'Chart calculation in progress' : 'Recalculate chart'}
            >
              {isLoading ? 'Calculating...' : 'Recalculate'}
            </Button>
            <Button 
              onClick={handleViewWithSave} 
              className="bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark"
              aria-label="Save chart"
            >
              💾 Save Chart
            </Button>
          </div>
        </div>
      </Card>

      {/* Error display */}
  {error !== null && error.length > 0 && (
        <div role="alert" aria-live="assertive">
          <Card className="p-6 bg-red-50 border-red-200">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </Card>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div aria-live="polite">
          <Card className="p-6 text-center" aria-busy="true">
            <div className="flex items-center justify-center space-x-2" role="status" aria-label="Calculating natal chart">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Calculating your natal chart…</span>
            </div>
          </Card>
        </div>
      )}

      {/* Chart content */}
  {chartData !== null && !isLoading && (
        <div className="space-y-6">
          {/* Chart visualization */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Natal Chart</h2>
            <ChartDisplay chart={chartData} />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Chart;
