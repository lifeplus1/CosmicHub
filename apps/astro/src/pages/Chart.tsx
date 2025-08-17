import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button } from '@cosmichub/ui';
import { useBirthData } from '../contexts/BirthDataContext';
import ChartDisplay from '../components/ChartDisplay/ChartDisplay';
import { ChartBirthData, fetchChartData, ChartData } from '../services/api';

const Chart: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { birthData, setBirthData } = useBirthData();
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle URL parameters on component mount
  useEffect(() => {
    // Check if we have URL parameters for birth data
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const day = searchParams.get('day');
    const hour = searchParams.get('hour');
    const minute = searchParams.get('minute');
    const city = searchParams.get('city');
    
    if (year && month && day && hour && minute && city) {
      const urlBirthData: ChartBirthData = {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
        city: city,
        lat: parseFloat(searchParams.get('lat') || '0'),
        lon: parseFloat(searchParams.get('lon') || '0'),
        timezone: searchParams.get('timezone') || 'UTC'
      };
      
      setBirthData(urlBirthData);
    }
  }, [searchParams, setBirthData]);

  // Calculate chart when birth data changes
  useEffect(() => {
    if (birthData) {
      calculateChartData();
    }
  }, [birthData]);

  const calculateChartData = async () => {
    if (!birthData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the API function to calculate chart
      const chartResult = await fetchChartData(birthData);
      setChartData(chartResult);

    } catch (error) {
      console.error('Error calculating chart:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while calculating the chart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = () => {
    if (birthData) {
      calculateChartData();
    }
  };

  const handleEditBirthData = () => {
    navigate('/');
  };

  const handleViewWithSave = () => {
    if (birthData) {
      // Store birth data in sessionStorage for ChartResults page
      const storedBirthData = {
        date: `${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')}`,
        time: `${birthData.hour.toString().padStart(2, '0')}:${birthData.minute.toString().padStart(2, '0')}`,
        location: birthData.city
      };
      
      sessionStorage.setItem('birthData', JSON.stringify(storedBirthData));
      console.log('✅ Birth data stored for chart-results page:', storedBirthData);
      navigate('/chart-results');
    }
  };

  if (!birthData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">No Birth Data Available</h2>
          <p className="text-gray-600 mb-4">
            Please provide your birth information to generate a natal chart.
          </p>
          <Button onClick={handleEditBirthData}>
            Enter Birth Data
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with birth data summary */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Natal Chart</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Born: {birthData.year}-{birthData.month.toString().padStart(2, '0')}-{birthData.day.toString().padStart(2, '0')} at {birthData.hour.toString().padStart(2, '0')}:{birthData.minute.toString().padStart(2, '0')}</p>
              <p>Location: {birthData.city}</p>
              {birthData.lat && birthData.lon && (
                <p>Coordinates: {birthData.lat.toFixed(4)}°, {birthData.lon.toFixed(4)}°</p>
              )}
            </div>
          </div>
          <div className="space-x-2">
            <Button variant="secondary" onClick={handleEditBirthData}>
              Edit Birth Data
            </Button>
            <Button onClick={handleRecalculate} disabled={isLoading}>
              {isLoading ? 'Calculating...' : 'Recalculate'}
            </Button>
            <Button onClick={handleViewWithSave} className="bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark">
              💾 Save Chart
            </Button>
          </div>
        </div>
      </Card>

      {/* Error display */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Calculating your natal chart...</span>
          </div>
        </Card>
      )}

      {/* Chart content */}
      {chartData && !isLoading && (
        <div className="space-y-6">
          {/* Chart visualization */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Natal Chart</h2>
            <ChartDisplay chart={chartData as unknown as Record<string, unknown>} />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Chart;
