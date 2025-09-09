import React, { useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { type BinauralRangeWithKey } from './BinauralRangeSelector';

interface AdvancedSettingsProps {
  fadeIn: number;
  fadeOut: number;
  customFrequency: number;
  binauralBeat: number;
  onFadeInChange: (value: number) => void;
  onFadeOutChange: (value: number) => void;
  onCustomFrequencyChange: (value: number) => void;
  onBinauralBeatChange: (value: number) => void;
  currentRange: BinauralRangeWithKey;
  disabled?: boolean;
  className?: string;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = React.memo(({
  fadeIn,
  fadeOut,
  customFrequency,
  binauralBeat,
  onFadeInChange,
  onFadeOutChange,
  onCustomFrequencyChange,
  onBinauralBeatChange,
  currentRange,
  disabled = false,
  className = '',
}) => {
  const handleFadeInChange = useCallback(
    (values: number[]) => {
      const value = values[0];
      if (typeof value === 'number' && value >= 0 && value <= 30) {
        onFadeInChange(value);
      }
    },
    [onFadeInChange]
  );

  const handleFadeOutChange = useCallback(
    (values: number[]) => {
      const value = values[0];
      if (typeof value === 'number' && value >= 0 && value <= 30) {
        onFadeOutChange(value);
      }
    },
    [onFadeOutChange]
  );

  const handleCustomFrequencyChange = useCallback(
    (values: number[]) => {
      const value = values[0];
      if (typeof value === 'number' && value >= 20 && value <= 2000) {
        onCustomFrequencyChange(value);
      }
    },
    [onCustomFrequencyChange]
  );

  const handleBinauralBeatChange = useCallback(
    (values: number[]) => {
      const value = values[0];
      if (typeof value === 'number' && value >= 0.5 && value <= 100) {
        onBinauralBeatChange(value);
      }
    },
    [onBinauralBeatChange]
  );

  const getColorClass = useCallback(
    (color: BinauralRangeWithKey['color']): string => {
      const colorClasses = {
        purple: 'bg-purple-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        gray: 'bg-gray-500',
      };
      return colorClasses[color];
    },
    []
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg" aria-hidden="true">🔧</span>
        <h4 className="font-medium text-white">Advanced Controls</h4>
      </div>

      {/* Fade Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fade In */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="fade-in-slider"
              className="text-sm font-medium text-white/90"
            >
              Fade In
            </label>
            <span className="text-sm font-mono text-white/90">
              {fadeIn}s
            </span>
          </div>
          
          <Slider.Root
            id="fade-in-slider"
            className="relative flex items-center w-full h-2 select-none touch-none"
            value={[fadeIn]}
            min={0}
            max={30}
            step={1}
            onValueChange={handleFadeInChange}
            disabled={disabled}
            aria-label="Fade in duration"
            aria-valuenow={fadeIn}
            aria-valuemin={0}
            aria-valuemax={30}
            aria-valuetext={`${fadeIn} seconds fade in`}
          >
            <Slider.Track className="relative flex-grow h-2 bg-white/20 rounded-lg">
              <Slider.Range className="absolute h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg" />
            </Slider.Track>
            <Slider.Thumb
              className={`
                block w-5 h-5 bg-white rounded-full shadow-lg 
                focus:outline-none focus:ring-2 focus:ring-green-400
                hover:scale-110 active:scale-95 transition-transform
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
              `}
              aria-label="Fade in slider thumb"
            />
          </Slider.Root>
          
          <div className="flex justify-between text-xs text-white/60">
            <span>0s</span>
            <span>15s</span>
            <span>30s</span>
          </div>
        </div>

        {/* Fade Out */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label
              htmlFor="fade-out-slider"
              className="text-sm font-medium text-white/90"
            >
              Fade Out
            </label>
            <span className="text-sm font-mono text-white/90">
              {fadeOut}s
            </span>
          </div>
          
          <Slider.Root
            id="fade-out-slider"
            className="relative flex items-center w-full h-2 select-none touch-none"
            value={[fadeOut]}
            min={0}
            max={30}
            step={1}
            onValueChange={handleFadeOutChange}
            disabled={disabled}
            aria-label="Fade out duration"
            aria-valuenow={fadeOut}
            aria-valuemin={0}
            aria-valuemax={30}
            aria-valuetext={`${fadeOut} seconds fade out`}
          >
            <Slider.Track className="relative flex-grow h-2 bg-white/20 rounded-lg">
              <Slider.Range className="absolute h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg" />
            </Slider.Track>
            <Slider.Thumb
              className={`
                block w-5 h-5 bg-white rounded-full shadow-lg 
                focus:outline-none focus:ring-2 focus:ring-orange-400
                hover:scale-110 active:scale-95 transition-transform
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
              `}
              aria-label="Fade out slider thumb"
            />
          </Slider.Root>
          
          <div className="flex justify-between text-xs text-white/60">
            <span>0s</span>
            <span>15s</span>
            <span>30s</span>
          </div>
        </div>
      </div>

      {/* Custom Frequency Settings */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-white/90 flex items-center space-x-2">
          <span>🎵</span>
          <span>Custom Frequency Tuning</span>
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Frequency */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="custom-frequency-slider"
                className="text-sm font-medium text-white/90"
              >
                Base Frequency
              </label>
              <span className="text-sm font-mono text-white/90">
                {customFrequency} Hz
              </span>
            </div>
            
            <Slider.Root
              id="custom-frequency-slider"
              className="relative flex items-center w-full h-2 select-none touch-none"
              value={[customFrequency]}
              min={20}
              max={2000}
              step={1}
              onValueChange={handleCustomFrequencyChange}
              disabled={disabled}
              aria-label="Custom base frequency"
              aria-valuenow={customFrequency}
              aria-valuemin={20}
              aria-valuemax={2000}
              aria-valuetext={`${customFrequency} Hz base frequency`}
            >
              <Slider.Track className="relative flex-grow h-2 bg-white/20 rounded-lg">
                <Slider.Range className="absolute h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg" />
              </Slider.Track>
              <Slider.Thumb
                className={`
                  block w-5 h-5 bg-white rounded-full shadow-lg 
                  focus:outline-none focus:ring-2 focus:ring-indigo-400
                  hover:scale-110 active:scale-95 transition-transform
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
                `}
                aria-label="Custom frequency slider thumb"
              />
            </Slider.Root>
            
            <div className="flex justify-between text-xs text-white/60">
              <span>20 Hz</span>
              <span>500 Hz</span>
              <span>2000 Hz</span>
            </div>
          </div>

          {/* Binaural Beat */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="binaural-beat-slider"
                className="text-sm font-medium text-white/90"
              >
                Binaural Beat
              </label>
              <span className="text-sm font-mono text-white/90">
                {binauralBeat.toFixed(1)} Hz
              </span>
            </div>
            
            <Slider.Root
              id="binaural-beat-slider"
              className="relative flex items-center w-full h-2 select-none touch-none"
              value={[binauralBeat]}
              min={0.5}
              max={100}
              step={0.5}
              onValueChange={handleBinauralBeatChange}
              disabled={disabled}
              aria-label="Binaural beat frequency"
              aria-valuenow={binauralBeat}
              aria-valuemin={0.5}
              aria-valuemax={100}
              aria-valuetext={`${binauralBeat.toFixed(1)} Hz binaural beat`}
            >
              <Slider.Track className="relative flex-grow h-2 bg-white/20 rounded-lg">
                <Slider.Range className="absolute h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg" />
              </Slider.Track>
              <Slider.Thumb
                className={`
                  block w-5 h-5 bg-white rounded-full shadow-lg 
                  focus:outline-none focus:ring-2 focus:ring-pink-400
                  hover:scale-110 active:scale-95 transition-transform
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
                `}
                aria-label="Binaural beat slider thumb"
              />
            </Slider.Root>
            
            <div className="flex justify-between text-xs text-white/60">
              <span>0.5 Hz</span>
              <span>50 Hz</span>
              <span>100 Hz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Range Indicator */}
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <Tooltip.Provider>
            <Tooltip.Root>
              {/* @ts-ignore - Radix UI asChild typing issue */}
              <Tooltip.Trigger asChild>
                <div
                  className="flex items-center space-x-2 cursor-help"
                  tabIndex={0}
                  role="button"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${getColorClass(currentRange.color)}`}
                    aria-label={currentRange.name}
                  />
                  <span className="text-sm font-medium text-white/90">
                    {currentRange.name}
                  </span>
                  {currentRange.key !== 'custom' && (
                    <span className="text-xs text-white/60">
                      ({currentRange.min}-{currentRange.max} Hz range)
                    </span>
                  )}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="p-3 bg-black/90 backdrop-blur-sm border border-white/20 rounded shadow-xl text-white text-sm max-w-xs"
                  side="top"
                >
                  <div className="space-y-2">
                    <div className="font-medium">{currentRange.name}</div>
                    <div className="text-white/80">
                      {currentRange.key === 'delta' && 'Associated with deep sleep, healing, and regeneration. Best for nighttime use.'}
                      {currentRange.key === 'theta' && 'Linked to deep meditation, creativity, and REM sleep. Great for visualization.'}
                      {currentRange.key === 'alpha' && 'Promotes relaxation, focus, and learning. Ideal for stress reduction.'}
                      {currentRange.key === 'beta' && 'Enhances alertness, concentration, and problem-solving. Good for work.'}
                      {currentRange.key === 'gamma' && 'Associated with high-level cognitive processing and awareness.'}
                      {currentRange.key === 'custom' && 'Custom frequency outside standard brainwave ranges.'}
                    </div>
                  </div>
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>

          <div className="text-right">
            <div className="text-sm text-white/70">Current beat</div>
            <div className="text-lg font-mono text-white">
              {binauralBeat.toFixed(1)} Hz
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
        <div className="flex items-start space-x-2">
          <span className="text-cyan-400 text-sm mt-0.5">💡</span>
          <div className="text-xs text-cyan-200">
            <div className="font-medium mb-1">Pro Tip:</div>
            <div>
              Gradual fade-in and fade-out (5-10s) help your brain adjust to frequency changes naturally.
              Lower frequencies (delta/theta) are best for relaxation, while higher frequencies (alpha/beta) enhance focus.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AdvancedSettings.displayName = 'AdvancedSettings';

export default AdvancedSettings;
