import React, { useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';

interface DurationControlProps {
  value: number; // Duration in minutes
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const DurationControl: React.FC<DurationControlProps> = React.memo(({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const handleDurationChange = useCallback(
    (newValues: number[]) => {
      const newValue = newValues[0];
      if (typeof newValue === 'number' && newValue >= 1 && newValue <= 120) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const formatDuration = useCallback((minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }, []);

  const getDurationRecommendation = useCallback((minutes: number): string => {
    if (minutes <= 5) return 'Quick session';
    if (minutes <= 15) return 'Relaxation';
    if (minutes <= 30) return 'Meditation';
    if (minutes <= 60) return 'Deep session';
    return 'Extended practice';
  }, []);

  const getDurationIcon = useCallback((minutes: number): string => {
    if (minutes <= 10) return '⚡';
    if (minutes <= 30) return '🧘';
    if (minutes <= 60) return '🌊';
    return '🌌';
  }, []);

  // Preset duration options
  const presetDurations = [5, 10, 15, 20, 30, 45, 60, 90];

  const handlePresetClick = useCallback(
    (duration: number) => {
      onChange(duration);
    },
    [onChange]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="duration-slider"
          className="flex items-center space-x-2 text-sm font-medium text-white/90"
        >
          <span className="text-lg" aria-hidden="true">
            {getDurationIcon(value)}
          </span>
          <span>Session Duration</span>
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white/70">
            {getDurationRecommendation(value)}
          </span>
          <span className="text-sm font-mono text-white/90">
            {formatDuration(value)}
          </span>
        </div>
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presetDurations.map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() => handlePresetClick(duration)}
            className={`
              px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-cyan-400
              hover:scale-105 active:scale-95
              ${value === duration
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
              }
            `}
            disabled={disabled}
            aria-label={`Set duration to ${formatDuration(duration)}`}
            {...(value === duration && { 'aria-pressed': 'true' })}
          >
            {formatDuration(duration)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Slider.Root
          id="duration-slider"
          className="relative flex items-center w-full h-3 select-none touch-none"
          value={[value]}
          min={1}
          max={120}
          step={1}
          onValueChange={handleDurationChange}
          disabled={disabled}
          aria-label="Session duration"
          aria-valuenow={value}
          aria-valuemin={1}
          aria-valuemax={120}
          aria-valuetext={`${formatDuration(value)} session duration`}
        >
          <Slider.Track className="relative flex-grow h-3 bg-white/20 rounded-lg">
            <Slider.Range 
              className="absolute h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg transition-all duration-200" 
            />
          </Slider.Track>
          <Slider.Thumb
            className={`
              block w-6 h-6 bg-white rounded-full shadow-lg 
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent
              hover:scale-110 active:scale-95
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
            `}
            aria-label="Duration slider thumb"
          />
        </Slider.Root>

        <div className="flex justify-between text-xs text-white/60">
          <span>1 min</span>
          <span>30 min</span>
          <span>1 hour</span>
          <span>2 hours</span>
        </div>
      </div>

      {/* Duration Information */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2 rounded bg-white/5 border border-white/10">
          <div className="text-white/70 mb-1">Estimated time</div>
          <div className="text-white font-medium">{formatDuration(value)}</div>
        </div>
        <div className="p-2 rounded bg-white/5 border border-white/10">
          <div className="text-white/70 mb-1">Session type</div>
          <div className="text-white font-medium">{getDurationRecommendation(value)}</div>
        </div>
      </div>

      {/* Duration Tips */}
      {value <= 5 && (
        <div className="flex items-center space-x-2 p-2 rounded bg-blue-500/10 border border-blue-400/20">
          <span className="text-blue-400 text-sm">💡</span>
          <span className="text-xs text-blue-300">
            Short sessions are perfect for quick relaxation breaks.
          </span>
        </div>
      )}

      {value >= 90 && (
        <div className="flex items-center space-x-2 p-2 rounded bg-purple-500/10 border border-purple-400/20">
          <span className="text-purple-400 text-sm">🎯</span>
          <span className="text-xs text-purple-300">
            Long sessions are ideal for deep meditation and healing.
          </span>
        </div>
      )}
    </div>
  );
});

DurationControl.displayName = 'DurationControl';

export default DurationControl;
