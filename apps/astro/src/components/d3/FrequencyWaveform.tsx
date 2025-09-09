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

// Frequency-specific types
export interface FrequencyData {
  frequency: number;
  amplitude: number;
  phase: number;
  label: string;
  color: string;
  category: 'solfeggio' | 'chakra' | 'brainwave' | 'binaural' | 'rife' | 'planetary' | 'stellar' | 'metallic' | 'custom';
  benefits: string[];
  duration?: number;
}

interface SpectrumBar {
  x: number;
  y: number;
  width: number;
  height: number;
  frequency: FrequencyData;
}

export interface FrequencyVisualizationConfig {
  width: number;
  height: number;
  showWaveform: boolean;
  showSpectrum: boolean;
  showFrequencyLabels: boolean;
  animation: {
    duration: number;
    easing: (t: number) => number;
  };
  theme: {
    background: string;
    wave: string;
    spectrum: string;
    labels: string;
    grid: string;
  };
  accessibility: {
    title: string;
    description: string;
  };
}

export interface FrequencyVisualizationProps {
  data: FrequencyData[];
  config: FrequencyVisualizationConfig;
  currentFrequency?: number;
  isPlaying?: boolean;
  onFrequencySelect?: (frequency: FrequencyData) => void;
  onFrequencyHover?: (frequency: FrequencyData | null) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  testId?: string;
}

// Enhanced Frequency Waveform Visualization
export const FrequencyWaveform = memo(forwardRef<SVGSVGElement, FrequencyVisualizationProps>(({
  data,
  config,
  currentFrequency,
  isPlaying = false,
  onFrequencySelect,
  onFrequencyHover,
  loading = false,
  error = null,
  className = '',
  testId
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredFrequency, setHoveredFrequency] = useState<FrequencyData | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
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

  // Generate waveform data points
  const generateWaveform = useCallback((frequency: number, amplitude: number, phase: number, points: number = 200) => {
    const waveform = [];
    for (let i = 0; i < points; i++) {
      const x = (i / points) * config.width;
      const time = (i / points) * 4 * Math.PI; // 2 full cycles
      const y = config.height / 2 + amplitude * Math.sin(2 * Math.PI * frequency * time / 1000 + phase + animationPhase);
      waveform.push({ x, y });
    }
    return waveform;
  }, [config.width, config.height, animationPhase]);

  // Generate spectrum bars
  const generateSpectrum = useCallback((frequencies: FrequencyData[]): SpectrumBar[] => {
    const spectrum: SpectrumBar[] = [];
    const barWidth = config.width / frequencies.length;

    frequencies.forEach((freq, index) => {
      const x = index * barWidth;
      const height = (freq.amplitude / 100) * (config.height * 0.8);
      const y = config.height - height;

      spectrum.push({
        x,
        y,
        width: barWidth * 0.8,
        height,
        frequency: freq
      });
    });

    return spectrum;
  }, [config.width, config.height]);

  // Animation loop for playing state
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => prev + 0.1);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Render the frequency visualization
  useEffect(() => {
    if (!svgRef.current || !inView || loading || error) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .attr('width', config.width)
      .attr('height', config.height)
      .attr('role', 'img')
      .attr('aria-label', config.accessibility.title)
      .append('g');

    // Add title for accessibility
    g.append('title').text(config.accessibility.title);
    g.append('desc').text(config.accessibility.description);

    // Draw grid lines
    if (config.showWaveform) {
      // Horizontal grid lines
      for (let i = 0; i <= 4; i++) {
        const y = (i * config.height) / 4;
        g.append('line')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', config.width)
          .attr('y2', y)
          .attr('stroke', config.theme.grid)
          .attr('stroke-width', 0.5)
          .style('opacity', 0.3);
      }

      // Vertical grid lines
      for (let i = 0; i <= 8; i++) {
        const x = (i * config.width) / 8;
        g.append('line')
          .attr('x1', x)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', config.height)
          .attr('stroke', config.theme.grid)
          .attr('stroke-width', 0.5)
          .style('opacity', 0.3);
      }
    }

    // Draw waveforms for each frequency
    if (config.showWaveform && data.length > 0) {
      data.forEach((freqData, index) => {
        const waveform = generateWaveform(
          freqData.frequency,
          freqData.amplitude,
          freqData.phase + (index * Math.PI) / data.length
        );

        const line = d3.line<{ x: number; y: number }>()
          .x(d => d.x)
          .y(d => d.y)
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(waveform)
          .attr('class', 'frequency-wave')
          .attr('d', line)
          .attr('stroke', freqData.color)
          .attr('stroke-width', isPlaying && currentFrequency === freqData.frequency ? 3 : 2)
          .attr('fill', 'none')
          .style('opacity', 0.8)
          .style('cursor', onFrequencySelect ? 'pointer' : 'default')
          .on('click', () => onFrequencySelect?.(freqData))
          .on('mouseenter', () => {
            setHoveredFrequency(freqData);
            onFrequencyHover?.(freqData);
          })
          .on('mouseleave', () => {
            setHoveredFrequency(null);
            onFrequencyHover?.(null);
          });
      });
    }

    // Draw spectrum bars
    if (config.showSpectrum && data.length > 0) {
      const spectrum = generateSpectrum(data);

      g.selectAll('.spectrum-bar')
        .data(spectrum)
        .enter()
        .append('rect')
        .attr('class', 'spectrum-bar')
        .attr('x', (d: SpectrumBar) => d.x)
        .attr('y', (d: SpectrumBar) => d.y)
        .attr('width', (d: SpectrumBar) => d.width)
        .attr('height', (d: SpectrumBar) => d.height)
        .attr('fill', (d: SpectrumBar) => d.frequency.color)
        .attr('rx', 2)
        .attr('ry', 2)
        .style('opacity', 0.7)
        .style('cursor', onFrequencySelect ? 'pointer' : 'default')
        .on('click', (d: SpectrumBar) => onFrequencySelect?.(d.frequency))
        .on('mouseenter', (d: SpectrumBar) => {
          setHoveredFrequency(d.frequency);
          onFrequencyHover?.(d.frequency);
        })
        .on('mouseleave', () => {
          setHoveredFrequency(null);
          onFrequencyHover?.(null);
        });

      // Animate spectrum bars when playing
      if (isPlaying) {
        g.selectAll('.spectrum-bar')
          .transition()
          .duration(200)
          .attr('height', (d: unknown) => {
            const data = d as SpectrumBar;
            const boost = currentFrequency === data.frequency.frequency ? 1.2 : 1;
            return data.height * boost;
          })
          .attr('y', (d: unknown) => {
            const data = d as SpectrumBar;
            const boost = currentFrequency === data.frequency.frequency ? 1.2 : 1;
            return config.height - (data.height * boost);
          });
      }
    }

    // Add frequency labels
    if (config.showFrequencyLabels && data.length > 0) {
      data.forEach((freqData, index) => {
        const x = (index * config.width) / data.length + (config.width / data.length) / 2;
        const y = config.height - 20;

        g.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', config.theme.labels)
          .style('font-weight', '500')
          .text(`${freqData.frequency}Hz`);

        // Add category indicator
        g.append('text')
          .attr('x', x)
          .attr('y', y + 15)
          .attr('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', config.theme.labels)
          .style('opacity', 0.7)
          .text(freqData.category);
      });
    }

  }, [
    data,
    config,
    inView,
    loading,
    error,
    isPlaying,
    currentFrequency,
    generateWaveform,
    generateSpectrum,
    onFrequencySelect,
    onFrequencyHover
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
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cosmic-gold border-t-transparent"></div>
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
          <div className="text-red-400 text-lg font-semibold mb-2">Visualization Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary
      name="FrequencyWaveform"
      level="component"
      onError={(error, errorInfo) => {
        console.error('Frequency Waveform Error:', error, errorInfo);
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
          className="overflow-visible w-full h-full"
        />

        {/* Enhanced Tooltip */}
        <AnimatePresence>
          {hoveredFrequency && (
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
                <div className="text-white font-bold text-lg">{hoveredFrequency.label}</div>
                <div className="text-cosmic-gold text-xl font-mono">
                  {hoveredFrequency.frequency} Hz
                </div>
                <div className="text-cosmic-silver text-sm capitalize">
                  {hoveredFrequency.category}
                </div>
                {hoveredFrequency.benefits.length > 0 && (
                  <div className="mt-2 text-xs text-cosmic-silver">
                    {hoveredFrequency.benefits.slice(0, 2).join(', ')}
                    {hoveredFrequency.benefits.length > 2 && '...'}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current frequency indicator */}
        {isPlaying && currentFrequency && (
          <motion.div
            className="absolute top-4 left-4 px-3 py-1 bg-cosmic-gold/20 border border-cosmic-gold/30 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-cosmic-gold text-sm font-medium">
              Playing: {currentFrequency} Hz
            </div>
          </motion.div>
        )}
      </motion.div>
    </ErrorBoundary>
  );
}));

FrequencyWaveform.displayName = 'FrequencyWaveform';

export default FrequencyWaveform;
