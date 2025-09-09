import React, {
  useRef,
  useEffect,
  useMemo,
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

// Enhanced Frequency Visualization Types
export interface FrequencyData {
  frequency: number;
  amplitude: number;
  phase: number;
  binauralBeat?: number;
  timestamp: number;
  label: string;
  color: string;
  category: 'solfeggio' | 'chakra' | 'brainwave' | 'binaural' | 'rife' | 'planetary' | 'stellar' | 'metallic' | 'custom';
}

export interface FrequencyVisualizationConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  showWaveform: boolean;
  showSpectrum: boolean;
  showBinaural: boolean;
  realTime: boolean;
  animation: {
    duration: number;
    easing: (t: number) => number;
  };
  theme: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    waveform: string;
    spectrum: string;
  };
  accessibility: {
    title: string;
    description: string;
    liveRegion?: boolean;
  };
}

export interface FrequencyVisualizationProps {
  data: FrequencyData[];
  config: FrequencyVisualizationConfig;
  currentFrequency?: number;
  isPlaying?: boolean;
  onFrequencySelect?: (frequency: number) => void;
  onDataPointHover?: (data: FrequencyData | null) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  testId?: string;
}

// Frequency ranges for different categories
const FREQUENCY_RANGES = {
  solfeggio: { min: 174, max: 963, color: '#ff6b6b' },
  chakra: { min: 396, max: 963, color: '#9775fa' },
  brainwave: { min: 0.5, max: 40, color: '#74c0fc' },
  custom: { min: 20, max: 20000, color: '#51cf66' }
};

// Enhanced Frequency Visualization Component
export const FrequencyVisualization = memo(forwardRef<SVGSVGElement, FrequencyVisualizationProps>(({
  data,
  config,
  currentFrequency,
  isPlaying = false,
  onFrequencySelect,
  onDataPointHover,
  loading = false,
  error = null,
  className = '',
  testId
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredData, setHoveredData] = useState<FrequencyData | null>(null);
  const [dimensions, setDimensions] = useState({
    width: config.width - config.margin.left - config.margin.right,
    height: config.height - config.margin.top - config.margin.bottom
  });
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Forward ref to parent
  useImperativeHandle(ref, () => svgRef.current!, []);

  // Combined ref for intersection observer
  const setRefs = useCallback((node: SVGSVGElement | null) => {
    if (svgRef.current !== node && node) {
      (svgRef as React.MutableRefObject<SVGSVGElement | null>).current = node;
    }
    inViewRef(node);
  }, [inViewRef]);

  // Responsive dimensions
  useEffect(() => {
    if (!config.realTime || !svgRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width - config.margin.left - config.margin.right, 200),
          height: Math.max(height - config.margin.top - config.margin.bottom, 200)
        });
      }
    });

    const container = svgRef.current.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }

    return () => resizeObserver.disconnect();
  }, [config.realTime, config.margin]);

  // Memoized scales for performance
  const scales = useMemo(() => {
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.frequency) as [number, number])
      .range([0, dimensions.width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.amplitude) ?? 1])
      .range([dimensions.height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(Object.keys(FREQUENCY_RANGES))
      .range(Object.values(FREQUENCY_RANGES).map(r => r.color));

    return { xScale, yScale, colorScale };
  }, [data, dimensions]);

  // Generate waveform data
  const waveformData = useMemo(() => {
    if (!config.showWaveform || data.length === 0) return [];

    return data.map(d => {
      const points = [];
      const samples = 100;
      const frequency = d.frequency;
      const amplitude = d.amplitude;

      for (let i = 0; i < samples; i++) {
        const x = (i / samples) * dimensions.width;
        const y = Math.sin((i / samples) * frequency * Math.PI * 2) * amplitude * dimensions.height * 0.1;
        points.push({ x, y: dimensions.height / 2 + y });
      }

      return {
        ...d,
        points
      };
    });
  }, [data, config.showWaveform, dimensions]);

  // Handle interactions
  const handleDataPointClick = useCallback((d: FrequencyData) => {
    onFrequencySelect?.(d.frequency);
  }, [onFrequencySelect]);

  const handleDataPointHover = useCallback((d: FrequencyData | null) => {
    setHoveredData(d);
    onDataPointHover?.(d);
  }, [onDataPointHover]);

  // Render visualization
  useEffect(() => {
    if (!svgRef.current || !inView || loading || error) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .attr('width', dimensions.width + config.margin.left + config.margin.right)
      .attr('height', dimensions.height + config.margin.top + config.margin.bottom)
      .attr('role', 'img')
      .attr('aria-label', config.accessibility.title)
      .append('g')
      .attr('transform', `translate(${config.margin.left},${config.margin.top})`);

    // Add title for accessibility
    g.append('title').text(config.accessibility.title);
    g.append('desc').text(config.accessibility.description);

    // Draw frequency range backgrounds
    if (config.showSpectrum) {
      Object.entries(FREQUENCY_RANGES).forEach(([_category, range]) => {
        const xStart = scales.xScale(range.min);
        const xEnd = scales.xScale(range.max);
        const width = xEnd - xStart;

        if (width > 0) {
          g.append('rect')
            .attr('x', xStart)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', dimensions.height)
            .attr('fill', range.color)
            .attr('opacity', 0.1)
            .attr('stroke', range.color)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5,5');
        }
      });
    }

    // Draw waveform
    if (config.showWaveform && waveformData.length > 0) {
      waveformData.forEach(wave => {
        const line = d3.line<{ x: number; y: number }>()
          .x(d => d.x)
          .y(d => d.y)
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(wave.points)
          .attr('fill', 'none')
          .attr('stroke', wave.color)
          .attr('stroke-width', isPlaying && currentFrequency === wave.frequency ? 3 : 2)
          .attr('opacity', isPlaying && currentFrequency === wave.frequency ? 1 : 0.7)
          .attr('d', line)
          .style('filter', isPlaying && currentFrequency === wave.frequency ?
            'drop-shadow(0 0 8px rgba(255, 107, 107, 0.6))' : 'none');
      });
    }

    // Draw data points
    const points = g.selectAll('.frequency-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'frequency-point')
      .attr('cx', d => scales.xScale(d.frequency))
      .attr('cy', d => scales.yScale(d.amplitude))
      .attr('r', d => (isPlaying && currentFrequency === d.frequency) ? 8 : 5)
      .attr('fill', d => d.color)
      .attr('stroke', config.theme.primary)
      .attr('stroke-width', d => (isPlaying && currentFrequency === d.frequency) ? 3 : 1)
      .style('cursor', onFrequencySelect ? 'pointer' : 'default')
      .style('filter', d => (isPlaying && currentFrequency === d.frequency) ?
        'drop-shadow(0 0 12px rgba(255, 107, 107, 0.8))' : 'none');

    // Add interaction handlers
    points
      .on('click', (event, d) => handleDataPointClick(d))
      .on('mouseenter', (event, d) => handleDataPointHover(d))
      .on('mouseleave', () => handleDataPointHover(null));

    // Add axes
    const xAxis = d3.axisBottom(scales.xScale)
      .tickSize(0)
      .tickPadding(8)
      .tickFormat(d => `${Number(d)}Hz`);

    const yAxis = d3.axisLeft(scales.yScale)
      .tickSize(0)
      .tickPadding(8)
      .tickFormat(d => `${Number(d)}`);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${dimensions.height})`)
      .call(xAxis)
      .style('color', config.theme.primary)
      .style('font-size', '12px');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .style('color', config.theme.primary)
      .style('font-size', '12px');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(scales.yScale)
        .tickSize(-dimensions.width)
        .tickFormat(() => ''))
      .style('stroke', config.theme.secondary)
      .style('stroke-opacity', 0.1)
      .style('stroke-dasharray', '2,2');

    // Add current frequency indicator
    if (currentFrequency && isPlaying) {
      const indicatorX = scales.xScale(currentFrequency);
      if (indicatorX >= 0 && indicatorX <= dimensions.width) {
        g.append('line')
          .attr('class', 'current-frequency-indicator')
          .attr('x1', indicatorX)
          .attr('y1', 0)
          .attr('x2', indicatorX)
          .attr('y2', dimensions.height)
          .attr('stroke', config.theme.accent)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .style('animation', 'pulse 2s infinite');
      }
    }

    // Animate entrance
    g.style('opacity', 0)
      .transition()
      .duration(config.animation.duration)
      .ease(config.animation.easing)
      .style('opacity', 1);

  }, [
    data,
    dimensions,
    scales,
    config,
    inView,
    loading,
    error,
    waveformData,
    currentFrequency,
    isPlaying,
    handleDataPointClick,
    handleDataPointHover
  ]);

  // Loading state
  if (loading) {
    return (
      <motion.div
        className={`flex items-center justify-center ${className}`}
        style={{
          width: dimensions.width + config.margin.left + config.margin.right,
          height: dimensions.height + config.margin.top + config.margin.bottom
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cosmic-gold border-t-transparent"></div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        className={`flex items-center justify-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg ${className}`}
        style={{
          width: dimensions.width + config.margin.left + config.margin.right,
          height: dimensions.height + config.margin.top + config.margin.bottom
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold mb-2">Visualization Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary
      name="FrequencyVisualization"
      level="component"
      onError={(error, errorInfo) => {
        console.error('Frequency Visualization Error:', error, errorInfo);
      }}
    >
      <motion.div
        className={`relative ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        data-testid={testId}
      >
        <svg
          ref={setRefs}
          className="d3-chart-svg"
          style={{
            width: dimensions.width + config.margin.left + config.margin.right,
            height: dimensions.height + config.margin.top + config.margin.bottom
          }}
        />

        {/* Enhanced Tooltip */}
        <AnimatePresence>
          {hoveredData && (
            <motion.div
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
              <div className="text-center">
                <div className="text-white font-bold text-lg">{hoveredData.label}</div>
                <div className="text-cosmic-gold text-xl font-mono">
                  {hoveredData.frequency.toFixed(1)} Hz
                </div>
                <div className="text-cosmic-silver text-sm">
                  Amplitude: {hoveredData.amplitude.toFixed(2)}
                </div>
                {hoveredData.binauralBeat && (
                  <div className="text-purple-400 text-sm">
                    Binaural: {hoveredData.binauralBeat.toFixed(1)} Hz
                  </div>
                )}
                <div className="text-xs text-cosmic-silver mt-2 capitalize">
                  {hoveredData.category}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live region for screen readers */}
        {config.accessibility.liveRegion && (
          <div
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {isPlaying && currentFrequency
              ? `Playing frequency: ${currentFrequency.toFixed(1)} Hz`
              : 'Frequency playback stopped'
            }
          </div>
        )}
      </motion.div>
    </ErrorBoundary>
  );
}));

FrequencyVisualization.displayName = 'FrequencyVisualization';

export default FrequencyVisualization;
