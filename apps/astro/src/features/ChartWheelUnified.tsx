import React, {
  useEffect,
  useRef,
  memo,
  useState,
  useMemo,
  useCallback,
} from 'react';
import * as d3 from 'd3';
import { useQuery } from '@tanstack/react-query';
import { fetchChartData } from '../services/api';
import type { ExtendedBirthData } from '@cosmichub/types';
import { useCanonicalBirthData } from '../hooks/useCanonicalBirthData';
import type { ApiResult } from '@cosmichub/config';
import { Button } from '@cosmichub/ui';
import type { ChartData, Aspect, PlanetName } from '../services/api.types';

// Local interface definitions to avoid import issues
interface ChartBirthData {
  birth_date: string;
  birth_time: string;
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
}

interface InteractiveState {
  selectedPlanet: string | null;
  hoveredElement: string | null;
  showTransits: boolean;
  highlightedAspects: string[];
  zoomLevel: number;
  rotationOffset: number;
}

interface ChartWheelUnifiedProps {
  birthData?: ChartBirthData | ExtendedBirthData;
  chartData?: ChartData;
  showAspects?: boolean;
  showAnimation?: boolean;
  // Interactive features
  interactive?: boolean;
  showTransits?: boolean;
  realTimeUpdates?: boolean;
  onPlanetSelect?: (planet: string) => void;
  onAspectSelect?: (aspect: Aspect) => void;
  // Display options
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ChartWheelUnified: React.FC<ChartWheelUnifiedProps> = ({
  birthData: _birthData,
  chartData: preTransformedData,
  showAspects = true,
  showAnimation = true,
  interactive = false,
  showTransits = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  realTimeUpdates = false,
  onPlanetSelect,
  onAspectSelect,
  showControls = true,
  size = 'md',
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [interactiveState, setInteractiveState] = useState<InteractiveState>({
    selectedPlanet: null,
    hoveredElement: null,
    showTransits: showTransits,
    highlightedAspects: [],
    zoomLevel: 1,
    rotationOffset: 0,
  });

  // Fetch natal chart data
  const canonicalBirthData = useCanonicalBirthData();
  const {
    data: fetchedData,
    isLoading,
    error,
    refetch,
  } = useQuery<ChartData>({
    queryKey: [
      'chartData',
      canonicalBirthData?.birth_date ?? canonicalBirthData?.city ?? null,
    ],
    queryFn: async (): Promise<ChartData> => {
      if (!canonicalBirthData) throw new Error('Birth data required');
      const result: ApiResult<ChartData> =
        await fetchChartData(canonicalBirthData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!canonicalBirthData && preTransformedData === null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  const data = preTransformedData ?? fetchedData;

  // Interactive event handlers (only active when interactive=true)
  const handlePlanetClick = useCallback(
    (planetName: string) => {
      if (!interactive) return;
      
      setInteractiveState(prev => ({
        ...prev,
        selectedPlanet: prev.selectedPlanet === planetName ? null : planetName,
        highlightedAspects:
          prev.selectedPlanet === planetName
            ? []
            : (data?.aspects
                ?.filter(
                  a => a.planet1 === planetName || a.planet2 === planetName
                )
                .map(a => `${a.planet1}-${a.planet2}`) ?? []),
      }));
      onPlanetSelect?.(planetName);
    },
    [data?.aspects, onPlanetSelect, interactive]
  );

  const handleAspectClick = useCallback(
    (aspect: Aspect) => {
      if (!interactive) return;
      
      onAspectSelect?.(aspect);
      setInteractiveState(prev => ({
        ...prev,
        highlightedAspects: [`${aspect.planet1}-${aspect.planet2}`],
      }));
    },
    [onAspectSelect, interactive]
  );

  const showTooltip = useCallback(
    (content: string, event: { pageX: number; pageY: number }) => {
      if (!interactive || !tooltipRef.current || !content) return;

      tooltipRef.current.innerHTML = content;
      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.left = `${event.pageX + 10}px`;
      tooltipRef.current.style.top = `${event.pageY - 10}px`;
    },
    [interactive]
  );

  const hideTooltip = useCallback(() => {
    if (!interactive || !tooltipRef.current) return;
    tooltipRef.current.style.display = 'none';
  }, [interactive]);

  // Size configurations
  const sizeConfig = useMemo(() => {
    const configs = {
      sm: { width: 600, height: 600, radius: 240 },
      md: { width: 800, height: 800, radius: 320 },
      lg: { width: 900, height: 900, radius: 380 },
    };
    return configs[size];
  }, [size]);

  // Chart constants
  const chartConstants = useMemo(
    () => ({
      ...sizeConfig,
      center: { x: sizeConfig.width / 2, y: sizeConfig.height / 2 },
      signs: [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
      ],
      signSymbols: ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
      signColors: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
        '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894',
      ],
      planetSymbols: {
        sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
        jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
        chiron: '⚷', ceres: '⚳', pallas: '⚴', juno: '⚵', vesta: '⚶',
      } as Record<string, string>,
      planetColors: {
        sun: '#FFD700', moon: '#E8E8E8', mercury: '#87CEEB', venus: '#32CD32', mars: '#FF4500',
        jupiter: '#FF8C00', saturn: '#DAA520', uranus: '#4FD0E4', neptune: '#6495ED', pluto: '#DA70D6',
        chiron: '#D2691E', ceres: '#90EE90', pallas: '#DDA0DD', juno: '#FFB6C1', vesta: '#F0E68C',
      } as Record<string, string>,
      aspectColors: {
        conjunction: '#FF0000', opposition: '#0066CC', trine: '#00AA00',
        square: '#FF6600', sextile: '#9966FF', quincunx: '#666666',
      } as Record<string, string>,
    }),
    [sizeConfig]
  );

  // Main chart rendering effect
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const {
      width, height, radius, center, signs, signSymbols, signColors,
      planetSymbols, planetColors, aspectColors,
    } = chartConstants;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', `mx-auto ${interactive ? 'cursor-crosshair' : ''}`)
      .style('background', interactive 
        ? 'radial-gradient(circle, #f8f9fa 0%, #e9ecef 100%)' 
        : 'white'
      )
      .attr('aria-label', `${interactive ? 'Interactive ' : ''}astrological natal chart wheel`);

    const g = svg
      .append('g')
      .attr(
        'transform',
        `translate(${center.x}, ${center.y}) scale(${interactiveState.zoomLevel}) rotate(${interactiveState.rotationOffset})`
      );

    // Define ring radii based on size
    const outerRadius = radius;
    const signBandRadius = radius - (interactive ? 30 : 25);
    const houseNumberRadius = radius - (interactive ? 60 : 50);
    const planetRadius = radius - (interactive ? 90 : 80);
    const aspectRadius = radius - (interactive ? 180 : 170);
    const innerRadius = radius - (interactive ? 200 : 180);

    // Enhanced zodiac rendering for interactive mode
    if (interactive) {
      // Draw gradients for signs
      const defs = svg.append('defs');
      signColors.forEach((color, index) => {
        const gradient = defs
          .append('linearGradient')
          .attr('id', `signGradient${index}`)
          .attr('x1', '0%').attr('y1', '0%')
          .attr('x2', '100%').attr('y2', '100%');

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0.3);

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0.1);
      });

      // Draw zodiac sign sectors
      signs.forEach((sign, index) => {
        const startAngle = ((index * 30 - 90) * Math.PI) / 180;
        const endAngle = (((index + 1) * 30 - 90) * Math.PI) / 180;
        const arcData = { startAngle, endAngle };
        const arc = d3.arc<void, typeof arcData>()
          .innerRadius(signBandRadius)
          .outerRadius(outerRadius);

        g.append('path')
          .attr('d', arc(arcData) as string)
          .attr('fill', `url(#signGradient${index})`)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseover', function (this: SVGPathElement, event: MouseEvent) {
            d3.select(this).attr('fill-opacity', 0.8);
            showTooltip(
              `<strong>${sign}</strong><br/>Element: ${getSignElement(sign)}<br/>Quality: ${getSignQuality(sign)}`,
              { pageX: event.pageX, pageY: event.pageY }
            );
          })
          .on('mouseout', function () {
            d3.select(this).attr('fill-opacity', 1);
            hideTooltip();
          });
      });
    }

    // Draw zodiac symbols
    signs.forEach((sign, index) => {
      const midAngle = ((index * 30 + 15 - 90) * Math.PI) / 180;
      g.append('text')
        .attr('x', Math.cos(midAngle) * (signBandRadius + 15))
        .attr('y', Math.sin(midAngle) * (signBandRadius + 15))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', interactive ? '24' : '20')
        .attr('font-weight', 'bold')
        .attr('fill', signColors[index] ?? '#666666')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5)
        .text(signSymbols[index] ?? '?')
        .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.3)');
    });

    // Draw house divisions and numbers
    for (let i = 0; i < 12; i++) {
      const angle = ((i * 30 - 90) * Math.PI) / 180;

      // House division lines
      g.append('line')
        .attr('x1', Math.cos(angle) * innerRadius)
        .attr('y1', Math.sin(angle) * innerRadius)
        .attr('x2', Math.cos(angle) * outerRadius)
        .attr('y2', Math.sin(angle) * outerRadius)
        .attr('stroke', '#333333')
        .attr('stroke-width', i % 3 === 0 ? 3 : 1.5)
        .attr('stroke-opacity', 0.7);

      // House numbers
      const midAngle = ((i * 30 + 15 - 90) * Math.PI) / 180;
      const houseData = data?.houses.find(h => h.number === i + 1);

      const houseText = g.append('text')
        .attr('x', Math.cos(midAngle) * houseNumberRadius)
        .attr('y', Math.sin(midAngle) * houseNumberRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', interactive ? '18' : '16')
        .attr('font-weight', 'bold')
        .attr('fill', '#2c3e50')
        .text((i + 1).toString());

      if (interactive) {
        houseText
          .style('cursor', 'pointer')
          .on('mouseover', function (event: MouseEvent) {
            showTooltip(
              `<strong>House ${i + 1}</strong><br/>Sign: ${houseData?.sign ?? 'Unknown'}<br/>Planets: None`,
              { pageX: event.pageX, pageY: event.pageY }
            );
          })
          .on('mouseout', hideTooltip);
      }
    }

    // Draw planets
    if (data?.planets) {
      Object.entries(data.planets).forEach(([name, planet], index) => {
        const angle = ((planet.position - 90) * Math.PI) / 180;
        const isSelected = interactive && interactiveState.selectedPlanet === name;
        const isHighlighted = interactive && interactiveState.highlightedAspects.some(aspectId =>
          aspectId.includes(name)
        );

        const planetGroup = g
          .append('g')
          .attr('class', 'planet-group')
          .style('cursor', interactive ? 'pointer' : 'default');

        if (interactive) {
          planetGroup
            .on('click', () => handlePlanetClick(name))
            .on('mouseover', function (event: MouseEvent) {
              d3.select(this).select('circle').attr('r', size === 'sm' ? 20 : 25);
              const tooltipContent = `
                <strong>${name.charAt(0).toUpperCase() + name.slice(1)}</strong><br/>
                Position: ${formatDegree(planet.position)}<br/>
                House: ${planet.house}<br/>
                ${planet.retrograde ? '<span style="color: red;">Retrograde ℞</span>' : 'Direct'}
              `;
              showTooltip(tooltipContent, { pageX: event.pageX, pageY: event.pageY });
            })
            .on('mouseout', function () {
              if (!isSelected) {
                d3.select(this).select('circle').attr('r', size === 'sm' ? 15 : 20);
              }
              hideTooltip();
            });
        }

        // Planet background circle
        const planetRadius_local = isSelected ? (size === 'sm' ? 20 : 25) : (size === 'sm' ? 15 : 20);
        planetGroup
          .append('circle')
          .attr('cx', Math.cos(angle) * planetRadius)
          .attr('cy', Math.sin(angle) * planetRadius)
          .attr('r', planetRadius_local)
          .attr('fill', isSelected ? (planetColors[name] ?? '#ffffff') : '#ffffff')
          .attr('stroke', planetColors[name] ?? '#333333')
          .attr('stroke-width', isHighlighted ? 4 : 2)
          .attr('fill-opacity', 0.9)
          .style('filter', isSelected ? 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' : 'none');

        // Planet symbol
        planetGroup
          .append('text')
          .attr('x', Math.cos(angle) * planetRadius)
          .attr('y', Math.sin(angle) * planetRadius)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', isSelected ? '20' : (size === 'sm' ? '14' : '16'))
          .attr('font-weight', 'bold')
          .attr('fill', isSelected ? '#ffffff' : (planetColors[name] ?? '#333333'))
          .text(planetSymbols[name] ?? name.slice(0, 2).toUpperCase());

        // Retrograde indicator
        if (planet.retrograde) {
          planetGroup
            .append('text')
            .attr('x', Math.cos(angle) * planetRadius + 15)
            .attr('y', Math.sin(angle) * planetRadius - 15)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12')
            .attr('font-weight', 'bold')
            .attr('fill', '#FF0000')
            .text('℞');
        }

        // Animation
        if (showAnimation) {
          planetGroup
            .style('opacity', 0)
            .transition()
            .delay(index * 100)
            .duration(600)
            .style('opacity', 1);
        }
      });
    }

    // Draw aspects
    if (showAspects && data?.aspects && Array.isArray(data.aspects) && data.aspects.length > 0) {
      data.aspects.forEach((aspect, index) => {
        if (
          typeof aspect.planet1 !== 'string' ||
          typeof aspect.planet2 !== 'string' ||
          !(aspect.planet1 in data.planets) ||
          !(aspect.planet2 in data.planets)
        ) return;

        const planet1 = data.planets[aspect.planet1];
        const planet2 = data.planets[aspect.planet2];
        if (!planet1 || !planet2) return;

        const angle1 = ((planet1.position - 90) * Math.PI) / 180;
        const angle2 = ((planet2.position - 90) * Math.PI) / 180;
        const aspectId = `${aspect.planet1}-${aspect.planet2}`;
        const isHighlighted = interactive &&
          Array.isArray(interactiveState.highlightedAspects) &&
          interactiveState.highlightedAspects.includes(aspectId);

        const line = g
          .append('line')
          .attr('class', 'aspect-line')
          .attr('x1', Math.cos(angle1) * aspectRadius)
          .attr('y1', Math.sin(angle1) * aspectRadius)
          .attr('x2', Math.cos(angle2) * aspectRadius)
          .attr('y2', Math.sin(angle2) * aspectRadius)
          .attr('stroke', aspectColors[aspect.aspect_type] ?? '#666666')
          .attr('stroke-width', isHighlighted ? 3 : aspect.orb <= 2 ? 2 : 1)
          .attr('stroke-opacity', isHighlighted ? 0.8 : 0.4)
          .attr('stroke-dasharray', getAspectDashArray(aspect.aspect_type))
          .style('cursor', interactive ? 'pointer' : 'default');

        if (interactive) {
          line
            .on('click', () => handleAspectClick(aspect))
            .on('mouseover', function (event: MouseEvent) {
              d3.select(this).attr('stroke-opacity', 0.8).attr('stroke-width', 3);
              const tooltipContent = `
                <strong>${aspect.aspect_type.charAt(0).toUpperCase() + aspect.aspect_type.slice(1)}</strong><br/>
                ${aspect.planet1} - ${aspect.planet2}<br/>
                Orb: ${aspect.orb.toFixed(1)}°<br/>
                Strength: ${aspect.orb <= 2 ? 'Strong' : aspect.orb <= 5 ? 'Medium' : 'Weak'}
              `;
              showTooltip(tooltipContent, { pageX: event.pageX, pageY: event.pageY });
            })
            .on('mouseout', function () {
              if (!isHighlighted) {
                d3.select(this)
                  .attr('stroke-opacity', 0.4)
                  .attr('stroke-width', aspect.orb <= 2 ? 2 : 1);
              }
              hideTooltip();
            });
        }

        // Animation for aspects
        if (showAnimation) {
          line
            .attr('stroke-dashoffset', 100)
            .transition()
            .delay(1000 + index * 50)
            .duration(800)
            .attr('stroke-dashoffset', 0);
        }
      });
    }

    // Draw chart borders
    g.append('circle')
      .attr('cx', 0).attr('cy', 0).attr('r', outerRadius)
      .attr('fill', 'none')
      .attr('stroke', '#2c3e50')
      .attr('stroke-width', interactive ? 4 : 3);

    g.append('circle')
      .attr('cx', 0).attr('cy', 0).attr('r', innerRadius)
      .attr('fill', '#ffffff')
      .attr('fill-opacity', interactive ? 0.8 : 1)
      .attr('stroke', '#2c3e50')
      .attr('stroke-width', 2);

    // Center point
    g.append('circle')
      .attr('cx', 0).attr('cy', 0).attr('r', interactive ? 5 : 3)
      .attr('fill', '#2c3e50');

  }, [
    data, showAspects, showAnimation, interactiveState, chartConstants,
    handlePlanetClick, handleAspectClick, showTooltip, hideTooltip, interactive, size
  ]);

  // Utility functions
  const formatDegree = (degree: number): string => {
    const signIndex = Math.floor(degree / 30);
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
    ];
    const degreeInSign = Math.floor(degree % 30);
    const minutes = Math.floor((degree % 1) * 60);
    const signName = signs[signIndex] ?? 'Unknown';
    return `${degreeInSign}°${minutes.toString().padStart(2, '0')}' ${signName}`;
  };

  const getSignElement = (sign: string): string => {
    const elements: Record<string, string> = {
      Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
      Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
      Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
    };
    return elements[sign] ?? 'Unknown';
  };

  const getSignQuality = (sign: string): string => {
    const qualities: Record<string, string> = {
      Aries: 'Cardinal', Taurus: 'Fixed', Gemini: 'Mutable', Cancer: 'Cardinal',
      Leo: 'Fixed', Virgo: 'Mutable', Libra: 'Cardinal', Scorpio: 'Fixed',
      Sagittarius: 'Mutable', Capricorn: 'Cardinal', Aquarius: 'Fixed', Pisces: 'Mutable',
    };
    return qualities[sign] ?? 'Unknown';
  };

  const getAspectDashArray = (aspectType: string): string => {
    switch (aspectType) {
      case 'conjunction':
      case 'opposition':
        return 'none';
      case 'trine':
        return '8,2';
      case 'square':
        return '4,4';
      case 'sextile':
        return '6,3';
      case 'quincunx':
        return '3,3';
      default:
        return '2,2';
    }
  };

  // Control handlers (only for interactive mode)
  const handleRefresh = () => {
    setIsAnimating(true);
    void refetch().finally(() => setIsAnimating(false));
  };

  const toggleTransits = () => {
    setInteractiveState(prev => ({
      ...prev,
      showTransits: !prev.showTransits,
    }));
  };

  const resetSelection = () => {
    setInteractiveState(prev => ({
      ...prev,
      selectedPlanet: null,
      highlightedAspects: [],
      zoomLevel: 1,
      rotationOffset: 0,
    }));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setInteractiveState(prev => ({
      ...prev,
      zoomLevel: Math.max(
        0.5,
        Math.min(2, prev.zoomLevel + (direction === 'in' ? 0.1 : -0.1))
      ),
    }));
  };

  // Loading and error states
  if (isLoading && preTransformedData === null) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-gold'></div>
        <span className='ml-2 text-cosmic-silver'>
          Loading{interactive ? ' interactive' : ''} chart...
        </span>
      </div>
    );
  }

  if (error !== null && error !== undefined) {
    return (
      <div className='text-center p-8'>
        <div className='text-red-500 mb-4'>Error loading chart</div>
        <Button onClick={handleRefresh} variant='secondary'>
          Try Again
        </Button>
      </div>
    );
  }

  if (data === null || data === undefined) {
    return (
      <div className='text-center p-8'>
        <div className='text-cosmic-silver mb-4'>No chart data available</div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 ${className}`}>
      {/* Control Panel (only in interactive mode) */}
      {interactive && showControls && (
        <div className='chart-control-panel mb-6'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <h3 className='text-xl font-semibold text-cosmic-gold'>
              Interactive Natal Chart
            </h3>

            <div className='flex flex-wrap gap-2'>
              <Button
                onClick={toggleTransits}
                variant={interactiveState.showTransits ? 'default' : 'secondary'}
                className='text-sm'
              >
                {interactiveState.showTransits ? '🔄 Hide Transits' : '🔄 Show Transits'}
              </Button>

              <Button onClick={() => handleZoom('in')} variant='secondary' className='text-sm'>
                🔍+
              </Button>

              <Button onClick={() => handleZoom('out')} variant='secondary' className='text-sm'>
                🔍-
              </Button>

              <Button onClick={resetSelection} variant='secondary' className='text-sm'>
                🔄 Reset
              </Button>

              <Button
                onClick={handleRefresh}
                variant='secondary'
                disabled={isAnimating}
                className='text-sm'
              >
                {isAnimating ? 'Refreshing...' : '↻ Refresh'}
              </Button>
            </div>
          </div>

          {/* Selection Info */}
          {interactiveState.selectedPlanet && (
            <div className='chart-selection-info mt-4'>
              <h4 className='text-cosmic-gold font-semibold mb-2'>
                Selected: {interactiveState.selectedPlanet.charAt(0).toUpperCase() + interactiveState.selectedPlanet.slice(1)}
              </h4>
              <div className='text-cosmic-silver text-sm space-y-1'>
                <div>
                  Position: {formatDegree(data.planets[interactiveState.selectedPlanet as PlanetName]?.position ?? 0)}
                </div>
                <div>
                  House: {data.planets[interactiveState.selectedPlanet as PlanetName]?.house ?? 'Unknown'}
                </div>
                {data.planets[interactiveState.selectedPlanet as PlanetName]?.retrograde && (
                  <div className='text-red-400'>Status: Retrograde ℞</div>
                )}
                {interactiveState.highlightedAspects.length > 0 && (
                  <div>Aspects: {interactiveState.highlightedAspects.length} highlighted</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Non-interactive header */}
      {!interactive && showControls && (
        <div className='mb-4 flex justify-between items-center'>
          <h3 className='text-xl font-semibold text-cosmic-gold'>Natal Chart</h3>
          <div className='flex gap-2'>
            <Button onClick={handleRefresh} variant='secondary' disabled={isAnimating}>
              {isAnimating ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div className={`relative ${interactive ? 'bg-gradient-to-br from-gray-50 to-gray-100' : 'bg-white'} rounded-lg p-6 border border-gray-300 shadow-lg`}>
        <svg 
          ref={svgRef} 
          className={`w-full h-auto max-w-[${sizeConfig.width}px] mx-auto`}
        />

        {/* Tooltip (only in interactive mode) */}
        {interactive && (
          <div 
            ref={tooltipRef} 
            className="chart-tooltip"
          />
        )}

        {/* Legend */}
        {showAspects && data.aspects && data.aspects.length > 0 && (
          <div className='mt-6 text-sm text-gray-700'>
            <div className='font-medium mb-3 text-gray-900'>
              Major Aspects ({data.aspects.length})
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs'>
              {data.aspects.slice(0, 9).map((aspect, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 bg-gray-50 rounded border ${interactive ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={interactive ? () => handleAspectClick(aspect) : undefined}
                  onKeyDown={interactive ? (e) => e.key === 'Enter' && handleAspectClick(aspect) : undefined}
                  tabIndex={interactive ? 0 : -1}
                  {...(interactive && {
                    role: 'button',
                    'aria-label': `View aspect: ${aspect.aspect_type} between ${aspect.planet1} and ${aspect.planet2}`
                  })}
                >
                  <span className='capitalize font-medium'>{aspect.aspect_type}</span>
                  <span className='text-gray-600'>{aspect.planet1} - {aspect.planet2}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Legend */}
        {interactive && (
          <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <h5 className='font-semibold text-gray-800 mb-2'>Aspect Colors</h5>
              <div className='space-y-1'>
                {Object.entries(chartConstants.aspectColors).map(([type, _color]) => (
                  <div key={type} className='flex items-center gap-2'>
                    <div className={`aspect-legend-line ${type}`} />
                    <span className='capitalize text-gray-700'>{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {interactiveState.showTransits && (
              <div>
                <h5 className='font-semibold text-gray-800 mb-2'>Transits</h5>
                <div className='text-gray-600 text-xs'>
                  Hollow circles show current planetary positions
                </div>
              </div>
            )}

            <div>
              <h5 className='font-semibold text-gray-800 mb-2'>Controls</h5>
              <div className='text-gray-600 text-xs space-y-1'>
                <div>• Click planets to highlight aspects</div>
                <div>• Hover for detailed information</div>
                <div>• Use zoom controls to explore</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ChartWheelUnified);
