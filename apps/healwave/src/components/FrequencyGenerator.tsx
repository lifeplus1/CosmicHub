import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { AudioEngine, FrequencyPreset, AudioSettings, getAllPresets } from '@cosmichub/frequency';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';

const LazyPresetInfo = lazy(() => import('./PresetInfo')); // Lazy load for performance; assume in @cosmichub/ui

/**
 * HealWave Standalone Frequency Generator
 * Uses shared audio engine but remains completely independent
 */
export const HealWaveFrequencyGenerator: React.FC = React.memo(() => {
  const [audioEngine] = useState(() => new AudioEngine());
  const [selectedPreset, setSelectedPreset] = useState<FrequencyPreset | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [settings, setSettings] = useState<AudioSettings>({
    volume: 50,
    duration: 10,
    fadeIn: 2,
    fadeOut: 2,
  });

  const presets = useMemo(() => getAllPresets(), []); // Memoize; fetch batched from Firestore with indexing for scalability

  const handlePlay = useCallback(async () => {
    if (!selectedPreset) return;
    try {
      await audioEngine.startFrequency(selectedPreset, settings);
      setIsPlaying(true);
    } catch (error: unknown) {
      console.error('Failed to start frequency:', error); // Integrate shared logger from @cosmichub/integrations
    }
  }, [audioEngine, selectedPreset, settings]);

  const handleStop = useCallback(() => {
    audioEngine.stopFrequency();
    setIsPlaying(false);
  }, [audioEngine]);

  const updateSettings = useCallback((key: keyof AudioSettings, value: number) => {
    // Type guard for valid ranges
    if ((key === 'volume' && (value < 0 || value > 100)) ||
        (key === 'duration' && (value < 1 || value > 60))) return;
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="healwave-frequency-generator" role="region" aria-label="Frequency Generator">
      <h2 className="mb-6 text-2xl font-bold">HealWave Frequency Generator</h2>
      
      {/* Preset Selection */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">Select Frequency</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <Tooltip.Provider key={preset.id}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => setSelectedPreset(preset)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedPreset?.id === preset.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    aria-pressed={selectedPreset?.id === preset.id}
                    aria-label={`Select ${preset.name} preset`}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-sm text-gray-600">{preset.baseFrequency} Hz</div>
                    <div className="mt-1 text-xs text-gray-500">{preset.description}</div>
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="p-2 bg-white border rounded shadow" side="top">Premium: Unlock more presets with subscription</Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          ))}
        </div>
      </div>

      {/* Controls */}
      {selectedPreset && (
        <div className="p-4 mb-6 border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-semibold">Session Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium" id="volume-label">Volume (%)</label>
              <Slider.Root
                className="relative flex items-center w-full h-5 select-none touch-none"
                value={[settings.volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => updateSettings('volume', value)}
                aria-labelledby="volume-label"
                aria-valuenow={settings.volume}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <Slider.Track className="relative flex-grow h-1 bg-gray-200 rounded-full">
                  <Slider.Range className="absolute h-1 bg-blue-500 rounded-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </Slider.Root>
              <span className="text-sm text-gray-600">{settings.volume}%</span>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium" id="duration-label">Duration (minutes)</label>
              <Slider.Root
                className="relative flex items-center w-full h-5 select-none touch-none"
                value={[settings.duration]}
                min={1}
                max={60}
                step={1}
                onValueChange={([value]) => updateSettings('duration', value)}
                aria-labelledby="duration-label"
                aria-valuenow={settings.duration}
                aria-valuemin={1}
                aria-valuemax={60}
              >
                <Slider.Track className="relative flex-grow h-1 bg-gray-200 rounded-full">
                  <Slider.Range className="absolute h-1 bg-blue-500 rounded-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </Slider.Root>
              <span className="text-sm text-gray-600">{settings.duration} min</span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-disabled={isPlaying}
            >
              {isPlaying ? 'Playing...' : 'Start Session'}
            </button>
            
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-disabled={!isPlaying}
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Frequency Info - Lazy loaded */}
      <Suspense fallback={<div aria-live="polite">Loading preset info...</div>}>
        {selectedPreset && <LazyPresetInfo preset={selectedPreset} />}
      </Suspense>
    </div>
  );
});

// Suggested Vitest test:
// test('renders presets without errors', async () => {
//   render(<HealWaveFrequencyGenerator />);
//   await waitFor(() => expect(screen.getByText('Select Frequency')).toBeInTheDocument());
// });