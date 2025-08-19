import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@cosmichub/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChartDisplay } from '../components';
import { CosmicLoading } from '../components/CosmicLoading';
import { saveChart, fetchChartData, type SaveChartRequest } from '../services/api';
import { devConsole } from '../config/environment';

interface StoredBirthData {
  date: string;  // "2023-06-15" format
  time: string;  // "14:30" format
  location: string;
}

interface BackendPlanet {
  position: number;
  house: number;
  retrograde?: boolean;
  speed?: number;
}

interface BackendHouse {
  house: number;
  cusp: number;
}

interface BackendAspect {
  point1: string;
  point2: string;
  aspect: string;
  orb: number;
  exact: boolean;
  point1_sign?: string;
  point2_sign?: string;
  point1_house?: number;
  point2_house?: number;
}

interface BackendChartResponse {
  planets?: Record<string, BackendPlanet>;
  houses?: Record<string, BackendHouse>;
  aspects?: BackendAspect[];
  latitude?: number;
  longitude?: number;
  timezone?: string;
  julian_day?: number;
  angles?: Record<string, number>;
}

// Type guard for BackendChartResponse
function isBackendChartResponse(data: unknown): data is BackendChartResponse {
  const response = data as BackendChartResponse;
  return typeof response === 'object' && 
         response !== null &&
         (!('planets' in response) || typeof response.planets === 'object') &&
         (!('houses' in response) || typeof response.houses === 'object') &&
         (!('aspects' in response) || Array.isArray(response.aspects)) &&
         (!('latitude' in response) || typeof response.latitude === 'number') &&
         (!('longitude' in response) || typeof response.longitude === 'number') &&
         (!('timezone' in response) || typeof response.timezone === 'string') &&
         (!('julian_day' in response) || typeof response.julian_day === 'number') &&
         (!('angles' in response) || typeof response.angles === 'object');
}

interface ExtendedChartData {
  planets: Record<string, BackendPlanet>;
  houses: Array<{ house: number; number: number; cusp: number; sign: string }>;
  aspects: BackendAspect[];
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
}

const ChartResults: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [chartData, setChartData] = useState<ExtendedChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Save chart mutation
  const saveMutation = useMutation({
    mutationFn: saveChart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['savedCharts'] });
      void alert('Chart saved successfully!');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      devConsole.error('❌ Error saving chart:', error);
      void alert(`Failed to save chart: ${message}`);
    }
  });

  const handleSaveChart = () => {
    if (user === null) {
      void alert('Please sign in to save your chart');
      void navigate('/login');
      return;
    }

    // Get the stored birth data that was used to calculate this chart
    const storedBirthData = sessionStorage.getItem('birthData');
    if (storedBirthData === null || chartData === null) {
      void alert('No chart data found. Please generate a chart first.');
      return;
    }

    function isStoredBirthData(data: unknown): data is StoredBirthData {
      const parsed = data as StoredBirthData;
      return (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof parsed.date === 'string' &&
        typeof parsed.time === 'string' &&
        typeof parsed.location === 'string'
      );
    }

    let birthData: StoredBirthData;
    try {
      const parsed: unknown = JSON.parse(storedBirthData);
      if (!isStoredBirthData(parsed)) {
        throw new Error('Invalid birth data format');
      }
      birthData = parsed;
    } catch {
      void alert('Invalid birth data format');
      return;
    }
    
    // Convert stored data to the format expected by the backend
    const dateParts = birthData.date.split('-').map(Number);
    const timeParts = birthData.time.split(':').map(Number);
    const [year = 0, month = 1, day = 1] = dateParts;
    const [hour = 0, minute = 0] = timeParts;
    
    const saveData: SaveChartRequest = {
      year,
      month,
      day,
      hour,
      minute,
      city: birthData.location,
      house_system: 'P', // Default to Placidus
      chart_name: `${birthData.location} ${birthData.date}`,
      lat: chartData.latitude,
      lon: chartData.longitude,
      timezone: chartData.timezone
    };

    void saveMutation.mutate(saveData);
  };

  // Utility function to get zodiac sign from position
  const getZodiacSignName = (position: number): string => {
    const zodiacSigns = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    if (typeof position !== 'number' || Number.isNaN(position) || position < 0) return 'Unknown';
    const signIndex = Math.floor(position / 30) % 12;
    return signIndex >= 0 && signIndex < zodiacSigns.length ? zodiacSigns[signIndex] : 'Unknown';
  };

  useEffect(() => {
    const transformChartData = (backendData: BackendChartResponse): ExtendedChartData => {
      // Convert houses object to array format (defensive for missing data)
      const housesSource: Record<string, BackendHouse> = typeof backendData.houses === 'object' && backendData.houses !== null ? backendData.houses : {};
      const housesArray = Object.entries(housesSource)
        .sort(([a], [b]) => {
          const numA = Number(a.replace('house_', ''));
          const numB = Number(b.replace('house_', ''));
          if (Number.isNaN(numA)) return -1;
          if (Number.isNaN(numB)) return 1;
          return numA - numB;
        })
        .map(([key, houseData]) => {
          const numStr = key.replace('house_', '');
          const houseNumber = Number.isNaN(Number(numStr)) ? 0 : Number(numStr);
          const house = typeof houseData.house === 'number' ? houseData.house : houseNumber;
          return {
            house,
            number: house,
            cusp: houseData.cusp,
            sign: getZodiacSignName(houseData.cusp)
          };
        });

      const latitude = backendData.latitude ?? 0;
      const longitude = backendData.longitude ?? 0;
      const timezone = backendData.timezone ?? 'Unknown';
      const julian_day = backendData.julian_day ?? 0;
      const angles = backendData.angles ?? {};

      return {
        planets: backendData.planets ?? {},
        houses: housesArray,
        aspects: backendData.aspects ?? [],
        latitude,
        longitude,
        timezone,
        julian_day,
        angles
      };
    };

    const calculateChart = async () => {
      try {
        // Get birth data from session storage
        const storedBirthData = sessionStorage.getItem('birthData');
        if (storedBirthData === null || storedBirthData === '') {
          setError('No birth data found. Please go back and enter your birth information.');
          setLoading(false);
          return;
        }

        function isStoredBirthData(data: unknown): data is StoredBirthData {
          const parsed = data as StoredBirthData;
          return (
            typeof parsed === 'object' &&
            parsed !== null &&
            typeof parsed.date === 'string' &&
            typeof parsed.time === 'string' &&
            typeof parsed.location === 'string'
          );
        }

        // Parse stored data and transform to backend format
        let parsedData: StoredBirthData;
        try {
          const parsed: unknown = JSON.parse(storedBirthData);
          if (!isStoredBirthData(parsed)) {
            throw new Error('Invalid birth data format');
          }
          parsedData = parsed;
        } catch {
          throw new Error('Invalid birth data format');
        }
        
        // Use the API service instead of direct fetch
        const rawChart = await fetchChartData({
          year: (Number.isNaN(Number(parsedData.date.split('-')[0])) ? 0 : Number(parsedData.date.split('-')[0])),
          month: (Number.isNaN(Number(parsedData.date.split('-')[1])) ? 1 : Number(parsedData.date.split('-')[1])),
          day: (Number.isNaN(Number(parsedData.date.split('-')[2])) ? 1 : Number(parsedData.date.split('-')[2])),
          hour: (Number.isNaN(Number(parsedData.time.split(':')[0])) ? 0 : Number(parsedData.time.split(':')[0])),
          minute: (Number.isNaN(Number(parsedData.time.split(':')[1])) ? 0 : Number(parsedData.time.split(':')[1])),
          city: parsedData.location
        });

        if (!isBackendChartResponse(rawChart)) {
          throw new Error('Invalid chart data received from server');
        }

        // Transform the backend data to frontend format  
        const transformedChart = transformChartData(rawChart);
        setChartData(transformedChart);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while calculating the chart');
      } finally {
        setLoading(false);
      }
    };
    
    void calculateChart();
  }, []);

  const handleBackToCalculator = () => {
    void navigate('/calculator');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <CosmicLoading size="lg" message="Calculating your birth chart..." />
        <p className="text-cosmic-silver mt-4 text-center">
          Analyzing planetary positions and aspects...
        </p>
      </div>
    );
  }

  if (error !== null && error !== '') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-red-400 mb-2">
            Chart Calculation Error
          </h2>
          <p className="text-cosmic-silver mb-4">{error}</p>
          <button
            onClick={handleBackToCalculator}
            className="bg-cosmic-purple hover:bg-cosmic-purple/80 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Calculator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Your Birth Chart
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Explore your cosmic blueprint
        </p>
      </div>

      {chartData !== null && (
        <>
          <div className="flex justify-center mb-6">
            <button
              onClick={handleBackToCalculator}
              className="bg-cosmic-purple/20 hover:bg-cosmic-purple/30 text-cosmic-silver border border-cosmic-purple/50 px-4 py-2 rounded-lg transition-colors mr-4"
            >
              ← New Chart
            </button>
            <button
              onClick={handleSaveChart}
              className="bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark px-4 py-2 rounded-lg transition-colors"
            >
              💾 Save Chart
            </button>
          </div>
          
          <Suspense fallback={<CosmicLoading />}>
            <ChartDisplay
              chart={chartData}
              onSaveChart={handleSaveChart}
            />
          </Suspense>
        </>
      )}
    </div>
  );
};

export default ChartResults;
