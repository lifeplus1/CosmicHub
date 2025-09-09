import React, { useCallback } from 'react';
import { Volume2, Clock } from 'lucide-react';
import VolumeSlider from './VolumeSlider';

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
  durationLabelId
}) => {
  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onDurationChange(Number(e.target.value));
  }, [onDurationChange]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    onVolumeChange(newVolume);
  }, [onVolumeChange]);

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-cyan-400" />
        Audio Controls
      </h3>

      <div className="space-y-4">
        {/* Volume Control */}
        <VolumeSlider
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />

        {/* Duration Control */}
        <div className="space-y-2">
          <label
            htmlFor={durationLabelId}
            className="text-sm font-medium text-slate-300 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Duration
          </label>
          <select
            id={durationLabelId}
            value={duration}
            onChange={handleDurationChange}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          >
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>
      </div>
    </div>
  );
};
