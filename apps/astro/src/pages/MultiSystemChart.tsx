import React, { useState, useEffect } from 'react';
import { devConsole } from '../config/environment';
import { Card, Button } from '@cosmichub/ui';
import { MultiSystemChartDisplay } from '../components/MultiSystemChart';
import type { MultiSystemChartData } from '../components/MultiSystemChart/types';
import { useBirthData } from '../contexts/BirthDataContext';
import { SimpleBirthForm } from '../components/SimpleBirthForm';
import { fetchChart, type ChartBirthData } from '../services/api';

const MultiSystemChart: React.FC = () => {
  const { birthData, isDataValid, setBirthData } = useBirthData();
  const [selectedSystems, setSelectedSystems] = useState<string[]>([
    'western',
    'vedic',
  ]);
  const [chartData, setChartData] = useState<MultiSystemChartData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch multi-system chart data when birth data is available
  useEffect(() => {
    const fetchMultiSystemChart = async () => {
      if (!birthData || !isDataValid) {
        setChartData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        devConsole.log?.('🌟 Fetching multi-system chart data...', birthData);

        // Call the multi-system chart API using the fetchChart service
        const result = await fetchChart(birthData);

        if (result.success) {
          devConsole.log?.('✅ Multi-system chart data received:', result.data);

          // The backend returns the multi-system data directly, not wrapped in a MultiSystemResponse
          // So we need to cast the response data to MultiSystemChartData
          setChartData(result.data as unknown as MultiSystemChartData);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to calculate multi-system chart';
        devConsole.error('❌ Error fetching multi-system chart:', errorMessage);
        setError(errorMessage);
        setChartData(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMultiSystemChart();
  }, [birthData, isDataValid]);

  const handleBirthDataSubmit = (data: ChartBirthData): void => {
    // Birth data is already set in context by SimpleBirthForm
    // The useEffect above will automatically trigger the API call
    devConsole.log?.('🧭 Multi-system chart birth data submitted', data);
  };

  const availableSystems = [
    {
      id: 'western',
      name: 'Western Tropical',
      description: 'Standard Western astrology',
    },
    {
      id: 'vedic',
      name: 'Vedic Sidereal',
      description: 'Ancient Indian astrology',
    },
    {
      id: 'uranian',
      name: 'Uranian System',
      description: 'Hamburg School astrology',
    },
    { id: 'synthesis', name: 'Synthesis', description: 'Combined approach' },
  ];

  const toggleSystem = (systemId: string): void => {
    setSelectedSystems(prev =>
      prev.includes(systemId)
        ? prev.filter(id => id !== systemId)
        : [...prev, systemId]
    );
  };

  return (
    <div className='space-y-8'>
      {/* Page Header */}
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-cosmic-gold mb-4 font-cinzel'>
          Multi-System Chart Analysis
        </h1>
        <p className='text-xl text-cosmic-silver/80'>
          Compare your birth chart across different astrological systems
        </p>
      </div>

      {/* Birth Data Input - Only show if no data */}
      {birthData === null && (
        <SimpleBirthForm
          title='Enter Birth Data for Multi-System Analysis'
          submitButtonText='Generate Multi-System Charts'
          showSampleButton={true}
          onSubmit={handleBirthDataSubmit}
        />
      )}

      {/* System Selection and Charts */}
      {birthData !== null && isDataValid && (
        <div className='space-y-6'>
          {/* System Selection */}
          <Card title='Astrological Systems'>
            <div className='space-y-4'>
              <p className='text-cosmic-silver/80'>
                Select which astrological systems to compare:
              </p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {availableSystems.map(system => (
                  <label
                    key={system.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSystems.includes(system.id)
                        ? 'border-cosmic-purple bg-cosmic-purple/10'
                        : 'border-cosmic-silver/20 hover:border-cosmic-purple/50'
                    }`}
                    htmlFor={`system-${system.id}`}
                    aria-label={`Select ${system.name}`}
                  >
                    <input
                      id={`system-${system.id}`}
                      type='checkbox'
                      checked={selectedSystems.includes(system.id)}
                      onChange={() => toggleSystem(system.id)}
                      className='rounded'
                    />
                    <div>
                      <div
                        className='text-cosmic-gold font-semibold'
                        id={`label-${system.id}`}
                      >
                        {system.name}
                      </div>
                      <div
                        className='text-cosmic-silver/70 text-sm'
                        id={`description-${system.id}`}
                      >
                        {system.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className='flex items-center justify-between pt-4 border-t border-cosmic-silver/20'>
                <div className='text-cosmic-silver/70 text-sm'>
                  {selectedSystems.length} system
                  {selectedSystems.length !== 1 ? 's' : ''} selected
                </div>
                <Button
                  onClick={() => setBirthData(null)}
                  variant='secondary'
                  className='text-sm'
                >
                  📝 Edit Birth Data
                </Button>
              </div>
            </div>
          </Card>

          {/* Chart Comparison */}
          {selectedSystems.length > 0 && (
            <Card title='Chart Comparison'>
              {/* Show loading state */}
              {isLoading && (
                <div className='flex items-center justify-center p-8'>
                  <div className='w-6 h-6 border-b-2 border-cosmic-purple rounded-full animate-spin mr-3'></div>
                  <span className='text-cosmic-silver'>
                    Calculating multi-system chart...
                  </span>
                </div>
              )}

              {/* Show error state */}
              {error && !isLoading && (
                <div className='p-6 border border-red-500 rounded-md bg-red-900/50'>
                  <div className='text-center'>
                    <h3 className='font-bold text-red-400 mb-2'>
                      Calculation Error
                    </h3>
                    <p className='text-cosmic-silver/70'>{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant='secondary'
                      className='mt-3'
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Show chart when data is available */}
              {chartData && !isLoading && !error && (
                <MultiSystemChartDisplay
                  chartData={chartData}
                  birthData={birthData}
                  showComparison={true}
                />
              )}

              {/* Show placeholder when no data and no loading/error */}
              {!chartData && !isLoading && !error && (
                <div className='p-6 border border-yellow-500 rounded-md bg-yellow-900/50'>
                  <div className='text-center'>
                    <h3 className='font-bold text-cosmic-silver'>
                      No Chart Data
                    </h3>
                    <p className='text-cosmic-silver/70'>
                      Waiting for chart calculation...
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Birth Information Summary */}
          <Card title='Birth Information'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='text-center'>
                <div className='text-cosmic-gold font-semibold'>Date</div>
                <div className='text-cosmic-silver'>
                  {birthData.month}/{birthData.day}/{birthData.year}
                </div>
              </div>
              <div className='text-center'>
                <div className='text-cosmic-gold font-semibold'>Time</div>
                <div className='text-cosmic-silver'>
                  {birthData.hour.toString().padStart(2, '0')}:
                  {birthData.minute.toString().padStart(2, '0')}
                </div>
              </div>
              <div className='text-center'>
                <div className='text-cosmic-gold font-semibold'>Location</div>
                <div className='text-cosmic-silver'>{birthData.city}</div>
              </div>
              <div className='text-center'>
                <div className='text-cosmic-gold font-semibold'>
                  Coordinates
                </div>
                <div className='text-cosmic-silver text-sm'>
                  {birthData.lat !== undefined && birthData.lon !== undefined && birthData.lat !== null && birthData.lon !== null && typeof birthData.lat === 'number' && typeof birthData.lon === 'number'
                    ? `${birthData.lat.toFixed(2)}°, ${birthData.lon.toFixed(2)}°`
                    : 'Auto-detected'}
                </div>
              </div>
            </div>
          </Card>

          {/* System Insights */}
          <Card title='System Insights'>
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-cosmic-gold'>
                Understanding the Differences
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div className='p-4 bg-cosmic-purple/5 border border-cosmic-purple/20 rounded-lg'>
                    <h4 className='text-cosmic-purple font-semibold mb-2'>
                      Western Tropical
                    </h4>
                    <p className='text-cosmic-silver/80 text-sm'>
                      Based on the seasons and the relationship between Earth
                      and Sun. Uses the tropical zodiac where Aries begins at
                      the spring equinox.
                    </p>
                  </div>

                  <div className='p-4 bg-cosmic-blue/5 border border-cosmic-blue/20 rounded-lg'>
                    <h4 className='text-cosmic-blue font-semibold mb-2'>
                      Vedic Sidereal
                    </h4>
                    <p className='text-cosmic-silver/80 text-sm'>
                      Ancient Indian system based on fixed star positions.
                      Typically shows signs about 24° earlier than Western
                      astrology.
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='p-4 bg-cosmic-gold/5 border border-cosmic-gold/20 rounded-lg'>
                    <h4 className='text-cosmic-gold font-semibold mb-2'>
                      Uranian System
                    </h4>
                    <p className='text-cosmic-silver/80 text-sm'>
                      Hamburg School approach using hypothetical planets and
                      midpoints. Focuses on precise timing and psychological
                      analysis.
                    </p>
                  </div>

                  <div className='p-4 bg-cosmic-green/5 border border-cosmic-green/20 rounded-lg'>
                    <h4 className='text-cosmic-green font-semibold mb-2'>
                      Synthesis
                    </h4>
                    <p className='text-cosmic-silver/80 text-sm'>
                      Combines elements from multiple systems to provide a
                      comprehensive and integrated astrological perspective.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MultiSystemChart;
