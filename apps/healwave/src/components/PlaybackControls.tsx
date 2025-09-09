import React from 'react';
import { Play, Pause } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  currentFrequency: number;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayPause,
  currentFrequency
}) => {
  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <div className="flex items-center space-x-4">
        <button
          onClick={onPlayPause}
          className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-200"
          aria-label={isPlaying ? 'Pause frequency generation' : 'Start frequency generation'}
          title={isPlaying ? 'Pause frequency generation' : 'Start frequency generation'}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-300">
          {isPlaying ? 'Playing' : 'Ready to play'}
        </p>
        <p className="text-lg font-semibold text-white">
          {currentFrequency} Hz
        </p>
      </div>
    </div>
  );
};
