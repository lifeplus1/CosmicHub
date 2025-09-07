import React, { useState, useCallback, useMemo } from 'react';
import { FrequencyPreset, AudioSettings } from '@cosmichub/integrations';
import { ChakraFrequencySelector } from './ChakraFrequencySelector';
import { ChakraKey, CHAKRA_FREQUENCIES } from './chakraConstants';
import { calculateSacredPattern, GeometryPattern } from './sacredGeometry';

interface EnhancedHealWaveProps {
  onPresetSelect: (preset: FrequencyPreset) => void;
  onSettingsChange: (settings: AudioSettings) => void;
  currentSettings: AudioSettings;
}

/**
 * Enhanced HealWave Component Integration Example
 * 
 * This component demonstrates how to integrate the new chakra frequency system
 * and sacred geometry visualizations into the existing HealWave architecture.
 */
export const EnhancedHealWave: React.FC<EnhancedHealWaveProps> = React.memo(({
  onPresetSelect,
  currentSettings
}) => {
  const [selectedChakra, setSelectedChakra] = useState<ChakraKey | null>(null);
  const [showGeometry, setShowGeometry] = useState<boolean>(true);
  const [currentFrequency, setCurrentFrequency] = useState<number>(432);

  // Generate sacred geometry pattern for current frequency
  const geometryPattern = useMemo<GeometryPattern | null>(() => {
    if (!showGeometry || !currentFrequency) return null;
    return calculateSacredPattern(currentFrequency, 300);
  }, [currentFrequency, showGeometry]);

  const handleChakraSelect = useCallback((preset: FrequencyPreset) => {
    setCurrentFrequency(preset.baseFrequency);
    
    // Extract chakra key from preset metadata
    const chakraKey = preset.metadata?.chakra as ChakraKey;
    if (chakraKey) {
      setSelectedChakra(chakraKey);
    }
    
    onPresetSelect(preset);
  }, [onPresetSelect]);

  const handleGeometryToggle = useCallback(() => {
    setShowGeometry(prev => !prev);
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  return (
    <section 
      className="enhanced-healwave space-y-6"
      aria-label="Enhanced HealWave frequency and sacred geometry controls"
    >
      {/* Sacred Geometry Visualization */}
      {showGeometry && geometryPattern && (
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              🔮 Sacred Geometry Visualization
            </h3>
            <button
              onClick={handleGeometryToggle}
              onKeyDown={(e) => handleKeyPress(e, handleGeometryToggle)}
              className="text-sm text-cyan-400 hover:text-cyan-300"
              aria-label="Hide sacred geometry visualization"
              tabIndex={0}
            >
              Hide Geometry
            </button>
          </div>
          
          <div 
            className="relative w-full max-w-md mx-auto"
            aria-label={`Sacred geometry pattern: ${geometryPattern.type.replace('_', ' ')} at ${currentFrequency} Hz`}
            role="img"
          >
            <SacredGeometryCanvas 
              pattern={geometryPattern}
              className="w-full h-80 rounded-lg border border-white/20 bg-black/50"
            />
            
            {/* Overlay information */}
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/80 backdrop-blur-sm rounded-lg text-white text-sm">
              <div className="flex justify-between items-center">
                <span>Frequency: {currentFrequency} Hz</span>
                <span>Resonance: {Math.round(geometryPattern.resonance * 100)}%</span>
              </div>
              <div className="text-xs text-white/70 mt-1">
                Pattern: {geometryPattern.type.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!showGeometry && (
        <div className="text-center">
          <button
            onClick={handleGeometryToggle}
            onKeyDown={(e) => handleKeyPress(e, handleGeometryToggle)}
            className="px-4 py-2 text-cyan-400 border border-cyan-400/30 rounded-lg hover:bg-cyan-400/10"
            aria-label="Show sacred geometry visualization"
            tabIndex={0}
          >
            🔮 Show Sacred Geometry
          </button>
        </div>
      )}

      {/* Chakra Frequency Selector */}
      <ChakraFrequencySelector
        onChakraSelect={handleChakraSelect}
        selectedChakra={selectedChakra}
        className="chakra-selector"
      />

      {/* Enhanced Session Information */}
      {selectedChakra && (
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-3">
            🌟 Current Session: {CHAKRA_FREQUENCIES[selectedChakra].name}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white/70 font-medium mb-2">Frequency Details</div>
              <div className="space-y-1 text-white/90">
                <div>Base: {CHAKRA_FREQUENCIES[selectedChakra].frequency} Hz</div>
                <div>Binaural: {CHAKRA_FREQUENCIES[selectedChakra].binauralBeat} Hz</div>
                <div>Element: {CHAKRA_FREQUENCIES[selectedChakra].element}</div>
                <div>Location: {CHAKRA_FREQUENCIES[selectedChakra].location}</div>
              </div>
            </div>
            
            <div>
              <div className="text-white/70 font-medium mb-2">Session Guidance</div>
              <div className="space-y-1 text-white/90">
                <div>Mantra: {CHAKRA_FREQUENCIES[selectedChakra].mantra}</div>
                <div>Duration: {currentSettings.duration} minutes</div>
                <div>Volume: {currentSettings.volume}%</div>
                {geometryPattern && (
                  <div>Sacred Pattern: {geometryPattern.type.replace('_', ' ')}</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Meditation Tips */}
          <div className="mt-4 p-3 rounded bg-white/5">
            <div className="text-white/70 text-xs font-medium mb-1">
              💡 Meditation Tips for {CHAKRA_FREQUENCIES[selectedChakra].name}
            </div>
            <div className="text-white/80 text-sm">
              Focus on your {CHAKRA_FREQUENCIES[selectedChakra].location.toLowerCase()} while 
              visualizing {CHAKRA_FREQUENCIES[selectedChakra].color} light. 
              Breathe deeply and repeat the mantra &ldquo;{CHAKRA_FREQUENCIES[selectedChakra].mantra}&rdquo; 
              to enhance the healing vibrations.
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

EnhancedHealWave.displayName = 'EnhancedHealWave';

/**
 * Sacred Geometry Canvas Component
 * Renders the geometric patterns using SVG for crisp, scalable graphics
 */
interface SacredGeometryCanvasProps {
  pattern: GeometryPattern;
  className?: string;
}

const SacredGeometryCanvas: React.FC<SacredGeometryCanvasProps> = ({ 
  pattern, 
  className = '' 
}) => {
  return (
    <svg
      className={`sacred-geometry-canvas ${className}`}
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background gradient */}
      <defs>
        <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.8)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.95)" />
        </radialGradient>
        
        {/* Glow effect filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background */}
      <rect width="300" height="300" fill="url(#bg-gradient)" />
      
      {/* Render pattern paths */}
      {pattern.paths.map((path, pathIndex) => {
        const color = pattern.colors[pathIndex] ?? '#ffffff';
        const pathData = path.map((pointIndex, index) => {
          const point = pattern.points[pointIndex];
          if (!point) return '';
          
          const command = index === 0 ? 'M' : 'L';
          return `${command} ${point.x} ${point.y}`;
        }).join(' ');
        
        return (
          <path
            key={pathIndex}
            d={pathData}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            opacity={0.7 + pattern.resonance * 0.3}
            filter="url(#glow)"
          />
        );
      })}
      
      {/* Center point */}
      <circle
        cx="150"
        cy="150"
        r="2"
        fill="#ffffff"
        opacity={0.8}
        filter="url(#glow)"
      />
    </svg>
  );
};

export default EnhancedHealWave;