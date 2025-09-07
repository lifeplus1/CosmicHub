import React, { useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';

interface VolumeControlProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = React.memo(({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const handleVolumeChange = useCallback(
    (newValues: number[]) => {
      const newValue = newValues[0];
      if (typeof newValue === 'number' && newValue >= 0 && newValue <= 100) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const getVolumeIcon = useCallback(() => {
    if (value === 0) return '🔇';
    if (value < 30) return '🔈';
    if (value < 70) return '🔉';
    return '🔊';
  }, [value]);

  const getVolumeLevel = useCallback(() => {
    if (value === 0) return 'Muted';
    if (value < 25) return 'Low';
    if (value < 50) return 'Medium';
    if (value < 75) return 'High';
    return 'Max';
  }, [value]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="volume-slider"
          className="flex items-center space-x-2 text-sm font-medium text-white/90"
        >
          <span className="text-lg" aria-hidden="true">
            {getVolumeIcon()}
          </span>
          <span>Volume</span>
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white/70">
            {getVolumeLevel()}
          </span>
          <span className="text-sm font-mono text-white/90 min-w-[3ch]">
            {value}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Slider.Root
          id="volume-slider"
          className="relative flex items-center w-full h-3 select-none touch-none"
          value={[value]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          disabled={disabled}
          aria-label="Volume control"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${value}% volume, ${getVolumeLevel().toLowerCase()}`}
        >
          <Slider.Track className="relative flex-grow h-3 bg-white/20 rounded-lg">
            <Slider.Range 
              className="absolute h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg transition-all duration-200" 
            />
          </Slider.Track>
          <Slider.Thumb
            className={`
              block w-6 h-6 bg-white rounded-full shadow-lg 
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent
              hover:scale-110 active:scale-95
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
            `}
            aria-label="Volume slider thumb"
          />
        </Slider.Root>

        <div className="flex justify-between text-xs text-white/60">
          <span>0%</span>
          <span className="text-white/40">|</span>
          <span>25%</span>
          <span className="text-white/40">|</span>
          <span>50%</span>
          <span className="text-white/40">|</span>
          <span>75%</span>
          <span className="text-white/40">|</span>
          <span>100%</span>
        </div>
      </div>

      {/* Volume Level Indicator */}
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => {
          const threshold = (index + 1) * 20;
          const isActive = value >= threshold;
          
          return (
            <div
              key={index}
              className={`
                w-2 h-4 rounded-sm transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-t from-cyan-400 to-purple-400' 
                  : 'bg-white/20'
                }
              `}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {value === 0 && (
        <div className="flex items-center space-x-2 p-2 rounded bg-yellow-500/10 border border-yellow-400/20">
          <span className="text-yellow-400 text-sm">⚠️</span>
          <span className="text-xs text-yellow-300">
            Volume is muted. Increase to hear audio.
          </span>
        </div>
      )}
    </div>
  );
});

VolumeControl.displayName = 'VolumeControl';

export default VolumeControl;
