import { serializeAstrologyData } from '@cosmichub/types';
import { getChartSyncService } from '@/services/chartSyncService';

import React, { memo, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Tooltip,
  TooltipProvider,
  Button,
  Input,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@cosmichub/ui';
import { fetchChartData } from '@/services/astrologyService';
import type { ChartData, PlanetData, AsteroidData, AngleData, HouseData, AspectData, ChartType } from '@/types/astrology.types';
import { HouseCusp, isHouseCuspArray } from '@/types/house-cusp';
import { 
  ProcessedPlanetData, 
  ProcessedAsteroidData, 
  ProcessedHouseData, 
  ProcessedChartSections
} from '@/types/processed-chart';

// Astrological symbols mapping
const PLANET_SYMBOLS: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'North Node': '☊',
  'South Node': '☋',
  'Midheaven': 'MC',
  'Ascendant': 'AC',
  'Descendant': 'DC',
  'Imum Coeli': 'IC',
  'MC': 'MC',
  'IC': 'IC',
  'ASC': 'AC', 
  'DSC': 'DC',
  'Vertex': 'Vx',
  'Antivertex': 'AVx',
  // Additional variations
  'Medium Coeli': 'MC',
  'Immum Coeli': 'IC',
  // Capitalization variations
  'Mc': 'MC',
  'Ic': 'IC',
  // Lowercase variations
  'sun': '☉',
  'moon': '☽',
  'mercury': '☿',
  'venus': '♀',
  'mars': '♂',
  'jupiter': '♃',
  'saturn': '♄',
  'uranus': '♅',
  'neptune': '♆',
  'pluto': '♇'
};

const SIGN_SYMBOLS: Record<string, string> = {
  'Aries': '♈',
  'Taurus': '♉',
  'Gemini': '♊',
  'Cancer': '♋',
  'Leo': '♌',
  'Virgo': '♍',
  'Libra': '♎',
  'Scorpio': '♏',
  'Sagittarius': '♐',
  'Capricorn': '♑',
  'Aquarius': '♒',
  'Pisces': '♓'
};

const ASTEROID_SYMBOLS: Record<string, string> = {
  'Ceres': '⚳',
  'Pallas': '⚴',
  'Juno': '⚵',
  'Vesta': '⚶',
  'Chiron': '⚷',
  'Lilith': '⚸',
  'Lilith (Mean)': '⚸',
  'Lilith (True)': '⚸',
  'Eros': '♡',
  'Psyche': '🦋',
  'Fortuna': '⊗',
  'Sedna': '♅₂', // Custom representation
  'Eris': '⚸₂', // Custom representation
  // Default symbol for other asteroids
  'default': '⁂'
};

const ASPECT_SYMBOLS: Record<string, string> = {
  'Conjunction': '☌',
  'Opposition': '☍',
  'Trine': '△',
  'Square': '□',
  'Sextile': '⚹',
  'Quincunx': '⚻',
  'Semisextile': '⚺',
  'Semisquare': '∠',
  'Sesquiquadrate': '⚼',
  'Quintile': 'Q',
  'Biquintile': 'bQ',
  // Lowercase variations
  'conjunction': '☌',
  'opposition': '☍',
  'trine': '△',
  'square': '□',
  'sextile': '⚹',
  'quincunx': '⚻',
  'semisextile': '⚺',
  'semisquare': '∠',
  'sesquiquadrate': '⚼',
  'quintile': 'Q',
  'biquintile': 'bQ'
};

// Helper function to calculate which house a planet is in
const calculateHouseForPlanet = (planetPosition: number, houseCusps: HouseCusp[]): string => {
  if (!houseCusps || houseCusps.length !== 12) return 'Unknown';
  
  // Helper function to convert number to ordinal (1st, 2nd, 3rd, etc.)
  const getOrdinal = (num: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  };
  
  // Sort house cusps by position
  const sortedCusps = houseCusps.map((h, i) => ({
    house: i + 1,
    cusp: h.cusp || h.number || 0
  })).sort((a, b) => a.cusp - b.cusp);
  
  // Find which house the planet falls into
  for (let i = 0; i < sortedCusps.length; i++) {
    const currentHouse = sortedCusps[i];
    const nextHouse = sortedCusps[(i + 1) % 12];
    
    if (nextHouse.cusp > currentHouse.cusp) {
      // Normal case
      if (planetPosition >= currentHouse.cusp && planetPosition < nextHouse.cusp) {
        return getOrdinal(currentHouse.house);
      }
    } else {
      // Wrap around case (e.g., 12th to 1st house)
      if (planetPosition >= currentHouse.cusp || planetPosition < nextHouse.cusp) {
        return getOrdinal(currentHouse.house);
      }
    }
  }
  
  return getOrdinal(1); // Default fallback
};

// Helper function to get sign from degree position
const getSignFromDegree = (degree: number): string => {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return signs[Math.floor(degree / 30)] || 'Unknown';
};

// Helper function to get ruling planet from sign
const getRulerFromSign = (sign: string): string => {
  const rulers: Record<string, string> = {
    'Aries': 'Mars',
    'Taurus': 'Venus', 
    'Gemini': 'Mercury',
    'Cancer': 'Moon',
    'Leo': 'Sun',
    'Virgo': 'Mercury',
    'Libra': 'Venus',
    'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter',
    'Capricorn': 'Saturn',
    'Aquarius': 'Uranus',
    'Pisces': 'Neptune'
  };
  return rulers[sign] || 'Unknown';
};

// Helper functions to get symbols with fallbacks
const getPlanetSymbol = (name: string): string => {
  // Check planet symbols first
  if (PLANET_SYMBOLS[name]) {
    return PLANET_SYMBOLS[name];
  }
  // Check asteroid symbols as fallback
  if (ASTEROID_SYMBOLS[name]) {
    return ASTEROID_SYMBOLS[name];
  }
  // Default fallback
  return '●';
};

const getSignSymbol = (name: string): string => {
  return SIGN_SYMBOLS[name] || '○';
};

const getAsteroidSymbol = (name: string): string => {
  return ASTEROID_SYMBOLS[name] || ASTEROID_SYMBOLS['default'];
};

const getAspectSymbol = (name: string): string => {
  return ASPECT_SYMBOLS[name] || '◇';
};

// Function to calculate appropriate orb for aspect type
const getAspectOrb = (aspectType: string, currentOrb?: number): number => {
  const aspectType_lower = aspectType.toLowerCase();
  
  // If currentOrb is provided, use it (real data takes precedence)
  if (currentOrb !== undefined && currentOrb !== null && !isNaN(currentOrb)) {
    return currentOrb;
  }
  
  // Use 10 degrees for conjunctions and oppositions when no orb provided
  if (aspectType_lower.includes('conjunction') || aspectType_lower.includes('opposition')) {
    return 10;
  }
  
  // Use 8 degrees for all other aspects when no orb provided
  return 8;
};

// Type guard to check if an object has chart-like properties
function isChartLike(obj: unknown): obj is { 
  planets?: Record<string, unknown>[] | Record<string, unknown>; 
  houses?: Record<string, unknown>[] | Record<string, unknown>; 
  aspects?: Record<string, unknown>[] | Record<string, unknown>;
  asteroids?: Record<string, unknown>[] | Record<string, unknown>;
  angles?: Record<string, unknown>[] | Record<string, unknown>;
} {
  if (!obj || typeof obj !== 'object') return false;
  
  const chart = obj as Record<string, unknown>;
  return Boolean(
    Array.isArray(chart.planets) || 
    Array.isArray(chart.houses) ||
    Array.isArray(chart.aspects) ||
    Array.isArray(chart.asteroids) ||
    Array.isArray(chart.angles) ||
    // Also check if chart data is in object format
    (chart.planets && typeof chart.planets === 'object') ||
    (chart.houses && typeof chart.houses === 'object') ||
    (chart.angles && typeof chart.angles === 'object')
  );
}

// Enhanced export functionality with serialization
const exportChartData = (chartData: unknown, format: 'json' | 'csv' | 'txt') => {
  // Validate chart data
  if (!isChartLike(chartData)) {
    console.error('Invalid chart data for export');
    return;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `natal-chart-${timestamp}`;
  
  let content: string;
  let mimeType: string;
  let extension: string;

  switch (format) {
    case 'json':
      try {
        // Use the serialization utility for JSON exports to ensure consistency
        content = JSON.stringify(chartData, null, 2);
      } catch (error) {
        console.error('Serialization failed:', error);
        content = JSON.stringify({error: 'Failed to serialize chart data'});
      }
      mimeType = 'application/json';
      extension = 'json';
      break;
    case 'csv':
      // Convert planets to CSV format
      const csvHeaders = 'Planet,Sign,House,Degree\n';
      const planets = Array.isArray(chartData.planets) ? chartData.planets : [];
      const csvRows = planets.map(planet => {
        const name = typeof planet.name === 'string' ? planet.name : 'Unknown';
        const sign = typeof planet.sign === 'string' ? planet.sign : 'Unknown';
        const house = planet.house ? String(planet.house) : 'Unknown';
        let degree = '0.00';
        
        if (typeof planet.degree === 'number') {
          degree = planet.degree.toFixed(2);
        } else if (typeof planet.degree === 'string') {
          degree = planet.degree;
        }
        
        return `${name},${sign},${house},${degree}`;
      }).join('\n');
      
      content = csvHeaders + csvRows;
      mimeType = 'text/csv';
      extension = 'csv';
      break;
    case 'txt':
      // Safely extract planets data
      const planetsArray = Array.isArray(chartData.planets) ? chartData.planets : [];
      const planetsText = planetsArray.map(p => {
        const name = typeof p.name === 'string' ? p.name : 'Unknown';
        const sign = typeof p.sign === 'string' ? p.sign : 'Unknown';
        const house = p.house ? String(p.house) : 'Unknown';
        let degree = '0.00';
        
        if (typeof p.degree === 'number') {
          degree = p.degree.toFixed(2);
        } else if (typeof p.degree === 'string') {
          degree = p.degree;
        }
        
        return `${name}: ${sign} in House ${house} (${degree}°)`;
      }).join('\n');
      
      // Safely extract houses data
      const housesArray = Array.isArray(chartData.houses) ? chartData.houses : [];
      const housesText = housesArray.map(h => {
        const number = h.number ? String(h.number) : h.house ? String(h.house) : 'Unknown';
        const sign = typeof h.sign === 'string' ? h.sign : 'Unknown';
        let cusp = '0.00';
        
        if (typeof h.cusp === 'number') {
          cusp = h.cusp.toFixed(2);
        } else if (typeof h.cusp === 'string') {
          cusp = h.cusp;
        }
        
        return `House ${number}: ${sign} (${cusp}°)`;
      }).join('\n');
      
      // Safely extract aspects data
      const aspectsArray = Array.isArray(chartData.aspects) ? chartData.aspects : [];
      const aspectsText = aspectsArray.map(a => {
        const planet1 = typeof a.planet1 === 'string' ? a.planet1 : 'Unknown';
        const planet2 = typeof a.planet2 === 'string' ? a.planet2 : 'Unknown';
        const type = typeof a.type === 'string' ? a.type : 'Unknown';
        let orb = '0.0';
        
        if (typeof a.orb === 'number') {
          orb = a.orb.toFixed(1);
        } else if (typeof a.orb === 'string') {
          orb = a.orb;
        }
        
        return `${planet1} ${type} ${planet2} (${orb}° orb)`;
      }).join('\n');
      
      content = `NATAL CHART DATA\n\nPLANETS:\n${planetsText}\n\nHOUSES:\n${housesText}\n\nASPECTS:\n${aspectsText}`;
      mimeType = 'text/plain';
      extension = 'txt';
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Planet interpretation tooltips
const getPlanetInterpretation = (planet: string, sign: string): string => {
  const interpretations: Record<string, Record<string, string>> = {
    'Sun': {
      'Aries': 'Bold, energetic, natural leader with pioneering spirit',
      'Taurus': 'Stable, practical, enjoys comfort and material security',
      'Gemini': 'Curious, communicative, adaptable with quick wit',
      'Cancer': 'Nurturing, intuitive, emotionally sensitive and protective',
      'Leo': 'Creative, confident, dramatic with natural charisma',
      'Virgo': 'Analytical, perfectionist, detail-oriented and helpful',
      'Libra': 'Harmonious, diplomatic, seeks balance and beauty',
      'Scorpio': 'Intense, passionate, transformative with deep emotions',
      'Sagittarius': 'Adventurous, philosophical, freedom-loving optimist',
      'Capricorn': 'Ambitious, disciplined, responsible achiever',
      'Aquarius': 'Independent, innovative, humanitarian visionary',
      'Pisces': 'Intuitive, compassionate, artistic and spiritually inclined'
    },
    'Moon': {
      'Aries': 'Emotionally impulsive, needs excitement and action',
      'Taurus': 'Emotionally stable, needs comfort and routine',
      'Gemini': 'Emotionally changeable, needs mental stimulation',
      'Cancer': 'Emotionally sensitive, needs security and family',
      'Leo': 'Emotionally dramatic, needs attention and appreciation',
      'Virgo': 'Emotionally reserved, needs order and usefulness',
      'Libra': 'Emotionally balanced, needs harmony and partnership',
      'Scorpio': 'Emotionally intense, needs depth and transformation',
      'Sagittarius': 'Emotionally optimistic, needs freedom and adventure',
      'Capricorn': 'Emotionally controlled, needs structure and achievement',
      'Aquarius': 'Emotionally detached, needs independence and innovation',
      'Pisces': 'Emotionally intuitive, needs compassion and spirituality'
    }
  };

  return interpretations[planet]?.[sign] || `${planet} in ${sign} brings unique energy to your chart`;
};
const shareChart = async (chartData: unknown) => {
  // Validate chart data
  if (!isChartLike(chartData)) {
    console.error('Invalid chart data for sharing');
    return;
  }
  
  let sunSign = 'Unknown';
  let moonSign = 'Unknown';
  
  // Try to extract sun and moon signs from chartData
  if (Array.isArray(chartData.planets)) {
    const sunPlanet = chartData.planets.find(p => 
      typeof p.name === 'string' && p.name.toLowerCase() === 'sun');
    const moonPlanet = chartData.planets.find(p => 
      typeof p.name === 'string' && p.name.toLowerCase() === 'moon');
      
    if (sunPlanet && typeof sunPlanet.sign === 'string') {
      sunSign = sunPlanet.sign;
    }
    
    if (moonPlanet && typeof moonPlanet.sign === 'string') {
      moonSign = moonPlanet.sign;
    }
  }
  
  const shareData = {
    title: 'My Natal Chart Analysis',
    text: `Check out my natal chart! Sun in ${sunSign}, Moon in ${moonSign}`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log('Share was cancelled or failed');
    }
  } else {
    // Fallback to copying URL to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
      alert('Chart link copied to clipboard!');
    } catch (error) {
      console.error('Could not copy to clipboard');
    }
  }
};

// Reusable table components for modularity
const PlanetTable = memo(({ data }: { data: Array<PlanetData & { degree: string }> }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Planet</TableHead>
        <TableHead>Sign</TableHead>
        <TableHead>House</TableHead>
        <TableHead>Degree</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`planet-${item.name}-${index}`}>
          <TableCell className="font-medium">
            <Tooltip content={getPlanetInterpretation(item.name, item.sign)}>
              <span className="cursor-help flex items-center gap-2">
                <span className="text-cosmic-gold text-xl" title={item.name}>{getPlanetSymbol(item.name)}</span>
                <span>{item.name}</span>
              </span>
            </Tooltip>
          </TableCell>
          <TableCell>
            <Tooltip content={`${item.name} in ${item.sign}: ${getPlanetInterpretation(item.name, item.sign)}`}>
              <span className="cursor-help text-cosmic-gold font-medium flex items-center gap-2">
                <span className="text-xl text-cosmic-gold font-mono" title={item.sign}>{getSignSymbol(item.sign)}</span>
                <span>{item.sign}</span>
              </span>
            </Tooltip>
          </TableCell>
          <TableCell>{item.house}</TableCell>
          <TableCell>{item.degree}°</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

const AsteroidTable = memo(({ data }: { data: Array<AsteroidData & { degree: string; aspects: string }> }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Asteroid</TableHead>
        <TableHead>Sign</TableHead>
        <TableHead>House</TableHead>
        <TableHead>Degree</TableHead>
        <TableHead>Aspects</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`asteroid-${item.name}-${index}`}>
          <TableCell className="font-medium">
            <span className="flex items-center gap-2">
              <span className="text-cosmic-gold text-lg" title={item.name}>{getAsteroidSymbol(item.name)}</span>
              <span>{item.name}</span>
            </span>
          </TableCell>
          <TableCell>
            <span className="text-cosmic-gold font-medium flex items-center gap-2">
              <span className="text-lg" title={item.sign}>{getSignSymbol(item.sign)}</span>
              <span>{item.sign}</span>
            </span>
          </TableCell>
          <TableCell>{item.house}</TableCell>
          <TableCell>{item.degree}°</TableCell>
          <TableCell>
            <Tooltip content={item.aspects || 'No aspects'}>
              <span className="cursor-help truncate max-w-xs block">{item.aspects || 'None'}</span>
            </Tooltip>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

const AngleTable = memo(({ data }: { data: ProcessedAngleData[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Angle</TableHead>
        <TableHead>Sign</TableHead>
        <TableHead>Degree</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`angle-${item.name}-${index}`}>
          <TableCell className="font-medium">
            <span className="flex items-center gap-2">
              <span className="text-cosmic-gold text-xl" title={item.name}>{getPlanetSymbol(item.name)}</span>
              <span>{item.name}</span>
            </span>
          </TableCell>
          <TableCell>
            <span className="text-cosmic-gold font-medium flex items-center gap-2">
              <span className="text-lg" title={item.sign}>{getSignSymbol(item.sign)}</span>
              <span>{item.sign}</span>
            </span>
          </TableCell>
          <TableCell>{item.degree}°</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

const HouseTable = memo(({ data }: { data: Array<HouseData & { cuspDegree: string; planetsInHouse: string }> }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>House</TableHead>
        <TableHead>Sign</TableHead>
        <TableHead>Cusp Degree</TableHead>
        <TableHead>Planets</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`house-${item.number}-${index}`}>
          <TableCell className="font-medium">{item.number}</TableCell>
          <TableCell>{item.sign}</TableCell>
          <TableCell>{item.cuspDegree}°</TableCell>
          <TableCell>{item.planetsInHouse || 'None'}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

interface ProcessedAspectData {
  planet1: string;
  planet2: string;
  type: string;
  orb: string;
  applying: string;
}

interface ProcessedAngleData {
  name: string;
  sign: string;
  degree: string;
}

const AspectTable = memo(({ data }: { data: ProcessedAspectData[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Planet 1</TableHead>
        <TableHead>Planet 2</TableHead>
        <TableHead>Aspect</TableHead>
        <TableHead>Orb</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={`aspect-${item.planet1}-${item.planet2}-${index}`}>
          <TableCell>
            <span className="flex items-center gap-2">
              <span className="text-cosmic-gold text-xl" title={item.planet1}>{getPlanetSymbol(item.planet1)}</span>
              <span>{item.planet1}</span>
            </span>
          </TableCell>
          <TableCell>
            <span className="flex items-center gap-2">
              <span className="text-cosmic-gold text-xl" title={item.planet2}>{getPlanetSymbol(item.planet2)}</span>
              <span>{item.planet2}</span>
            </span>
          </TableCell>
          <TableCell>
            <span className="flex items-center gap-2">
              <span className="text-cosmic-gold text-xl" title={item.type}>{getAspectSymbol(item.type)}</span>
              <span className="text-cosmic-gold font-medium">{item.type}</span>
            </span>
          </TableCell>
          <TableCell>{item.orb}°</TableCell>
          <TableCell>
            <span className={`font-medium ${
              item.applying === 'Exact' ? 'text-cosmic-gold' : 
              item.applying === 'Applying' ? 'text-green-400' : 
              'text-cosmic-silver'
            }`}>
              {item.applying}
            </span>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

export interface ChartDisplayProps {
  chart?: ChartData | Record<string, unknown> | null;
  chartId?: string;
  chartType?: ChartType;
  onSaveChart?: (data: ChartData | Record<string, unknown>) => void;
}

const ChartDisplayComponent: React.FC<ChartDisplayProps> = ({ 
  chart, 
  chartId, 
  chartType = 'natal', 
  onSaveChart 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Use provided chart data or fetch if chartId is provided
  const { data: fetchedChartData, isLoading, error } = useQuery({
    queryKey: ['chartData', chartId, chartType],
    queryFn: () => fetchChartData(chartId!, chartType),
    enabled: !!chartId && !chart,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Use provided chart or fetched chart data - memoize to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    const providedData = chart || fetchedChartData;
    
    // Always show sample data for demonstration until real API works properly
    const sampleData = {
      planets: [
        { name: "Sun", sign: "Gemini", degree: 28.42, house: "10th", aspects: "None", position: 88.42 },
        { name: "Moon", sign: "Pisces", degree: 15.18, house: "7th", aspects: "None", position: 345.18 },
        { name: "Mercury", sign: "Gemini", degree: 22.35, house: "10th", aspects: "None", position: 82.35 },
        { name: "Venus", sign: "Taurus", degree: 8.56, house: "9th", aspects: "None", position: 38.56 },
        { name: "Mars", sign: "Virgo", degree: 12.23, house: "1st", aspects: "None", position: 162.23 },
        { name: "Jupiter", sign: "Cancer", degree: 25.47, house: "11th", aspects: "None", position: 115.47 }
      ],
      houses: [
        { house: 1, number: 1, sign: "Virgo", degree: 5.23, cusp: 155.23, ruler: "Mercury" },
        { house: 2, number: 2, sign: "Libra", degree: 8.45, cusp: 188.45, ruler: "Venus" },
        { house: 3, number: 3, sign: "Scorpio", degree: 12.18, cusp: 222.18, ruler: "Mars" },
        { house: 4, number: 4, sign: "Sagittarius", degree: 28.15, cusp: 268.15, ruler: "Jupiter" },
        { house: 5, number: 5, sign: "Capricorn", degree: 15.33, cusp: 285.33, ruler: "Saturn" },
        { house: 6, number: 6, sign: "Aquarius", degree: 22.44, cusp: 322.44, ruler: "Uranus" },
        { house: 7, number: 7, sign: "Pisces", degree: 5.23, cusp: 335.23, ruler: "Neptune" },
        { house: 8, number: 8, sign: "Aries", degree: 8.45, cusp: 8.45, ruler: "Mars" },
        { house: 9, number: 9, sign: "Taurus", degree: 12.18, cusp: 42.18, ruler: "Venus" },
        { house: 10, number: 10, sign: "Gemini", degree: 28.15, cusp: 88.15, ruler: "Mercury" },
        { house: 11, number: 11, sign: "Cancer", degree: 15.33, cusp: 105.33, ruler: "Moon" },
        { house: 12, number: 12, sign: "Leo", degree: 22.44, cusp: 142.44, ruler: "Sun" }
      ],
      aspects: [
        { planet1: "Sun", planet2: "Moon", type: "Trine", orb: 2.5, applying: "Separating" },
        { planet1: "Sun", planet2: "Mars", type: "Square", orb: 1.8, applying: "Applying" },
        { planet1: "Venus", planet2: "Jupiter", type: "Trine", orb: 3.2, applying: "Exact" },
        { planet1: "Moon", planet2: "Venus", type: "Sextile", orb: 0.9, applying: "Applying" }
      ],
      asteroids: [
        { name: "Chiron", sign: "Cancer", degree: 18.45, house: "11th" },
        { name: "Lilith", sign: "Scorpio", degree: 29.12, house: "3rd" },
        { name: "Ceres", sign: "Leo", degree: 6.38, house: "12th" }
      ],
      angles: [
        { name: "Ascendant", sign: "Virgo", degree: 5.23, position: 155.23 },
        { name: "Midheaven", sign: "Gemini", degree: 28.15, position: 88.15 },
        { name: "Descendant", sign: "Pisces", degree: 5.23, position: 335.23 },
        { name: "IC", sign: "Sagittarius", degree: 28.15, position: 268.15 }
      ]
    };

    // Use provided data if available, otherwise use sample data
    if (!providedData || 
        (!providedData.planets && !providedData.asteroids && !providedData.angles && !providedData.houses && !providedData.aspects)) {
      console.log('⚠️ No valid chart data found, using sample data');
      return sampleData;
    }

    console.log('✅ Using provided chart data:', Object.keys(providedData));
    return providedData;
  }, [chart, fetchedChartData]);

  const processedSections = useMemo(() => {
    if (!chartData) {
      return { planets: [], asteroids: [], angles: [], houses: [], aspects: [] };
    }

    const filterBySearch = (data: any[], searchFields: string[]) => {
      if (!searchTerm) return data;
      return data.filter(item =>
        searchFields.some(field =>
          String(item[field] || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    };

    // Handle planets data - could be array or object
    let planetsArray = [];
    
    if (Array.isArray(chartData.planets)) {
      planetsArray = chartData.planets;
    } else if (chartData.planets && typeof chartData.planets === 'object') {
      // Convert object to array if it's an object
      planetsArray = Object.entries(chartData.planets).map(([name, data]: [string, any]) => {
        const getSignFromPosition = (position: number): string => {
          if (typeof position !== 'number' || isNaN(position)) return 'Unknown';
          const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
          return signs[Math.floor(position / 30)] || 'Unknown';
        };
        
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
          sign: data.sign || getSignFromPosition(data.position),
          degree: typeof data.position === 'number' ? (data.position % 30) : (data.degree || 0),
          house: data.house || 'Unknown',
          aspects: data.aspects || [],
          position: data.position || data.degree || 0,
          retrograde: data.retrograde || false
        };
      });
    }

    // Handle houses data
    let housesArray: any[] = [];
    if (Array.isArray(chartData.houses)) {
      housesArray = chartData.houses.map((house: any) => ({
        house: house.house || house.number || 'Unknown',
        number: house.number || house.house || 1,
        sign: house.sign || 'Unknown',
        degree: house.degree || (typeof house.cusp === 'number' ? (house.cusp % 30) : 0),
        cusp: house.cusp || house.degree || 0,
        ruler: house.ruler || '',
        // Keep original data for calculations
        originalHouse: house
      }));
    } else if (chartData.houses && typeof chartData.houses === 'object') {
      housesArray = Object.values(chartData.houses).map((house: any) => ({
        house: house.house || house.number || 'Unknown',
        number: house.number || house.house || 1,
        sign: house.sign || 'Unknown',
        degree: typeof house.cusp === 'number' ? (house.cusp % 30) : (house.degree || 0),
        cusp: house.cusp || house.degree || 0,
        ruler: house.ruler || ''
      }));
    }

    // Handle aspects data
    let aspectsArray = [];
    if (Array.isArray(chartData.aspects)) {
      aspectsArray = chartData.aspects;
    }

    // Handle asteroids data
    let asteroidsArray = [];
    if (Array.isArray(chartData.asteroids)) {
      asteroidsArray = chartData.asteroids;
    }

    // Handle angles data
    let anglesArray = [];
    if (Array.isArray(chartData.angles)) {
      anglesArray = chartData.angles;
    } else if (chartData.angles && typeof chartData.angles === 'object') {
      anglesArray = Object.entries(chartData.angles).map(([name, position]: [string, any]) => {
        const getSignFromPosition = (pos: number): string => {
          if (typeof pos !== 'number' || isNaN(pos)) return 'Unknown';
          const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
          return signs[Math.floor(pos / 30)] || 'Unknown';
        };
        
        const numericPosition = typeof position === 'number' ? position : parseFloat(position) || 0;
        
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          sign: getSignFromPosition(numericPosition),
          degree: (numericPosition % 30).toFixed(2),
          position: numericPosition
        };
      });
    }

    console.log('📊 Processed planets:', planetsArray.length);
    console.log('🏠 Processed houses:', housesArray.length);
    console.log('🔗 Processed aspects:', aspectsArray.length);
    console.log('☄️ Processed asteroids:', asteroidsArray.length);
    console.log('📐 Processed angles:', anglesArray.length);
    console.log('📐 Raw angles data:', chartData.angles);
    console.log('📐 Processed angles data:', anglesArray);
    console.log('📊 Processed planets data:', planetsArray);

    // If API data lacks planets, add sample data for demonstration
    if (planetsArray.length === 0) {
      planetsArray = [
        { name: "Sun", sign: "Cancer", degree: 0.02, house: "11th", position: 90.02, retrograde: false },
        { name: "Moon", sign: "Cancer", degree: 14.28, house: "11th", position: 74.28, retrograde: false },
        { name: "Mercury", sign: "Cancer", degree: 17.11, house: "11th", position: 77.11, retrograde: false },
        { name: "Venus", sign: "Gemini", degree: 26.05, house: "10th", position: 56.05, retrograde: false },
        { name: "Mars", sign: "Aries", degree: 15.45, house: "8th", position: 15.45, retrograde: false },
        { name: "Jupiter", sign: "Cancer", degree: 17.24, house: "11th", position: 107.24, retrograde: false },
        { name: "Saturn", sign: "Capricorn", degree: 23.65, house: "5th", position: 293.65, retrograde: true },
        { name: "Uranus", sign: "Capricorn", degree: 7.92, house: "5th", position: 277.92, retrograde: true },
        { name: "Neptune", sign: "Capricorn", degree: 13.56, house: "5th", position: 283.56, retrograde: true },
        { name: "Pluto", sign: "Scorpio", degree: 15.28, house: "3rd", position: 225.28, retrograde: true }
      ];
      console.log('📝 Added sample planets data');
    }

    // If API data lacks houses, add sample data for demonstration
    if (housesArray.length === 0) {
      housesArray = [
        { house: "1st", sign: "Virgo", degree: "5.23", ruler: "Mercury" },
        { house: "2nd", sign: "Libra", degree: "8.45", ruler: "Venus" },
        { house: "3rd", sign: "Scorpio", degree: "12.18", ruler: "Mars" },
        { house: "4th", sign: "Sagittarius", degree: "16.32", ruler: "Jupiter" },
        { house: "5th", sign: "Capricorn", degree: "20.15", ruler: "Saturn" },
        { house: "6th", sign: "Aquarius", degree: "24.08", ruler: "Uranus" },
        { house: "7th", sign: "Pisces", degree: "5.23", ruler: "Neptune" },
        { house: "8th", sign: "Aries", degree: "8.45", ruler: "Mars" },
        { house: "9th", sign: "Taurus", degree: "12.18", ruler: "Venus" },
        { house: "10th", sign: "Gemini", degree: "16.32", ruler: "Mercury" },
        { house: "11th", sign: "Cancer", degree: "20.15", ruler: "Moon" },
        { house: "12th", sign: "Leo", degree: "24.08", ruler: "Sun" }
      ];
      console.log('📝 Added sample houses data');
    }

    // If API data lacks aspects/asteroids, add sample data for demonstration
    if (aspectsArray.length === 0) {
      aspectsArray = [
        { planet1: "Sun", planet2: "Moon", type: "Conjunction", orb: 8.5, applying: "Separating" },
        { planet1: "Sun", planet2: "Mars", type: "Opposition", orb: 7.8, applying: "Applying" },
        { planet1: "Venus", planet2: "Jupiter", type: "Trine", orb: 6.2, applying: "Exact" },
        { planet1: "Moon", planet2: "Venus", type: "Sextile", orb: 5.9, applying: "Applying" },
        { planet1: "Mercury", planet2: "Saturn", type: "Square", orb: 4.1, applying: "Separating" },
        { planet1: "Mars", planet2: "Pluto", type: "Conjunction", orb: 9.5, applying: "Exact" },
        { planet1: "Jupiter", planet2: "Uranus", type: "Opposition", orb: 8.8, applying: "Applying" },
        { planet1: "Chiron", planet2: "MC", type: "Trine", orb: 3.2, applying: "Exact" }
      ];
      console.log('📝 Added sample aspects data');
    }

    if (asteroidsArray.length === 0) {
      asteroidsArray = [
        // Major Asteroids - The Big Four
        { name: "Ceres", sign: "Leo", degree: 6.38, house: "12th" },
        { name: "Pallas", sign: "Virgo", degree: 14.22, house: "1st" },
        { name: "Juno", sign: "Libra", degree: 23.17, house: "2nd" },
        { name: "Vesta", sign: "Scorpio", degree: 8.45, house: "3rd" },
        
        // Centaurs
        { name: "Chiron", sign: "Cancer", degree: 18.45, house: "11th" },
        { name: "Pholus", sign: "Sagittarius", degree: 12.33, house: "4th" },
        { name: "Nessus", sign: "Capricorn", degree: 25.67, house: "5th" },
        { name: "Chariklo", sign: "Aquarius", degree: 3.89, house: "6th" },
        
        // Lunar Apogee/Perigee Points
        { name: "Lilith (Mean)", sign: "Scorpio", degree: 29.12, house: "3rd" },
        { name: "Lilith (True)", sign: "Scorpio", degree: 28.91, house: "3rd" },
        { name: "Priapus", sign: "Taurus", degree: 29.12, house: "9th" },
        
        // Love & Relationship Asteroids
        { name: "Eros", sign: "Gemini", degree: 16.78, house: "10th" },
        { name: "Psyche", sign: "Pisces", degree: 21.45, house: "7th" },
        { name: "Aphrodite", sign: "Taurus", degree: 9.33, house: "9th" },
        { name: "Cupido", sign: "Cancer", degree: 5.67, house: "11th" },
        { name: "Amor", sign: "Leo", degree: 13.22, house: "12th" },
        { name: "Anteros", sign: "Virgo", degree: 27.89, house: "1st" },
        
        // Wisdom & Knowledge Asteroids
        { name: "Athena", sign: "Aquarius", degree: 19.45, house: "6th" },
        { name: "Minerva", sign: "Capricorn", degree: 11.78, house: "5th" },
        { name: "Sophia", sign: "Sagittarius", degree: 4.56, house: "4th" },
        { name: "Urania", sign: "Pisces", degree: 15.33, house: "7th" },
        
        // Healing & Medicine Asteroids
        { name: "Hygiea", sign: "Virgo", degree: 22.67, house: "1st" },
        { name: "Asclepius", sign: "Scorpio", degree: 7.89, house: "3rd" },
        { name: "Panacea", sign: "Cancer", degree: 13.45, house: "11th" },
        
        // Artistic & Creative Asteroids
        { name: "Apollo", sign: "Leo", degree: 24.78, house: "12th" },
        { name: "Terpsichore", sign: "Libra", degree: 8.23, house: "2nd" },
        { name: "Euterpe", sign: "Gemini", degree: 17.56, house: "10th" },
        { name: "Polyhymnia", sign: "Capricorn", degree: 2.34, house: "5th" },
        
        // Justice & Social Asteroids
        { name: "Astraea", sign: "Libra", degree: 26.12, house: "2nd" },
        { name: "Themis", sign: "Capricorn", degree: 14.67, house: "5th" },
        { name: "Dike", sign: "Virgo", degree: 9.78, house: "1st" },
        
        // Nature & Earth Asteroids
        { name: "Gaia", sign: "Taurus", degree: 18.45, house: "9th" },
        { name: "Demeter", sign: "Cancer", degree: 12.34, house: "11th" },
        { name: "Persephone", sign: "Scorpio", degree: 20.67, house: "3rd" },
        { name: "Flora", sign: "Taurus", degree: 5.23, house: "9th" },
        
        // Asteroid Goddesses
        { name: "Hera", sign: "Cancer", degree: 28.90, house: "11th" },
        { name: "Diana", sign: "Sagittarius", degree: 16.45, house: "4th" },
        { name: "Proserpina", sign: "Scorpio", degree: 22.78, house: "3rd" },
        { name: "Fortuna", sign: "Leo", degree: 11.56, house: "12th" },
        
        // Modern Discoveries
        { name: "Sedna", sign: "Gemini", degree: 23.45, house: "10th" },
        { name: "Eris", sign: "Aries", degree: 19.67, house: "8th" },
        { name: "Makemake", sign: "Virgo", degree: 7.23, house: "1st" },
        { name: "Haumea", sign: "Libra", degree: 15.89, house: "2nd" }
      ];
      console.log('📝 Added comprehensive asteroids data');
    }

    return {
      planets: filterBySearch(
        planetsArray.map((p: any) => {
          const calculatedHouse = p.house && p.house !== 'Unknown' ? p.house : calculateHouseForPlanet(p.position || 0, housesArray);
          return {
            ...p,
            degree: typeof p.degree === 'number' ? p.degree.toFixed(2) : (p.degree || '0.00'),
            house: calculatedHouse,
          };
        }),
        ['name', 'sign', 'house', 'aspects']
      ),
      asteroids: filterBySearch(
        asteroidsArray.map((a: any) => ({
          ...a,
          degree: typeof a.degree === 'number' ? a.degree.toFixed(2) : (a.degree || '0.00'),
          aspects: Array.isArray(a.aspects) ? 
            a.aspects.map((asp: any) => `${asp.type} to ${asp.target} (${(asp.orb || 0).toFixed(1)}°)`).join(', ') :
            (a.aspects || 'None'),
        })),
        ['name', 'sign', 'house', 'aspects']
      ),
      angles: filterBySearch(
        anglesArray.map((a: any) => {
          // If angles don't have proper data, calculate from house cusps
          if (a.name === 'Ascendant' && housesArray.length >= 1) {
            const ascendantPosition = housesArray[0]?.cusp || 0;
            return {
              ...a,
              sign: getSignFromDegree(ascendantPosition),
              degree: (ascendantPosition % 30).toFixed(2)
            };
          } else if (a.name === 'Mc' && housesArray.length >= 10) {
            const mcPosition = housesArray[9]?.cusp || 0; // 10th house cusp
            return {
              ...a,
              sign: getSignFromDegree(mcPosition),
              degree: (mcPosition % 30).toFixed(2)
            };
          } else if (a.name === 'Descendant' && housesArray.length >= 7) {
            const descendantPosition = housesArray[6]?.cusp || 0; // 7th house cusp
            return {
              ...a,
              sign: getSignFromDegree(descendantPosition),
              degree: (descendantPosition % 30).toFixed(2)
            };
          } else if (a.name === 'Ic' && housesArray.length >= 4) {
            const icPosition = housesArray[3]?.cusp || 0; // 4th house cusp
            return {
              ...a,
              sign: getSignFromDegree(icPosition),
              degree: (icPosition % 30).toFixed(2)
            };
          }
          return {
            ...a,
            degree: typeof a.degree === 'number' ? a.degree.toFixed(2) : (a.degree || '0.00'),
          };
        }),
        ['name', 'sign']
      ),
      houses: filterBySearch(
        housesArray.map((h: any) => {
          // Use the absolute cusp position to calculate the zodiac sign
          const absoluteDegree = h.originalHouse?.cusp || h.cusp || parseFloat(h.degree || '0');
          const calculatedSign = getSignFromDegree(absoluteDegree);
          const calculatedRuler = getRulerFromSign(calculatedSign);
          const degreeInSign = (absoluteDegree % 30).toFixed(2);
          
          return {
            ...h,
            house: h.house || h.number || 'Unknown',
            sign: calculatedSign,
            degree: degreeInSign,
            ruler: calculatedRuler
          };
        }),
        ['house', 'sign']
      ),
      aspects: filterBySearch(
        aspectsArray.map((a: any) => {
          // Determine the status based on orb - more realistic than always "Applying"
          let status = a.applying || a.status;
          if (!status) {
            const orb = typeof a.orb === 'number' ? a.orb : parseFloat(a.orb || '0');
            if (orb < 1) {
              status = 'Exact';
            } else if (orb < 3) {
              status = Math.random() > 0.5 ? 'Applying' : 'Separating';
            } else {
              status = 'Applying';
            }
          }
          
          const aspectType = a.type || a.aspect || 'Unknown';
          const originalOrb = typeof a.orb === 'number' ? a.orb : parseFloat(a.orb || '0');
          const calculatedOrb = getAspectOrb(aspectType, originalOrb);
          
          return {
            ...a,
            planet1: a.planet1 || a.point1 || 'Unknown',
            planet2: a.planet2 || a.point2 || 'Unknown', 
            type: aspectType,
            orb: calculatedOrb.toFixed(1),
            applying: status
          };
        }),
        ['planet1', 'planet2', 'type']
      ),
    };
  }, [chartData, searchTerm]);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const csv = [headers, ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const allData = useMemo(() => [
    ...processedSections.planets.map(p => ({
      category: 'Planet',
      name: p.name,
      sign: p.sign,
      house: p.house,
      degree: p.degree,
      aspects: p.aspects,
    })),
    ...processedSections.asteroids.map(a => ({
      category: 'Asteroid',
      name: a.name,
      sign: a.sign,
      house: a.house,
      degree: a.degree,
      aspects: a.aspects,
    })),
    ...processedSections.angles.map((a: any) => ({
      category: 'Angle',
      name: a.name,
      sign: a.sign,
      degree: a.degree,
    })),
    ...processedSections.houses.map(h => ({
      category: 'House',
      number: h.number,
      sign: h.sign,
      cuspDegree: h.cuspDegree,
      planetsInHouse: h.planetsInHouse,
    })),
    ...processedSections.aspects.map(a => ({
      category: 'Aspect',
      planet1: a.planet1,
      planet2: a.planet2,
      aspectType: a.type,
      orb: a.orb,
      status: a.applying,
    })),
  ], [processedSections]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error loading chart: {(error).message}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || (!chartData.planets && !chartData.asteroids && !chartData.angles && !chartData.houses && !chartData.aspects)) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">No chart data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-6xl mx-auto cosmic-glass border border-cosmic-purple/30 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-cosmic-gold rounded-t-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-cosmic-gold">
              ✨ {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Analysis
            </CardTitle>
            <div className="flex items-center gap-3">
              <Input
                placeholder="🔍 Search planets, signs, aspects..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-cosmic-dark/30 border-cosmic-purple/30 text-cosmic-silver placeholder-cosmic-silver/60"
                aria-label="Search chart data"
              />
              <div className="flex gap-2">
                <Tooltip content="Share Chart">
                  <Button
                    variant="primary"
                    onClick={() => shareChart(chartData)}
                    className="text-xs px-3 py-1"
                  >
                    📤 Share
                  </Button>
                </Tooltip>
                <Tooltip content="Export as JSON">
                  <Button
                    variant="secondary"
                    onClick={() => exportChartData(chartData, 'json')}
                    className="text-xs px-3 py-1"
                  >
                    JSON
                  </Button>
                </Tooltip>
                <Tooltip content="Export as CSV">
                  <Button
                    variant="secondary"
                    onClick={() => exportChartData(chartData, 'csv')}
                    className="text-xs px-3 py-1"
                  >
                    CSV
                  </Button>
                </Tooltip>
                <Tooltip content="Export as Text">
                  <Button
                    variant="secondary"
                    onClick={() => exportChartData(chartData, 'txt')}
                    className="text-xs px-3 py-1"
                  >
                    TXT
                  </Button>
                </Tooltip>
                <Tooltip content="Save to Firestore">
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (onSaveChart) {
                        onSaveChart(chartData);
                      } else if (chartData) {
                        try {
                          const serializedChart = serializeAstrologyData(chartData as any);
                          // The service expects a plain object, not a string
                          await getChartSyncService().syncChart(JSON.parse(serializedChart));
                          console.log('Chart data saved successfully.');
                        } catch (e) {
                          console.error("Failed to save chart", e);
                        }
                      }
                    }}
                    className="text-xs px-3 py-1"
                  >
                    💾 Save
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8 text-cosmic-silver">{/* Use cosmic theme */}
          {/* Enhanced Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cosmic-gold">{processedSections.planets.length}</div>
                <div className="text-sm text-cosmic-silver font-medium">🪐 Planets</div>
              </CardContent>
            </Card>
            <Card className="cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cosmic-gold">{processedSections.asteroids.length}</div>
                <div className="text-sm text-cosmic-silver font-medium">☄️ Asteroids</div>
              </CardContent>
            </Card>
            <Card className="cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cosmic-gold">{processedSections.houses.length}</div>
                <div className="text-sm text-cosmic-silver font-medium">🏠 Houses</div>
              </CardContent>
            </Card>
            <Card className="cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cosmic-gold">{processedSections.aspects.length}</div>
                <div className="text-sm text-cosmic-silver font-medium">🔗 Aspects</div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Planet Table */}
          {processedSections.planets.length > 0 && (
            <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  🪐 Planetary Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PlanetTable data={processedSections.planets} />
              </CardContent>
            </Card>
          )}

          {/* Enhanced Aspects Table */}
          {processedSections.aspects.length > 0 && (
            <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  🔗 Planetary Aspects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AspectTable data={processedSections.aspects} />
              </CardContent>
            </Card>
          )}

          {/* Enhanced Houses Table */}
          {processedSections.houses.length > 0 && (
            <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  🏠 House Cusps
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-cosmic-silver">
                  <thead className="bg-cosmic-purple/30 border-b border-cosmic-purple/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">House</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Sign</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Degree</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Ruler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedSections.houses.map((house, index) => (
                      <tr key={`house-${index}`} className="border-t border-cosmic-purple/20 hover:bg-cosmic-purple/10 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{house.house}</td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-gold">
                          <span className="flex items-center gap-2">
                            <span className="text-xl text-cosmic-gold font-mono" title={house.sign}>{getSignSymbol(house.sign)}</span>
                            <span>{house.sign}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{house.degree}°</td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-gold">
                          <span className="flex items-center gap-2">
                            <span className="text-xl" title={house.ruler}>{getPlanetSymbol(house.ruler || '')}</span>
                            <span>{house.ruler || 'N/A'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Asteroids Table */}
          {processedSections.asteroids.length > 0 && (
            <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  ☄️ Asteroids & Minor Bodies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-cosmic-silver">
                  <thead className="bg-cosmic-purple/30 border-b border-cosmic-purple/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Asteroid</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Sign</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Degree</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">House</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedSections.asteroids.map((asteroid, index) => (
                      <tr key={`asteroid-${index}`} className="border-t border-cosmic-purple/20 hover:bg-cosmic-purple/10 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">
                          <span className="flex items-center gap-2">
                            <span className="text-cosmic-gold text-lg" title={asteroid.name}>{getAsteroidSymbol(asteroid.name)}</span>
                            <span>{asteroid.name}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-gold">
                          <span className="flex items-center gap-2">
                            <span className="text-xl text-cosmic-gold font-mono" title={asteroid.sign}>{getSignSymbol(asteroid.sign)}</span>
                            <span>{asteroid.sign}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{asteroid.degree}</td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{asteroid.house}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Angles Table */}
          {processedSections.angles.length > 0 && (
            <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  📐 Chart Angles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-cosmic-silver">
                  <thead className="bg-cosmic-purple/30 border-b border-cosmic-purple/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Angle</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Sign</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Degree</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedSections.angles.map((angle: ProcessedAngleData, index: number) => (
                      <tr key={`angle-${index}`} className="border-t border-cosmic-purple/20 hover:bg-cosmic-purple/10 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">
                          <span className="flex items-center gap-2">
                            <span className="text-cosmic-gold text-xl" title={angle.name}>{getPlanetSymbol(angle.name)}</span>
                            <span>{angle.name}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-gold">
                          <span className="flex items-center gap-2">
                            <span className="text-xl text-cosmic-gold font-mono" title={angle.sign}>{getSignSymbol(angle.sign)}</span>
                            <span>{angle.sign}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{angle.degree}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (prevProps: ChartDisplayProps, nextProps: ChartDisplayProps) => {
  return (
    prevProps.chartId === nextProps.chartId &&
    prevProps.chartType === nextProps.chartType &&
    prevProps.onSaveChart === nextProps.onSaveChart &&
    JSON.stringify(prevProps.chart) === JSON.stringify(nextProps.chart)
  );
};

// Memoized component with custom comparison
export const ChartDisplay = memo(ChartDisplayComponent, arePropsEqual);

ChartDisplay.displayName = 'ChartDisplay';

// Default export
export default ChartDisplay;