import React, { memo, useState, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '../utils/cn';
import { Waves } from 'lucide-react';

// Import new modular components
import { FrequencyControls } from './enhanced';
import { AudioControls } from './AudioControls';
import { BinauralControls } from './BinauralControls';
import { AdvancedControls } from './AdvancedControls';
import { PlaybackControls } from './PlaybackControls';
import { StatusDisplay } from './StatusDisplay';

// Import shared components
import { SacredGeometryCanvas } from './enhancements/SacredGeometryCanvas';

// Import constants and schemas
import { FREQUENCY_CONSTANTS } from './constants/frequencyConstants';

// Import hooks
import { useAudioEngineManager } from './hooks/useAudioEngineManager';

// Import types
import type { ValidatedFrequencyData as FrequencyData } from '../schemas/frequencySchemas';
import type { GeometryPattern } from './enhancements/sacredGeometry';

export interface EnhancedFrequencyGeneratorProps {
  className?: string;
  initialFrequency?: number;
  showVisualization?: boolean;
  /** Enable real-time frequency updates */
  realTimeUpdates?: boolean;
  onFrequencyChange?: (frequency: number) => void;
  onPresetSelect?: (preset: FrequencyData) => void;
  onVolumeChange?: (volume: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

// Enhanced Frequency Generator with comprehensive features
export const EnhancedFrequencyGenerator = memo<EnhancedFrequencyGeneratorProps>(({
  className = '',
  initialFrequency = FREQUENCY_CONSTANTS.DEFAULT_FREQUENCY,
  showVisualization = true,
  realTimeUpdates: _realTimeUpdates = true,
  onFrequencyChange,
  onVolumeChange,
  onDurationChange,
  onPlayStateChange
}) => {
  // Use the new audio engine hook
  const { isPlaying, playFrequency, stopFrequency, updateVolume } = useAudioEngineManager({
    onPlayStateChange
  });

  // Core state
  const [currentFrequency, setCurrentFrequency] = useState<number>(initialFrequency);
  const [volume, setVolume] = useState<number>(FREQUENCY_CONSTANTS.DEFAULT_VOLUME);
  const [duration, setDuration] = useState<number>(FREQUENCY_CONSTANTS.DEFAULT_DURATION);

  // Advanced features state
  const [binauralEnabled, setBinauralEnabled] = useState(false);
  const [binauralBeat, setBinauralBeat] = useState<number>(FREQUENCY_CONSTANTS.DEFAULT_BINAURAL_BEAT);
  const [showSacredGeometry, setShowSacredGeometry] = useState(false);

  // UI state
  const [_geometryPattern, _setGeometryPattern] = useState<GeometryPattern | null>(null);

  // Refs and IDs
  const durationLabelId = useId();

  const { ref: inViewRef } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Handle frequency changes
  const handleFrequencyChange = useCallback((frequency: number) => {
    setCurrentFrequency(frequency);
    onFrequencyChange?.(frequency);
  }, [onFrequencyChange]);

  // Handle volume changes
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    updateVolume(newVolume);
    onVolumeChange?.(newVolume);
  }, [updateVolume, onVolumeChange]);

  // Handle duration changes
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
    onDurationChange?.(newDuration);
  }, [onDurationChange]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    const frequencyData: FrequencyData = {
      frequency: currentFrequency,
      amplitude: volume,
      phase: 0,
      label: `Custom: ${currentFrequency}Hz`,
      color: '#00ff88',
      category: 'custom',
      benefits: ['Custom frequency']
    };

    if (isPlaying) {
      stopFrequency();
    } else {
      playFrequency(frequencyData, volume, duration, binauralEnabled, binauralBeat).catch(() => {
        // Handle error silently - error already logged in playFrequency
      });
    }
  }, [isPlaying, stopFrequency, playFrequency, currentFrequency, volume, duration, binauralEnabled, binauralBeat]);

  // Handle binaural beat changes
  const handleBinauralBeatChange = useCallback((beat: number) => {
    setBinauralBeat(beat);
  }, []);

  // Handle sacred geometry toggle
  const handleSacredGeometryToggle = useCallback((enabled: boolean) => {
    setShowSacredGeometry(enabled);
  }, []);

  return (
    <div
      ref={inViewRef}
      className={cn(
        'enhanced-frequency-generator',
        'flex flex-col gap-6 p-6',
        'bg-gradient-to-br from-slate-900/95 to-slate-800/95',
        'backdrop-blur-sm rounded-xl border border-slate-700/50',
        'shadow-2xl min-h-[600px]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Waves className="w-6 h-6 text-cyan-400" />
          Enhanced Frequency Generator
        </h2>
        <StatusDisplay isPlaying={isPlaying} />
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frequency Controls - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <FrequencyControls
            currentFrequency={currentFrequency}
            onFrequencyChange={handleFrequencyChange}
          />
        </div>

        {/* Right Column Controls */}
        <div className="space-y-6">
          {/* Audio Controls */}
          <AudioControls
            volume={volume}
            duration={duration}
            onVolumeChange={handleVolumeChange}
            onDurationChange={handleDurationChange}
            durationLabelId={durationLabelId}
          />

          {/* Binaural Controls */}
          <BinauralControls
            binauralEnabled={binauralEnabled}
            onBinauralEnabledChange={setBinauralEnabled}
            binauralBeat={binauralBeat}
            onBinauralBeatChange={handleBinauralBeatChange}
          />
        </div>
      </div>

      {/* Advanced Controls */}
      <AdvancedControls
        showSacredGeometry={showSacredGeometry}
        onSacredGeometryToggle={handleSacredGeometryToggle}
      />

      {/* Sacred Geometry Visualization */}
      {showVisualization && showSacredGeometry && _geometryPattern && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <SacredGeometryCanvas
            pattern={_geometryPattern}
            className="w-full max-w-md h-64"
          />
        </motion.div>
      )}

      {/* Playback Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        currentFrequency={currentFrequency}
      />
    </div>
  );
});

EnhancedFrequencyGenerator.displayName = 'EnhancedFrequencyGenerator';

export default EnhancedFrequencyGenerator;
