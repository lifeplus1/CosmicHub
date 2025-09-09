import React, { memo, useState, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { Waves } from 'lucide-react';

// Import new modular components
import { FrequencyControls } from './enhanced/FrequencyControls';
import { AudioControls } from './AudioControls';
import { BinauralControls } from './BinauralControls';
import { AdvancedControls } from './AdvancedControls';
import { PlaybackControls } from './PlaybackControls';
import { StatusDisplay } from './StatusDisplay';

// Import shared components
import { SacredGeometryCanvas } from './enhancements/SacredGeometryCanvas';

// Import constants and schemas
import { FREQUENCY_CONSTANTS, FREQUENCY_CATEGORIES, TAB_OPTIONS } from './constants/frequencyConstants';

// Import hooks
import { useAudioEngineManager } from './hooks/useAudioEngineManager';

// Import types
import type { ValidatedFrequencyData as FrequencyData } from '../schemas/frequencySchemas';
import type { GeometryPattern } from './enhancements/sacredGeometry';
import type { ChakraKey } from './enhancements/chakraConstants';

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
  onPresetSelect,
  onVolumeChange,
  onDurationChange,
  onPlayStateChange
}) => {
  // Use the new audio engine hook
  const { isPlaying, playFrequency, stopFrequency, updateVolume } = useAudioEngineManager({
    onPlayStateChange
  });

  // Core state
  const [currentFrequency, setCurrentFrequency] = useState(initialFrequency);
  const [selectedPreset, setSelectedPreset] = useState<FrequencyData | null>(null);
  const [volume, setVolume] = useState(FREQUENCY_CONSTANTS.DEFAULT_VOLUME);
  const [duration, setDuration] = useState(FREQUENCY_CONSTANTS.DEFAULT_DURATION);

  // Advanced features state
  const [binauralEnabled, setBinauralEnabled] = useState(false);
  const [binauralBeat, setBinauralBeat] = useState(FREQUENCY_CONSTANTS.DEFAULT_BINAURAL_BEAT);
  const [showSacredGeometry, setShowSacredGeometry] = useState(false);
  const [selectedChakra, setSelectedChakra] = useState<ChakraKey | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<typeof FREQUENCY_CATEGORIES[number]>('all');
  const [customPresets, setCustomPresets] = useState<FrequencyData[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showPresetCreator, setShowPresetCreator] = useState(false);

  // UI state
  const [visualizationData, setVisualizationData] = useState<FrequencyData[]>([]);
  const [geometryPattern, setGeometryPattern] = useState<GeometryPattern | null>(null);
  const [activeTab, setActiveTab] = useState<typeof TAB_OPTIONS[number]>('frequencies');

  // Refs and IDs
  const volumeLabelId = useId();
  const durationLabelId = useId();

  const { ref: inViewRef, inView } = useInView({
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

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: FrequencyData) => {
    setSelectedPreset(preset);
    setCurrentFrequency(preset.frequency);
    onPresetSelect?.(preset);
  }, [onPresetSelect]);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      await stopFrequency();
    } else {
      await playFrequency(currentFrequency, {
        volume,
        duration,
        binauralEnabled,
        binauralBeat,
        selectedChakra
      });
    }
  }, [isPlaying, stopFrequency, playFrequency, currentFrequency, volume, duration, binauralEnabled, binauralBeat, selectedChakra]);

  // Handle binaural beat changes
  const handleBinauralBeatChange = useCallback((beat: number) => {
    setBinauralBeat(beat);
  }, []);

  // Handle chakra selection
  const handleChakraSelect = useCallback((chakra: ChakraKey | null) => {
    setSelectedChakra(chakra);
  }, []);

  // Handle category filter changes
  const handleCategoryFilterChange = useCallback((category: typeof FREQUENCY_CATEGORIES[number]) => {
    setCategoryFilter(category);
  }, []);

  // Handle tab changes
  const handleTabChange = useCallback((tab: typeof TAB_OPTIONS[number]) => {
    setActiveTab(tab);
  }, []);

  // Handle sacred geometry toggle
  const handleSacredGeometryToggle = useCallback((enabled: boolean) => {
    setShowSacredGeometry(enabled);
  }, []);

  // Handle custom preset creation
  const handleCreateCustomPreset = useCallback(() => {
    if (presetName.trim()) {
      const newPreset: FrequencyData = {
        id: `custom-${Date.now()}`,
        name: presetName.trim(),
        frequency: currentFrequency,
        category: 'other',
        description: `Custom preset at ${currentFrequency}Hz`,
        benefits: ['Custom frequency'],
        duration: duration,
        volume: volume
      };
      setCustomPresets(prev => [...prev, newPreset]);
      setPresetName('');
      setShowPresetCreator(false);
    }
  }, [presetName, currentFrequency, duration, volume]);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Frequency Controls */}
        <FrequencyControls
          currentFrequency={currentFrequency}
          onFrequencyChange={handleFrequencyChange}
          volumeLabelId={volumeLabelId}
        />

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

      {/* Advanced Controls */}
      <AdvancedControls
        showSacredGeometry={showSacredGeometry}
        onSacredGeometryToggle={handleSacredGeometryToggle}
      />

      {/* Sacred Geometry Visualization */}
      {showVisualization && showSacredGeometry && geometryPattern && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <SacredGeometryCanvas
            pattern={geometryPattern}
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
