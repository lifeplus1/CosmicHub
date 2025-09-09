import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useId,
  useRef,
} from 'react';
import { devConsole } from '../config/devConsole';
import {
  AudioEngine,
  FrequencyPreset,
  AudioSettings,
  getAllPresets,
  isValidFrequencyPreset,
} from '@cosmichub/integrations';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import MiniPlayer from './MiniPlayer';
import { FrequencyWaveform, FrequencyData, FrequencyVisualizationConfig } from '@cosmichub/ui';
import * as d3 from 'd3';

/**
 * HealWave Unrestricted Frequency Generator for AB Testing
 * No subscription restrictions - all features available to all users
 */
export const HealWaveFrequencyGeneratorUnrestricted: React.FC = React.memo(() => {
  const [audioEngine] = useState<AudioEngine>(() => new AudioEngine());
  const [selectedPreset, setSelectedPreset] = useState<FrequencyPreset | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [settings, setSettings] = useState<AudioSettings>({
    volume: 50,
    duration: 10,
    fadeIn: 2,
    fadeOut: 2,
  });
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'solfeggio' | 'chakra' | 'brainwave'
  >('all');
  const [hoveredFrequency, setHoveredFrequency] = useState<FrequencyData | null>(null);

  // Frequency visualization data
  const frequencyData = useMemo<FrequencyData[]>(() => {
    if (!selectedPreset) return [];

    const baseData: FrequencyData = {
      frequency: selectedPreset.baseFrequency,
      amplitude: settings.volume,
      phase: 0,
      label: selectedPreset.name,
      color: '#00ffff',
      category: selectedPreset.category as FrequencyData['category'],
      benefits: selectedPreset.benefits ? [...selectedPreset.benefits] : [],
      duration: settings.duration * 60, // Convert to seconds
    };

    // Add binaural beat as second frequency if present
    if (selectedPreset.binauralBeat) {
      return [
        baseData,
        {
          ...baseData,
          frequency: selectedPreset.binauralBeat,
          label: `${selectedPreset.name} (Binaural)`,
          color: '#ec4899', // Pink for binaural
          category: 'binaural' as const,
        }
      ];
    }

    return [baseData];
  }, [selectedPreset, settings.volume, settings.duration]);

  // Frequency visualization config
  const visualizationConfig: FrequencyVisualizationConfig = useMemo(() => ({
    width: 800,
    height: 300,
    showWaveform: true,
    showSpectrum: true,
    showFrequencyLabels: true,
    animation: {
      duration: 1000,
      easing: d3.easeCubicInOut,
    },
    theme: {
      background: 'transparent',
      wave: '#ffffff',
      spectrum: '#00ffff',
      labels: '#ffffff',
      grid: '#ffffff20',
    },
    accessibility: {
      title: 'Frequency Visualization',
      description: 'Real-time visualization of the selected frequency waveform and spectrum',
    },
  }), []);

  // Accessible ids
  const volumeLabelId = useId();
  const durationLabelId = useId();

  // Ref for radiogroup to manage keyboard navigation
  const radioGroupRef = useRef<HTMLDivElement | null>(null);

  // NO RESTRICTIONS - All presets available for all users
  const presets = useMemo<readonly FrequencyPreset[]>(() => {
    const allPresets = getAllPresets();
    const filteredPresets = allPresets.filter(preset =>
      categoryFilter === 'all' ? true : preset.category === categoryFilter
    );
    
    // Debug logging
    devConsole.info('🎵 HealWave Unrestricted Debug - Preset loading:', {
      totalPresets: allPresets.length,
      filteredPresets: filteredPresets.length,
      noRestrictions: true,
      presetNames: filteredPresets.map(p => p.name)
    });
    
    return filteredPresets;
  }, [categoryFilter]);

  // Available preset categories based on current presets
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(presets.map(p => p.category)));
    return categories.sort();
  }, [presets]);

  // Event handlers
  const handlePresetChange = useCallback((preset: FrequencyPreset) => {
    if (!isValidFrequencyPreset(preset)) {
      devConsole.error('❌ Invalid preset selected:', preset);
      return;
    }
    
    devConsole.info('🎵 Preset selected:', {
      name: preset.name,
      frequency: preset.baseFrequency,
      category: preset.category,
      binauralBeat: preset.binauralBeat
    });
    
    setSelectedPreset(preset);
    
    // Update audio engine with new frequency
    // TODO: Fix AudioEngine type definitions
    // audioEngine.updateFrequency(preset.baseFrequency);
    if (preset.binauralBeat) {
      // audioEngine.updateBinauralBeat(preset.binauralBeat);
    }
  }, []);

  const handleVolumeChange = useCallback((values: number[]) => {
    const volume = values[0];
    if (volume !== undefined) {
      setSettings(prev => ({ ...prev, volume }));
      // TODO: Fix AudioEngine type definitions
      // audioEngine.updateVolume(volume / 100);
    }
  }, []);

  const handleDurationChange = useCallback((values: number[]) => {
    const duration = values[0];
    if (duration !== undefined) {
      setSettings(prev => ({ ...prev, duration }));
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (!selectedPreset) {
      devConsole.warn('⚠️ No preset selected');
      return;
    }

    try {
      devConsole.info('▶️ Starting audio session:', {
        preset: selectedPreset.name,
        frequency: selectedPreset.baseFrequency,
        duration: settings.duration,
        volume: settings.volume
      });

      // TODO: Fix AudioEngine type definitions
      /*
      await audioEngine.play({
        frequency: selectedPreset.baseFrequency,
        duration: settings.duration * 60 * 1000, // Convert to milliseconds
        volume: settings.volume / 100,
        binauralBeat: selectedPreset.binauralBeat,
        fadeIn: settings.fadeIn * 1000,
        fadeOut: settings.fadeOut * 1000,
      });
      */
      
      setIsPlaying(true);
    } catch (error) {
      devConsole.error('❌ Failed to start audio session:', error instanceof Error ? error.message : String(error));
    }
  }, [selectedPreset, settings]);

  const handleStop = useCallback(() => {
    devConsole.info('⏹️ Stopping audio session');
    // TODO: Fix AudioEngine type definitions
    // audioEngine.stop();
    setIsPlaying(false);
  }, []);

  const handleCategoryFilterChange = useCallback((category: 'all' | 'solfeggio' | 'chakra' | 'brainwave') => {
    setCategoryFilter(category);
    setSelectedPreset(null); // Clear selection when changing category
  }, []);

  // Cleanup audio engine on unmount
  useEffect(() => {
    return () => {
      // TODO: Fix AudioEngine type definitions
      // audioEngine.cleanup();
    };
  }, [audioEngine]);

  return (
    <div className='space-y-6'>
      {/* Category Filter */}
      <fieldset className='space-y-4'>
        <legend className='text-lg font-semibold text-white'>
          🎵 Frequency Categories (No Restrictions)
        </legend>
        <div className='flex flex-wrap gap-2'>
          <button
            type="button"
            onClick={() => handleCategoryFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            All ({presets.length})
          </button>
          {availableCategories.map((category) => {
            const count = presets.filter(p => p.category === category).length;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryFilterChange(category as 'solfeggio' | 'chakra' | 'brainwave')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  categoryFilter === category
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Preset Selection */}
      <fieldset className='space-y-4'>
        <legend className='text-lg font-semibold text-white'>
          Choose Frequency Preset
        </legend>
        <div
          role='radiogroup'
          aria-label='Available frequency presets'
          ref={radioGroupRef}
          className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'
        >
          {presets.map((preset) => (
            <label
              key={preset.id}
              className={`relative cursor-pointer p-4 border rounded-lg transition-all hover:scale-105 ${
                selectedPreset?.id === preset.id
                  ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/25'
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
              }`}
            >
              <input
                type='radio'
                name='frequency-preset'
                value={preset.id}
                checked={selectedPreset?.id === preset.id}
                onChange={() => handlePresetChange(preset)}
                className='sr-only'
                aria-describedby={`${preset.id}-description`}
              />
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-medium text-white'>{preset.name}</h3>
                  <span className='text-sm text-cyan-300'>
                    {preset.baseFrequency} Hz
                  </span>
                </div>
                <p
                  id={`${preset.id}-description`}
                  className='text-sm text-white/70'
                >
                  {preset.description}
                </p>
                {preset.binauralBeat && (
                  <div className='flex items-center space-x-2'>
                    <span className='px-2 py-1 text-xs bg-purple-500/30 text-purple-300 rounded-full'>
                      Binaural: {preset.binauralBeat} Hz
                    </span>
                  </div>
                )}
                <div className='flex items-center space-x-2'>
                  <span className='px-2 py-1 text-xs bg-emerald-500/30 text-emerald-300 rounded-full capitalize'>
                    {preset.category}
                  </span>
                  <span className='px-2 py-1 text-xs bg-blue-500/30 text-blue-300 rounded-full'>
                    ✨ Available
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Controls */}
      {selectedPreset && (
        <div id='healwave-session-settings' className='p-4 mb-6 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg'>
          <h4 className='mb-3 font-semibold text-white'>Session Settings</h4>

          {selectedPreset?.binauralBeat ? (
            <div className='mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg'>
              <p className='text-sm text-purple-300'>
                🎧 <strong>Binaural Beat Active:</strong> This frequency includes a {selectedPreset.binauralBeat} Hz binaural beat. 
                Use stereo headphones for the full therapeutic effect.
              </p>
            </div>
          ) : null}

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Volume Control */}
            <div className='space-y-3'>
              <label 
                id={volumeLabelId}
                className='block text-sm font-medium text-white'
              >
                Volume: {settings.volume}%
              </label>
              <Slider.Root
                value={[settings.volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                aria-labelledby={volumeLabelId}
                className='relative flex items-center w-full h-5'
              >
                <Slider.Track className='relative flex-1 h-2 bg-white/20 rounded-full'>
                  <Slider.Range className='absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full' />
                </Slider.Track>
                <Slider.Thumb className='block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform' />
              </Slider.Root>
            </div>

            {/* Duration Control */}
            <div className='space-y-3'>
              <label 
                id={durationLabelId}
                className='block text-sm font-medium text-white'
              >
                Duration: {settings.duration} minutes (Unlimited)
              </label>
              <Slider.Root
                value={[settings.duration]}
                onValueChange={handleDurationChange}
                min={1}
                max={120}
                step={1}
                aria-labelledby={durationLabelId}
                className='relative flex items-center w-full h-5'
              >
                <Slider.Track className='relative flex-1 h-2 bg-white/20 rounded-full'>
                  <Slider.Range className='absolute h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full' />
                </Slider.Track>
                <Slider.Thumb className='block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform' />
              </Slider.Root>
            </div>
          </div>

          {/* Play/Stop Controls */}
          <div className='flex justify-center mt-6 space-x-4'>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => void handlePlay()}
                  disabled={isPlaying}
                  className='px-8 py-3 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25'
                  aria-label={`Play ${selectedPreset.name} frequency`}
                >
                  ▶️ Play Session
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content className='px-3 py-2 text-sm text-white bg-black rounded-lg'>
                Start {settings.duration}-minute healing session
              </Tooltip.Content>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={handleStop}
                  disabled={!isPlaying}
                  className='px-8 py-3 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/25'
                  aria-label='Stop frequency session'
                >
                  ⏹️ Stop
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content className='px-3 py-2 text-sm text-white bg-black rounded-lg'>
                Stop current session
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
        </div>
      )}

      {/* Frequency Visualization */}
      {selectedPreset && frequencyData.length > 0 && (
        <div className='mb-6 p-4 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg'>
          <h4 className='mb-4 font-semibold text-white'>Frequency Visualization</h4>
          <FrequencyWaveform
            data={frequencyData}
            config={visualizationConfig}
            currentFrequency={isPlaying ? selectedPreset.baseFrequency : undefined}
            isPlaying={isPlaying}
            onFrequencyHover={setHoveredFrequency}
            className="w-full"
            testId="healwave-frequency-visualization"
          />
          {hoveredFrequency && (
            <div className='mt-4 p-3 bg-black/50 rounded-lg'>
              <div className='text-sm text-white/80'>
                <strong>{hoveredFrequency.label}</strong> - {hoveredFrequency.frequency} Hz
                {hoveredFrequency.benefits && hoveredFrequency.benefits.length > 0 && (
                  <div className='mt-1 text-xs text-cyan-300'>
                    Benefits: {hoveredFrequency.benefits.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Frequency Info */}
      {selectedPreset && (
        <div className='p-4 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg'>
          <h4 className='mb-2 font-semibold text-white'>
            About {selectedPreset.name}
          </h4>
          <p className='text-sm text-white/80 mb-2'>
            {selectedPreset.description}
          </p>
          <div className='text-xs text-white/60'>
            <div>Frequency: {selectedPreset.baseFrequency} Hz</div>
            <div>Category: {selectedPreset.category}</div>
            {selectedPreset.binauralBeat && (
              <div className='text-purple-300 font-medium'>
                <span>
                  Binaural Beat: {selectedPreset.binauralBeat} Hz
                </span>
                <span className='text-white/60 ml-2'>
                  (Use stereo headphones for best effect)
                </span>
              </div>
            )}
            {selectedPreset.benefits && (
              <div className='mt-2'>
                <strong className='text-cyan-300'>Benefits:</strong>
                <ul className='list-disc list-inside mt-1'>
                  {selectedPreset.benefits.map(
                    (benefit: string, index: number) => (
                      <li key={benefit + index.toString()}>{benefit}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live region for play state updates */}
      <div className='sr-only' aria-live='polite'>
        {isPlaying
          ? 'Frequency playback started'
          : 'Frequency playback stopped'}
      </div>

      {/* Sticky Mini Player */}
      <MiniPlayer
        isPlaying={isPlaying}
        title={selectedPreset ? `${selectedPreset.name} • ${selectedPreset.baseFrequency} Hz` : 'No preset selected'}
        subtitle={selectedPreset?.binauralBeat ? `Binaural • ${selectedPreset.binauralBeat} Hz` : undefined}
        onStop={handleStop}
      />
    </div>
  );
});

HealWaveFrequencyGeneratorUnrestricted.displayName = 'HealWaveFrequencyGeneratorUnrestricted';

export default React.memo(HealWaveFrequencyGeneratorUnrestricted);
