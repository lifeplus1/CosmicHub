import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ValidatedFrequencyData as FrequencyData } from '../../schemas/frequencySchemas';

export interface HealWaveVisualizationProps {
  data: FrequencyData[];
  width?: number;
  height?: number;
  currentFrequency?: number;
  isPlaying?: boolean;
  onFrequencySelect?: (frequency: number) => void;
  className?: string;
  testId?: string;
}

/**
 * HealWave-specific D3.js Frequency Visualization
 * Self-contained to respect workspace cross-app sharing rules
 */
export const HealWaveFrequencyVisualization: React.FC<HealWaveVisualizationProps> = ({
  data = [],
  width = 800,
  height = 400,
  currentFrequency,
  isPlaying = false,
  onFrequencySelect,
  className = '',
  testId
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Create scales
  const xScale = useMemo(() => {
    if (data.length === 0) return d3.scaleLinear().domain([0, 1000]).range([50, width - 50]);
    
    const freqExtent = d3.extent(data, d => d.frequency) as [number, number];
    return d3.scaleLinear()
      .domain(freqExtent)
      .range([50, width - 50]);
  }, [data, width]);

  const yScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, 1])
      .range([height - 50, 50]);
  }, [height]);

  // Animation for playing state
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      setAnimationFrame(prev => prev + 1);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  // D3.js rendering
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Background gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'background-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('style', 'stop-color:#1a0b2e;stop-opacity:1');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('style', 'stop-color:#0a0312;stop-opacity:1');

    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#background-gradient)')
      .attr('rx', 12);

    // Create waveform line generator
    const line = d3.line<FrequencyData>()
      .x(d => xScale(d.frequency))
      .y(d => {
        const baseY = yScale(d.amplitude);
        if (isPlaying && d.frequency === currentFrequency) {
          // Add sine wave animation for current frequency
          const time = animationFrame * 0.1;
          const wave = Math.sin((d.frequency / 100) * time) * 20;
          return baseY + wave;
        }
        return baseY;
      })
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Draw frequency line
    if (data.length > 1) {
      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#00ffff')
        .attr('stroke-width', 2)
        .attr('opacity', 0.7)
        .attr('d', line);
    }

    // Draw frequency points
    const circles = svg.selectAll('.frequency-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'frequency-point')
      .attr('cx', d => xScale(d.frequency))
      .attr('cy', d => yScale(d.amplitude))
      .attr('r', d => d.frequency === currentFrequency && isPlaying ? 8 : 5)
      .attr('fill', d => {
        if (d.frequency === currentFrequency && isPlaying) {
          return '#ffd700'; // Gold for current frequency
        }
        return d.color || '#ffffff';
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onFrequencySelect) {
          onFrequencySelect(d.frequency);
        }
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('opacity', 1);

        // Tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(d.frequency)}, ${yScale(d.amplitude) - 20})`);

        tooltip.append('rect')
          .attr('x', -40)
          .attr('y', -25)
          .attr('width', 80)
          .attr('height', 20)
          .attr('fill', 'rgba(0, 0, 0, 0.8)')
          .attr('rx', 4);

        tooltip.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -10)
          .attr('fill', '#ffffff')
          .attr('font-size', '12px')
          .text(`${d.frequency.toFixed(1)} Hz`);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.frequency === currentFrequency && isPlaying ? 8 : 5)
          .attr('opacity', 0.8);

        svg.select('.tooltip').remove();
      });

    // Add pulsing effect for current frequency
    if (currentFrequency && isPlaying) {
      const currentPoint = circles.filter(d => d.frequency === currentFrequency);
      
      currentPoint
        .append('circle')
        .attr('cx', xScale(currentFrequency))
        .attr('cy', d => yScale(d.amplitude))
        .attr('r', 8)
        .attr('fill', 'none')
        .attr('stroke', '#ffd700')
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('r', 20)
        .attr('opacity', 1)
        .transition()
        .duration(1000)
        .attr('r', 30)
        .attr('opacity', 0)
        .on('end', function() {
          d3.select(this).remove();
        });
    }

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .tickSize(-height + 100)
      .tickFormat(d => `${d} Hz`);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height - 50})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px');

    svg.selectAll('.x-axis .tick line')
      .attr('stroke', '#ffffff')
      .attr('stroke-opacity', 0.1);

    // Y-axis (amplitude)
    const yAxis = d3.axisLeft(yScale)
      .tickSize(-width + 100)
      .tickFormat(d => `${((d as number) * 100).toFixed(0)}%`);

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px');

    svg.selectAll('.y-axis .tick line')
      .attr('stroke', '#ffffff')
      .attr('stroke-opacity', 0.1);

    // Axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .text('Frequency (Hz)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .text('Amplitude');

  }, [data, xScale, yScale, width, height, currentFrequency, isPlaying, animationFrame, onFrequencySelect]);

  return (
    <div className={`healwave-frequency-visualization ${className}`} data-testid={testId}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-auto max-w-full"
      />
      <div className="mt-2 text-center text-cosmic-silver/70 text-sm">
        Interactive Frequency Visualization • Click points to select frequencies
      </div>
    </div>
  );
};

export default HealWaveFrequencyVisualization;
