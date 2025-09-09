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
import FeatureGuard from './FeatureGuard';
import { useHealwaveFeatures } from '../hooks/useHealwaveFeatures';
import MiniPlayer from './MiniPlayer';
import { FrequencyWaveform, FrequencyData, FrequencyVisualizationConfig } from '@cosmichub/ui';
import * as d3 from 'd3';

/**
 * HealWave Standalone Frequency Generator
 * Uses shared audio engine but remains completely independent
 */
export const HealWaveFrequencyGenerator: React.FC = React.memo(() => {
  const features = useHealwaveFeatures();
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
      color: selectedPreset.category === 'solfeggio' ? '#00ffff' :
             selectedPreset.category === 'chakra' ? '#ff6b6b' :
             selectedPreset.category === 'brainwave' ? '#a855f7' : '#fbbf24',
      category: selectedPreset.category as FrequencyData['category'],
      benefits: [...(selectedPreset.benefits ?? [])],
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
  // const presetsLabelId = useId(); // reserved for future grouping label
  const volumeLabelId = useId();
  const durationLabelId = useId();

  // Ref for radiogroup to manage keyboard navigation
  const radioGroupRef = useRef<HTMLDivElement | null>(null);

  // Filter presets based on user tier
  const presets = useMemo<readonly FrequencyPreset[]>(() => {
    const allPresets = getAllPresets();
    const tierFiltered = allPresets.filter(preset => {
      // Free tier: Include solfeggio, chakra frequencies, and basic brainwave frequencies with binaural beats
      if (!features.advancedFrequencies.isAllowed) {
        const isBasicBrainwave = preset.category === 'brainwave' && 
          ['delta-sleep', 'theta-meditation', 'alpha-relaxation'].includes(preset.id);
        return preset.category === 'solfeggio' || 
               preset.category === 'chakra' || 
               isBasicBrainwave;
      }
      // Premium/Clinical: All presets available
      return true;
    });
    const filteredPresets = tierFiltered.filter(preset =>
      categoryFilter === 'all' ? true : preset.category === categoryFilter
    );
    
    // Debug logging
    devConsole.info('🎵 HealWave Debug - Preset loading:', {
      totalPresets: allPresets.length,
      filteredPresets: filteredPresets.length,
      advancedFrequenciesAllowed: features.advancedFrequencies.isAllowed,
      presetNames: filteredPresets.map(p => p.name)
    });
    
    return filteredPresets;
  }, [features.advancedFrequencies.isAllowed, categoryFilter]);
  // Stop any playing audio on unmount for cleanup
  useEffect(() => {
    return () => {
      audioEngine.stopFrequency();
    };
  }, [audioEngine]);

  // Keyboard navigation for custom radio group (roving tabindex pattern)
  const handleRadioKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const keys = [
        'ArrowRight',
        'ArrowDown',
        'ArrowLeft',
        'ArrowUp',
        'Home',
        'End',
      ];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const radios =
        radioGroupRef.current?.querySelectorAll<HTMLInputElement>(
          'input[type="radio"][name="healwave-preset"]'
        );
      if (!radios || radios.length === 0) return;
      const currentIndex = selectedPreset
        ? presets.findIndex(p => p.id === selectedPreset.id)
        : 0;
      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        nextIndex = (currentIndex + 1) % radios.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        nextIndex = (currentIndex - 1 + radios.length) % radios.length;
      if (e.key === 'Home') nextIndex = 0;
      if (e.key === 'End') nextIndex = radios.length - 1;
      const nextPreset = presets[nextIndex];
      if (nextPreset) {
        setSelectedPreset(nextPreset);
        const radio = radios[nextIndex];
        if (radio) {
          radio.focus();
        }
      }
    },
    [presets, selectedPreset]
  );

  const handlePlay = useCallback(async (): Promise<void> => {
    const preset = selectedPreset; // snapshot to avoid stale closure updates
    if (!preset || !isValidFrequencyPreset(preset)) return;
    try {
      await audioEngine.startFrequency(preset, settings);
      setIsPlaying(true);
    } catch (error: unknown) {
      devConsole.error('Failed to start frequency', { error });
    }
  }, [audioEngine, selectedPreset, settings]);

  const handleStop = useCallback(() => {
    audioEngine.stopFrequency();
    setIsPlaying(false);
  }, [audioEngine]);

  const updateSettings = useCallback(
    (key: keyof AudioSettings, value: number): void => {
      // Type guard for valid ranges
      if (
        (key === 'volume' && (value < 0 || value > 100)) ||
        (key === 'duration' && (value < 1 || value > 60))
      ) {
        return;
      }
      setSettings((prev: AudioSettings) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <div
      className='healwave-frequency-generator'
      role='region'
      aria-label='Frequency Generator'
    >
      <h2 className='mb-6 text-2xl font-bold'>HealWave Frequency Generator</h2>

      {/* Quick Filters */}
      <div className='mb-4 flex flex-wrap items-center gap-2' aria-label='Filter presets by category'>
        {([
          { id: 'all', label: 'All' },
          { id: 'solfeggio', label: 'Solfeggio' },
          { id: 'chakra', label: 'Chakra' },
          { id: 'brainwave', label: 'Brainwave' },
        ] as const).map(btn => (
          <button
            key={btn.id}
            type='button'
            onClick={() => setCategoryFilter(btn.id)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              categoryFilter === btn.id
                ? 'bg-cyan-500/20 border-cyan-400 text-white'
                : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
            }`}
            aria-pressed={categoryFilter === btn.id ? true : false}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Debug Info */}
      {(typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') && (
        <div className='mb-4 p-2 bg-blue-900/20 border border-blue-500/30 rounded text-xs'>
          Debug: {presets.length} presets loaded, Advanced: {features.advancedFrequencies.isAllowed ? 'Yes' : 'No'}
          <br />
          <strong>Current Tier:</strong> {(() => {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('tier') ?? 'free (default)';
          })()}
        </div>
      )}

      {/* Preset Selection */}
  <fieldset className='mb-6' role='group' aria-label='Select Frequency'>
        <legend className='mb-3 text-lg font-semibold'>Select Frequency</legend>
        {presets.length === 0 ? (
          <div className='p-4 border border-red-500/30 bg-red-900/20 rounded text-red-300'>
            No presets available. This might indicate a loading issue.
          </div>
        ) : (
          <div
            className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'
            ref={radioGroupRef}
            onKeyDown={handleRadioKeyDown}
          >
            {presets.map(preset => {
            const isSelected = selectedPreset?.id === preset.id;
            return (
              <Tooltip.Provider key={preset.id}>
                <Tooltip.Root>
                  {/* @ts-ignore - Radix UI asChild typing issue */}
                  <Tooltip.Trigger asChild>
                    <label
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-cyan-400 ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/20 backdrop-blur-sm'
                          : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type='radio'
                        name='healwave-preset'
                        className='sr-only'
                        checked={isSelected}
                        onChange={() => setSelectedPreset(preset)}
                        value={preset.id}
                        aria-label={`${preset.name} preset (${preset.baseFrequency} Hz)`}
                      />
                      <div className='font-medium text-white'>
                        {preset.name}
                      </div>
                      <div className='text-sm text-cyan-300'>
                        {preset.baseFrequency} Hz
                      </div>
                      {preset.binauralBeat && (
                        <div className='text-xs text-purple-300'>
                          🎵 Binaural Beat: {preset.binauralBeat} Hz
                        </div>
                      )}
                      <div className='mt-1 text-xs text-white/70'>
                        {preset.description}
                      </div>
                    </label>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className='p-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded shadow-xl text-white text-sm'
                      side='top'
                    >
                      Premium: Unlock more presets with subscription
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            );
          })}
        </div>
        )}
      </fieldset>

      {/* Premium Preset Preview */}
      {!features.advancedFrequencies.isAllowed && (
        <FeatureGuard 
          requiredTier="premium" 
          feature="advanced-frequencies"
          showPreview={true}
        >
          <fieldset className='mb-6'>
            <legend className='mb-4 text-lg font-semibold text-white'>
              🔬 Advanced Rife Frequencies
            </legend>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
              <div className='p-3 border border-purple-500/30 bg-purple-500/10 rounded-lg opacity-50'>
                <span className='text-sm text-purple-300'>20 Hz - General Vitality</span>
              </div>
              <div className='p-3 border border-purple-500/30 bg-purple-500/10 rounded-lg opacity-50'>
                <span className='text-sm text-purple-300'>727 Hz - General Healing</span>
              </div>
              <div className='p-3 border border-purple-500/30 bg-purple-500/10 rounded-lg opacity-50'>
                <span className='text-sm text-purple-300'>880 Hz - Immune Support</span>
              </div>
              <div className='p-3 border border-purple-500/30 bg-purple-500/10 rounded-lg opacity-50'>
                <span className='text-sm text-purple-300'>+ 50 more frequencies</span>
              </div>
            </div>
          </fieldset>
        </FeatureGuard>
      )}

      {/* Controls */}
      {selectedPreset && (
        <div id='healwave-session-settings' className='p-4 mb-6 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg'>
          <h4 className='mb-3 font-semibold text-white'>Session Settings</h4>

          {selectedPreset?.binauralBeat ? (
            <div className='mb-3 rounded-lg border border-purple-400/30 bg-purple-500/10 p-3 text-xs text-purple-200'>
              For binaural beats, use stereo headphones for best results.
            </div>
          ) : null}

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <div
                className='block mb-1 text-sm font-medium text-white/90'
                id={volumeLabelId}
              >
                Volume (%)
              </div>
              <Slider.Root
                className='relative flex items-center w-full h-5 select-none touch-none'
                value={[settings.volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => {
                  if (typeof value === 'number') {
                    updateSettings('volume', value);
                  }
                }}
                aria-labelledby={volumeLabelId}
                aria-valuenow={settings.volume}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <Slider.Track className='relative flex-grow h-1 bg-white/20 rounded-full'>
                  <Slider.Range className='absolute h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full' />
                </Slider.Track>
                <Slider.Thumb className='block w-4 h-4 bg-white border-2 border-cyan-400 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400' />
              </Slider.Root>
              <span className='text-sm text-white/70'>{settings.volume}%</span>
            </div>

            <div>
              <div
                className='block mb-1 text-sm font-medium text-white/90'
                id={durationLabelId}
              >
                Duration (minutes)
              </div>
              <Slider.Root
                className='relative flex items-center w-full h-5 select-none touch-none'
                value={[settings.duration]}
                min={1}
                max={60}
                step={1}
                onValueChange={([value]) => {
                  if (typeof value === 'number') {
                    updateSettings('duration', value);
                  }
                }}
                aria-labelledby={durationLabelId}
                aria-valuenow={settings.duration}
                aria-valuemin={1}
                aria-valuemax={60}
              >
                <Slider.Track className='relative flex-grow h-1 bg-white/20 rounded-full'>
                  <Slider.Range className='absolute h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full' />
                </Slider.Track>
                <Slider.Thumb className='block w-4 h-4 bg-white border-2 border-purple-400 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400' />
              </Slider.Root>
              <span className='text-sm text-white/70'>
                {settings.duration} min
              </span>
            </div>
            {/* Fade In */}
            <div>
              <div className='block mb-1 text-sm font-medium text-white/90'>
                Fade In (seconds)
              </div>
              <Slider.Root
                className='relative flex items-center w-full h-5 select-none touch-none'
                value={[settings.fadeIn ?? 0]}
                min={0}
                max={10}
                step={1}
                onValueChange={([value]) => {
                  if (typeof value === 'number') {
                    updateSettings('fadeIn', value);
                  }
                }}
                aria-label='Fade In (seconds)'
              >
                <Slider.Track className='relative flex-grow h-1 rounded-full bg-white/20'>
                  <Slider.Range className='absolute h-1 rounded-full bg-gradient-to-r from-emerald-400 to-green-400' />
                </Slider.Track>
                <Slider.Thumb className='block h-4 w-4 rounded-full border-2 border-emerald-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400' />
              </Slider.Root>
              <span className='text-sm text-white/70'>{settings.fadeIn ?? 0}s</span>
            </div>
            {/* Fade Out */}
            <div>
              <div className='block mb-1 text-sm font-medium text-white/90'>
                Fade Out (seconds)
              </div>
              <Slider.Root
                className='relative flex items-center w-full h-5 select-none touch-none'
                value={[settings.fadeOut ?? 0]}
                min={0}
                max={10}
                step={1}
                onValueChange={([value]) => {
                  if (typeof value === 'number') {
                    updateSettings('fadeOut', value);
                  }
                }}
                aria-label='Fade Out (seconds)'
              >
                <Slider.Track className='relative flex-grow h-1 rounded-full bg-white/20'>
                  <Slider.Range className='absolute h-1 rounded-full bg-gradient-to-r from-rose-400 to-red-400' />
                </Slider.Track>
                <Slider.Thumb className='block h-4 w-4 rounded-full border-2 border-rose-400 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400' />
              </Slider.Root>
              <span className='text-sm text-white/70'>{settings.fadeOut ?? 0}s</span>
            </div>
          </div>

          <div className='flex gap-3 mt-4'>
            <button
              type='button'
              onClick={() => {
                void handlePlay();
              }}
              disabled={isPlaying || !selectedPreset}
              className='px-4 py-2 text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all shadow-lg hover:shadow-cyan-500/25'
            >
              {isPlaying ? 'Playing...' : 'Start Session'}
            </button>

            <button
              type='button'
              onClick={handleStop}
              disabled={!isPlaying}
              className='px-4 py-2 text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 transition-all shadow-lg hover:shadow-red-500/25'
            >
              Stop
            </button>
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

HealWaveFrequencyGenerator.displayName = 'HealWaveFrequencyGenerator';

export default React.memo(HealWaveFrequencyGenerator);
