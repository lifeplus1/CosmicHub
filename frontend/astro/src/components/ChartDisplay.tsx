import React, { memo, useMemo, useCallback } from "react";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ToastProvider';
import * as Accordion from '@radix-ui/react-accordion';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { ChartData } from '../types';

interface ExtendedChartData extends ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
  [key: string]: unknown;
}

// Type aliases for component use
type PlanetData = NonNullable<ChartData['planets']>[string];
type HouseData = ChartData['houses'][number];
type AspectData = ChartData['aspects'][number];

interface ChartDisplayProps {
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
const getZodiacSign = (position: number): { name: string; symbol: string; color: string; element: string } => {
  if (typeof position !== 'number' || isNaN(position)) return { name: "Unknown", symbol: "?", color: "gray-500", element: "Unknown" };
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

const getSignDescription = (signName: string): string => {
  const descriptions: Record<string, string> = {
    "Aries": "Bold, pioneering, and energetic. Natural leaders who initiate action and embrace new challenges.",
    "Taurus": "Stable, practical, and sensual. Values security, comfort, and the finer things in life.",
    "Gemini": "Curious, adaptable, and communicative. Quick-thinking and enjoys variety and mental stimulation.",
    "Cancer": "Nurturing, intuitive, and protective. Deeply emotional with strong connections to home and family.",
    "Leo": "Confident, creative, and dramatic. Natural performers who enjoy being in the spotlight and inspiring others.",
    "Virgo": "Analytical, helpful, and perfectionist. Detail-oriented with a desire to improve and serve others.",
    "Libra": "Harmonious, diplomatic, and artistic. Seeks balance, beauty, and fair partnerships in all areas of life.",
    "Scorpio": "Intense, transformative, and mysterious. Deep emotional nature with powerful intuition and magnetic presence.",
    "Sagittarius": "Adventurous, philosophical, and optimistic. Loves freedom, travel, and exploring new ideas and cultures.",
    "Capricorn": "Ambitious, disciplined, and practical. Goal-oriented with strong work ethic and respect for tradition.",
    "Aquarius": "Independent, innovative, and humanitarian. Forward-thinking with unique perspectives and social consciousness.",
    "Pisces": "Compassionate, imaginative, and spiritual. Highly intuitive with deep empathy and artistic sensibilities."
  };
  return descriptions[signName] || `${signName} brings its unique energetic qualities to this planetary placement.`;
};

const getHouseDescription = (houseNumber: number): string => {
  const descriptions: Record<number, string> = {
    1: "Identity & Self - Your personality, appearance, and how you approach life. Your natural instincts and first impressions.",
    2: "Values & Resources - Your money, possessions, self-worth, and personal values. What you value and how you earn.",
    3: "Communication & Learning - Your communication style, siblings, short trips, and everyday learning. Local environment.",
    4: "Home & Family - Your roots, family, home, and emotional foundation. Your private life and sense of security.",
    5: "Creativity & Romance - Your creative expression, children, romance, and fun. What brings you joy and self-expression.",
    6: "Health & Service - Your daily routines, work, health, and service to others. Your approach to wellness and duty.",
    7: "Partnerships & Marriage - Your close relationships, marriage, and business partnerships. How you relate to others.",
    8: "Transformation & Shared Resources - Death, rebirth, shared money, and psychological transformation. Deep change.",
    9: "Philosophy & Higher Learning - Your beliefs, higher education, long-distance travel, and spiritual quest for meaning.",
    10: "Career & Reputation - Your public image, career, status, and life direction. Your professional identity and goals.",
    11: "Friends & Groups - Your friendships, social groups, hopes, and dreams. Your place in the collective and aspirations.",
    12: "Spirituality & Subconscious - Your spiritual life, hidden enemies, subconscious patterns, and connection to the divine."
  };
  return descriptions[houseNumber] || `House ${houseNumber} represents a specific area of life experience in astrology.`;
};

// Memoized planet row component
const PlanetRow = memo(({ point, data, houses }: { 
  point: string; 
  data: PlanetData; 
  houses: HouseData[] 
}) => {
  const sign = getZodiacSign(data.position);
  const house = getHouseForPlanet(data.position, houses);
  
  const getPlanetDescription = (planetName: string): string => {
    const descriptions: Record<string, string> = {
      sun: "Your core identity, ego, and life purpose. Represents your essential self and vitality.",
      moon: "Your emotions, instincts, and subconscious patterns. How you feel and react emotionally.",
      mercury: "Communication, thinking, and learning style. How you process and share information.",
      venus: "Love, beauty, values, and relationships. What you find attractive and how you express affection.",
      mars: "Action, desire, and energy. Your drive, ambition, and how you pursue goals.",
      jupiter: "Growth, wisdom, and expansion. Your beliefs, optimism, and areas of natural luck.",
      saturn: "Structure, discipline, and life lessons. Your responsibilities and areas of growth through challenge.",
      uranus: "Innovation, rebellion, and sudden change. Your unique qualities and need for freedom.",
      neptune: "Dreams, spirituality, and illusion. Your imagination, intuition, and connection to the divine.",
      pluto: "Transformation, power, and regeneration. Deep psychological patterns and areas of rebirth.",
      north_node: "Your soul's purpose and karmic direction. The qualities you're developing in this lifetime.",
      south_node: "Past-life talents and karmic patterns. Natural abilities you're already comfortable with.",
      chiron: "The wounded healer. Areas of deep healing and where you can help others through your experience.",
      ascendant: "Your rising sign and how others perceive you. Your approach to life and first impressions.",
      midheaven: "Your public image and career direction. Your reputation and life goals.",
      ic: "Your roots and foundation. Family background and emotional security needs.",
      descendant: "Your approach to partnerships and what you seek in others."
    };
    return descriptions[planetName.toLowerCase()] || `${planetName} represents specific astrological influences in your chart.`;
  };
  
  return (
    <tr>
      <td className="border-b border-cosmic-gold/20 py-2 px-4">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className="flex items-center space-x-2 cursor-help">
                <span className={`text-xl text-${sign.color}`}>{planetSymbols[point] || "⭐"}</span>
                <span className="font-bold text-cosmic-silver">{point.charAt(0).toUpperCase() + point.slice(1).replace('_', ' ')}</span>
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="cosmic-card max-w-xs p-3 text-sm text-cosmic-silver border border-cosmic-gold/30 rounded-lg shadow-lg z-50"
                sideOffset={5}
              >
                {getPlanetDescription(point)}
                <Tooltip.Arrow className="fill-cosmic-dark" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </td>
      <td className="border-b border-cosmic-gold/20 py-2 px-4">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className="flex items-center space-x-2 cursor-help">
                <span className={`text-lg text-${sign.color}`}>{sign.symbol}</span>
                <div className="flex flex-col">
                  <span className="font-bold text-cosmic-silver">{sign.name}</span>
                  <span className="text-sm text-cosmic-silver/80 font-medium">{formatDegree(data.position)}</span>
                </div>
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="cosmic-card max-w-xs p-3 text-sm text-cosmic-silver border border-cosmic-gold/30 rounded-lg shadow-lg z-50"
                sideOffset={5}
              >
                <div className="space-y-1">
                  <div className="font-bold text-cosmic-gold">{sign.name} ({sign.element} Sign)</div>
                  <div>{getSignDescription(sign.name)}</div>
                </div>
                <Tooltip.Arrow className="fill-cosmic-dark" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </td>
      <td className="border-b border-cosmic-gold/20 py-2 px-4">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span className="bg-cosmic-purple/20 text-cosmic-purple px-2 py-1 rounded text-sm cursor-help">
                House {house}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="cosmic-card max-w-xs p-3 text-sm text-cosmic-silver border border-cosmic-gold/30 rounded-lg shadow-lg z-50"
                sideOffset={5}
              >
                <div className="space-y-1">
                  <div className="font-bold text-cosmic-gold">House {house}</div>
                  <div>{getHouseDescription(house)}</div>
                </div>
                <Tooltip.Arrow className="fill-cosmic-dark" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </td>
      <td className="border-b border-cosmic-gold/20 py-2 px-4">
        {data.retrograde ? (
          <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">℞</span>
        ) : (
          <span className="text-cosmic-silver/80 font-bold">—</span>
        )}
      </td>
    </tr>
  );
});

PlanetRow.displayName = 'PlanetRow';

// Memoized aspect row component
const AspectRow = memo(({ aspect }: { aspect: AspectData }) => {
  const getAspectColor = (aspectType: string): string => {
    switch (aspectType.toLowerCase()) {
      case 'conjunction': return 'red-500';
      case 'opposition': return 'blue-500';
      case 'trine': return 'green-500';
      case 'square': return 'orange-500';
      case 'sextile': return 'purple-500';
      default: return 'gray-500';
    }
  };

  const getAspectSymbol = (aspectType: string): string => {
    switch (aspectType.toLowerCase()) {
      case 'conjunction': return '☌';
      case 'opposition': return '☍';
      case 'trine': return '△';
      case 'square': return '□';
      case 'sextile': return '⚹';
      default: return '—';
    }
  };

  const getAspectDescription = (aspectType: string): string => {
    const descriptions: Record<string, string> = {
      conjunction: "Union and blending of planetary energies. Intensifies and combines the qualities of both planets.",
      opposition: "Tension and balance between opposing forces. Creates awareness through contrast and the need for integration.",
      trine: "Harmonious flow of energy. Natural talents and easy expression of planetary qualities working together.",
      square: "Dynamic tension and challenge. Creates motivation for growth through overcoming obstacles and friction.",
      sextile: "Opportunity and cooperation. Supportive energy that can be activated through conscious effort and awareness.",
      semisquare: "Minor tension aspect creating mild friction that motivates action and adjustment.",
      sesquiquadrate: "Minor challenging aspect that creates restlessness and the need for refinement.",
      quincunx: "Adjustment aspect requiring adaptation and flexibility to integrate different energies."
    };
    return descriptions[aspectType.toLowerCase()] || `${aspectType} represents a specific angular relationship between planets.`;
  };

  const aspectColor = getAspectColor(aspect.aspect);

  return (
    <tr>
      <td className="border-b border-cosmic-gold/20 py-2 px-4">
        <div className="flex items-center space-x-2">
          <span className="text-cosmic-silver font-bold">{planetSymbols[aspect.point1] || aspect.point1}</span>
          <span className="font-bold text-cosmic-silver">{aspect.point1.replace('_', ' ')}</span>
        </div>
      </td>
      <td className="border-b border-cosmic-gold/20 py-2 px-4">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div className="flex items-center space-x-2 cursor-help">
                <span className={`text-lg text-${aspectColor}`}>{getAspectSymbol(aspect.aspect)}</span>
                <span className={`font-bold text-${aspectColor}`}>{aspect.aspect}</span>
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="cosmic-card max-w-xs p-3 text-sm text-cosmic-silver border border-cosmic-gold/30 rounded-lg shadow-lg z-50"
                sideOffset={5}
              >
                <div className="space-y-1">
                  <div className="font-bold text-cosmic-gold">{aspect.aspect}</div>
                  <div>{getAspectDescription(aspect.aspect)}</div>
                </div>
                <Tooltip.Arrow className="fill-cosmic-dark" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </td>
      <td className="border-b border-cosmic-gold/20 py-2 px-4">
        <div className="flex items-center space-x-2">
          <span className="text-cosmic-silver font-bold">{planetSymbols[aspect.point2] || aspect.point2}</span>
          <span className="font-bold text-cosmic-silver">{aspect.point2.replace('_', ' ')}</span>
        </div>
      </td>
      <td className="border-b border-cosmic-gold/20 py-2 px-4">
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

  const handleSaveChart = useCallback(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save your chart',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    onSaveChart?.();
  }, [user, onSaveChart, toast]);

  // Loading state
  if (loading) {
    return (
      <div className="mt-6 cosmic-card p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin text-purple-500 text-4xl mx-auto">⭐</div>
          <p className="text-lg text-white/80 font-medium">Calculating your natal chart...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!chart) {
    return (
      <div className="mt-6 cosmic-card p-6">
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-md flex space-x-4">
          <span className="text-red-500 text-xl">⚠️</span>
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
          <div className="space-y-6 mb-8">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-bold text-cosmic-gold text-center">
                🌟 Your Natal Chart
              </h2>
              
              {/* Chart Information */}
              <div className="cosmic-card bg-purple-50/10 p-4 lg:p-6 rounded-xl border border-purple-300/30">
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-center gap-4 lg:gap-8 text-sm lg:text-base">
                    <p className="text-cosmic-silver font-semibold">
                      <strong>Latitude:</strong> {chartInfo?.latitude}°
                    </p>
                    <p className="text-cosmic-silver font-semibold">
                      <strong>Longitude:</strong> {chartInfo?.longitude}°
                    </p>
                    <p className="text-cosmic-silver font-semibold">
                      <strong>Timezone:</strong> {chartInfo?.timezone}
                    </p>
                  </div>
                  <p className="text-cosmic-silver text-sm text-center opacity-80">
                    Julian Day: {chartInfo?.julianDay}
                  </p>
                </div>
              </div>

              {/* Save Chart Button */}
              {user && onSaveChart && (
                <div className="flex justify-center">
                  <button
                    className="cosmic-button text-lg"
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
            <Accordion.Item value="0" className="cosmic-card border-purple-300/30 rounded-xl overflow-hidden">
              <Accordion.Trigger className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-300 p-4 lg:p-6 w-full flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🪐</span>
                  <span className="text-lg lg:text-xl font-bold text-cosmic-silver mb-0">
                    Planets ({planetEntries.length})
                  </span>
                </div>
                <span className="text-cosmic-silver text-xl">▼</span>
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                {planetEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr>
                          <th className="min-w-32 py-2 px-4 text-left">Planet</th>
                          <th className="min-w-40 py-2 px-4 text-left">Sign & Position</th>
                          <th className="min-w-24 py-2 px-4 text-left">House</th>
                          <th className="min-w-20 py-2 px-4 text-left">Motion</th>
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
                    <div className="bg-yellow-900/50 border border-yellow-500 p-4 rounded-md flex space-x-4">
                      <span className="text-yellow-500 text-xl">⚠️</span>
                      <p className="text-white/80">No planet data available</p>
                    </div>
                  </div>
                )}
              </Accordion.Content>
            </Accordion.Item>

            {/* Houses Section */}
            <Accordion.Item value="1" className="cosmic-card border-purple-300/30 rounded-xl overflow-hidden">
              <Accordion.Trigger className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-300 p-4 lg:p-6 w-full flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏠</span>
                  <span className="text-lg lg:text-xl font-bold text-cosmic-silver mb-0">
                    Houses ({chart.houses?.length || 0})
                  </span>
                </div>
                <span className="text-cosmic-silver text-xl">▼</span>
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="min-w-24 py-2 px-4 text-left">House</th>
                        <th className="min-w-40 py-2 px-4 text-left">Cusp Sign</th>
                        <th className="min-w-32 py-2 px-4 text-left">Degree</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(chart.houses || []).map((house, index) => {
                        const sign = getZodiacSign(house.cusp);
                        return (
                          <tr key={index}>
                            <td className="border-b border-cosmic-gold/20 py-2 px-4">
                              <span className="bg-cosmic-purple text-white px-2 py-1 rounded text-sm">House {house.house}</span>
                            </td>
                            <td className="border-b border-cosmic-gold/20 py-2 px-4">
                              <div className="flex items-center space-x-2">
                                <span className={`text-lg text-${sign.color}`}>{sign.symbol}</span>
                                <span className="font-semibold text-white">{sign.name}</span>
                              </div>
                            </td>
                            <td className="border-b border-cosmic-gold/20 py-2 px-4 text-white/80 font-mono">
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
            <Accordion.Item value="2" className="cosmic-card border-purple-300/30 rounded-xl overflow-hidden">
              <Accordion.Trigger className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-300 p-4 lg:p-6 w-full flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📐</span>
                  <span className="text-lg lg:text-xl font-bold text-cosmic-silver mb-0">
                    Angles ({Object.keys(chart.angles || {}).length})
                  </span>
                </div>
                <span className="text-cosmic-silver text-xl">▼</span>
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="min-w-32 py-2 px-4 text-left">Angle</th>
                        <th className="min-w-32 py-2 px-4 text-left">Sign</th>
                        <th className="min-w-32 py-2 px-4 text-left">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(chart.angles || {}).map(([angle, degree]) => {
                        const sign = getZodiacSign(degree);
                        return (
                          <tr key={angle}>
                            <td className="border-b border-cosmic-gold/20 py-2 px-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg text-amber-400">
                                  {planetSymbols[angle] || "⭐"}
                                </span>
                                <span className="font-semibold text-white">
                                  {angle.toUpperCase().replace('_', ' ')}
                                </span>
                              </div>
                            </td>
                            <td className="border-b border-cosmic-gold/20 py-2 px-4">
                              <div className="flex items-center space-x-2">
                                <span className={`text-lg text-${sign.color}`}>
                                  {sign.symbol}
                                </span>
                                <span className="text-white">{sign.name}</span>
                              </div>
                            </td>
                            <td className="border-b border-cosmic-gold/20 py-2 px-4 text-white/80 font-mono">
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
            <Accordion.Item value="3" className="cosmic-card border-purple-300/30 rounded-xl overflow-hidden">
              <Accordion.Trigger className="bg-purple-500/20 hover:bg-purple-500/30 transition-colors duration-300 p-4 lg:p-6 w-full flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚹</span>
                  <span className="text-lg lg:text-xl font-bold text-cosmic-silver mb-0">
                    Major Aspects ({aspectEntries.length})
                  </span>
                </div>
                <span className="text-cosmic-silver text-xl">▼</span>
              </Accordion.Trigger>
              <Accordion.Content className="p-0">
                {aspectEntries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr>
                          <th className="min-w-32 py-2 px-4 text-left">Planet 1</th>
                          <th className="min-w-32 py-2 px-4 text-left">Aspect</th>
                          <th className="min-w-32 py-2 px-4 text-left">Planet 2</th>
                          <th className="min-w-24 py-2 px-4 text-left">Orb</th>
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
                    <div className="bg-blue-900/50 border border-blue-500 p-4 rounded-md flex space-x-4">
                      <span className="text-blue-500 text-xl">ℹ️</span>
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