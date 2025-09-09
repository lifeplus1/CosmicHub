import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useId,
  memo
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  ErrorBoundary
} from '@cosmichub/ui';
import { ValidatedFrequencyData as FrequencyData } from '../schemas/frequencySchemas';
import HealWaveFrequencyVisualization from './visualization/HealWaveFrequencyVisualization';
import { AudioEngine, FrequencyPreset } from '@cosmichub/integrations';
import { devConsole } from '../config/devConsole';
import { ChakraFrequencySelector } from './enhancements/ChakraFrequencySelector';
import { ChakraKey, CHAKRA_FREQUENCIES } from './enhancements/chakraConstants';
import { calculateSacredPattern, GeometryPattern } from './enhancements/sacredGeometry';
import MiniPlayer from './MiniPlayer';
import DurationTimer from './DurationTimer';
import { CategoryFilter } from './ui/ControlComponents';
import CompactFrequencyList from './ui/CompactFrequencyList';
import { 
  getUnifiedFrequencyPresets, 
  getAvailableCategories
} from '../data/unifiedFrequencyData';

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
  initialFrequency = 528,
  showVisualization = true,
  realTimeUpdates: _realTimeUpdates = true,
  onFrequencyChange,
  onPresetSelect,
  onVolumeChange,
  onDurationChange,
  onPlayStateChange
}) => {
  // Core state
  const [currentFrequency, setCurrentFrequency] = useState(initialFrequency);
  const [selectedPreset, setSelectedPreset] = useState<FrequencyData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(15);
  
  // Advanced features state
  const [binauralEnabled, setBinauralEnabled] = useState(false);
  const [binauralBeat, setBinauralBeat] = useState(0);
  const [showSacredGeometry, setShowSacredGeometry] = useState(false);
  const [_showChakraSelector, setShowChakraSelector] = useState(false);
  const [selectedChakra, setSelectedChakra] = useState<ChakraKey | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'solfeggio' | 'chakra' | 'brainwave' | 'planetary' | 'rife'>('all');
  const [customPresets, setCustomPresets] = useState<FrequencyData[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showPresetCreator, setShowPresetCreator] = useState(false);
  
  // UI state
  const [visualizationData, setVisualizationData] = useState<FrequencyData[]>([]);
  const [geometryPattern, setGeometryPattern] = useState<GeometryPattern | null>(null);
  const [activeTab, setActiveTab] = useState<'frequencies' | 'chakras' | 'custom'>('frequencies');
  
  // Refs and IDs
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const volumeLabelId = useId();
  const durationLabelId = useId();
  
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Helper to update playing state and notify parent
  const updatePlayingState = useCallback((playing: boolean) => {
    setIsPlaying(playing);
    onPlayStateChange?.(playing);
  }, [onPlayStateChange]);

  // Test AudioContext availability with user interaction requirement
  const _testAudioContext = useCallback(async (): Promise<boolean> => {
    try {
      // Check if AudioContext is available
      interface ExtendedWindow extends Window {
        webkitAudioContext?: typeof AudioContext;
      }
      const win = window as ExtendedWindow;
      const AudioContextClass = window.AudioContext || win.webkitAudioContext;
      if (!AudioContextClass) {
        devConsole.warn('AudioContext not supported in this browser');
        return false;
      }
      
      // Create a test context to check functionality
      const testContext = new AudioContextClass();
      
      // Modern browsers require user interaction to start AudioContext
      if (testContext.state === 'suspended') {
        try {
          await testContext.resume();
        } catch (resumeError) {
          devConsole.warn('AudioContext requires user interaction:', resumeError);
          // This is expected - we'll handle it in the actual audio start
        }
      }
      
      await testContext.close();
      return true;
    } catch (error) {
      devConsole.error('AudioContext test failed:', error);
      return false;
    }
  }, []);

  // Initialize AudioEngine with proper cleanup
  const initializeAudioEngine = useCallback((): boolean => {
    try {
      // Only destroy and recreate if necessary
      if (audioEngineRef.current) {
        // Check if the current engine is in a good state
        try {
          const state = audioEngineRef.current.getState();
          devConsole.info('🎵 Current AudioEngine state:', state);
          // If engine exists and is not playing, we can reuse it
          if (!state.isPlaying) {
            devConsole.info('✅ Reusing existing AudioEngine');
            return true;
          }
        } catch {
          // If getting state fails, destroy and recreate
          devConsole.info('🔄 AudioEngine state check failed, recreating...');
          audioEngineRef.current.destroy();
        }
      }
      
      audioEngineRef.current = new AudioEngine();
      devConsole.info('✅ AudioEngine initialized successfully');
      return true;
    } catch (error) {
      devConsole.error('❌ Failed to initialize AudioEngine:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }, []);  // Initialize audio engine
  useEffect(() => {
    initializeAudioEngine();
    
    return () => {
      if (audioEngineRef.current) {
        try {
          // Stop any playing audio before destroying
          if (audioEngineRef.current.getState().isPlaying) {
            audioEngineRef.current.stopFrequency();
          }
          audioEngineRef.current.destroy();
          devConsole.info('🗑️ AudioEngine destroyed successfully');
        } catch (error) {
          devConsole.error('❌ Failed to destroy AudioEngine:', error instanceof Error ? error.message : String(error));
        } finally {
          // Ensure state is reset
          setIsPlaying(false);
        }
      }
    };
  }, [initializeAudioEngine]);

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
    if (!preset || typeof preset.frequency !== 'number') {
      devConsole.error('Invalid preset selected:', preset);
      return;
    }
    
    devConsole.info('🎵 Preset selected:', {
      name: preset.label,
      frequency: preset.frequency,
      category: preset.category
    });
    
    setSelectedPreset(preset);
    setCurrentFrequency(preset.frequency);
    onPresetSelect?.(preset);
    onFrequencyChange?.(preset.frequency);
  }, [onPresetSelect, onFrequencyChange]);

  const handleVolumeChange = useCallback(async (values: number[]) => {
    const newVolume = values[0];
    if (newVolume !== undefined) {
      setVolume(newVolume);
      onVolumeChange?.(newVolume);
      
      // Update audio engine volume if playing
      if (audioEngineRef.current && isPlaying) {
        try {
          await audioEngineRef.current.setVolume(newVolume);
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

    try {
      devConsole.info('▶️ Starting enhanced audio session:', {
        preset: selectedPreset.label,
        frequency: selectedPreset.frequency,
        duration,
        volume,
        binauralEnabled,
        binauralBeat: binauralEnabled ? binauralBeat : undefined
      });

      // Check AudioEngine state before starting
      const engineState = audioEngineRef.current.getState();
      devConsole.info('🎵 AudioEngine state:', engineState);

      // Ensure AudioContext is properly activated by user interaction
      // This is required by modern browser audio policies
      try {
        interface ExtendedWindow extends Window {
          webkitAudioContext?: typeof AudioContext;
        }
        const win = window as ExtendedWindow;
        const AudioContextClass = window.AudioContext ?? win.webkitAudioContext;
        
        if (!AudioContextClass) {
          throw new Error('AudioContext not supported in this browser');
        }
        
        // Create a temporary audio context to test browser support
        const testContext = new AudioContextClass();
        if (testContext.state === 'suspended') {
          await testContext.resume();
        }
        await testContext.close();
        devConsole.info('🎵 Browser audio context test passed');
      } catch (contextError) {
        devConsole.error('❌ Browser audio context test failed:', contextError instanceof Error ? contextError.message : String(contextError));
        throw new Error('Audio context activation failed - please ensure you have clicked to activate audio');
      }

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

      const preset: FrequencyPreset = {
        id: selectedPreset.label.toLowerCase().replace(/\s+/g, '-'),
        name: selectedPreset.label,
        category: getCategoryMapping(selectedPreset.category),
        baseFrequency: selectedPreset.frequency,
        binauralBeat: binauralEnabled ? binauralBeat : undefined,
        description: selectedPreset.benefits?.join(', '),
        benefits: selectedPreset.benefits || []
      };

      const settings = {
        volume,
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
            volume: volume,
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

    // Convert to FrequencyData format
    const frequencyData: FrequencyData = {
      frequency: preset.baseFrequency,
      amplitude: volume,
      phase: 0,
      label: preset.name,
      color: CHAKRA_FREQUENCIES[chakraKey]?.color ?? '#ffffff',
      category: 'chakra',
      timestamp: Date.now(),
      benefits: preset.benefits ? [...preset.benefits] : []
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
    <ErrorBoundary
      name="UltimateFrequencyGenerator"
      level="component"
      onError={(_error, _errorInfo) => {
        devConsole.error('UltimateFrequencyGenerator Error:', _error);
      }}
    >
      <motion.div
        ref={inViewRef}
        className={`space-y-6 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Enhanced Header with No Restrictions Notice */}
        <div className="text-center">
          <motion.h2
            className="text-3xl font-bold text-cosmic-gold mb-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            🎵 Ultimate Frequency Generator
          </motion.h2>
          <motion.p
            className="text-cosmic-silver mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Professional D3.js visualization • Sacred geometry • Chakra alignment • Unlimited access
          </motion.p>
          
          {/* Premium Features Unlocked Notice */}
          <motion.div
            className="mb-6 p-3 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-300">✨</span>
              <p className="text-sm font-medium text-green-200">
                Ultimate Mode: All premium features unlocked - D3.js visualization, sacred geometry, unlimited duration
              </p>
            </div>
          </motion.div>
        </div>

        {/* Feature Tabs */}
        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {(['frequencies', 'chakras', 'custom'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-cosmic-gold text-black shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {tab === 'frequencies' && '🎛️ All Frequencies'}
              {tab === 'chakras' && '🌈 Chakra System'}
              {tab === 'custom' && '💾 Custom Presets'}
            </button>
          ))}
        </motion.div>

        {/* Enhanced Controls Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Frequency Control */}
          <div className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30">
            <h3 className="text-lg font-semibold text-cosmic-gold mb-4">🎚️ Frequency</h3>
            <div className="space-y-4">
              <div>
                <label 
                  id={volumeLabelId}
                  className="block text-sm text-cosmic-silver mb-2"
                >
                  Current: {currentFrequency.toFixed(1)} Hz
                </label>
                <Slider.Root
                  value={[currentFrequency]}
                  onValueChange={(values) => handleFrequencyChange(values[0] ?? 528)}
                  min={0.1}
                  max={20000}
                  step={0.1}
                  aria-labelledby={volumeLabelId}
                  className="relative flex items-center w-full h-5"
                >
                  <Slider.Track className="relative flex-1 h-2 bg-white/20 rounded-full">
                    <Slider.Range className="absolute h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                </Slider.Root>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[174, 285, 528, 741, 852, 963].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => handleFrequencyChange(freq)}
                    className="px-2 py-1 text-xs bg-cosmic-purple/20 text-cosmic-purple rounded hover:bg-cosmic-purple/30 transition-colors"
                  >
                    {freq} Hz
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Volume & Duration */}
          <div className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30">
            <h3 className="text-lg font-semibold text-cosmic-gold mb-4">🔊 Audio</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-cosmic-silver mb-2">
                  Volume: {Math.round(volume * 100)}%
                </label>
                <Slider.Root
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.01}
                  className="relative flex items-center w-full h-5"
                >
                  <Slider.Track className="relative flex-1 h-2 bg-white/20 rounded-full">
                    <Slider.Range className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                </Slider.Root>
              </div>
              <div>
                <label 
                  id={durationLabelId}
                  className="block text-sm text-cosmic-silver mb-2"
                >
                  Duration: {duration} min (Unlimited ✨)
                </label>
                <Slider.Root
                  value={[duration]}
                  onValueChange={handleDurationChange}
                  min={1}
                  max={180}
                  step={1}
                  aria-labelledby={durationLabelId}
                  className="relative flex items-center w-full h-5"
                >
                  <Slider.Track className="relative flex-1 h-2 bg-white/20 rounded-full">
                    <Slider.Range className="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                </Slider.Root>
              </div>
            </div>
          </div>

          {/* Binaural Controls */}
          <div className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30">
            <h3 className="text-lg font-semibold text-cosmic-gold mb-4">🎧 Binaural</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={binauralEnabled}
                  onChange={(e) => setBinauralEnabled(e.target.checked)}
                  className="rounded border-cosmic-purple/30 bg-cosmic-purple/10"
                />
                <span className="text-cosmic-silver">Enable Beats</span>
              </label>

              <AnimatePresence>
                {binauralEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm text-cosmic-silver mb-2">
                      Beat: {binauralBeat.toFixed(1)} Hz
                    </label>
                    <Slider.Root
                      value={[binauralBeat]}
                      onValueChange={(values) => setBinauralBeat(values[0] ?? 0)}
                      min={0.1}
                      max={40}
                      step={0.1}
                      className="relative flex items-center w-full h-5"
                    >
                      <Slider.Track className="relative flex-1 h-2 bg-white/20 rounded-full">
                        <Slider.Range className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      </Slider.Track>
                      <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform" />
                    </Slider.Root>
                    <div className="text-xs text-cosmic-silver mt-1">
                      Use stereo headphones
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30">
            <h3 className="text-lg font-semibold text-cosmic-gold mb-4">🔮 Advanced</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showSacredGeometry}
                  onChange={(e) => setShowSacredGeometry(e.target.checked)}
                  className="rounded border-cosmic-purple/30 bg-cosmic-purple/10"
                />
                <span className="text-cosmic-silver text-sm">Sacred Geometry ✨</span>
              </label>
              
              <button
                onClick={() => setShowPresetCreator(!showPresetCreator)}
                className="w-full py-2 px-3 text-sm bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 text-white transition-all"
              >
                💾 Create Preset
              </button>

              <DurationTimer
                duration={duration}
                isActive={isPlaying}
                onComplete={handleStop}
              />
            </div>
          </div>
        </motion.div>

        {/* Playback Controls */}
        <motion.div
          className="flex justify-center space-x-4 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={isPlaying ? handleStop : handlePlay}
                  disabled={!selectedPreset}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-3 ${
                    isPlaying
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed'
                  }`}
                >
                  <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
                  <span>{isPlaying ? 'Stop Session' : 'Start Healing Session'}</span>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content className="px-3 py-2 text-sm text-white bg-black rounded-lg">
                {selectedPreset ? `${isPlaying ? 'Stop' : 'Start'} ${selectedPreset.label} session` : 'Select a frequency preset first'}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </motion.div>

        {/* Content Based on Active Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'frequencies' && (
            <motion.div
              key="frequencies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category Filter */}
              <div className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30 mb-6">
                <h3 className="text-lg font-semibold text-cosmic-gold mb-4">🎛️ Filter by Category</h3>
                <CategoryFilter
                  categories={availableCategories}
                  currentCategory={categoryFilter}
                  onChange={(category) => handleCategoryFilter(category as typeof categoryFilter)}
                  getCount={(category) => {
                    const unifiedPresets = getUnifiedFrequencyPresets();
                    return category === 'all' 
                      ? unifiedPresets.length 
                      : unifiedPresets.filter(p => p.category === category).length;
                  }}
                />
              </div>

              {/* Enhanced Frequency Library with Educational Content */}
              <CompactFrequencyList
                frequencies={allPresets}
                selectedFrequency={selectedPreset ?? undefined}
                onFrequencySelect={handlePresetSelect}
                categoryFilter={categoryFilter}
                className="cosmic-glass"
              />
            </motion.div>
          )}

          {activeTab === 'chakras' && (
            <motion.div
              key="chakras"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChakraFrequencySelector
                onChakraSelect={handleChakraSelect}
                selectedChakra={selectedChakra}
                className="mb-6"
              />
            </motion.div>
          )}

          {activeTab === 'custom' && (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30">
                <h3 className="text-xl font-semibold text-cosmic-gold mb-4">
                  💾 Custom Preset Creator (Premium Feature ✨)
                </h3>
                
                <AnimatePresence>
                  {showPresetCreator && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 mb-6"
                    >
                      <input
                        type="text"
                        placeholder="Enter preset name..."
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        className="w-full p-3 text-white bg-white/10 border border-white/20 rounded-xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cosmic-gold"
                      />
                      <button
                        onClick={handleSaveCustomPreset}
                        disabled={!presetName.trim()}
                        className="w-full py-3 px-6 bg-gradient-to-r from-cosmic-gold to-yellow-500 text-black font-semibold rounded-xl hover:from-yellow-400 hover:to-cosmic-gold disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
                      >
                        💾 Save Custom Preset
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Display Custom Presets */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {customPresets.map((preset, index) => (
                    <motion.button
                      key={`custom-${index}`}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                        selectedPreset === preset
                          ? 'border-cosmic-gold bg-cosmic-gold/20 shadow-lg'
                          : 'border-cosmic-purple/30 bg-cosmic-purple/10 hover:border-cosmic-purple/50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-4 h-4 rounded-full mx-auto mb-2 bg-purple-500"></div>
                      <div className="text-xs font-bold text-white">
                        {preset.frequency} Hz
                      </div>
                      <div className="text-xs text-cosmic-silver/70 truncate">
                        {preset.label}
                      </div>
                      <div className="text-xs text-purple-400 mt-1">Custom</div>
                    </motion.button>
                  ))}
                  
                  {customPresets.length === 0 && (
                    <div className="col-span-full text-center py-8 text-cosmic-silver/60">
                      No custom presets yet. Create your first one above!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sacred Geometry Visualization */}
        <AnimatePresence>
          {showSacredGeometry && geometryPattern && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30"
            >
              <h3 className="text-xl font-semibold text-cosmic-gold mb-4">
                🔮 Sacred Geometry Pattern
              </h3>
              <div className="flex justify-center">
                <SacredGeometryCanvas 
                  pattern={geometryPattern}
                  className="w-full max-w-md h-80 rounded-lg border border-white/20 bg-black/50"
                />
              </div>
              <div className="mt-4 text-center text-cosmic-silver">
                <div className="text-sm">
                  Pattern: {geometryPattern.type.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-xs text-cosmic-silver/70">
                  Resonance: {Math.round(geometryPattern.resonance * 100)}% • Frequency: {currentFrequency} Hz
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Visualization */}
        <AnimatePresence>
          {showVisualization && inView && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 1.0 }}
              className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30"
            >
              <h3 className="text-xl font-semibold text-cosmic-gold mb-4">
                📊 Professional D3.js Visualization
              </h3>
              
              {/* HealWave-specific D3.js Visualization */}
              <div className="space-y-6">
                <HealWaveFrequencyVisualization
                  data={[...visualizationData, ...binauralData]}
                  width={800}
                  height={400}
                  currentFrequency={currentFrequency}
                  isPlaying={isPlaying}
                  onFrequencySelect={handleFrequencyChange}
                  className="w-full"
                  testId="healwave-frequency-visualization"
                />
                
                {selectedPreset && (
                  <div className="mt-4 p-4 bg-cosmic-dark/40 rounded-lg border border-cosmic-purple/30">
                    <h4 className="text-cosmic-gold font-medium mb-2">Frequency Waveform</h4>
                    <div className="h-32 bg-black/30 rounded flex items-center justify-center border border-cosmic-purple/20">
                      <div className="text-cosmic-silver/60 text-center">
                        <div className="text-2xl mb-1">{selectedPreset.frequency.toFixed(2)} Hz</div>
                        <div className="text-sm">{isPlaying ? 'Playing' : 'Ready'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Frequency Information Panel */}
              {selectedPreset && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-black/50 rounded-lg border border-white/20"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-white font-bold text-lg">{selectedPreset.label}</div>
                      <div className="text-cosmic-gold text-xl font-mono">
                        {selectedPreset.frequency.toFixed(1)} Hz
                      </div>
                      <div className="text-cosmic-silver text-sm capitalize">
                        Category: {selectedPreset.category}
                      </div>
                    </div>
                    {selectedPreset.benefits && selectedPreset.benefits.length > 0 && (
                      <div>
                        <div className="text-white/70 text-sm font-medium mb-1">Benefits:</div>
                        <ul className="text-cyan-300 text-sm space-y-1">
                          {selectedPreset.benefits.slice(0, 3).map((benefit: string, index: number) => (
                            <li key={index}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Status Display */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="inline-flex items-center space-x-6 bg-cosmic-purple/10 px-8 py-4 rounded-full border border-cosmic-purple/30">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm font-medium text-white">
                {isPlaying ? 'Playing' : 'Stopped'}
              </span>
            </div>
            <div className="text-sm text-cosmic-gold font-mono">
              {currentFrequency.toFixed(1)} Hz
            </div>
            {binauralEnabled && binauralBeat > 0 && (
              <div className="text-sm text-purple-400 font-medium">
                Binaural: ±{binauralBeat.toFixed(1)} Hz
              </div>
            )}
            {selectedPreset && (
              <div className="text-sm text-cyan-400 capitalize">
                {selectedPreset.category}
              </div>
            )}
          </div>
        </motion.div>

        {/* Hidden Components for Functionality */}
        {/* AudioPlayer disabled to prevent conflicts with AudioEngine */}
        <div className="hidden">
          {/* 
          <AudioPlayer
            frequency={currentFrequency}
            volume={volume}
            isPlaying={isPlaying}
            binauralBeat={binauralEnabled ? binauralBeat : 0}
            onPlayStateChange={updatePlayingState}
          />
          */}
        </div>

        {/* Sticky Mini Player */}
        <MiniPlayer
          isPlaying={isPlaying}
          title={selectedPreset ? `${selectedPreset.label} • ${selectedPreset.frequency} Hz` : 'Ultimate Frequency Generator'}
          subtitle={binauralEnabled && binauralBeat > 0 ? `Binaural • ±${binauralBeat} Hz` : undefined}
          onStop={handleStop}
        />
      </motion.div>
    </ErrorBoundary>
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
