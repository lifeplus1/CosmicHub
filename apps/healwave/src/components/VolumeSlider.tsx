import React, { useState, useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';

interface VolumeSliderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({
  volume,
  onVolumeChange,
}) => {
  const [currentVolume, setCurrentVolume] = useState(volume);

  const handleVolumeChange = useCallback(
    (newVolume: number[]) => {
      const v = typeof newVolume[0] === 'number' ? newVolume[0] : currentVolume;
      setCurrentVolume(v);
      onVolumeChange(v);
    },
    [onVolumeChange, currentVolume]
  );

  return (
    <div className='space-y-2'>
      <label
        className='block text-sm font-medium text-white/90'
        htmlFor='volume-slider'
      >
        Volume: {Math.round(currentVolume * 100)}%
      </label>
      <Slider.Root
        id='volume-slider'
        className='relative flex items-center w-full h-5 select-none touch-none'
        value={[currentVolume]}
        onValueChange={handleVolumeChange}
        max={1}
        step={0.01}
        aria-label='Volume control'
      >
        <Slider.Track className='relative flex-grow h-1 rounded-full bg-white/20'>
          <Slider.Range className='absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400' />
        </Slider.Track>
        <Slider.Thumb
          className='block w-5 h-5 transition-all bg-white rounded-full shadow-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500'
          aria-label='Volume thumb'
        />
      </Slider.Root>
    </div>
  );
};

export default VolumeSlider;
