import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  memo,
  forwardRef,
  useImperativeHandle
} from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ErrorBoundary } from '@cosmichub/ui';

// Astrology-specific types
export interface AstrologyPlanet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde?: boolean;
  color: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  quality: 'cardinal' | 'fixed' | 'mutable';
}

export interface AstrologyAspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
  applying: boolean;
  color: string;
  strength: number;
}

export interface AstrologyHouse {
  number: number;
  sign: string;
  cusp: number;
  ruler: string;
  color: string;
}

export interface AstrologyChartConfig {
  width: number;
  height: number;
  innerRadius: number;
  outerRadius: number;
  showAspects: boolean;
  showHouses: boolean;
  showDegrees: boolean;
  animation: {
    duration: number;
    easing: (t: number) => number;
  };
  theme: {
    background: string;
    planets: Record<string, string>;
    aspects: Record<string, string>;
    houses: Record<string, string>;
    signs: Record<string, string>;
  };
  accessibility: {
    title: string;
    description: string;
    ariaLabel?: string;
  };
}

// Hover element type for tooltip data
export interface HoveredElement {
  type: 'planet' | 'aspect' | 'house' | null;
  data: AstrologyPlanet | AstrologyAspect | AstrologyHouse | null;
}

export interface AstrologyChartProps {
  planets: AstrologyPlanet[];
  aspects?: AstrologyAspect[];
  houses?: AstrologyHouse[];
  config: AstrologyChartConfig;
  interactive?: boolean;
  onPlanetClick?: (planet: AstrologyPlanet) => void;
  onAspectClick?: (aspect: AstrologyAspect) => void;
  onHouseClick?: (house: AstrologyHouse) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  testId?: string;
}

// Zodiac signs data
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'fire', quality: 'cardinal', color: '#ff6b6b' },
  { name: 'Taurus', symbol: '♉', element: 'earth', quality: 'fixed', color: '#51cf66' },
  { name: 'Gemini', symbol: '♊', element: 'air', quality: 'mutable', color: '#74c0fc' },
  { name: 'Cancer', symbol: '♋', element: 'water', quality: 'cardinal', color: '#9775fa' },
  { name: 'Leo', symbol: '♌', element: 'fire', quality: 'fixed', color: '#ffd43b' },
  { name: 'Virgo', symbol: '♍', element: 'earth', quality: 'mutable', color: '#69db7c' },
  { name: 'Libra', symbol: '♎', element: 'air', quality: 'cardinal', color: '#4dabf7' },
  { name: 'Scorpio', symbol: '♏', element: 'water', quality: 'fixed', color: '#da77f2' },
  { name: 'Sagittarius', symbol: '♐', element: 'fire', quality: 'mutable', color: '#ffa94d' },
  { name: 'Capricorn', symbol: '♑', element: 'earth', quality: 'cardinal', color: '#8ce99a' },
  { name: 'Aquarius', symbol: '♒', element: 'air', quality: 'fixed', color: '#339af0' },
  { name: 'Pisces', symbol: '♓', element: 'water', quality: 'mutable', color: '#e599f7' }
];

// Planet symbols and data
const PLANET_DATA = {
  Sun: { symbol: '☉', color: '#ffd43b', element: 'fire' },
  Moon: { symbol: '☽', color: '#9775fa', element: 'water' },
  Mercury: { symbol: '☿', color: '#74c0fc', element: 'air' },
  Venus: { symbol: '♀', color: '#ff6b9d', element: 'earth' },
  Mars: { symbol: '♂', color: '#ff6b6b', element: 'fire' },
  Jupiter: { symbol: '♃', color: '#ffd43b', element: 'fire' },
  Saturn: { symbol: '♄', color: '#8ce99a', element: 'earth' },
  Uranus: { symbol: '⛢', color: '#4dabf7', element: 'air' },
  Neptune: { symbol: '♆', color: '#da77f2', element: 'water' },
  Pluto: { symbol: '♇', color: '#e599f7', element: 'water' }
};

// Enhanced Astrology Chart Wheel Component
export const AstrologyChartWheel = memo(forwardRef<SVGSVGElement, AstrologyChartProps>(({
  planets,
  aspects = [],
  houses = [],
  config,
  interactive = true,
  onPlanetClick,
  onAspectClick,
  onHouseClick,
  loading = false,
  error = null,
  className = '',
  testId
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredElement, setHoveredElement] = useState<HoveredElement>({ type: null, data: null });
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Forward ref to parent
  useImperativeHandle(ref, () => svgRef.current!, []);

  // Combined ref for intersection observer
  const setRefs = useCallback((node: SVGSVGElement | null) => {
    (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = node;
    inViewRef(node);
  }, [inViewRef]);

  // Calculate position on the wheel
  const getPosition = useCallback((degree: number, radius: number) => {
    const radian = (degree - 90) * (Math.PI / 180); // Start from top
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  }, []);

  // Get sign from degree
  const _getSignFromDegree = useCallback((degree: number) => {
    return Math.floor(degree / 30) % 12;
  }, []);

  // Get house from degree (simplified)
  const _getHouseFromDegree = useCallback((degree: number, houses: AstrologyHouse[]) => {
    if (houses.length === 0) return 1;
    for (let i = 0; i < houses.length; i++) {
      const current = houses[i];
      const next = houses[(i + 1) % houses.length];
      if (current && next && degree >= current.cusp && degree < next.cusp) {
        return current.number;
      }
    }
    return 1;
  }, []);

  // Render the astrology chart wheel
  useEffect(() => {
    if (!svgRef.current || !inView || loading || error) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .attr('width', config.width)
      .attr('height', config.height)
      .attr('role', 'img')
      .attr('aria-label', config.accessibility.ariaLabel ?? config.accessibility.title)
      .append('g')
      .attr('transform', `translate(${config.width / 2}, ${config.height / 2})`);

    // Add title for accessibility
    g.append('title').text(config.accessibility.title);
    g.append('desc').text(config.accessibility.description);

    // Draw zodiac wheel background
    g.selectAll('.zodiac-segment')
      .data(ZODIAC_SIGNS)
      .enter()
      .append('path')
      .attr('class', 'zodiac-segment')
      .attr('d', (d, i) => {
        const arc = d3.arc()
          .innerRadius(config.innerRadius)
          .outerRadius(config.outerRadius)
          .startAngle((i * 30) * (Math.PI / 180))
          .endAngle(((i + 1) * 30) * (Math.PI / 180));
        return arc({
          innerRadius: config.innerRadius,
          outerRadius: config.outerRadius,
          startAngle: (i * 30) * (Math.PI / 180),
          endAngle: ((i + 1) * 30) * (Math.PI / 180)
        });
      })
      .attr('fill', d => d.color)
      .attr('stroke', config.theme.background)
      .attr('stroke-width', 1)
      .style('opacity', 0.3)
      .style('cursor', interactive ? 'pointer' : 'default');

    // Add zodiac sign symbols
    g.selectAll('.zodiac-symbol')
      .data(ZODIAC_SIGNS)
      .enter()
      .append('text')
      .attr('class', 'zodiac-symbol')
      .attr('x', (d, i) => getPosition(i * 30 + 15, config.outerRadius - 20).x)
      .attr('y', (d, i) => getPosition(i * 30 + 15, config.outerRadius - 20).y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '16px')
      .style('fill', '#ffffff')
      .style('font-weight', 'bold')
      .text(d => d.symbol);

    // Draw degree markers
    if (config.showDegrees) {
      for (let i = 0; i < 360; i += 5) {
        const isMajor = i % 30 === 0;
        const inner = isMajor ? config.innerRadius + 10 : config.innerRadius + 5;
        const outer = isMajor ? config.outerRadius - 10 : config.outerRadius - 5;

        g.append('line')
          .attr('x1', getPosition(i, inner).x)
          .attr('y1', getPosition(i, inner).y)
          .attr('x2', getPosition(i, outer).x)
          .attr('y2', getPosition(i, outer).y)
          .attr('stroke', isMajor ? '#ffffff' : '#cccccc')
          .attr('stroke-width', isMajor ? 2 : 1)
          .style('opacity', 0.6);
      }
    }

    // Draw houses
    if (config.showHouses && houses.length > 0) {
      houses.forEach((house, index) => {
        const nextHouse = houses[(index + 1) % houses.length];
        if (!nextHouse) return;

        const startAngle = house.cusp;
        const endAngle = nextHouse.cusp;

        g.append('path')
          .attr('class', 'house-segment')
          .attr('d', (() => {
            const arc = d3.arc()
              .innerRadius(config.innerRadius - 20)
              .outerRadius(config.innerRadius)
              .startAngle(startAngle * (Math.PI / 180))
              .endAngle(endAngle * (Math.PI / 180));
            return arc({
              innerRadius: config.innerRadius - 20,
              outerRadius: config.innerRadius,
              startAngle: startAngle * (Math.PI / 180),
              endAngle: endAngle * (Math.PI / 180)
            });
          })())
          .attr('fill', house.color)
          .attr('stroke', config.theme.background)
          .attr('stroke-width', 1)
          .style('opacity', 0.4)
          .style('cursor', interactive && onHouseClick ? 'pointer' : 'default')
          .on('click', () => onHouseClick?.(house))
          .on('mouseenter', () => setHoveredElement({ type: 'house', data: house }))
          .on('mouseleave', () => setHoveredElement({ type: null, data: null }));
      });

      // Add house numbers
      houses.forEach(house => {
        const pos = getPosition(house.cusp + 15, config.innerRadius - 10);
        g.append('text')
          .attr('x', pos.x)
          .attr('y', pos.y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('fill', '#ffffff')
          .style('font-weight', 'bold')
          .text(house.number);
      });
    }

    // Draw aspects
    if (config.showAspects && aspects.length > 0) {
      aspects.forEach(aspect => {
        const planet1 = planets.find(p => p.name === aspect.planet1);
        const planet2 = planets.find(p => p.name === aspect.planet2);

        if (planet1 && planet2) {
          const pos1 = getPosition(planet1.degree, config.innerRadius - 40);
          const pos2 = getPosition(planet2.degree, config.innerRadius - 40);

          g.append('line')
            .attr('class', 'aspect-line')
            .attr('x1', pos1.x)
            .attr('y1', pos1.y)
            .attr('x2', pos2.x)
            .attr('y2', pos2.y)
            .attr('stroke', aspect.color)
            .attr('stroke-width', Math.max(1, aspect.strength * 3))
            .style('opacity', aspect.applying ? 1 : 0.6)
            .style('stroke-dasharray', aspect.applying ? 'none' : '5,5')
            .style('cursor', interactive && onAspectClick ? 'pointer' : 'default')
            .on('click', () => onAspectClick?.(aspect))
            .on('mouseenter', () => setHoveredElement({ type: 'aspect', data: aspect }))
            .on('mouseleave', () => setHoveredElement({ type: null, data: null }));
        }
      });
    }

    // Draw planets with animations
    const planetGroups = g.selectAll('.planet-group')
      .data(planets)
      .enter()
      .append('g')
      .attr('class', 'planet-group')
      .style('cursor', interactive && onPlanetClick ? 'pointer' : 'default');

    // Planet symbols
    planetGroups.append('text')
      .attr('class', 'planet-symbol')
      .attr('x', d => getPosition(d.degree, config.innerRadius - 60).x)
      .attr('y', d => getPosition(d.degree, config.innerRadius - 60).y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '20px')
      .style('fill', d => d.color)
      .style('filter', 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))')
      .text(d => PLANET_DATA[d.name as keyof typeof PLANET_DATA]?.symbol || d.symbol)
      .on('click', (event, d) => onPlanetClick?.(d))
      .on('mouseenter', (event, d) => setHoveredElement({ type: 'planet', data: d }))
      .on('mouseleave', () => setHoveredElement({ type: null, data: null }));

    // Retrograde indicators
    planetGroups.filter(d => d.retrograde === true)
      .append('text')
      .attr('class', 'retrograde-indicator')
      .attr('x', d => getPosition(d.degree, config.innerRadius - 80).x)
      .attr('y', d => getPosition(d.degree, config.innerRadius - 80).y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('fill', '#ff6b6b')
      .text('R');

    // Animate planet entrance
    planetGroups
      .style('opacity', 0)
      .transition()
      .duration(config.animation.duration)
      .ease(config.animation.easing)
      .style('opacity', 1);

  }, [
    planets,
    aspects,
    houses,
    config,
    inView,
    loading,
    error,
    interactive,
    onPlanetClick,
    onAspectClick,
    onHouseClick,
    getPosition
  ]);

  // Loading state
  if (loading) {
    return (
      <motion.div
        className={`flex items-center justify-center ${className}`}
        style={{ width: config.width, height: config.height }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cosmic-gold border-t-transparent"></div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        className={`flex items-center justify-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg ${className}`}
        style={{ width: config.width, height: config.height }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold mb-2">Chart Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary
      name="AstrologyChartWheel"
      level="component"
      onError={(error, errorInfo) => {
        console.error('Astrology Chart Wheel Error:', error, errorInfo);
      }}
    >
      <motion.div
        className={`relative ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        data-testid={testId}
      >
        <svg
          ref={setRefs}
          className="overflow-visible w-full h-full"
        />

        {/* Enhanced Tooltip */}
        <AnimatePresence>
          {hoveredElement.type && hoveredElement.data && (
            <motion.div
              ref={tooltipRef}
              className="absolute z-10 p-4 bg-black/90 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl pointer-events-none max-w-xs"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {hoveredElement.type === 'planet' && hoveredElement.data && 'name' in hoveredElement.data && (
                <div className="text-center">
                  <div className="text-2xl mb-2">{PLANET_DATA[hoveredElement.data.name as keyof typeof PLANET_DATA]?.symbol}</div>
                  <div className="text-white font-bold text-lg">{hoveredElement.data.name}</div>
                  <div className="text-cosmic-gold">{hoveredElement.data.sign} {hoveredElement.data.degree.toFixed(1)}°</div>
                  <div className="text-cosmic-silver text-sm">House {hoveredElement.data.house}</div>
                  {hoveredElement.data.retrograde && (
                    <div className="text-red-400 text-sm font-medium">Retrograde</div>
                  )}
                </div>
              )}

              {hoveredElement.type === 'aspect' && hoveredElement.data && 'planet1' in hoveredElement.data && (
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{hoveredElement.data.type}</div>
                  <div className="text-cosmic-gold">
                    {hoveredElement.data.planet1} ↔ {hoveredElement.data.planet2}
                  </div>
                  <div className="text-cosmic-silver text-sm">Orb: {hoveredElement.data.orb.toFixed(1)}°</div>
                  <div className="text-cosmic-silver text-sm">
                    {hoveredElement.data.applying ? 'Applying' : 'Separating'}
                  </div>
                </div>
              )}

              {hoveredElement.type === 'house' && hoveredElement.data && 'number' in hoveredElement.data && (
                <div className="text-center">
                  <div className="text-white font-bold text-lg">House {hoveredElement.data.number}</div>
                  <div className="text-cosmic-gold">{hoveredElement.data.sign}</div>
                  <div className="text-cosmic-silver text-sm">Ruler: {hoveredElement.data.ruler}</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ErrorBoundary>
  );
}));

AstrologyChartWheel.displayName = 'AstrologyChartWheel';

export default AstrologyChartWheel;
