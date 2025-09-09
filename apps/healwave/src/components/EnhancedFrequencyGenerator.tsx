import React, { memo, useState, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';
import { Waves } from 'lucide-react';

// Import new modular components
import { FrequencyControls } from './FrequencyControls';
import { AudioControls } from './AudioControls';
import { BinauralControls } from './BinauralControls';
import { AdvancedControls } from './AdvancedControls';
import { PlaybackControls } from './PlaybackControls';
import { StatusDisplay } from './StatusDisplay';

// Import shared components
import { SacredGeometryCanvas } from './SacredGeometryCanvas';

// Import constants and schemas
import { FREQUENCY_CONSTANTS, FREQUENCY_CATEGORIES, TAB_OPTIONS } from './frequencyConstants';

// Import hooks
import { useAudioEngineManager } from './useAudioEngineManager';

// Import types
import type { FrequencyData, GeometryPattern, ChakraKey } from './types/frequency.types';

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

  // Enhanced preset data with filtering using unified data layer
  const allPresets = useMemo(() => {
    const unifiedPresets = getUnifiedFrequencyPresets();
    const combinedPresets = [...unifiedPresets, ...customPresets];
    if (categoryFilter === 'all') {
      return combinedPresets;
    }
    return combinedPresets.filter(preset => preset.category === categoryFilter);
  }, [categoryFilter, customPresets]);

  // Available categories from unified data layer
  const availableCategories = useMemo(() => getAvailableCategories(), []);

  

  

  // Update visualization data when frequency changes
  useEffect(() => {
    if (!showVisualization) return;

    const baseData = allPresets.map(preset => ({
      ...preset,
      amplitude: preset.frequency === currentFrequency ? 1.0 : 0.6,
      timestamp: Date.now()
    }));

    // Add current frequency if not in presets
    if (!allPresets.find(p => p.frequency === currentFrequency)) {
      baseData.push({
        frequency: currentFrequency,
        amplitude: 1.0,
        phase: 0,
        label: `Custom: ${currentFrequency} Hz`,
        color: '#ff6b6b',
        category: 'custom',
        timestamp: Date.now(),
        benefits: ['Custom frequency']
      });
    }

    setVisualizationData(baseData);
  }, [currentFrequency, showVisualization, allPresets]);

  // Generate sacred geometry pattern when frequency changes
  useEffect(() => {
    if (!showSacredGeometry) {
      setGeometryPattern(null);
      return;
    }

    const pattern = calculateSacredPattern(currentFrequency, 300);
    setGeometryPattern(pattern);
  }, [currentFrequency, showSacredGeometry]);

  // Enhanced event handlers
  const handleFrequencyChange = useCallback((frequency: number | FrequencyData) => {
    const freq = typeof frequency === 'number' ? frequency : frequency.frequency;
    setCurrentFrequency(freq);
    onFrequencyChange?.(freq);
    
    // Update audio engine frequency - handled in handlePlay when needed
  }, [onFrequencyChange]);

  const handlePresetSelect = useCallback((preset: FrequencyData) => {
    // Validate preset before using it
    const validation = safeValidateFrequencyData(preset);
    
    if (!validation.success) {
      devConsole.error('❌ Invalid preset selected, validation failed:', {
        preset: preset?.label || 'Unknown',
        errors: validation.error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ')
      });
      return;
    }

    const validPreset = validation.data;
    
    devConsole.info('🎵 Preset selected and validated:', {
      name: validPreset.label,
      frequency: validPreset.frequency,
      category: validPreset.category,
      isBinaural: validPreset.metadata?.isBinaural
    });
    
    setSelectedPreset(validPreset);
    setCurrentFrequency(validPreset.frequency);
    onPresetSelect?.(validPreset);
    onFrequencyChange?.(validPreset.frequency);
  }, [onPresetSelect, onFrequencyChange]);

  const handleVolumeChange = useCallback(async (values: number[]) => {
    const newVolume = values[0];
    if (newVolume !== undefined) {
      setVolume(newVolume);
      onVolumeChange?.(newVolume);
      
      // Update audio engine volume if playing
      if (audioEngineRef.current && isPlaying) {
        try {
          await audioEngineRef.current.setVolume(newVolume * 100); // Convert 0-1 to 0-100
        } catch (error) {
          devConsole.error('Failed to update volume:', error);
        }
      }
    }
  }, [onVolumeChange, isPlaying]);

  const handleDurationChange = useCallback((values: number[]) => {
    const newDuration = values[0];
    if (newDuration !== undefined) {
      setDuration(newDuration);
      onDurationChange?.(newDuration);
    }
  }, [onDurationChange]);

  const handlePlay = useCallback(async () => {
    if (!selectedPreset || !audioEngineRef.current) {
      devConsole.warn('⚠️ No preset selected or audio engine not initialized');
      return;
    }

    // Ensure AudioEngine exists and try to activate AudioContext with user gesture
    if (!initializeAudioEngine()) {
      devConsole.error('❌ Failed to initialize AudioEngine');
      return;
    }

    try {
      devConsole.info('▶️ Starting enhanced audio session:', {
        preset: selectedPreset.label,
        frequency: selectedPreset.frequency,
        duration,
        volume,
        binauralEnabled,
        binauralBeat: binauralEnabled ? binauralBeat : undefined
      });

      // Debug Beta High Focus specifically
      if (selectedPreset.label?.includes('Beta High Focus')) {
        devConsole.info('🔍 DEBUG: Beta High Focus audio parameters:', {
          selectedPreset: selectedPreset,
          metadata: selectedPreset.metadata,
          isBinauralPreset: selectedPreset.metadata?.isBinaural,
          audioEngineRef: !!audioEngineRef.current
        });
      }

      // Try to activate AudioContext with user gesture first
      if (!audioEngineRef.current) {
        throw new Error('AudioEngine not available');
      }
      
      // Check if the activateAudioContext method exists before calling it
      if (typeof audioEngineRef.current.activateAudioContext === 'function') {
        const activated = await audioEngineRef.current.activateAudioContext();
        if (!activated) {
          devConsole.warn('AudioContext activation returned false, but continuing...');
        }
      } else {
        devConsole.info('activateAudioContext method not available, relying on startFrequency for activation');
      }

      // Check AudioEngine state before starting
      const engineState = audioEngineRef.current.getState();
      devConsole.info('🎵 AudioEngine state before start:', engineState);
      
      // Ensure we stop any current playback first
      if (engineState.isPlaying) {
        devConsole.info('🛑 Stopping current playback before starting new session');
        audioEngineRef.current.stopFrequency();
      }

      // AudioContext activation is handled by AudioEngine internally
      // No need for separate context testing as it may interfere

      // Convert FrequencyData to FrequencyPreset for AudioEngine
      // Map extended categories to compatible AudioEngine categories
      const getCategoryMapping = (category: string): FrequencyPreset['category'] => {
        switch (category) {
          case 'stellar':
          case 'metallic':
            return 'custom';
          case 'solfeggio':
          case 'rife':
          case 'brainwave':
          case 'planetary':
          case 'chakra':
            return category as FrequencyPreset['category'];
          default:
            return 'custom';
        }
      };

      // Debug: Log selected preset details
      devConsole.info('🔍 Selected preset details:', {
        frequency: selectedPreset.frequency,
        label: selectedPreset.label,
        category: selectedPreset.category,
        metadata: selectedPreset.metadata
      });

      // Validate frequency before creating preset
      if (selectedPreset.frequency < 1 || selectedPreset.frequency > 20000) {
        throw new Error(`Invalid frequency: ${selectedPreset.frequency}Hz. Must be between 1-20000 Hz`);
      }

      // Handle binaural beats correctly
      const isBinauralPreset = selectedPreset.metadata?.isBinaural;
      const presetBinauralBeat = selectedPreset.metadata?.binauralBeat as number | undefined;
      const presetBaseFreq = selectedPreset.metadata?.baseFrequency as number | undefined;

      const preset: FrequencyPreset = {
        id: selectedPreset.label.toLowerCase().replace(/\s+/g, '-'),
        name: selectedPreset.label,
        category: getCategoryMapping(selectedPreset.category),
        // For binaural presets, use the original base frequency
        baseFrequency: isBinauralPreset && presetBaseFreq ? presetBaseFreq : selectedPreset.frequency,
        // For binaural presets, use the preset's binaural beat, otherwise use UI setting
        binauralBeat: isBinauralPreset ? presetBinauralBeat : (binauralEnabled ? binauralBeat : undefined),
        description: selectedPreset.benefits?.join(', '),
        benefits: selectedPreset.benefits || []
      };

      devConsole.info('🎵 Created preset for AudioEngine:', preset);

      const settings = {
        volume: volume * 100, // Convert from 0-1 to 0-100 for AudioEngine
        duration,
        fadeIn: 2, // 2 second fade in
        fadeOut: 2  // 2 second fade out
      };

      await audioEngineRef.current.startFrequency(preset, settings);
      
      // Verify the audio actually started
      const finalState = audioEngineRef.current.getState();
      if (finalState.isPlaying) {
        updatePlayingState(true);
        devConsole.info('✅ Audio session started successfully');
      } else {
        throw new Error('AudioEngine reported not playing after start');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      devConsole.error('❌ Failed to start audio session:', errorMessage);
      
      // Show user-friendly error message based on error type
      if (errorMessage.includes('suspended') || errorMessage.includes('CONTEXT_UNAVAILABLE') || errorMessage.includes('CONTEXT_NOT_RUNNING')) {
        devConsole.warn('💡 Audio needs user interaction. Click play again to activate audio.');
        // Don't try to reinitialize for context issues - user needs to click again
        updatePlayingState(false);
        return;
      } else if (errorMessage.includes('frequency')) {
        devConsole.warn('💡 Invalid frequency detected. Please select a different preset.');
      } else {
        devConsole.warn('💡 Audio failed to start. Attempting to recover...');
      }
      
      // If AudioEngine fails, try reinitializing
      devConsole.info('🔄 Attempting to reinitialize AudioEngine...');
      updatePlayingState(false); // Ensure state is reset
      
      if (initializeAudioEngine() && audioEngineRef.current) {
        try {
          // Convert FrequencyData to FrequencyPreset format
          const presetForEngine: FrequencyPreset = {
            id: `preset-${selectedPreset?.frequency || 528}`,
            name: selectedPreset?.label || 'Default',
            baseFrequency: selectedPreset?.frequency || 528,
            category: (selectedPreset?.category as FrequencyPreset['category']) || 'custom',
            binauralBeat: binauralEnabled ? binauralBeat : 0,
            description: `${selectedPreset?.label || 'Custom frequency'} - ${selectedPreset?.frequency}Hz`,
            benefits: selectedPreset?.benefits || []
          };
          
          await audioEngineRef.current.startFrequency(presetForEngine, {
            volume: volume * 100, // Convert 0-1 to 0-100
            duration: duration,
            fadeIn: 2,
            fadeOut: 2
          });
          
          // Verify retry succeeded
          const retryState = audioEngineRef.current.getState();
          if (retryState.isPlaying) {
            updatePlayingState(true);
            devConsole.info('✅ Audio session started successfully after reinitialization');
            return; // Success after retry
          } else {
            throw new Error('AudioEngine still not playing after reinitialization');
          }
        } catch (retryError) {
          devConsole.error('❌ Failed to start audio session even after reinitialization:', retryError instanceof Error ? retryError.message : String(retryError));
        }
      }
      
      updatePlayingState(false);
    }
  }, [selectedPreset, duration, volume, binauralEnabled, binauralBeat, initializeAudioEngine, updatePlayingState]);

  const handleStop = useCallback(() => {
    devConsole.info('⏹️ Stopping enhanced audio session');
    
    if (audioEngineRef.current) {
      try {
        audioEngineRef.current.stopFrequency();
        devConsole.info('✅ Audio session stopped successfully');
      } catch (error) {
        devConsole.error('❌ Failed to stop audio session:', error instanceof Error ? error.message : String(error));
      }
    }
    
    // Ensure state is updated after stopping
    updatePlayingState(false);
  }, [updatePlayingState]);

  const handleChakraSelect = useCallback((preset: FrequencyPreset) => {
    const chakraKey = preset.metadata?.chakra as ChakraKey;
    if (chakraKey && chakraKey in CHAKRA_FREQUENCIES) {
      setSelectedChakra(chakraKey);
    }

    // Convert to FrequencyData format using the improved conversion function
    const frequencyData: FrequencyData = {
      ...convertPresetToFrequencyData(preset),
      amplitude: volume,
      color: CHAKRA_FREQUENCIES[chakraKey]?.color ?? '#ffffff',
    };

    handlePresetSelect(frequencyData);
  }, [volume, handlePresetSelect]);

  const handleCategoryFilter = useCallback((category: typeof categoryFilter) => {
    setCategoryFilter(category);
    setSelectedPreset(null); // Clear selection when changing category
  }, []);

  const handleSaveCustomPreset = useCallback(() => {
    if (!presetName.trim()) return;

    const customPreset: FrequencyData = {
      frequency: currentFrequency,
      amplitude: volume,
      phase: 0,
      label: presetName,
      color: '#9333ea',
      category: 'custom',
      timestamp: Date.now(),
      benefits: ['Custom healing frequency']
    };

    setCustomPresets(prev => [...prev, customPreset]);
    setPresetName('');
    setShowPresetCreator(false);
    
    devConsole.info('💾 Custom preset saved:', customPreset);
  }, [presetName, currentFrequency, volume]);

  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
    
    // Reset selections when switching tabs
    if (tab === 'chakras') {
      setShowChakraSelector(true);
    } else {
      setShowChakraSelector(false);
    }
  }, []);

  // Generate binaural beat data
  const binauralData = useMemo(() => {
    if (!binauralEnabled || binauralBeat === 0) return [];

    return [{
      frequency: currentFrequency,
      amplitude: volume,
      phase: 0,
      binauralBeat,
      timestamp: Date.now(),
      label: `Binaural: ${currentFrequency} ± ${binauralBeat} Hz`,
      color: '#da77f2',
      category: 'custom' as const
    }];
  }, [binauralEnabled, binauralBeat, currentFrequency, volume]);

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
          selectedPreset={selectedPreset}
          onPresetSelect={handlePresetSelect}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={handleCategoryFilterChange}
          customPresets={customPresets}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          presetName={presetName}
          onPresetNameChange={setPresetName}
          showPresetCreator={showPresetCreator}
          onShowPresetCreatorChange={setShowPresetCreator}
          onCreateCustomPreset={handleCreateCustomPreset}
        />

        {/* Audio Controls */}
        <AudioControls
          volume={volume}
          onVolumeChange={handleVolumeChange}
          duration={duration}
          onDurationChange={handleDurationChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          volumeLabelId={volumeLabelId}
          durationLabelId={durationLabelId}
        />

        {/* Binaural Controls */}
        <BinauralControls
          binauralEnabled={binauralEnabled}
          onBinauralEnabledChange={setBinauralEnabled}
          binauralBeat={binauralBeat}
          onBinauralBeatChange={handleBinauralBeatChange}
          selectedChakra={selectedChakra}
          onChakraSelect={handleChakraSelect}
        />
      </div>

      {/* Advanced Controls */}
      <AdvancedControls
        showSacredGeometry={showSacredGeometry}
        onSacredGeometryToggle={handleSacredGeometryToggle}
        geometryPattern={geometryPattern}
        onGeometryPatternChange={setGeometryPattern}
        visualizationData={visualizationData}
        onVisualizationDataChange={setVisualizationData}
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
        selectedPreset={selectedPreset}
      />
    </div>
  );
});

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

EnhancedFrequencyGenerator.displayName = 'UltimateFrequencyGenerator';

export default EnhancedFrequencyGenerator;
