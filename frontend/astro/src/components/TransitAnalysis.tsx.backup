import React, { useState } from 'react';
import { useToast } from './ToastProvider';
import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import FeatureGuard from './FeatureGuard';
import type { BirthData, TransitData } from '../types';

interface TransitAnalysisProps {
  birthData: BirthData;
}

interface TransitResult {
  period: {
    start: string;
    end: string;
    duration_days: number;
  };
  transits: {
    most_active_days: Array<{
      date: string;
      transit_count: number;
      transits: Array<{
        transit_planet: string;
        natal_planet: string;
        aspect: string;
        orb: number;
        exactness: number;
        interpretation: string;
        applying: boolean;
      }>;
    }>;
    strongest_transits: Array<{
      date: string;
      transit_planet: string;
      natal_planet: string;
      aspect: string;
      orb: number;
      exactness: number;
      interpretation: string;
      applying: boolean;
    }>;
  };
  significant_periods: Array<{
    date: string;
    activity_level: number;
    primary_themes: string[];
    significance_score: number;
  }>;
  summary: {
    period_overview: string;
    most_active_planet: string;
    key_themes: string[];
    overall_intensity: string;
    recommendations: string[];
  };
}

const TransitAnalysis: React.FC<TransitAnalysisProps> = ({ birthData }) => {
  const [transitResult, setTransitResult] = useState<TransitResult | null>(null);
  const [lunarTransits, setLunarTransits] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLunar, setLoadingLunar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });

  const { toast } = useToast();

  const calculateTransits = async () => {
    setLoading(true);
    setError(null);

    try {
      const transitData: TransitData = {
        birth_data: birthData,
        start_date: `${dateRange.startDate}T00:00:00Z`,
        end_date: `${dateRange.endDate}T23:59:59Z`,
        orb: 2.0,
        include_retrogrades: true
      };

      const response = await fetch('/api/calculate-transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transitData),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate transits');
      }

      const data = await response.json();
      setTransitResult(data.transits);

      toast({
        title: 'Transits Calculated',
        description: 'Your transit analysis is ready.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      toast({
        title: 'Transit Calculation Failed',
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateLunarTransits = async () => {
    setLoadingLunar(true);

    try {
      const transitData: TransitData = {
        birth_data: birthData,
        start_date: `${dateRange.startDate}T00:00:00Z`,
        end_date: `${dateRange.endDate}T23:59:59Z`
      };

      const response = await fetch('/api/calculate-lunar-transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transitData),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate lunar transits');
      }

      const data = await response.json();
      setLunarTransits(data.transits);

    } catch (err) {
      console.error('Lunar transit calculation error:', err);
    } finally {
      setLoadingLunar(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const formatPlanet = (planet: string) => {
    return planet.charAt(0).toUpperCase() + planet.slice(1);
  };

  const getAspectColor = (aspect: string) => {
    switch (aspect) {
      case 'conjunction':
      case 'trine':
      case 'sextile':
        return 'green-500';
      case 'square':
      case 'opposition':
        return 'orange-500';
      default:
        return 'gray-500';
    }
  };

  const getIntensityColor = (level: number) => {
    if (level > 75) return 'red-500';
    if (level > 50) return 'orange-500';
    if (level > 25) return 'yellow-500';
    return 'green-500';
  };

  if (!birthData) {
    return (
      <div className="py-10 text-center">
        <p className="text-cosmic-silver">Please calculate your chart first to analyze transits.</p>
      </div>
    );
  }

  return (
    <FeatureGuard requiredTier="premium" feature="transits">
      <div className="flex flex-col space-y-6">
        <div className="cosmic-card">
          <div className="p-4">
            <h2 className="mb-4 text-xl font-bold text-purple-600">Transit Period</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-cosmic-gold">Start Date</label>
                <input
                  className="cosmic-input"
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                />
              </div>
              <div>
                <label className="block mb-2 text-cosmic-gold">End Date</label>
                <input
                  className="cosmic-input"
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                className="flex-1 cosmic-button"
                onClick={calculateTransits}
                disabled={loading}
              >
                {loading ? 'Calculating...' : 'Planetary Transits'}
                <FaCalendarAlt className="ml-2" />
              </button>
              <button
                className="flex-1 cosmic-button"
                onClick={calculateLunarTransits}
                disabled={loadingLunar}
              >
                {loadingLunar ? 'Calculating...' : 'Lunar Transits'}
                <FaClock className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 border border-red-500 rounded-md bg-red-900/50">
            <div className="flex space-x-4">
              <span className="text-xl text-red-500">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {transitResult && (
          <Tabs.Root>
            <Tabs.List className="flex border-b border-cosmic-silver/30">
              <Tabs.Trigger value="summary" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Summary</Tabs.Trigger>
              <Tabs.Trigger value="significant" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Significant Periods</Tabs.Trigger>
              <Tabs.Trigger value="strongest" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Strongest Transits</Tabs.Trigger>
              <Tabs.Trigger value="active_days" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Active Days</Tabs.Trigger>
              <Tabs.Trigger value="lunar" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Lunar Cycles</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="summary" className="p-4">
              <div className="flex flex-col space-y-6">
                <div className="cosmic-card">
                  <div className="p-4">
                    <h3 className="mb-4 font-bold text-md">Period Overview</h3>
                    <p className="text-cosmic-silver">{transitResult.summary.period_overview}</p>
                  </div>
                </div>

                <div className="cosmic-card">
                  <div className="p-4">
                    <h3 className="mb-4 font-bold text-md">Key Insights</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-cosmic-silver">Most Active Planet</p>
                        <p className="font-bold">{formatPlanet(transitResult.summary.most_active_planet)}</p>
                      </div>
                      <div>
                        <p className="text-cosmic-silver">Overall Intensity</p>
                        <p className="font-bold">{transitResult.summary.overall_intensity}</p>
                      </div>
                    </div>
                    <h4 className="mt-4 mb-2 text-sm font-bold">Key Themes</h4>
                    <div className="flex flex-wrap space-x-2">
                      {transitResult.summary.key_themes.map((theme, index) => (
                        <span key={index} className="px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="cosmic-card">
                  <div className="p-4">
                    <h3 className="mb-4 font-bold text-md">Recommendations</h3>
                    <div className="flex flex-col space-y-2">
                      {transitResult.summary.recommendations.map((rec, index) => (
                        <p key={index} className="text-cosmic-silver">• {rec}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="significant" className="p-4">
              <div className="flex flex-col space-y-4">
                {transitResult.significant_periods.map((period, index) => (
                  <div key={index} className="cosmic-card">
                    <div className="p-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold">{period.date}</h4>
                        <span className={`bg-${getIntensityColor(period.activity_level)} text-white px-2 py-1 rounded text-sm`}>
                          Intensity: {period.activity_level}%
                        </span>
                      </div>
                      <p className="mb-2 text-cosmic-silver">Significance Score: {period.significance_score}</p>
                      <div className="flex flex-wrap space-x-2">
                        {period.primary_themes.map((theme, i) => (
                          <span key={i} className="px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Tabs.Content>

            <Tabs.Content value="strongest" className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Transit</th>
                      <th className="px-4 py-2 text-left">Orb</th>
                      <th className="px-4 py-2 text-left">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transitResult.transits.strongest_transits.map((transit, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 border-b border-cosmic-gold/20">{transit.date}</td>
                        <td className="px-4 py-2 border-b border-cosmic-gold/20">
                          <span className={`text-${getAspectColor(transit.aspect)} font-bold`}>
                            {formatPlanet(transit.transit_planet)} {transit.aspect} {formatPlanet(transit.natal_planet)}
                          </span>
                        </td>
                        <td className="px-4 py-2 border-b border-cosmic-gold/20">{transit.orb.toFixed(1)}° {transit.applying ? '(Applying)' : '(Separating)'}</td>
                        <td className="px-4 py-2 border-b border-cosmic-gold/20 text-cosmic-silver">{transit.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Tabs.Content>

            <Tabs.Content value="active_days" className="p-4">
              <div className="cosmic-card">
                <div className="p-4">
                  <Accordion.Root type="single" collapsible>
                    {transitResult.transits.most_active_days.map((day, index) => (
                      <Accordion.Item value={index.toString()} key={index}>
                        <Accordion.Trigger className="flex justify-between w-full">
                          <span className="font-bold">{day.date}</span>
                          <span className="px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple">
                            {day.transit_count} transits
                          </span>
                          <Accordion.Icon />
                        </Accordion.Trigger>
                        <Accordion.Content className="pb-4">
                          <div className="flex flex-col space-y-2">
                            {day.transits.map((transit, i) => (
                              <div key={i} className="p-2 rounded-md bg-gray-50">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-semibold">
                                    {formatPlanet(transit.transit_planet)} {transit.aspect} {formatPlanet(transit.natal_planet)}
                                  </span>
                                  <span className={`bg-${getAspectColor(transit.aspect)} text-white px-2 py-1 rounded text-sm`}>
                                    {transit.orb.toFixed(1)}°
                                  </span>
                                </div>
                                <p className="mb-1 text-xs text-white/80">
                                  Exactness: {transit.exactness}%
                                </p>
                                <p className="text-sm text-cosmic-silver">
                                  {transit.interpretation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </Accordion.Content>
                      </Accordion.Item>
                    ))}
                  </Accordion.Root>
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="lunar" className="p-4">
              <div className="cosmic-card">
                <div className="p-4">
                  {lunarTransits ? (
                    <div className="flex flex-col space-y-4">
                      <p className="text-cosmic-silver">{lunarTransits.summary}</p>
                      
                      {lunarTransits.moon_transits && lunarTransits.moon_transits.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full table-auto">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left">Date & Time</th>
                                <th className="px-4 py-2 text-left">Aspect</th>
                                <th className="px-4 py-2 text-left">Interpretation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lunarTransits.moon_transits.slice(0, 20).map((transit: any, index: number) => (
                                <tr key={index}>
                                  <td className="px-4 py-2 border-b border-cosmic-gold/20">{new Date(transit.datetime).toLocaleString()}</td>
                                  <td className="px-4 py-2 border-b border-cosmic-gold/20">
                                    <span className="px-2 py-1 text-sm text-blue-500 rounded bg-blue-500/20">
                                      Moon {transit.aspect} {formatPlanet(transit.natal_planet)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2 border-b border-cosmic-gold/20 text-cosmic-silver">{transit.interpretation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-cosmic-silver">No significant lunar transits found in this period.</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <p className="text-cosmic-silver">
                        Lunar transits show emotional timing and daily rhythms. Click "Lunar Transits" above to calculate.
                      </p>
                      {loadingLunar && (
                        <div className="flex items-center space-x-2">
                          <div className="text-purple-500 animate-spin">⭐</div>
                          <p className="text-cosmic-silver">Calculating lunar cycles...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        )}
      </div>
    </FeatureGuard>
  );
};

export default TransitAnalysis;