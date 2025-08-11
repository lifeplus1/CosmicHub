import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChartDisplay from '../components/ChartDisplay';
import { CosmicLoading } from '../components/CosmicLoading';
import type { ChartData } from '../types';

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  lat?: number;
  lon?: number;
}

interface StoredBirthData {
  date: string;  // "2023-06-15" format
  time: string;  // "14:30" format
  location: string;
}

// Backend response structure
interface BackendChartData {
  planets: Record<string, {
    position: number;
    house: number;
    retrograde?: boolean;
    speed?: number;
  }>;
  houses: Record<string, {
    house: number;
    cusp: number;
  }>;
  aspects: Array<{
    point1: string;
    point2: string;
    aspect: string;
    orb: number;
    exact: boolean;
    point1_sign?: string;
    point2_sign?: string;
    point1_house?: number;
    point2_house?: number;
  }>;
}

interface ExtendedChartData extends ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
}

const ChartResults: React.FC = () => {
  const [chartData, setChartData] = useState<ExtendedChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Utility function to get zodiac sign from position
  const getZodiacSignName = (position: number): string => {
    const zodiacSigns = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    if (typeof position !== 'number' || isNaN(position)) return 'Unknown';
    const signIndex = Math.floor(position / 30) % 12;
    return zodiacSigns[signIndex] || 'Unknown';
  };

  // Transform backend chart data to frontend expected format
  const transformChartData = (backendData: any, birthData?: BirthData): ExtendedChartData => {
    console.log('🔄 Transforming chart data:', { backendData, birthData });
    
    // Convert houses object to array format
    const housesArray = Object.entries(backendData.houses || {})
      .sort(([a], [b]) => {
        const numA = parseInt(a.replace('house_', ''));
        const numB = parseInt(b.replace('house_', ''));
        return numA - numB;
      })
      .map(([, houseData]: [string, any]) => ({
        house: houseData.house,
        cusp: houseData.cusp,
        sign: getZodiacSignName(houseData.cusp)
      }));

    // Get coordinates from the response or provide defaults
    console.log('🔍 Backend data check:', {
      hasLatitude: 'latitude' in backendData,
      latitude: backendData.latitude,
      hasLongitude: 'longitude' in backendData, 
      longitude: backendData.longitude,
      hasTimezone: 'timezone' in backendData,
      timezone: backendData.timezone,
      hasJulianDay: 'julian_day' in backendData,
      julian_day: backendData.julian_day
    });
    
    const latitude = backendData.latitude || 0;
    const longitude = backendData.longitude || 0;
    const timezone = backendData.timezone || 'Unknown';
    const julian_day = backendData.julian_day || 0;
    const angles = backendData.angles || {};

    console.log('✅ Transformation complete:', { latitude, longitude, timezone, housesCount: housesArray.length });

    return {
      planets: backendData.planets || {},
      houses: housesArray,
      aspects: backendData.aspects || [],
      latitude,
      longitude,
      timezone,
      julian_day,
      angles
    };
  };

  // Transform stored birth data to backend format
  const transformBirthData = (storedData: StoredBirthData): BirthData => {
    // Parse date: "2023-06-15" -> { year: 2023, month: 6, day: 15 }
    const [year, month, day] = storedData.date.split('-').map(Number);
    
    // Parse time: "14:30" -> { hour: 14, minute: 30 }
    const [hour, minute] = storedData.time.split(':').map(Number);
    
    return {
      year,
      month,
      day,
      hour,
      minute,
      city: storedData.location,
      // Let backend handle geocoding from city name
      // lat and lon are optional in the backend model
    };
  };

  useEffect(() => {
    const calculateChart = async () => {
      try {
        // Get birth data from session storage
        const storedBirthData = sessionStorage.getItem('birthData');
        
        if (!storedBirthData) {
          setError('No birth data found. Please go back and enter your birth information.');
          setLoading(false);
          return;
        }
        
        // Parse stored data and transform to backend format
        const parsedData: StoredBirthData = JSON.parse(storedBirthData);
        const birthData: BirthData = transformBirthData(parsedData);
        
        console.log('Original birth data:', parsedData);
        console.log('Transformed birth data:', birthData);
        
        // Make API call to calculate chart
        const response = await fetch('http://localhost:8000/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          body: JSON.stringify(birthData),
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API Error:', errorData);
          throw new Error(`Failed to calculate chart: ${response.status} ${response.statusText}`);
        }
        
        const calculatedChart = await response.json();
        console.log('Raw backend chart data:', calculatedChart);
        
        // Transform the backend data to frontend format
        const transformedChart = transformChartData(calculatedChart, birthData);
        console.log('Transformed chart data:', transformedChart);
        
        setChartData(transformedChart);
        
      } catch (err) {
        console.error('Error calculating chart:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while calculating the chart');
      } finally {
        setLoading(false);
      }
    };
    
    calculateChart();
  }, []);

  const handleBackToCalculator = () => {
    navigate('/calculator');
  };

const handleSaveChart = async () => {
  try {
    // Get the stored birth data that was used to calculate this chart
    const storedBirthData = sessionStorage.getItem('birthData');
    if (!storedBirthData) {
      console.error('No birth data found for saving');
      alert('No birth data found. Please generate a chart first.');
      return;
    }

    const parsedData: StoredBirthData = JSON.parse(storedBirthData);
    
    // Convert stored data to the format expected by the backend
    const [year, month, day] = parsedData.date.split('-').map(Number);
    const [hour, minute] = parsedData.time.split(':').map(Number);
    
    const saveData = {
      year,
      month,
      day,
      hour,
      minute,
      city: parsedData.location,
      house_system: "P", // Default to Placidus
      chart_name: `${parsedData.location} ${parsedData.date}`
    };

    console.log('Saving chart with data:', saveData);

    // Try to get Firebase auth first
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        // User is authenticated, use the authenticated endpoint
        const token = await user.getIdToken();
        
        const response = await fetch('http://localhost:8000/api/charts/save-chart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(saveData)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Save chart error:', errorData);
          throw new Error(`Failed to save chart: ${response.status}`);
        }

        const result = await response.json();
        console.log('Chart saved successfully:', result);
        alert(`Chart saved successfully! Chart ID: ${result.id}`);
        
      } else {
        // No user authenticated, use test endpoint
        console.log('No user authenticated, using test endpoint');
        
        const response = await fetch('http://localhost:8000/api/charts/test-save-chart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(saveData)
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Save chart error:', errorData);
          throw new Error(`Failed to save chart: ${response.status}`);
        }

        const result = await response.json();
        console.log('Test chart saved successfully:', result);
        alert(`Test chart saved successfully! Chart ID: ${result.id}\n\nNote: Sign in to save charts to your personal collection.`);
      }
      
    } catch (authError) {
      console.error('Auth error, falling back to test endpoint:', authError);
      
      // Fallback to test endpoint
      const response = await fetch('http://localhost:8000/api/charts/test-save-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Save chart error:', errorData);
        throw new Error(`Failed to save chart: ${response.status}`);
      }

      const result = await response.json();
      console.log('Test chart saved successfully:', result);
      alert(`Test chart saved successfully! Chart ID: ${result.id}\n\nNote: Sign in to save charts to your personal collection.`);
    }
    
  } catch (error) {
    console.error('Error saving chart:', error);
    alert('Failed to save chart. Please try again.');
  }
};  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <CosmicLoading size="lg" message="Calculating your birth chart..." />
        <p className="text-cosmic-silver mt-4 text-center">
          Analyzing planetary positions and aspects...
        </p>
      </div>
    );
  }

  if (error) {
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

      {chartData && (
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
          
          <ChartDisplay 
            chart={chartData} 
            onSaveChart={handleSaveChart}
            loading={false}
          />
        </>
      )}
    </div>
  );
};

export default ChartResults;
