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
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ErrorBoundary } from '@cosmichub/ui';

// TypeScript interfaces for D3 chart configuration
export interface D3ChartConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  responsive?: boolean;
  animation?: {
    duration: number;
    easing: (t: number) => number;
  };
  accessibility?: {
    title: string;
    description: string;
    ariaLabel?: string;
  };
  theme?: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fontSize: {
      title: number;
      label: number;
      axis: number;
    };
  };
}

export interface D3ChartData {
  id: string;
  value: number;
  label: string;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface D3ChartProps<T = D3ChartData> {
  data: T[];
  config: D3ChartConfig;
  className?: string;
  onDataPointClick?: (data: T, event: MouseEvent) => void;
  onDataPointHover?: (data: T | null, event: MouseEvent | null) => void;
  loading?: boolean;
  error?: string | null;
  virtualize?: boolean;
  testId?: string;
}

// Base D3 Chart Hook with performance optimizations
export const useD3Chart = <T extends D3ChartData>(
  config: D3ChartConfig,
  data: T[]
) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({
    width: config.width,
    height: config.height
  });

  // Responsive dimensions with ResizeObserver
  useEffect(() => {
    if (!config.responsive || !svgRef.current) return;

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
  }, [config.responsive, config.margin]);

  // Memoized scales for performance
  const scales = useMemo(() => {
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.id))
      .range([0, dimensions.width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) ?? 0])
      .range([dimensions.height, 0]);

    const colorScale = d3.scaleOrdinal<string, string>()
      .domain(data.map(d => d.id))
      .range(d3.schemeCategory10);

    return { xScale, yScale, colorScale };
  }, [data, dimensions.width, dimensions.height]);

  // Memoized axes
  const axes = useMemo(() => {
    const xAxis = d3.axisBottom(scales.xScale)
      .tickSize(0)
      .tickPadding(8);

    const yAxis = d3.axisLeft(scales.yScale)
      .tickSize(0)
      .tickPadding(8);

    return { xAxis, yAxis };
  }, [scales.xScale, scales.yScale]);

  return {
    svgRef,
    dimensions,
    scales,
    axes,
    config
  };
};

// Enhanced D3 Chart Component with accessibility and performance
export const D3Chart = memo(forwardRef<SVGSVGElement, D3ChartProps>(({
  data,
  config,
  className = '',
  onDataPointClick,
  onDataPointHover,
  loading = false,
  error = null,
  virtualize: _virtualize = false,
  testId
}, ref) => {
  const { svgRef, dimensions, scales, axes } = useD3Chart(config, data);
  const [hoveredData, setHoveredData] = useState<D3ChartData | null>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Forward ref to parent
  useImperativeHandle(ref, () => svgRef.current!, []);

  // Combined ref for intersection observer
  const setRefs = useCallback((node: SVGSVGElement | null) => {
    svgRef.current = node;
    inViewRef(node);
  }, [inViewRef]);

  // Handle data point interactions
  const handleDataPointClick = useCallback((d: D3ChartData, event: unknown) => {
    onDataPointClick?.(d, event as MouseEvent);
  }, [onDataPointClick]);

  const handleDataPointHover = useCallback((d: D3ChartData | null, event: unknown) => {
    setHoveredData(d);
    onDataPointHover?.(d, event as MouseEvent | null);
  }, [onDataPointHover]);

  // Render chart with D3
  useEffect(() => {
    if (!svgRef.current || !inView || loading || error) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Create main group
    const g = svg
      .attr('width', dimensions.width + config.margin.left + config.margin.right)
      .attr('height', dimensions.height + config.margin.top + config.margin.bottom)
      .attr('role', 'img')
      .attr('aria-label', config.accessibility?.ariaLabel ?? config.accessibility?.title ?? 'Data visualization')
      .append('g')
      .attr('transform', `translate(${config.margin.left},${config.margin.top})`);

    // Add title for accessibility
    if (config.accessibility?.title) {
      g.append('title').text(config.accessibility.title);
    }

    // Add description for accessibility
    if (config.accessibility?.description) {
      g.append('desc').text(config.accessibility.description);
    }

    // Render bars with animations
    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => scales.xScale(d.id) ?? 0)
      .attr('y', dimensions.height)
      .attr('width', scales.xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', (d: D3ChartData): string => d.color ?? scales.colorScale(d.id))
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', onDataPointClick ? 'pointer' : 'default')
      .style('transition', 'all 0.2s ease');

    // Animate bars
    bars.transition()
      .duration(config.animation?.duration ?? 1000)
      .ease(config.animation?.easing ?? d3.easeCubicOut)
      .attr('y', d => scales.yScale(d.value))
      .attr('height', d => dimensions.height - scales.yScale(d.value));

    // Add interaction handlers
    bars
      .on('click', (event, d) => handleDataPointClick(d, event))
      .on('mouseenter', (event, d) => handleDataPointHover(d, event))
      .on('mouseleave', (event) => handleDataPointHover(null, event));

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${dimensions.height})`)
      .call(axes.xAxis)
      .style('font-size', `${config.theme?.fontSize.axis ?? 12}px`)
      .style('color', config.theme?.colors.text ?? '#e2e8f0');

    g.append('g')
      .attr('class', 'y-axis')
      .call(axes.yAxis)
      .style('font-size', `${config.theme?.fontSize.axis ?? 12}px`)
      .style('color', config.theme?.colors.text ?? '#e2e8f0');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(scales.yScale)
        .tickSize(-dimensions.width)
        .tickFormat(() => ''))
      .style('stroke', config.theme?.colors.secondary ?? '#553c9a')
      .style('stroke-opacity', 0.1)
      .style('stroke-dasharray', '2,2');

    // Add data labels
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (scales.xScale(d.id) ?? 0) + scales.xScale.bandwidth() / 2)
      .attr('y', d => scales.yScale(d.value) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', `${config.theme?.fontSize.label ?? 12}px`)
      .style('fill', config.theme?.colors.text ?? '#e2e8f0')
      .style('font-weight', '500')
      .text(d => d.label);

  }, [
    data,
    dimensions,
    scales,
    axes,
    config,
    inView,
    loading,
    error,
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
          <div className="text-red-400 text-lg font-semibold mb-2">Chart Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary
      name="D3Chart"
      level="component"
      onError={(error, errorInfo) => {
        console.error('D3 Chart Error:', error, errorInfo);
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
          className="overflow-visible"
          style={{
            width: dimensions.width + config.margin.left + config.margin.right,
            height: dimensions.height + config.margin.top + config.margin.bottom
          }}
        />

        {/* Tooltip for hovered data */}
        {hoveredData && (
          <motion.div
            className="absolute z-10 p-3 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="text-white text-sm font-medium">{hoveredData.label}</div>
            <div className="text-cosmic-gold text-lg font-bold">{hoveredData.value}</div>
          </motion.div>
        )}
      </motion.div>
    </ErrorBoundary>
  );
}));

D3Chart.displayName = 'D3Chart';

export default D3Chart;
