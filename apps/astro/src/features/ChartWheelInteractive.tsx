/**
 * Advanced Interactive Chart Wheel with Real-Time Features
 * Enhanced version with tooltips, animations, and real-time updates
 */

import React, { useEffect, useRef, memo, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useQuery } from '@tanstack/react-query';
import { fetchChartData, type ChartBirthData } from '../services/api';
import { Button } from '@cosmichub/ui';
import styles from './ChartWheelInteractive.module.css';

import type { AspectType, Planet as APIPlanet, House as APIHouse, Aspect as APIAspect, ChartData as APIChartData } from '../services/api.types';

// Enhanced interfaces for interactivity that extend API types
interface Planet extends Omit<APIPlanet, 'dignity' | 'essential_dignity' | 'sign' | 'name'> {
  name: string;
  color?: string;
}

interface House extends Omit<APIHouse, 'sign'> {
  sign: string;
  planets?: string[];
}

export interface Aspect extends Omit<APIAspect, 'aspect_type' | 'power' | 'planet1' | 'planet2' | 'exact'> {
  planet1: string;
  planet2: string;
  angle: number;
  type: AspectType;
  strength: 'strong' | 'medium' | 'weak';
  exact?: boolean;
}

interface ChartData extends Omit<APIChartData, 'planets' | 'houses' | 'aspects' | 'house_system' | 'sidereal'> {
  planets: Record<string, Planet>;
  houses: House[];
  aspects?: Aspect[];
  transits?: Record<string, Planet>; // Real-time transit positions
}

interface InteractiveState {
  selectedPlanet: string | null;
  hoveredElement: string | null;
  showTransits: boolean;
  highlightedAspects: string[];
  zoomLevel: number;
  rotationOffset: number;
}

interface ChartWheelInteractiveProps {
  birthData?: ChartBirthData;
  chartData?: ChartData;
  showAspects?: boolean;
  showAnimation?: boolean;
  showTransits?: boolean;
  realTimeUpdates?: boolean;
  onPlanetSelect?: (planet: string) => void;
  onAspectSelect?: (aspect: Aspect) => void;
}

const ChartWheelInteractive: React.FC<ChartWheelInteractiveProps> = ({
  birthData,
  chartData: preTransformedData,
  showAspects = true,
  showAnimation = true,
  showTransits = false,
  realTimeUpdates = false,
  onPlanetSelect,
  onAspectSelect
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
    rotationOffset: 0
  });

  // Fetch natal chart data
  const { data: fetchedData, isLoading, error, refetch } = useQuery<ChartData>({
    queryKey: ['chartData', birthData],
    queryFn: async () => {
      if (birthData === null || birthData === undefined) throw new Error('Birth data required');
      const response = await fetchChartData(birthData);
      return transformAPIResponseToChartData(response);
    },
    enabled: birthData !== null && birthData !== undefined && preTransformedData === null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Fetch real-time transit data
  const { data: transitData } = useQuery<Record<string, Planet>>({
    queryKey: ['transitData'],
    queryFn: async () => {
      const currentTime = new Date();
      const transitBirthData: ChartBirthData = {
        year: currentTime.getFullYear(),
        month: currentTime.getMonth() + 1,
        day: currentTime.getDate(),
        hour: currentTime.getHours(),
        minute: currentTime.getMinutes(),
        lat: 0, // Use chart location or default
        lon: 0,
        timezone: 'UTC',
        city: 'Greenwich'
      };
      const response = await fetchChartData(transitBirthData);
      return response.planets ?? {};
    },
    enabled: realTimeUpdates === true && interactiveState.showTransits === true,
    refetchInterval: 60000, // Update every minute
    staleTime: 30000
  });

  const data = preTransformedData ?? fetchedData;

  // Transform API response with type-safe handling
    // Transform API response with proper typing
  const transformAPIResponseToChartData = (apiData: APIChartData): ChartData => {
    const transformedPlanets: Record<string, Planet> = {};
    const planets = apiData.planets ?? {};
    
    Object.entries(planets).forEach(([name, planetData]) => {
      if (planetData === null || planetData === undefined || typeof planetData !== 'object') {
        return;
      }
      
      // Safe access with type checking
      const planetObj = planetData as unknown as Record<string, unknown>;
      const position = typeof planetObj.position === 'number' ? planetObj.position : 0;
      const retrograde = planetObj.retrograde === true;
      const speed = typeof planetObj.speed === 'number' ? planetObj.speed : 0;
      
      transformedPlanets[name] = {
        name,
        position,
        retrograde,
        speed,
        house: calculateHouseForPlanet(position)
      };
    });

    const transformedHouses: House[] = (apiData.houses ?? []).map(houseData => ({
      number: houseData.number,
      cusp: houseData.cusp,
      sign: houseData.sign,
      planets: []
    }));

    // Add planets to houses
    Object.entries(transformedPlanets).forEach(([planetName, planet]) => {
      const house = transformedHouses.find(h => h.number === planet.house);
      if (house !== null && house !== undefined) {
        house.planets ??= [];
        house.planets.push(planetName);
      }
    });

    const transformedAspects = (apiData.aspects ?? []).map(aspect => ({
      planet1: aspect.planet1,
      planet2: aspect.planet2,
      angle: getAspectAngle(aspect.aspect_type),
      orb: aspect.orb,
      type: aspect.aspect_type,
      applying: aspect.applying,
      strength: getAspectStrength(aspect.orb)
    }));

    return {
      planets: transformedPlanets,
      houses: transformedHouses.sort((a, b) => a.number - b.number),
      aspects: transformedAspects,
      angles: apiData.angles,
      transits: transitData,
      latitude: apiData.latitude ?? 0,
      longitude: apiData.longitude ?? 0,
      timezone: apiData.timezone ?? 'UTC',
      julian_day: apiData.julian_day ?? 0
    };
  };

  // Utility functions
  const calculateHouseForPlanet = (position: number): number => {
    if (position === null || position === undefined) return 1;
    // Simple house calculation - in production, use more accurate method
    return Math.floor(position / 30) + 1;
  };

  const getAspectAngle = (aspectType: string): number => {
    const aspectAngles: Record<string, number> = {
      'conjunction': 0, 'opposition': 180, 'trine': 120,
      'square': 90, 'sextile': 60, 'quincunx': 150
    };
    const key = aspectType.toLowerCase();
    return aspectAngles[key] ?? 0;
  };

  const getAspectStrength = (orb: number): 'strong' | 'medium' | 'weak' => {
    if (orb !== null && orb !== undefined) {
      if (typeof orb === 'number') {
        if (orb === 0 || orb <= 2) return 'strong';
        if (orb > 2 && orb <= 5) return 'medium';
      }
    }
    return 'weak';
  };

  // Interactive event handlers
  const handlePlanetClick = useCallback((planetName: string) => {
    setInteractiveState(prev => ({
      ...prev,
      selectedPlanet: prev.selectedPlanet === planetName ? null : planetName,
      highlightedAspects: prev.selectedPlanet === planetName ? [] : 
        (data?.aspects?.filter(a => a.planet1 === planetName || a.planet2 === planetName).map(a => `${a.planet1}-${a.planet2}`) ?? [])
    }));
    onPlanetSelect?.(planetName);
  }, [data?.aspects, onPlanetSelect]);

  const handleAspectClick = useCallback((aspect: Aspect) => {
    onAspectSelect?.(aspect);
    setInteractiveState(prev => ({
      ...prev,
      highlightedAspects: [`${aspect.planet1}-${aspect.planet2}`]
    }));
  }, [onAspectSelect]);

  const showTooltip = useCallback((content: string, event: { pageX: number; pageY: number }) => {
    if (
      tooltipRef.current === null || 
      tooltipRef.current === undefined ||
      typeof content !== 'string' ||
      content.length === 0 ||
      typeof event?.pageX !== 'number' ||
      typeof event?.pageY !== 'number'
    ) {
      return;
    }
    
    tooltipRef.current.innerHTML = content;
    tooltipRef.current.style.display = 'block';
    tooltipRef.current.style.left = `${event.pageX + 10}px`;
    tooltipRef.current.style.top = `${event.pageY - 10}px`;
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipRef.current === null) return;
    tooltipRef.current.style.display = 'none';
  }, []);

  // Chart constants with enhanced styling
  const chartConstants = useMemo(() => ({
    width: 900,
    height: 900,
    radius: 380,
    center: { x: 450, y: 450 },
    signs: [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ],
    signSymbols: ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'],
    signColors: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7', '#00B894'
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
      conjunction: '#FF0000', opposition: '#0066CC', trine: '#00AA00',
      square: '#FF6600', sextile: '#9966FF', quincunx: '#666666'
    } as Record<string, string>,
    transitColors: {
      sun: '#FFD700AA', moon: '#E8E8E8AA', mercury: '#87CEEBAA', venus: '#32CD32AA', mars: '#FF4500AA'
    } as Record<string, string>
  }), []);

  // Main chart rendering effect
  useEffect(() => {
    if (data === null || data === undefined || svgRef.current === null) {
      return;
    }

    const { width, height, radius, center, signs, signSymbols, signColors, planetSymbols, planetColors, aspectColors } = chartConstants;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'mx-auto cursor-crosshair')
      .style('background', 'radial-gradient(circle, #f8f9fa 0%, #e9ecef 100%)')
      .attr('role', 'img')
      .attr('aria-label', 'Interactive astrological natal chart wheel');

    const g = svg.append('g')
      .attr('transform', `translate(${center.x}, ${center.y}) scale(${interactiveState.zoomLevel}) rotate(${interactiveState.rotationOffset})`);

    // Define enhanced ring radii
    const outerRadius = radius;
    const signBandRadius = radius - 30;
    const houseNumberRadius = radius - 60;
    const planetRadius = radius - 90;
    const transitRadius = radius - 120;
    const aspectRadius = radius - 180;
    const innerRadius = radius - 200;

    // Draw zodiac sign bands with gradients
    const defs = svg.append('defs');
    signColors.forEach((color, index) => {
      const gradient = defs.append('linearGradient')
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
      const startAngle = (index * 30 - 90) * Math.PI / 180;
      const endAngle = ((index + 1) * 30 - 90) * Math.PI / 180;

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
        .on('mouseover', function(this: SVGPathElement, event: MouseEvent) {
          if (sign.length > 0) {
            d3.select(this).attr('fill-opacity', 0.8);
            showTooltip(`<strong>${sign}</strong><br/>Element: ${getSignElement(sign)}<br/>Quality: ${getSignQuality(sign)}`, { 
              pageX: event.pageX, 
              pageY: event.pageY 
            });
          }
        })
        .on('mouseout', function() {
          d3.select(this).attr('fill-opacity', 1);
          hideTooltip();
        });

      // Sign symbols
      const midAngle = (index * 30 + 15 - 90) * Math.PI / 180;
      g.append('text')
        .attr('x', Math.cos(midAngle) * (signBandRadius + 15))
        .attr('y', Math.sin(midAngle) * (signBandRadius + 15))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '24')
        .attr('font-weight', 'bold')
        .attr('fill', signColors[index])
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5)
        .text(signSymbols[index])
        .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.3)');
    });

    // Draw house divisions and numbers
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      
      // House division lines
      g.append('line')
        .attr('x1', Math.cos(angle) * innerRadius)
        .attr('y1', Math.sin(angle) * innerRadius)
        .attr('x2', Math.cos(angle) * outerRadius)
        .attr('y2', Math.sin(angle) * outerRadius)
        .attr('stroke', '#333333')
        .attr('stroke-width', i % 3 === 0 ? 3 : 1.5) // Emphasize angular houses
        .attr('stroke-opacity', 0.7);

      // House numbers
      const midAngle = (i * 30 + 15 - 90) * Math.PI / 180;
      const houseData = data.houses.find(h => h.number === i + 1);
      
      g.append('text')
        .attr('x', Math.cos(midAngle) * houseNumberRadius)
        .attr('y', Math.sin(midAngle) * houseNumberRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '18')
        .attr('font-weight', 'bold')
        .attr('fill', '#2c3e50')
        .text((i + 1).toString())
        .style('cursor', 'pointer')
        .on('mouseover', function(event: MouseEvent) {
          showTooltip(`<strong>House ${i + 1}</strong><br/>Sign: ${houseData?.sign ?? 'Unknown'}<br/>Planets: ${houseData?.planets?.join(', ') ?? 'None'}`, { 
            pageX: event.pageX, 
            pageY: event.pageY 
          });
        })
        .on('mouseout', hideTooltip);
    }

    // Draw natal planets with enhanced interactivity
    Object.entries(data.planets).forEach(([name, planet], index) => {
      const angle = (planet.position - 90) * Math.PI / 180;
      const isSelected = interactiveState.selectedPlanet === name;
      const isHighlighted = interactiveState.highlightedAspects.some(aspectId => 
        aspectId.includes(name)
      );

      const planetGroup = g.append('g')
        .attr('class', 'planet-group')
        .style('cursor', 'pointer')
        .on('click', () => handlePlanetClick(name))
        .on('mouseover', function(event: MouseEvent) {
          d3.select(this).select('circle').attr('r', 25);
          const tooltipContent = `
            <strong>${name.charAt(0).toUpperCase() + name.slice(1)}</strong><br/>
            Position: ${formatDegree(planet.position)}<br/>
            House: ${planet.house}<br/>
            ${planet.retrograde ? '<span style="color: red;">Retrograde ℞</span>' : 'Direct'}
          `;
          showTooltip(tooltipContent, { 
            pageX: event.pageX, 
            pageY: event.pageY 
          });
        })
        .on('mouseout', function() {
          if (isSelected === false) {
            d3.select(this).select('circle').attr('r', 20);
          }
          hideTooltip();
        });

      // Planet background circle
      planetGroup.append('circle')
        .attr('cx', Math.cos(angle) * planetRadius)
        .attr('cy', Math.sin(angle) * planetRadius)
        .attr('r', isSelected ? 25 : 20)
        .attr('fill', isSelected ? planetColors[name] : '#ffffff')
        .attr('stroke', planetColors[name] ?? '#333333')
        .attr('stroke-width', isHighlighted ? 4 : 2)
        .attr('fill-opacity', 0.9)
        .style('filter', isSelected ? 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' : 'none');

      // Planet symbol
      planetGroup.append('text')
        .attr('x', Math.cos(angle) * planetRadius)
        .attr('y', Math.sin(angle) * planetRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', isSelected ? '20' : '16')
        .attr('font-weight', 'bold')
        .attr('fill', isSelected ? '#ffffff' : (planetColors[name] ?? '#333333'))
          .text(planetSymbols[name] ?? name.slice(0, 2).toUpperCase());      // Retrograde indicator
      if (planet.retrograde) {
        planetGroup.append('text')
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

    // Draw transits if enabled
    if (interactiveState.showTransits === true && transitData !== null && transitData !== undefined) {
      Object.entries(transitData).forEach(([name, planet]) => {
        const natalPlanet = data.planets[name];
        if (natalPlanet === undefined || natalPlanet === null) return; // Only show transits for natal planets

        const angle = (planet.position - 90) * Math.PI / 180;
        
        const transitGroup = g.append('g')
          .attr('class', 'transit-group')
          .style('cursor', 'pointer')
          .on('mouseover', function(event: MouseEvent) {
            const tooltipContent = `
              <strong>Transit ${name.charAt(0).toUpperCase() + name.slice(1)}</strong><br/>
              Current Position: ${formatDegree(planet.position)}<br/>
              Natal Position: ${formatDegree(data.planets[name].position)}
            `;
            showTooltip(tooltipContent, { 
              pageX: event.pageX, 
              pageY: event.pageY 
            });
          })
          .on('mouseout', hideTooltip);

        // Transit planet (hollow circle)
        transitGroup.append('circle')
          .attr('cx', Math.cos(angle) * transitRadius)
          .attr('cy', Math.sin(angle) * transitRadius)
          .attr('r', 15)
          .attr('fill', 'none')
          .attr('stroke', planetColors[name] ?? '#333333')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3,3');

        // Transit symbol
        transitGroup.append('text')
          .attr('x', Math.cos(angle) * transitRadius)
          .attr('y', Math.sin(angle) * transitRadius)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '12')
          .attr('font-weight', 'bold')
          .attr('fill', (typeof planetColors[name] === 'string' && planetColors[name].length > 0) ? planetColors[name] : '#333333')
          .text((typeof planetSymbols[name] === 'string' && planetSymbols[name].length > 0) ? planetSymbols[name] : name.slice(0, 1).toUpperCase());

        // Connect transit to natal position
        const natalAngle = (data.planets[name].position - 90) * Math.PI / 180;
        g.append('line')
          .attr('x1', Math.cos(natalAngle) * planetRadius)
          .attr('y1', Math.sin(natalAngle) * planetRadius)
          .attr('x2', Math.cos(angle) * transitRadius)
          .attr('y2', Math.sin(angle) * transitRadius)
          .attr('stroke', typeof planetColors[name] === 'string' ? planetColors[name] : '#333333')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.3)
          .attr('stroke-dasharray', '2,2');
      });
    }

    // Draw aspects with enhanced interactivity
    if (showAspects === true && Array.isArray(data.aspects) && data.aspects.length > 0) {
      data.aspects.forEach((aspect, index) => {
        if (
          typeof aspect.planet1 !== 'string' || 
          typeof aspect.planet2 !== 'string' ||
          !(aspect.planet1 in data.planets) ||
          !(aspect.planet2 in data.planets)
        ) {
          return;
        }

        const planet1 = data.planets[aspect.planet1];
        const planet2 = data.planets[aspect.planet2];
        
        if (
          typeof planet1?.position !== 'number' || 
          typeof planet2?.position !== 'number'
        ) {
          return;
        }

        const angle1 = (planet1.position - 90) * Math.PI / 180;
        const angle2 = (planet2.position - 90) * Math.PI / 180;
        const aspectId = `${aspect.planet1}-${aspect.planet2}`;
        const isHighlighted = Array.isArray(interactiveState.highlightedAspects) && 
          interactiveState.highlightedAspects.includes(aspectId);

        const line = g.append('line')
          .attr('class', 'aspect-line')
          .attr('x1', Math.cos(angle1) * aspectRadius)
          .attr('y1', Math.sin(angle1) * aspectRadius)
          .attr('x2', Math.cos(angle2) * aspectRadius)
          .attr('y2', Math.sin(angle2) * aspectRadius)
          .attr('stroke', aspectColors[aspect.type] ?? '#666666')
          .attr('stroke-width', isHighlighted ? 3 : (aspect.strength === 'strong' ? 2 : 1))
          .attr('stroke-opacity', isHighlighted ? 0.8 : 0.4)
          .attr('stroke-dasharray', getAspectDashArray(aspect.type))
          .style('cursor', 'pointer')
          .on('click', () => handleAspectClick(aspect))
          .on('mouseover', function(event: MouseEvent) {
            d3.select(this).attr('stroke-opacity', 0.8).attr('stroke-width', 3);
            const tooltipContent = `
              <strong>${aspect.type.charAt(0).toUpperCase() + aspect.type.slice(1)}</strong><br/>
              ${aspect.planet1} - ${aspect.planet2}<br/>
              Orb: ${aspect.orb.toFixed(1)}°<br/>
              Strength: ${aspect.strength}
            `;
            showTooltip(tooltipContent, { 
              pageX: event.pageX, 
              pageY: event.pageY 
            });
          })
          .on('mouseout', function() {
            if (!isHighlighted) {
              d3.select(this).attr('stroke-opacity', 0.4).attr('stroke-width', aspect.strength === 'strong' ? 2 : 1);
            }
            hideTooltip();
          });

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
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', outerRadius)
      .attr('fill', 'none')
      .attr('stroke', '#2c3e50')
      .attr('stroke-width', 4);

    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', innerRadius)
      .attr('fill', '#ffffff')
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#2c3e50')
      .attr('stroke-width', 2);

    // Center point
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 5)
      .attr('fill', '#2c3e50');

  }, [data, showAspects, showAnimation, interactiveState, transitData, chartConstants, handlePlanetClick, handleAspectClick, showTooltip, hideTooltip]);

  // Utility functions
  const formatDegree = (degree: number): string => {
    const signIndex = Math.floor(degree / 30);
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const degreeInSign = Math.floor(degree % 30);
    const minutes = Math.floor((degree % 1) * 60);
    return `${degreeInSign}°${minutes.toString().padStart(2, '0')}' ${signs[signIndex]}`;
  };

  const getSignElement = (sign: string): string => {
    const elements: Record<string, string> = {
      Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
      Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
      Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water'
    };
    return elements[sign] ?? 'Unknown';
  };

  const getSignQuality = (sign: string): string => {
    const qualities: Record<string, string> = {
      Aries: 'Cardinal', Taurus: 'Fixed', Gemini: 'Mutable', Cancer: 'Cardinal',
      Leo: 'Fixed', Virgo: 'Mutable', Libra: 'Cardinal', Scorpio: 'Fixed',
      Sagittarius: 'Mutable', Capricorn: 'Cardinal', Aquarius: 'Fixed', Pisces: 'Mutable'
    };
    return qualities[sign] ?? 'Unknown';
  };

  const getAspectDashArray = (aspectType: string): string => {
              if (typeof aspectType !== 'string' || aspectType.length === 0) return 'none';
    switch (aspectType) {
      case 'conjunction':
      case 'opposition': return 'none';
      case 'trine': return '8,2';
      case 'square': return '4,4';
      case 'sextile': return '6,3';
      case 'quincunx': return '3,3';
      default: return '2,2';
    }
  };

  // Control handlers
  const handleRefresh = () => {
    setIsAnimating(true);
    void refetch().finally(() => setIsAnimating(false));
  };

  const toggleTransits = () => {
    setInteractiveState(prev => ({ 
      ...prev, 
      showTransits: !prev.showTransits 
    }));
  };

  const resetSelection = () => {
    setInteractiveState(prev => ({
      ...prev,
      selectedPlanet: null,
      highlightedAspects: [],
      zoomLevel: 1,
      rotationOffset: 0
    }));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setInteractiveState(prev => ({
      ...prev,
      zoomLevel: Math.max(0.5, Math.min(2, prev.zoomLevel + (direction === 'in' ? 0.1 : -0.1)))
    }));
  };

  if (isLoading && preTransformedData === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-gold"></div>
        <span className="ml-2 text-cosmic-silver">Loading interactive chart...</span>
      </div>
    );
  }

  if (error !== null && error !== undefined) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">Error loading chart</div>
        <Button onClick={handleRefresh} variant="secondary">
          Try Again
        </Button>
      </div>
    );
  }

  if (data === null || data === undefined) {
    return (
      <div className="text-center p-8">
        <div className="text-cosmic-silver mb-4">No chart data available</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Control Panel */}
      <div className={styles.controlPanel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-cosmic-gold">Interactive Natal Chart</h3>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={toggleTransits} 
              variant={interactiveState.showTransits === true ? "primary" : "secondary"}
              className="text-sm"
            >
              {interactiveState.showTransits ? '🔄 Hide Transits' : '🔄 Show Transits'}
            </Button>
            
            <Button onClick={() => handleZoom('in')} variant="secondary" className="text-sm">
              🔍+
            </Button>
            
            <Button onClick={() => handleZoom('out')} variant="secondary" className="text-sm">
              🔍-
            </Button>
            
            <Button onClick={resetSelection} variant="secondary" className="text-sm">
              🔄 Reset
            </Button>
            
            <Button onClick={handleRefresh} variant="secondary" disabled={isAnimating} className="text-sm">
              {isAnimating ? 'Refreshing...' : '↻ Refresh'}
            </Button>
          </div>
        </div>

        {/* Selection Info */}
        {interactiveState.selectedPlanet !== null && interactiveState.selectedPlanet !== undefined && (
          <div className={styles.selectionInfo}>
            <h4 className="text-cosmic-gold font-semibold mb-2">
              Selected: {interactiveState.selectedPlanet.charAt(0).toUpperCase() + interactiveState.selectedPlanet.slice(1)}
            </h4>
            <div className="text-cosmic-silver text-sm space-y-1">
              <div>Position: {formatDegree(data.planets[interactiveState.selectedPlanet]?.position ?? 0)}</div>
              <div>House: {data.planets[interactiveState.selectedPlanet]?.house ?? 'Unknown'}</div>
              {data.planets[interactiveState.selectedPlanet]?.retrograde === true && (
                <div className="text-red-400">Status: Retrograde ℞</div>
              )}
              {Array.isArray(interactiveState.highlightedAspects) && interactiveState.highlightedAspects.length > 0 && (
                <div>Aspects: {interactiveState.highlightedAspects.length} highlighted</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className={styles.chartContainer}>
        <svg 
          ref={svgRef} 
          className={styles.chartSvg}
        />
        
        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className={styles.chartTooltip}
        />

        {/* Legend */}
        {Array.isArray(data.aspects) && data.aspects.length > 0 && showAspects === true && (
          <div className={styles.chartLegend}>
            <div>
              <h5 className="font-semibold text-gray-800 mb-2">Major Aspects ({data.aspects.length})</h5>
              <div className="space-y-1">
                {Object.entries(chartConstants.aspectColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div 
                      className={`${styles.aspectLegendLine} aspect-color-${type}`}
                      data-aspect-color={color}
                    />
                    <span className="capitalize text-gray-700">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {interactiveState.showTransits && (
              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Transits</h5>
                <div className="text-gray-600 text-xs">
                  Hollow circles show current planetary positions
                </div>
              </div>
            )}

            <div>
              <h5 className="font-semibold text-gray-800 mb-2">Controls</h5>
              <div className="text-gray-600 text-xs space-y-1">
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

export default memo(ChartWheelInteractive);
