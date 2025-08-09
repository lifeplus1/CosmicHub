import React, { useState, useCallback, useMemo } from 'react';
import { AudioEngine, FrequencyPreset, AudioSettings } from '@cosmichub/frequency';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';

interface BinauralSettingsProps {
  onSettingsChange: (settings: AudioSettings) => void;
  onPresetSelect: (preset: FrequencyPreset) => void;
  currentSettings: AudioSettings;
  audioEngine: AudioEngine;
}

/**
 * HealWave Binaural Settings Component
 * Provides advanced binaural beat configuration using shared frequency engine
 * Remains completely standalone while leveraging shared infrastructure
 */
export const BinauralSettings: React.FC<BinauralSettingsProps> = React.memo(({
  onSettingsChange,
  onPresetSelect,
  currentSettings,
  audioEngine
}) => {
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [customFrequency, setCustomFrequency] = useState<number>(40);
  const [binauralBeat, setBinauralBeat] = useState<number>(6);

  interface BinauralRange {
    min: number;
    max: number;
    name: string;
    color: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  }

  type BinauralRangeKey = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'custom';

  interface BinauralRangeWithKey extends BinauralRange {
    key: BinauralRangeKey;
  }

  const binauralRanges = useMemo<Record<BinauralRangeKey, BinauralRange>>(() => ({
    delta: { min: 0.5, max: 4, name: 'Delta (Deep Sleep)', color: 'purple' },
    theta: { min: 4, max: 8, name: 'Theta (Meditation)', color: 'blue' },
    alpha: { min: 8, max: 14, name: 'Alpha (Relaxation)', color: 'green' },
    beta: { min: 14, max: 30, name: 'Beta (Focus)', color: 'yellow' },
    gamma: { min: 30, max: 100, name: 'Gamma (Awareness)', color: 'red' },
    custom: { min: 0, max: 0, name: 'Custom', color: 'gray' },
  }), []);

  const getCurrentRange = useCallback((beat: number): BinauralRangeWithKey => {
    for (const [key, range] of Object.entries(binauralRanges) as [BinauralRangeKey, BinauralRange][]) {
      if (key !== 'custom' && beat >= range.min && beat < range.max) {
        return { key, ...range };
      }
    }
    return { key: 'custom', ...binauralRanges.custom };
  }, [binauralRanges]);

  const colorMap = useMemo<Record<BinauralRange['color'], { bg: string; border: string }>>(() => ({
    purple: { bg: 'bg-purple-500', border: 'border-purple-500 bg-purple-50 text-purple-700' },
    blue: { bg: 'bg-blue-500', border: 'border-blue-500 bg-blue-50 text-blue-700' },
    green: { bg: 'bg-green-500', border: 'border-green-500 bg-green-50 text-green-700' },
    yellow: { bg: 'bg-yellow-500', border: 'border-yellow-500 bg-yellow-50 text-yellow-700' },
    red: { bg: 'bg-red-500', border: 'border-red-500 bg-red-50 text-red-700' },
    gray: { bg: 'bg-gray-500', border: 'border-gray-500 bg-gray-50 text-gray-700' },
  }), []);

  const getColorClass = useCallback((color: BinauralRange['color']): string => colorMap[color].bg, [colorMap]);
  const getBorderColorClass = useCallback((color: BinauralRange['color']): string => colorMap[color].border, [colorMap]);

  const handleVolumeChange = useCallback((value: number): void => {
    if (value < 0 || value > 100) return; // Type guard for range
    const newSettings: AudioSettings = { ...currentSettings, volume: value };
    onSettingsChange(newSettings);
  // Optimistically set volume on engine (no playing state guard available)
  audioEngine.setVolume(value).catch((error: unknown) => console.error('Volume set failed:', error));
  }, [currentSettings, onSettingsChange, audioEngine]);

  const handleDurationChange = useCallback((value: number): void => {
    if (value < 1 || value > 120) return;
    onSettingsChange({ ...currentSettings, duration: value });
  }, [currentSettings, onSettingsChange]);

  const handleFadeChange = useCallback((type: 'fadeIn' | 'fadeOut', value: number): void => {
    if (value < 0 || value > 30) return;
    onSettingsChange({ ...currentSettings, [type]: value });
  }, [currentSettings, onSettingsChange]);

  const createCustomPreset = useCallback((): void => {
    const currentRangeInfo = getCurrentRange(binauralBeat);
    const customPreset: FrequencyPreset = {
      id: `custom-${Date.now()}`,
      name: `Custom ${customFrequency}Hz + ${binauralBeat}Hz beat`,
      category: 'custom',
      baseFrequency: customFrequency,
      binauralBeat: binauralBeat,
      description: `Custom binaural beat in ${currentRangeInfo.name} range`,
      benefits: [`${currentRangeInfo.name} state enhancement`],
    };
    onPresetSelect(customPreset);
  }, [customFrequency, binauralBeat, onPresetSelect, getCurrentRange]);

  const currentRange = useMemo<BinauralRangeWithKey>(() => getCurrentRange(binauralBeat), [binauralBeat, getCurrentRange]);

  return (
    <div className="p-6 space-y-6 bg-white border border-gray-200 rounded-lg" role="region" aria-label="Binaural Settings">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">🎵 Binaural Settings</h3>
        {advancedMode ? (
          <button
            type="button"
            onClick={() => setAdvancedMode((prev) => !prev)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
            aria-pressed="true"
            aria-expanded="true"
            aria-controls="binaural-advanced-section"
          >
            Simple Mode
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAdvancedMode((prev) => !prev)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
            aria-pressed="false"
            aria-expanded="false"
            aria-controls="binaural-advanced-section"
          >
            Advanced Mode
          </button>
        )}
      </div>

      {/* Basic Settings */}
      <div className="space-y-4">
        <div>
          <label htmlFor="volume-slider" className="block mb-2 text-sm font-medium text-gray-700">
            Volume: {currentSettings.volume}%
          </label>
          <Slider.Root
            id="volume-slider"
            className="relative flex items-center w-full h-2 select-none touch-none"
            value={[currentSettings.volume]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) => handleVolumeChange(value)}
            aria-label="Volume"
            aria-valuenow={currentSettings.volume}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <Slider.Track className="relative flex-grow h-2 bg-gray-200 rounded-lg">
              <Slider.Range className="absolute h-2 bg-gray-600 rounded-lg" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Volume thumb" />
          </Slider.Root>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Silent</span>
            <span>Maximum</span>
          </div>
        </div>

        <div>
          <label htmlFor="duration-slider" className="block mb-2 text-sm font-medium text-gray-700">
            Session Duration: {currentSettings.duration} minutes
          </label>
          <Slider.Root
            id="duration-slider"
            className="relative flex items-center w-full h-2 select-none touch-none"
            value={[currentSettings.duration]}
            min={1}
            max={120}
            step={1}
            onValueChange={([value]) => handleDurationChange(value)}
            aria-label="Duration"
            aria-valuenow={currentSettings.duration}
            aria-valuemin={1}
            aria-valuemax={120}
          >
            <Slider.Track className="relative flex-grow h-2 bg-gray-200 rounded-lg">
              <Slider.Range className="absolute h-2 bg-gray-600 rounded-lg" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Duration thumb" />
          </Slider.Root>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>1 min</span>
            <span>2 hours</span>
          </div>
        </div>
      </div>

      {/* Advanced Settings - Lazy load if complex, but inline for simplicity */}
      {advancedMode && (
        <div id="binaural-advanced-section" className="pt-4 space-y-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900">🔧 Advanced Controls</h4>
          
          {/* Fade Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fade-in-slider" className="block mb-2 text-sm font-medium text-gray-700">
                Fade In: {currentSettings.fadeIn}s
              </label>
              <Slider.Root
                id="fade-in-slider"
                className="relative flex items-center w-full h-2 select-none touch-none"
                value={[currentSettings.fadeIn]}
                min={0}
                max={30}
                step={1}
                onValueChange={([value]) => handleFadeChange('fadeIn', value)}
                aria-label="Fade In"
                aria-valuenow={currentSettings.fadeIn}
                aria-valuemin={0}
                aria-valuemax={30}
              >
                <Slider.Track className="relative flex-grow h-2 bg-gray-200 rounded-lg">
                  <Slider.Range className="absolute h-2 bg-gray-600 rounded-lg" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Fade In thumb" />
              </Slider.Root>
            </div>
            
            <div>
              <label htmlFor="fade-out-slider" className="block mb-2 text-sm font-medium text-gray-700">
                Fade Out: {currentSettings.fadeOut}s
              </label>
              <Slider.Root
                id="fade-out-slider"
                className="relative flex items-center w-full h-2 select-none touch-none"
                value={[currentSettings.fadeOut]}
                min={0}
                max={30}
                step={1}
                onValueChange={([value]) => handleFadeChange('fadeOut', value)}
                aria-label="Fade Out"
                aria-valuenow={currentSettings.fadeOut}
                aria-valuemin={0}
                aria-valuemax={30}
              >
                <Slider.Track className="relative flex-grow h-2 bg-gray-200 rounded-lg">
                  <Slider.Range className="absolute h-2 bg-gray-600 rounded-lg" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Fade Out thumb" />
              </Slider.Root>
            </div>
          </div>

          {/* Custom Frequency Creation */}
          <div className="p-4 space-y-4 rounded-lg bg-gray-50">
            <h5 className="font-medium text-gray-900">🎛️ Create Custom Frequency</h5>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="base-frequency" className="block mb-2 text-sm font-medium text-gray-700">
                  Base Frequency: {customFrequency} Hz
                </label>
                <Slider.Root
                  id="base-frequency"
                  className="relative flex items-center w-full h-2 select-none touch-none"
                  value={[customFrequency]}
                  min={20}
                  max={2000}
                  step={1}
                  onValueChange={([value]) => setCustomFrequency(value)}
                  aria-label="Base Frequency"
                  aria-valuenow={customFrequency}
                  aria-valuemin={20}
                  aria-valuemax={2000}
                >
                  <Slider.Track className="relative flex-grow h-2 bg-gray-200 rounded-lg">
                    <Slider.Range className="absolute h-2 bg-gray-600 rounded-lg" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Base Frequency thumb" />
                </Slider.Root>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>20 Hz</span>
                  <span>2000 Hz</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="binaural-beat" className="block mb-2 text-sm font-medium text-gray-700">
                  Binaural Beat: {binauralBeat} Hz
                </label>
                <Slider.Root
                  id="binaural-beat"
                  className="relative flex items-center w-full h-2 select-none touch-none"
                  value={[binauralBeat]}
                  min={0.5}
                  max={100}
                  step={0.5}
                  onValueChange={([value]) => setBinauralBeat(value)}
                  aria-label="Binaural Beat"
                  aria-valuenow={binauralBeat}
                  aria-valuemin={0.5}
                  aria-valuemax={100}
                >
                  <Slider.Track className="relative flex-grow h-2 bg-gray-200 rounded-lg">
                    <Slider.Range className="absolute h-2 bg-gray-600 rounded-lg" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Binaural Beat thumb" />
                </Slider.Root>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>0.5 Hz</span>
                  <span>100 Hz</span>
                </div>
              </div>
            </div>

            {/* Binaural Beat Range Indicator */}
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div className="flex items-center space-x-2 cursor-help" tabIndex={0} role="button">
                    <div 
                      className={`w-3 h-3 rounded-full ${getColorClass(currentRange.color)}`}
                      aria-label={currentRange.name}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {currentRange.name}
                    </span>
                    {currentRange.key !== 'custom' && (
                      <span className="text-xs text-gray-500">
                        ({currentRange.min}-{currentRange.max} Hz range)
                      </span>
                    )}
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="p-2 bg-white border rounded shadow" side="top">Range info and benefits</Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            {/* Quick Range Buttons */}
            <div className="grid grid-cols-5 gap-2">
              {(Object.entries(binauralRanges) as [BinauralRangeKey, BinauralRange][])
                .filter(([key]) => key !== 'custom')
                .map(([key, range]) => (
                <button
                  key={key}
                  onClick={() => setBinauralBeat((range.min + range.max) / 2)}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    currentRange.key === key
                      ? getBorderColorClass(range.color)
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  aria-label={`Select ${range.name}`}
                >
                  {range.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={createCustomPreset}
                    className="w-full px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    🎵 Create Custom Frequency
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="p-2 bg-white border rounded shadow" side="top">Premium: Save custom presets with subscription</Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="p-4 rounded-lg bg-blue-50">
        <h5 className="mb-2 font-medium text-blue-900">💡 Tips for Best Results</h5>
        <ul className="space-y-1 text-sm text-blue-800" role="list">
          <li>• Use headphones for proper binaural effect</li>
          <li>• Start with lower volumes and gradually increase</li>
          <li>• Delta waves (0.5-4 Hz) are best for sleep</li>
          <li>• Theta waves (4-8 Hz) enhance meditation</li>
          <li>• Alpha waves (8-14 Hz) promote relaxation</li>
        </ul>
        <p className="mt-2 text-sm text-blue-800">Try our Astro app for astrology-tied frequencies! <a href="/astro" className="underline hover:text-blue-600">Learn more</a></p>
      </div>
    </div>
  );
});

// Suggested Vitest test:
// test('handles volume change within range', () => {
//   const onChange = vi.fn();
//   render(<BinauralSettings onSettingsChange={onChange} ... />);
//   // Simulate slider change and assert
// });