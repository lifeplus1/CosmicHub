import React, { useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { FREQUENCY_CONSTANTS } from '../constants/frequencyConstants';

interface AudioControlsProps {
  volume: number;
  duration: number;
  onVolumeChange: (volume: number) => void;
  onDurationChange: (duration: number) => void;
  durationLabelId: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  volume,
  duration,
  onVolumeChange,
  onDurationChange,
  durationLabelId,
}) => {
  const handleVolumeChange = useCallback(async (values: number[]) => {
    const newVolume = values[0];
    if (newVolume !== undefined) {
      onVolumeChange(newVolume);
    }
  }, [onVolumeChange]);

  const handleDurationChange = useCallback((values: number[]) => {
    const newDuration = values[0];
    if (newDuration !== undefined) {
      onDurationChange(newDuration);
    }
  }, [onDurationChange]);

  return (
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
            min={FREQUENCY_CONSTANTS.MIN_VOLUME}
            max={FREQUENCY_CONSTANTS.MAX_VOLUME}
            step={FREQUENCY_CONSTANTS.VOLUME_STEP}
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
            min={FREQUENCY_CONSTANTS.MIN_DURATION}
            max={FREQUENCY_CONSTANTS.MAX_DURATION}
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
  );
};
