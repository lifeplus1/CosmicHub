import React, { useEffect, useRef, memo, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useQuery } from '@tanstack/react-query';
import { fetchChartData, type ChartBirthData, type ChartData as APIChartData } from '../services/api';
import type { ApiResult } from '../services/apiResult';
import { Button } from '@cosmichub/ui';

// Enhanced TypeScript interfaces
interface BackendPlanet {
  position: number;
  retrograde?: boolean;
  speed?: number;
}

interface BackendHouse {
  house: number;
  cusp: number;
  sign?: string;
}

interface Planet {
  name: string;
  position: number; // Degree in zodiac (0-360)
  retrograde?: boolean;
  speed?: number;
}

interface House {
  house: number;
  number: number;
  cusp: number; // Degree position
  sign: string;
}

interface APIAspect {
  point1: string;
  point2: string;
  aspect: string;
  orb: number;
}

interface ChartData {
  planets: Record<string, Planet>;
  houses: House[];
  aspects?: Aspect[];
  angles?: Record<string, number>;
}

interface Aspect {
  planet1: string;
  planet2: string;
  angle: number;
  orb: number;
  type: AspectType;
  applying: boolean;
}

type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface BackendChartResponse {
  planets?: Record<string, BackendPlanet>;
  houses?: Record<string, BackendHouse>;
  aspects?: APIAspect[];
  latitude?: number;
  longitude?: number;
  timezone?: string;
  julian_day?: number;
  angles?: Record<string, number>;
}

interface ChartWheelProps {
  birthData?: ChartBirthData;
  chartData?: ChartData; // Add pre-transformed chart data prop
  showAspects?: boolean;
  showAnimation?: boolean;
}

// Enhanced ChartWheel component with aspects and animations
const ChartWheel: React.FC<ChartWheelProps> = ({ 
  birthData, 
  chartData: preTransformedData,
  showAspects = true, 
  showAnimation = true 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch chart data from backend using the /calculate endpoint (only if no pre-transformed data)
  const { data: fetchedData, isLoading, error, refetch } = useQuery<ChartData>({
    queryKey: ['chartData', birthData],
  queryFn: async () => {
  if (birthData === null || birthData === undefined) throw new Error('Birth data required');
  const result: ApiResult<APIChartData> = await fetchChartData(birthData);
  if (!result.success) throw new Error(result.error);
  return transformAPIResponseToChartData(result.data);
    },
  enabled: birthData !== null && birthData !== undefined && preTransformedData === null,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2,
  });

  // Use pre-transformed data if available, otherwise use fetched data
  const data = preTransformedData ?? fetchedData;

  // Transform API response to our internal ChartData format (only used when no pre-transformed data)
  const transformAPIResponseToChartData = (apiData: APIChartData): ChartData => {
    // Transform planets
    const transformedPlanets: Record<string, Planet> = {};
    const planets = apiData.planets ?? {};
    Object.entries(planets).forEach(([name, planetData]) => {
      if (planetData === null || planetData === undefined) return;
      if (typeof planetData.position !== 'number') return;
      
      transformedPlanets[name] = {
        name,
        position: planetData.position,
        retrograde: planetData.retrograde === true,
        speed: typeof planetData.speed === 'number' ? planetData.speed : 0,
      };
    });

    // Transform houses 
    const transformedHouses: House[] = [];
    Object.entries(apiData.houses ?? {}).forEach(([, houseData]) => {
      function isAPIHouse(data: unknown): data is { house: number; cusp: number; sign?: string } {
        if (data === null || data === undefined || typeof data !== 'object') return false;
        const h = data as { house?: number; cusp?: number; sign?: string };
        return typeof h.house === 'number' && typeof h.cusp === 'number';
      }

      if (isAPIHouse(houseData)) {
        transformedHouses.push({
          house: houseData.house,
          number: houseData.house,
          cusp: houseData.cusp,
          sign: typeof houseData.sign === 'string' ? houseData.sign : '',
        });
      }
    });

    // Transform aspects with proper type handling
    const transformedAspects: Aspect[] = [];
    const aspects = apiData.aspects ?? [];
    
    function isAPIAspect(data: unknown): data is APIAspect {
      if (data === null || data === undefined || typeof data !== 'object') return false;
      const a = data as APIAspect;
      return (
        typeof a.point1 === 'string' &&
        typeof a.point2 === 'string' &&
        typeof a.aspect === 'string' &&
        typeof a.orb === 'number'
      );
    }
    
    for (const aspect of aspects) {
      if (!isAPIAspect(aspect)) continue;
      
      const { point1, point2, aspect: aspectType, orb } = aspect;

      transformedAspects.push({
        planet1: point1,
        planet2: point2,
        angle: getAspectAngle(aspectType),
        orb: orb,
        type: aspectType.toLowerCase() as AspectType,
        applying: false,
      });
    }

  const angles = (apiData.angles !== null && apiData.angles !== undefined) ? { ...apiData.angles } : undefined;

    return {
      planets: transformedPlanets,
      houses: transformedHouses.sort((a, b) => a.number - b.number),
      aspects: transformedAspects,
      angles,
    };
  };

  // Helper function for aspect angle calculation
  const getAspectAngle = (aspectType: string): number => {
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
  const key = aspectType.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(aspectAngles, key)) {
    const val = aspectAngles[key];
    return typeof val === 'number' ? val : 0;
  }
  return 0;
  };

  // Memoized constants for performance
  const chartConstants = useMemo(() => ({
    width: 800,
    height: 800,
    radius: 320,
    center: { x: 400, y: 400 },
    signs: [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ],
    signSymbols: ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
    signColors: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ],
    planetSymbols: {
      sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
      jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
      chiron: '⚷', ceres: '⚳', pallas: '⚴', juno: '⚵', vesta: '⚶'
    } as Record<string, string>,
    planetColors: {
      sun: '#FFD700', moon: '#E8E8E8', mercury: '#87CEEB', venus: '#32CD32', mars: '#FF4500',
      jupiter: '#FF8C00', saturn: '#DAA520', uranus: '#4FD0E4', neptune: '#6495ED', pluto: '#DA70D6',
      chiron: '#D2691E', ceres: '#90EE90', pallas: '#DDA0DD', juno: '#FFB6C1', vesta: '#F0E68C'
    } as Record<string, string>,
    aspectColors: {
      conjunction: '#FF0000',
      opposition: '#0066CC',
      trine: '#00AA00',
      square: '#FF6600',
      sextile: '#9966FF',
      quincunx: '#666666',
    } as Record<string, string>
  }), []);

  useEffect(() => {
  if (data === null || data === undefined || svgRef.current === null || svgRef.current === undefined) return;

    const { width, height, radius, center, signs, signSymbols, planetSymbols, planetColors, aspectColors } = chartConstants;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'mx-auto')
      .attr('role', 'img')
      .attr('aria-label', 'Astrological natal chart wheel');

    const g = svg.append('g').attr('transform', `translate(${center.x}, ${center.y})`);

    // Define concentric ring radii
    const outerRadius = radius;
    const houseNumberRadius = radius - 25;
    const zodiacSymbolRadius = radius - 50;  // Outermost planet ring
    const degreeRadius = radius - 80;        // Degree ring
    const signRadius = radius - 110;         // Sign ring  
    const retrogradeRadius = radius - 140;   // Innermost retrograde ring
    const innerRadius = radius - 170;

    // Draw 12 equal house divisions (30 degrees each)
    for (let i = 0; i < 12; i++) {
      const startAngle = (i * 30 - 90) * Math.PI / 180;

      // House division lines (every 30 degrees) - equal houses
      g.append('line')
        .attr('x1', Math.cos(startAngle) * innerRadius)
        .attr('y1', Math.sin(startAngle) * innerRadius)
        .attr('x2', Math.cos(startAngle) * outerRadius)
        .attr('y2', Math.sin(startAngle) * outerRadius)
        .attr('stroke', '#333333')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.8)
        .attr('aria-label', `House ${i + 1} division`);
    }

    // Draw house numbers in equal 30-degree segments
    for (let i = 0; i < 12; i++) {
      const midAngle = (i * 30 + 15 - 90) * Math.PI / 180; // Middle of each 30-degree segment
      
      g.append('text')
        .attr('x', Math.cos(midAngle) * houseNumberRadius)
        .attr('y', Math.sin(midAngle) * houseNumberRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '16')
        .attr('font-weight', 'bold')
        .attr('fill', '#333333')
        .text((i + 1).toString());
    }

    // Helper function to get zodiac sign info
    function getZodiacInfo(position: number) {
      const rawIndex = Math.floor(position / 30);
      const signIndex = rawIndex >= 0 && rawIndex < signs.length ? rawIndex : 0;
      const degreeInSign = Math.floor(position % 30);
      const minuteInSign = Math.floor((position % 1) * 60);
      const signName = signs[signIndex] ?? 'Unknown';
      const signSymbol = signSymbols[signIndex] ?? '?';
      return {
        signIndex,
        signName,
        signSymbol,
        degree: degreeInSign,
        minute: minuteInSign,
        formatted: `${degreeInSign}°${minuteInSign.toString().padStart(2, '0')}'`
      };
    }

    // Draw planets in concentric rings
  const planets: Record<string, Planet> = data.planets ?? {};
    Object.entries(planets).forEach(([name, planet]: [string, Planet], index: number) => {
      const angle = (planet.position - 90) * Math.PI / 180;
      const zodiacInfo = getZodiacInfo(planet.position);
      
      const planetGroup = g.append('g')
        .attr('class', 'planet-group')
  .attr('aria-label', `Planet ${String(planet.name)} at ${planet.position.toFixed(1)} degrees${planet.retrograde === true ? ' retrograde' : ''}`);

      // Ring 1: Planet Symbol (outermost) - use planet symbol, not zodiac
        const planetSymbol = planetGroup.append('text')
        .attr('x', Math.cos(angle) * zodiacSymbolRadius)
        .attr('y', Math.sin(angle) * zodiacSymbolRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '18')
        .attr('font-weight', 'bold')
          .attr('fill', planetColors[name.toLowerCase()] ?? '#333333')
        .attr('opacity', 0)
          .text(planetSymbols[name.toLowerCase()] ?? name.slice(0, 2).toUpperCase());

      // Ring 2: Degree
      const degreeText = planetGroup.append('text')
        .attr('x', Math.cos(angle) * degreeRadius)
        .attr('y', Math.sin(angle) * degreeRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '11')
        .attr('font-weight', 'normal')
        .attr('fill', '#333333')
        .attr('opacity', 0)
        .text(zodiacInfo.formatted);

      // Ring 3: Zodiac Sign Symbol (where the planet is located)
      const signText = planetGroup.append('text')
        .attr('x', Math.cos(angle) * signRadius)
        .attr('y', Math.sin(angle) * signRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '16')
        .attr('font-weight', 'bold')
        .attr('fill', '#666666')
        .attr('opacity', 0)
        .text(zodiacInfo.signSymbol);

      // Ring 4: Retrograde indicator (innermost)
      if (planet.retrograde === true) {
        planetGroup.append('text')
          .attr('x', Math.cos(angle) * retrogradeRadius)
          .attr('y', Math.sin(angle) * retrogradeRadius)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '12')
          .attr('font-weight', 'bold')
          .attr('fill', '#FF0000')
          .attr('opacity', 0)
          .text('℞')
          .transition()
          .delay(showAnimation ? index * 100 + 600 : 0)
          .duration(showAnimation ? 300 : 0)
          .attr('opacity', 1);
      }

      // Animate elements in sequence
  if (showAnimation) {
        planetSymbol
          .transition()
          .delay(index * 100)
          .duration(400)
          .attr('opacity', 1);

        degreeText
          .transition()
          .delay(index * 100 + 150)
          .duration(400)
          .attr('opacity', 1);

        signText
          .transition()
          .delay(index * 100 + 300)
          .duration(400)
          .attr('opacity', 1);
      } else {
        planetSymbol.attr('opacity', 1);
        degreeText.attr('opacity', 1);
        signText.attr('opacity', 1);
      }
    });

    // Draw aspects more subtly
  const aspects: Aspect[] = Array.isArray(data.aspects) ? data.aspects : [];
  if (showAspects && aspects.length > 0) {
      aspects.forEach((aspect, index) => {
        const planet1 = data.planets[aspect.planet1];
        const planet2 = data.planets[aspect.planet2];
        
  if (planet1 === null || planet1 === undefined || planet2 === null || planet2 === undefined) return;

        const angle1 = (planet1.position - 90) * Math.PI / 180;
        const angle2 = (planet2.position - 90) * Math.PI / 180;
        const aspectRadius = innerRadius - 20; // Position aspects in the center area

          const line = g.append('line')
          .attr('x1', Math.cos(angle1) * aspectRadius)
          .attr('y1', Math.sin(angle1) * aspectRadius)
          .attr('x2', Math.cos(angle1) * aspectRadius)
          .attr('y2', Math.sin(angle1) * aspectRadius)
            .attr('stroke', aspectColors[aspect.type] ?? '#666666')
          .attr('stroke-width', aspect.type === 'conjunction' || aspect.type === 'opposition' ? 2 : 1)
          .attr('stroke-opacity', 0.4)
          .attr('stroke-dasharray', (aspect.type === 'sextile' || aspect.type === 'quincunx') ? '3,3' : null)
          .attr('aria-label', `${String(aspect.type)} aspect between ${String(aspect.planet1)} and ${String(aspect.planet2)}`);

        // Animate aspect lines
  if (showAnimation === true) {
          line
            .transition()
            .delay(1500 + index * 100)
            .duration(800)
            .attr('x2', Math.cos(angle2) * aspectRadius)
            .attr('y2', Math.sin(angle2) * aspectRadius);
        } else {
          line
            .attr('x2', Math.cos(angle2) * aspectRadius)
            .attr('y2', Math.sin(angle2) * aspectRadius);
        }
      });
    }

    // Draw chart borders - clean and simple
    // Outer circle
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', outerRadius)
      .attr('fill', 'none')
      .attr('stroke', '#333333')
      .attr('stroke-width', 3);

    // Inner circle only
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', innerRadius)
      .attr('fill', '#ffffff')
      .attr('stroke', '#333333')
      .attr('stroke-width', 2);

    // Center point
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 3)
      .attr('fill', '#333333');

    // Cleanup function
    return () => {
      svg.selectAll('*').remove();
    };
  }, [data, showAspects, showAnimation, chartConstants]);

  const handleRefresh = () => {
    setIsAnimating(true);
    void refetch().finally(() => setIsAnimating(false));
  };

  if (isLoading && (preTransformedData === null || preTransformedData === undefined)) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-gold"></div>
      <span className="ml-2 text-cosmic-silver">Loading chart...</span>
    </div>
  );

  if (error !== null && error !== undefined) return (
    <div className="text-center p-8">
      <div className="text-red-500 mb-4">Error loading chart</div>
      <Button onClick={handleRefresh} variant="secondary">
        Try Again
      </Button>
    </div>
  );

  if (data === null || data === undefined) return (
    <div className="text-center p-8">
      <div className="text-cosmic-silver mb-4">No chart data available</div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-cosmic-gold">Natal Chart</h3>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="secondary" disabled={isAnimating}>
            {isAnimating ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-6 border border-gray-300 shadow-lg">
        <svg 
          ref={svgRef} 
          className="w-full h-auto max-w-[800px] mx-auto"
        />
        
  {showAspects && ((data.aspects?.length ?? 0) > 0) && (
          <div className="mt-6 text-sm text-gray-700">
            <div className="font-medium mb-3 text-gray-900">Major Aspects ({(data.aspects?.length ?? 0)})</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {(Array.isArray(data.aspects) ? data.aspects : []).slice(0, 9).map((aspect, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <span className="capitalize font-medium">{aspect.type}</span>
                  <span className="text-gray-600">
                    {aspect.planet1} - {aspect.planet2}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(ChartWheel);