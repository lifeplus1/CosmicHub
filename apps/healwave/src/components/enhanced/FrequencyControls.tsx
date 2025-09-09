import React, { useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { FREQUENCY_CONSTANTS } from '../constants/frequencyConstants';

interface FrequencyControlsProps {
  currentFrequency: number;
  onFrequencyChange: (frequency: number) => void;
  volumeLabelId: string;
}

export const FrequencyControls: React.FC<FrequencyControlsProps> = ({
  currentFrequency,
  onFrequencyChange,
  volumeLabelId,
}) => {
  const handleFrequencyChange = useCallback((values: number[]) => {
    const freq = values[0] ?? FREQUENCY_CONSTANTS.DEFAULT_FREQUENCY;
    onFrequencyChange(freq);
  }, [onFrequencyChange]);

  const handleQuickFrequencySelect = useCallback((freq: number) => {
    onFrequencyChange(freq);
  }, [onFrequencyChange]);

  return (
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
            onValueChange={handleFrequencyChange}
            min={FREQUENCY_CONSTANTS.MIN_FREQUENCY}
            max={FREQUENCY_CONSTANTS.MAX_FREQUENCY}
            step={FREQUENCY_CONSTANTS.VOLUME_STEP}
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
          {FREQUENCY_CONSTANTS.COMMON_FREQUENCIES.map((freq) => (
            <button
              key={freq}
              onClick={() => handleQuickFrequencySelect(freq)}
              className="px-2 py-1 text-xs bg-cosmic-purple/20 text-cosmic-purple rounded hover:bg-cosmic-purple/30 transition-colors"
            >
              {freq} Hz
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
