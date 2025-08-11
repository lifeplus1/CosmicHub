import React, { memo, useMemo, useCallback } from "react";
import { useAuth } from '@cosmichub/auth';
import { useToast } from './ToastProvider';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import type { ChartData } from '../types';

interface ExtendedChartData extends ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
  [key: string]: any;
}

// Type aliases for component use
type PlanetData = NonNullable<ChartData['planets']>[string];
type HouseData = ChartData['houses'][number];
type AspectData = ChartData['aspects'][number];

export interface ChartDisplayProps {
  chart: ExtendedChartData | null;
  onSaveChart?: () => void;
  loading?: boolean;
}

// Enhanced planet symbols with better Unicode support
const planetSymbols: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
  ascendant: "AC",
  midheaven: "MC",
  mc: "MC",
  ic: "IC",
  descendant: "DC",
  north_node: "☊",
  south_node: "☋",
  chiron: "⚷",
  ceres: "⚳",
  pallas: "⚴",
  juno: "⚵",
  vesta: "⚶",
  lilith: "⚸",
  vertex: "Vx",
  antivertex: "AVx",
  part_of_fortune: "⊗"
};

// Zodiac signs with symbols and colors
const zodiacSigns = [
  { name: "Aries", symbol: "♈", color: "red-500", element: "Fire" },
  { name: "Taurus", symbol: "♉", color: "green-500", element: "Earth" },
  { name: "Gemini", symbol: "♊", color: "yellow-500", element: "Air" },
  { name: "Cancer", symbol: "♋", color: "blue-500", element: "Water" },
  { name: "Leo", symbol: "♌", color: "orange-500", element: "Fire" },
  { name: "Virgo", symbol: "♍", color: "green-600", element: "Earth" },
  { name: "Libra", symbol: "♎", color: "pink-500", element: "Air" },
  { name: "Scorpio", symbol: "♏", color: "red-700", element: "Water" },
  { name: "Sagittarius", symbol: "♐", color: "purple-500", element: "Fire" },
  { name: "Capricorn", symbol: "♑", color: "gray-600", element: "Earth" },
  { name: "Aquarius", symbol: "♒", color: "cyan-500", element: "Air" },
  { name: "Pisces", symbol: "♓", color: "blue-400", element: "Water" }
];

// Memoized functions for better performance
const getZodiacSign = (position: number) => {
  if (typeof position !== 'number' || isNaN(position)) return { name: "Unknown", symbol: "?", color: "gray-500" };
  const index = Math.floor(position / 30);
  return zodiacSigns[index] || zodiacSigns[0];
};

const getHouseForPlanet = (position: number, houses: HouseData[]): number => {
  if (!houses || houses.length === 0) return 1;
  
  for (let i = 0; i < houses.length; i++) {
    const start = houses[i].cusp;
    const end = houses[(i + 1) % houses.length].cusp;
    if (start < end) {
      if (position >= start && position < end) return i + 1;
    } else {
      if (position >= start || position < end) return i + 1;
    }
  }
  return 1;
};

const formatDegree = (degree: number): string => {
  if (typeof degree !== 'number' || isNaN(degree)) return "—";
  const sign = getZodiacSign(degree);
  const degreeInSign = Math.floor(degree % 30);
  const minutes = Math.floor((degree % 1) * 60);
  return `${degreeInSign}°${minutes.toString().padStart(2, '0')}' ${sign.symbol}`;
};

// Memoized planet row component
const PlanetRow = memo(({ point, data, houses }: { 
  point: string; 
  data: PlanetData; 
  houses: HouseData[] 
}) => {
  const sign = getZodiacSign(data.position);
  const house = getHouseForPlanet(data.position, houses);
  
  return (
    <tr>
      <td className="px-4 py-2 border-b border-cosmic-gold/20">
        <div className="flex items-center space-x-2">
          <span className={`text-xl text-${sign.color}`}>{planetSymbols[point] || "⭐"}</span>
          <span className="font-bold text-cosmic-silver">{point.charAt(0).toUpperCase() + point.slice(1).replace('_', ' ')}</span>
        </div>
      </td>
      <td className="px-4 py-2 border-b border-cosmic-gold/20">
        <div className="flex items-center space-x-2">
          <span className={`text-lg text-${sign.color}`}>{sign.symbol}</span>
          <div className="flex flex-col">
            <span className="font-bold text-cosmic-silver">{sign.name}</span>
            <span className="text-sm font-medium text-cosmic-silver/80">{formatDegree(data.position)}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-2 border-b border-cosmic-gold/20">
        <span className="px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple">House {house}</span>
      </td>
      <td className="px-4 py-2 border-b border-cosmic-gold/20">
        {data.retrograde ? (
          <span className="px-2 py-1 text-sm text-white bg-red-500 rounded">℞</span>
        ) : (
          <span className="font-bold text-cosmic-silver/80">—</span>
        )}
      </td>
    </tr>
  );
});

PlanetRow.displayName = 'PlanetRow';

// Memoized aspect row component
const AspectRow = memo(({ aspect }: { aspect: AspectData }) => {
  const getAspectColor = (aspectType: string) => {
    switch (aspectType.toLowerCase()) {
      case 'conjunction': return 'red-500';
      case 'opposition': return 'blue-500';
      case 'trine': return 'green-500';
      case 'square': return 'orange-500';
      case 'sextile': return 'purple-500';
      default: return 'gray-500';
    }
  };

  const getAspectSymbol = (aspectType: string) => {
    switch (aspectType.toLowerCase()) {
      case 'conjunction': return '☌';
      case 'opposition': return '☍';
      case 'trine': return '△';
      case 'square': return '□';
      case 'sextile': return '⚹';
      default: return '—';
    }
  };

  const aspectColor = getAspectColor(aspect.aspect);

  return (
    <tr>
      <td className="px-4 py-2 border-b border-cosmic-gold/20">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-cosmic-silver">{planetSymbols[aspect.point1] || aspect.point1}</span>
          <span className="font-bold text-cosmic-silver">{aspect.point1.replace('_', ' ')}</span>
        </div>
      </td>
      <td className="px-4 py-2 border-b border-cosmic-gold/20">
        <div className="flex items-center space-x-2">
          <span className={`text-lg text-${aspectColor}`}>{getAspectSymbol(aspect.aspect)}</span>
          <span className={`font-bold text-${aspectColor}`}>{aspect.aspect}</span>
        </div>
      </td>
      <td className="px-4 py-2 border-b border-cosmic-gold/20">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-cosmic-silver">{planetSymbols[aspect.point2] || aspect.point2}</span>
          <span className="font-bold text-cosmic-silver">{aspect.point2.replace('_', ' ')}</span>
        </div>
      </td>
      <td className="px-4 py-2 border-b border-cosmic-gold/20">
        <span 
          className={`${
            aspect.orb < 2 ? 'bg-green-500 text-white' : 'bg-cosmic-purple/20 text-cosmic-purple'
          } px-2 py-1 rounded text-sm`}
        >
          {aspect.orb.toFixed(2)}°
        </span>
      </td>
    </tr>
  );
});

AspectRow.displayName = 'AspectRow';

const ChartDisplay: React.FC<ChartDisplayProps> = memo(({ 
  chart, 
  onSaveChart, 
  loading = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Memoized computations
  const chartInfo = useMemo(() => {
    if (!chart) return null;
    
    console.log('🔍 ChartDisplay - chart object:', {
      hasChart: !!chart,
      latitude: chart.latitude,
      latitudeType: typeof chart.latitude,
      longitude: chart.longitude,
      longitudeType: typeof chart.longitude,
      timezone: chart.timezone,
      timezoneType: typeof chart.timezone,
      julian_day: chart.julian_day,
      allKeys: Object.keys(chart)
    });
    
    return {
      latitude: typeof chart.latitude === 'number' && !isNaN(chart.latitude) ? chart.latitude.toFixed(4) : 'N/A',
      longitude: typeof chart.longitude === 'number' && !isNaN(chart.longitude) ? chart.longitude.toFixed(4) : 'N/A',
      timezone: chart.timezone || 'Unknown',
      julianDay: chart.julian_day ? chart.julian_day.toFixed(4) : 'N/A'
    };
  }, [chart]);

  const planetEntries = useMemo(() => {
    if (!chart?.planets) return [];
    return Object.entries(chart.planets).sort(([a], [b]) => {
      const order = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
      return (order.indexOf(a) !== -1 ? order.indexOf(a) : 999) - (order.indexOf(b) !== -1 ? order.indexOf(b) : 999);
    });
  }, [chart?.planets]);

  const aspectEntries = useMemo(() => {
    if (!chart?.aspects) return [];
    return chart.aspects.filter(aspect => aspect.orb <= 8); // Only show tight aspects
  }, [chart?.aspects]);

  const houseEntries = useMemo(() => {
    if (!chart?.houses) return [];
    return chart.houses;
  }, [chart?.houses]);

  const handleSaveChart = useCallback(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save your chart',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onSaveChart?.();
  }, [user, onSaveChart, toast]);

  // Loading state
  if (loading) {
    return (
      <div className="p-8 mt-6 cosmic-card">
        <div className="space-y-4 text-center">
          <div className="mx-auto text-4xl text-purple-500 animate-spin">⭐</div>
          <p className="text-lg font-medium text-white/80">Calculating your natal chart...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!chart) {
    return (
      <div className="p-6 mt-6 cosmic-card">
        <div className="flex p-4 space-x-4 border border-red-500 rounded-md bg-red-900/50">
          <span className="text-xl text-red-500">⚠️</span>
          <div>
            <h3 className="font-bold text-white">No Chart Data Available</h3>
            <p className="text-white/80">Please enter your birth information and calculate your chart.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6" data-testid="chart-display">
      <div className="cosmic-card rounded-2xl">
        <div className="p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-8 space-y-6">
            <div className="space-y-4 text-center">
              <h2 className="text-lg font-bold text-center text-cosmic-gold">
                🌟 Your Natal Chart
              </h2>
              
              {/* Chart Information */}
              <div className="p-4 border cosmic-card bg-purple-50/10 lg:p-6 rounded-xl border-purple-300/30">
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-center gap-4 text-sm lg:gap-8 lg:text-base">
                    <p className="font-semibold text-cosmic-silver">
                      <strong>Latitude:</strong> {chartInfo?.latitude}°
                    </p>
                    <p className="font-semibold text-cosmic-silver">
                      <strong>Longitude:</strong> {chartInfo?.longitude}°
                    </p>
                    <p className="font-semibold text-cosmic-silver">
                      <strong>Timezone:</strong> {chartInfo?.timezone}
                    </p>
                  </div>
                  <p className="text-sm text-center text-cosmic-silver opacity-80">
                    Julian Day: {chartInfo?.julianDay}
                  </p>
                </div>
              </div>

              {/* Save Chart Button */}
              {user && onSaveChart && (
                <div className="flex justify-center">
                  <button
                    className="text-lg cosmic-button"
                    onClick={handleSaveChart}
                  >
                    💾 Save Chart
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chart Sections */}
          <Accordion.Root className="space-y-6" type="multiple" defaultValue={['0']}>
            {/* Planets Section */}
            <Accordion.Item value="0" className="overflow-hidden cosmic-card border-purple-300/30 rounded-xl">
              <Accordion.Trigger className="flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🪐</span>
                  <span className="mb-0 text-lg font-bold lg:text-xl text-cosmic-silver">
                    Planets ({planetEntries.length})
                  </span>
                </div>
                <ChevronDownIcon className="h-4 w-4" />
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                {planetEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left min-w-32">Planet</th>
                          <th className="px-4 py-2 text-left min-w-40">Sign & Position</th>
                          <th className="px-4 py-2 text-left min-w-24">House</th>
                          <th className="px-4 py-2 text-left min-w-20">Motion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planetEntries.map(([point, data]) => (
                          <PlanetRow 
                            key={point} 
                            point={point} 
                            data={data} 
                            houses={chart.houses}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex p-4 space-x-4 border border-yellow-500 rounded-md bg-yellow-900/50">
                      <span className="text-xl text-yellow-500">⚠️</span>
                      <p className="text-white/80">No planet data available</p>
                    </div>
                  </div>
                )}
              </Accordion.Content>
            </Accordion.Item>

            {/* Houses Section */}
            <Accordion.Item value="1" className="overflow-hidden cosmic-card border-purple-300/30 rounded-xl">
              <Accordion.Trigger className="flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏠</span>
                                    <span className="mb-0 text-lg font-bold lg:text-xl text-cosmic-silver">
                    Houses ({houseEntries.length})
                  </span>
                </div>
                <ChevronDownIcon className="h-4 w-4" />
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left min-w-24">House</th>
                        <th className="px-4 py-2 text-left min-w-40">Cusp Sign</th>
                        <th className="px-4 py-2 text-left min-w-32">Degree</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(chart.houses || []).map((house, index) => {
                        const sign = getZodiacSign(house.cusp);
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 border-b border-cosmic-gold/20">
                              <span className="px-2 py-1 text-sm text-white rounded bg-cosmic-purple">House {house.house}</span>
                            </td>
                            <td className="px-4 py-2 border-b border-cosmic-gold/20">
                              <div className="flex items-center space-x-2">
                                <span className={`text-lg text-${sign.color}`}>{sign.symbol}</span>
                                <span className="font-semibold text-white">{sign.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 font-mono border-b border-cosmic-gold/20 text-white/80">
                              {formatDegree(house.cusp)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Accordion.Content>
            </Accordion.Item>

            {/* Angles Section */}
            <Accordion.Item value="2" className="overflow-hidden cosmic-card border-purple-300/30 rounded-xl">
              <Accordion.Trigger className="flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📐</span>
                  <span className="mb-0 text-lg font-bold lg:text-xl text-cosmic-silver">
                    Angles ({Object.keys(chart.angles || {}).length})
                  </span>
                </div>
                <ChevronDownIcon className="w-5 h-5 transition-transform duration-300 group-radix-state-open:rotate-180" />
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left min-w-32">Angle</th>
                        <th className="px-4 py-2 text-left min-w-32">Sign</th>
                        <th className="px-4 py-2 text-left min-w-32">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(chart.angles || {}).map(([angle, degree]) => {
                        const sign = getZodiacSign(degree);
                        return (
                          <tr key={angle}>
                            <td className="px-4 py-2 border-b border-cosmic-gold/20">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg text-amber-400">
                                  {planetSymbols[angle] || "⭐"}
                                </span>
                                <span className="font-semibold text-white">
                                  {angle.toUpperCase().replace('_', ' ')}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 border-b border-cosmic-gold/20">
                              <div className="flex items-center space-x-2">
                                <span className={`text-lg text-${sign.color}`}>
                                  {sign.symbol}
                                </span>
                                <span className="text-white">{sign.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 font-mono border-b border-cosmic-gold/20 text-white/80">
                              {formatDegree(degree)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Accordion.Content>
            </Accordion.Item>

            {/* Aspects Section */}
            <Accordion.Item value="3" className="overflow-hidden cosmic-card border-purple-300/30 rounded-xl">
              <Accordion.Trigger className="flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚹</span>
                  <span className="mb-0 text-lg font-bold lg:text-xl text-cosmic-silver">
                    Major Aspects ({aspectEntries.length})
                  </span>
                </div>
                <ChevronDownIcon className="w-5 h-5 transition-transform duration-300 group-radix-state-open:rotate-180" />
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                {aspectEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left min-w-32">Planet 1</th>
                          <th className="px-4 py-2 text-left min-w-32">Aspect</th>
                          <th className="px-4 py-2 text-left min-w-32">Planet 2</th>
                          <th className="px-4 py-2 text-left min-w-24">Orb</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aspectEntries.map((aspect, index) => (
                          <AspectRow key={index} aspect={aspect} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex p-4 space-x-4 border border-blue-500 rounded-md bg-blue-900/50">
                      <span className="text-xl text-blue-500">ℹ️</span>
                      <p className="text-white/80">No major aspects found within 8° orb</p>
                    </div>
                  </div>
                )}
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
});

ChartDisplay.displayName = 'ChartDisplay';

export default ChartDisplay;