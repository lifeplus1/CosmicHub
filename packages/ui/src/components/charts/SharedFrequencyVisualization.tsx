import { useState, useCallback, memo } from 'react';

// Enhanced Frequency Visualization Types
export interface FrequencyData {
  frequency: number;
  amplitude: number;
  phase: number;
  binauralBeat?: number;
  timestamp?: number;
  label: string;
  color: string;
  category: 'solfeggio' | 'chakra' | 'brainwave' | 'binaural' | 'rife' | 'planetary' | 'stellar' | 'metallic' | 'custom';
  benefits?: string[];
  duration?: number;
}

export interface FrequencyVisualizationConfig {
  width: number;
  height: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  showWaveform?: boolean;
  showSpectrum?: boolean;
  showBinaural?: boolean;
  showFrequencyLabels?: boolean;
  realTime?: boolean;
  animation?: {
    duration: number;
    easing?: (t: number) => number;
  };
  theme?: {
    background?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    waveform?: string;
    spectrum?: string;
    wave?: string;
    labels?: string;
    grid?: string;
  };
  accessibility?: {
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
  onFrequencySelect?: (frequency: number | FrequencyData) => void;
  onFrequencyHover?: (frequency: FrequencyData | null) => void;
  onDataPointHover?: (data: FrequencyData | null) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  testId?: string;
}

// Simple Frequency Visualization Component (lightweight fallback)
export const FrequencyVisualization = memo<FrequencyVisualizationProps>(({
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
}) => {
  const [hoveredData, setHoveredData] = useState<FrequencyData | null>(null);

  const handleDataPointClick = useCallback((d: FrequencyData) => {
    if (typeof onFrequencySelect === 'function') {
      onFrequencySelect(d);
    }
  }, [onFrequencySelect]);

  const handleDataPointHover = useCallback((d: FrequencyData | null) => {
    setHoveredData(d);
    onFrequencyHover?.(d);
  }, [onFrequencyHover]);

  // Loading state
  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: config.width, height: config.height }}
        data-testid={testId}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg ${className}`}
        style={{ width: config.width, height: config.height }}
        data-testid={testId}
      >
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold mb-2">Visualization Error</div>
          <div className="text-red-300 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-gray-900 border border-gray-700 rounded-lg p-4 ${className}`}
      style={{ width: config.width, height: config.height }}
      data-testid={testId}
    >
      <div className="mb-4">
        <h3 className="text-white font-semibold mb-2">
          {config.accessibility?.title || 'Frequency Visualization'}
        </h3>
        {isPlaying && currentFrequency && (
          <div className="text-green-400 text-sm">
            Currently playing: {currentFrequency} Hz
          </div>
        )}
      </div>

      {/* Simple frequency display */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
        {data.map((freq, index) => (
          <div
            key={`${freq.frequency}-${index}`}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
              currentFrequency === freq.frequency && isPlaying
                ? 'border-green-400 bg-green-400/20 shadow-lg'
                : hoveredData?.frequency === freq.frequency
                ? 'border-blue-400 bg-blue-400/20'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700'
            }`}
            onClick={() => handleDataPointClick(freq)}
            onMouseEnter={() => handleDataPointHover(freq)}
            onMouseLeave={() => handleDataPointHover(null)}
          >
            <div className="text-center">
              <div
                className="w-4 h-4 rounded-full mx-auto mb-2"
                style={{ backgroundColor: freq.color }}
              />
              <div className="text-white font-mono text-lg">
                {freq.frequency} Hz
              </div>
              <div className="text-gray-400 text-sm truncate">
                {freq.label}
              </div>
              <div className="text-xs text-gray-500 capitalize mt-1">
                {freq.category}
              </div>
              {freq.binauralBeat && (
                <div className="text-xs text-purple-400 mt-1">
                  Binaural: {freq.binauralBeat} Hz
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredData && (
        <div className="absolute z-10 p-4 bg-black/90 border border-white/20 rounded-lg shadow-xl pointer-events-none max-w-xs bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="text-center">
            <div className="text-white font-bold text-lg">{hoveredData.label}</div>
            <div className="text-blue-400 text-xl font-mono">
              {hoveredData.frequency} Hz
            </div>
            <div className="text-gray-300 text-sm">
              Amplitude: {hoveredData.amplitude.toFixed(2)}
            </div>
            {hoveredData.binauralBeat && (
              <div className="text-purple-400 text-sm">
                Binaural: {hoveredData.binauralBeat} Hz
              </div>
            )}
            <div className="text-xs text-gray-400 mt-2 capitalize">
              {hoveredData.category}
            </div>
            {hoveredData.benefits && hoveredData.benefits.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                {hoveredData.benefits.slice(0, 2).join(', ')}
                {hoveredData.benefits.length > 2 && '...'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live region for screen readers */}
      {config.accessibility?.liveRegion && (
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {isPlaying && currentFrequency
            ? `Playing frequency: ${currentFrequency} Hz`
            : 'Frequency playback stopped'
          }
        </div>
      )}
    </div>
  );
});

FrequencyVisualization.displayName = 'FrequencyVisualization';

// Also export the waveform component as an alias for compatibility
export const FrequencyWaveform = FrequencyVisualization;

export default FrequencyVisualization;
