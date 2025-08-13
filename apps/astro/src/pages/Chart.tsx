import React, { useState, Suspense, lazy } from 'react';
import { useAuth } from '@cosmichub/auth';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@cosmichub/ui';
import { useBirthData } from '../contexts/BirthDataContext';
import { SimpleBirthForm } from '../components/SimpleBirthForm';
import ChartDisplay from '../components/ChartDisplay';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChartData, saveChart, type SaveChartRequest } from '../services/api';
import type { ChartBirthData } from '../services/api';

// Lazy load ChartWheel for optimal performance
const ChartWheel = lazy(() => import('../features/ChartWheel'));

// Loading component for ChartWheel
const ChartWheelSkeleton = () => (
  <div className="flex items-center justify-center h-[600px] bg-cosmic-dark rounded-lg border border-cosmic-purple animate-pulse">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cosmic-gold"></div>
      <div className="text-cosmic-silver">Loading chart wheel...</div>
    </div>
  </div>
);

// Helper functions for aspect transformation
const getAspectAngle = (aspectType: string): number => {
  if (!aspectType) return 0;
  const aspectAngles: Record<string, number> = {
    'conjunction': 0,
    'opposition': 180,
    'trine': 120,
    'square': 90,
    'sextile': 60,
    'quincunx': 150,
    'semisextile': 30,
    'semisquare': 45,
    'sesquiquadrate': 135,
    'quintile': 72,
  };
  return aspectAngles[aspectType.toLowerCase()] || 0;
};

const getSignFromPosition = (position: number): string => {
  if (typeof position !== 'number' || isNaN(position)) return 'Unknown';
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(position / 30)] || 'Unknown';
};

const Chart: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { birthData, isDataValid, setBirthData } = useBirthData();
  const [showAspects, setShowAspects] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const queryClient = useQueryClient();

  // Fetch chart data and transform it consistently for both components
  const { data: rawChartData, isLoading: chartLoading, error: chartError } = useQuery({
    queryKey: ['chartData', birthData],
    queryFn: async () => {
      if (!birthData) throw new Error('Birth data required');
      return await fetchChartData(birthData);
    },
    enabled: !!birthData && isDataValid,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  });

  // Save chart mutation
  const saveMutation = useMutation({
    mutationFn: saveChart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCharts'] });
      alert('Chart saved successfully!');
    },
    onError: (error) => {
      console.error('Error saving chart:', error);
      alert(`Failed to save chart: ${error.message}`);
    },
  });

  const handleSaveChart = () => {
    if (!user) {
      alert('Please sign in to save your chart');
      navigate('/login');
      return;
    }

    if (!birthData) {
      alert('No chart data to save. Please generate a chart first.');
      return;
    }

    const saveData: SaveChartRequest = {
      year: birthData.year,
      month: birthData.month,
      day: birthData.day,
      hour: birthData.hour,
      minute: birthData.minute,
      city: birthData.city,
      house_system: 'P', // Default to Placidus
      chart_name: `${birthData.city} ${birthData.year}-${birthData.month.toString().padStart(2, '0')}-${birthData.day.toString().padStart(2, '0')}`
    };

    saveMutation.mutate(saveData);
  };

  // Transform the data consistently for both components
  const chartData = React.useMemo(() => {
    if (!rawChartData) return null;
    
    // Transform planets to match both component expectations
    const transformedPlanets: Record<string, any> = {};
    Object.entries(rawChartData.planets).forEach(([name, planetData]: [string, any]) => {
      transformedPlanets[name] = {
        name,
        position: planetData.position,
        retrograde: planetData.retrograde || false,
        speed: planetData.speed || 0,
      };
    });

    // Transform houses to match both component expectations
    const transformedHouses: any[] = [];
    Object.entries(rawChartData.houses).forEach(([houseKey, houseData]: [string, any]) => {
      transformedHouses.push({
        house: houseData.house,
        number: houseData.house, // For ChartWheel compatibility
        cusp: houseData.cusp,
        sign: houseData.sign || '',
      });
    });

    // Transform aspects to match both component expectations
    const transformedAspects = (rawChartData.aspects || [])
      .filter((aspect: any) => aspect && aspect.aspect) // Filter out invalid aspects
      .map((aspect: any) => ({
        // For ChartDisplay compatibility
        point1: aspect.point1,
        point2: aspect.point2,
        aspect: aspect.aspect.toLowerCase(), // Normalize to lowercase
        orb: aspect.orb,
        exact: aspect.orb < 1,
        point1_sign: getSignFromPosition(aspect.point1_position || 0),
        point2_sign: getSignFromPosition(aspect.point2_position || 0),
        // For ChartWheel compatibility
        planet1: aspect.point1,
        planet2: aspect.point2,
        type: aspect.aspect.toLowerCase() as 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx',
        angle: getAspectAngle(aspect.aspect), // Calculate angle from aspect type
        applying: false, // Default for backend aspects
      }));

    return {
      planets: transformedPlanets,
      houses: transformedHouses.sort((a, b) => a.house - b.house),
      aspects: transformedAspects,
      angles: rawChartData.angles,
      latitude: rawChartData.latitude,
      longitude: rawChartData.longitude,
      timezone: rawChartData.timezone,
      julian_day: rawChartData.julian_day,
    };
  }, [rawChartData]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Natal Chart Wheel
        </h1>
        <p className="text-xl text-cosmic-silver/80">
          Interactive astrological chart with planetary positions, houses, and aspects
        </p>
      </div>

      {/* Birth Data Input - Only show if no data */}
      {!birthData && (
        <SimpleBirthForm
          title="Enter Birth Data"
          submitButtonText="Generate Natal Chart"
          showSampleButton={true}
        />
      )}

      {/* Chart Display */}
      {birthData && isDataValid && (
        <div className="space-y-6">
          {/* Chart Controls */}
          <Card title="Chart Controls">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="showAspects" 
                    checked={showAspects}
                    onChange={(e) => setShowAspects(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showAspects" className="text-cosmic-silver">
                    Show Aspects
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="showAnimation" 
                    checked={showAnimation}
                    onChange={(e) => setShowAnimation(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="showAnimation" className="text-cosmic-silver">
                    Animations
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Save Chart Button */}
                {user && (
                  <Button 
                    onClick={handleSaveChart}
                    disabled={saveMutation.isPending}
                    className="text-sm bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark"
                  >
                    {saveMutation.isPending ? 'Saving...' : '💾 Save Chart'}
                  </Button>
                )}
                
                {/* Multi-System Link */}
                <Button 
                  onClick={() => navigate('/multi-system')} 
                  variant="secondary"
                  className="text-sm"
                >
                  🌍 Compare Systems
                </Button>
                
                <Button 
                  onClick={() => setBirthData(null)} 
                  variant="secondary"
                  className="text-sm"
                >
                  📝 Edit Data
                </Button>
              </div>
            </div>
          </Card>

          {/* Chart Wheel and Data Display */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Chart Wheel */}
            <Card title="Your Natal Chart">
              <Suspense fallback={<ChartWheelSkeleton />}>
                <ChartWheel
                  birthData={birthData}
                  chartData={chartData || undefined}
                  showAspects={showAspects}
                  showAnimation={showAnimation}
                />
              </Suspense>
            </Card>

            {/* Chart Data Tables */}
            <Card title="Astrological Data">
              {chartLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-gold"></div>
                  <span className="ml-2 text-cosmic-silver">Loading chart data...</span>
                </div>
              ) : chartError ? (
                <div className="text-center p-8">
                  <div className="text-red-500 mb-4">Error loading chart data</div>
                  <Button onClick={() => window.location.reload()} variant="secondary">
                    Retry
                  </Button>
                </div>
              ) : chartData ? (
                <ChartDisplay chart={chartData as any} onSaveChart={handleSaveChart} />
              ) : (
                <div className="text-center p-8">
                  <div className="text-cosmic-silver">No chart data available</div>
                </div>
              )}
            </Card>
          </div>

          {/* Chart Information */}
          <Card title="Birth Information">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-cosmic-gold font-semibold">Date</div>
                <div className="text-cosmic-silver">{birthData.month}/{birthData.day}/{birthData.year}</div>
              </div>
              <div className="text-center">
                <div className="text-cosmic-gold font-semibold">Time</div>
                <div className="text-cosmic-silver">{birthData.hour.toString().padStart(2, '0')}:{birthData.minute.toString().padStart(2, '0')}</div>
              </div>
              <div className="text-center">
                <div className="text-cosmic-gold font-semibold">Location</div>
                <div className="text-cosmic-silver">{birthData.city}</div>
              </div>
              <div className="text-center">
                <div className="text-cosmic-gold font-semibold">Coordinates</div>
                <div className="text-cosmic-silver text-sm">
                  {birthData.lat ? `${birthData.lat.toFixed(2)}°, ${birthData.lon?.toFixed(2)}°` : 'Auto-detected'}
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card title="Explore More">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/multi-system')}
                className="p-4 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg hover:bg-cosmic-purple/20 transition-colors text-left"
              >
                <div className="text-2xl mb-2">🌍</div>
                <h4 className="text-cosmic-purple font-semibold">Multi-System Analysis</h4>
                <p className="text-cosmic-silver/70 text-sm">Compare Western, Vedic, and Uranian systems</p>
              </button>
              
              <button
                onClick={() => navigate('/numerology')}
                className="p-4 bg-cosmic-blue/10 border border-cosmic-blue/30 rounded-lg hover:bg-cosmic-blue/20 transition-colors text-left"
              >
                <div className="text-2xl mb-2">🔢</div>
                <h4 className="text-cosmic-blue font-semibold">Numerology Profile</h4>
                <p className="text-cosmic-silver/70 text-sm">Discover your life path and destiny numbers</p>
              </button>
              
              <button
                onClick={() => navigate('/ai-interpretation')}
                className="p-4 bg-cosmic-gold/10 border border-cosmic-gold/30 rounded-lg hover:bg-cosmic-gold/20 transition-colors text-left"
              >
                <div className="text-2xl mb-2">🤖</div>
                <h4 className="text-cosmic-gold font-semibold">AI Interpretation</h4>
                <p className="text-cosmic-silver/70 text-sm">Get intelligent chart analysis</p>
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Chart;
