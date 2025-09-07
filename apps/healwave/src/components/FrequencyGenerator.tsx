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

  // Accessible ids
  // const presetsLabelId = useId(); // reserved for future grouping label
  const volumeLabelId = useId();
  const durationLabelId = useId();

  // Ref for radiogroup to manage keyboard navigation
  const radioGroupRef = useRef<HTMLDivElement | null>(null);

  // Filter presets based on user tier
  const presets = useMemo<readonly FrequencyPreset[]>(() => {
    const allPresets = getAllPresets();
    return allPresets.filter(preset => {
      // Free tier: Only solfeggio and basic chakra frequencies
      if (!features.advancedFrequencies.isAllowed) {
        return preset.category === 'solfeggio' || preset.category === 'chakra';
      }
      // Premium/Clinical: All presets available
      return true;
    });
  }, [features.advancedFrequencies.isAllowed]);
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
      const buttons =
        radioGroupRef.current?.querySelectorAll<HTMLButtonElement>(
          'button[role="radio"]'
        );
      if (!buttons || buttons.length === 0) return;
      const currentIndex = selectedPreset
        ? presets.findIndex(p => p.id === selectedPreset.id)
        : 0;
      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')
        nextIndex = (currentIndex + 1) % buttons.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      if (e.key === 'Home') nextIndex = 0;
      if (e.key === 'End') nextIndex = buttons.length - 1;
      const nextPreset = presets[nextIndex];
      if (nextPreset) {
        setSelectedPreset(nextPreset);
        const btn = buttons[nextIndex];
        if (btn) {
          btn.focus();
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

      {/* Preset Selection */}
      <fieldset className='mb-6'>
        <legend className='mb-3 text-lg font-semibold'>Select Frequency</legend>
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
        <div className='p-4 mb-6 border border-white/20 bg-white/5 backdrop-blur-sm rounded-lg'>
          <h4 className='mb-3 font-semibold text-white'>Session Settings</h4>

          <div className='grid grid-cols-2 gap-4'>
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
              <div>Binaural Beat: {selectedPreset.binauralBeat} Hz</div>
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
    </div>
  );
});

HealWaveFrequencyGenerator.displayName = 'HealWaveFrequencyGenerator';

// Suggested Vitest test:
// test('renders presets without errors', async () => {
//   render(<HealWaveFrequencyGenerator />);
//   await waitFor(() => expect(screen.getByText('Select Frequency')).toBeInTheDocument());
// });
