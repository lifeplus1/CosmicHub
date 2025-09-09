import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ValidatedFrequencyData } from '../../schemas/frequencySchemas';

interface PlaybackControlsProps {
  isPlaying: boolean;
  selectedPreset: ValidatedFrequencyData | null;
  onPlay: () => void;
  onStop: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  selectedPreset,
  onPlay,
  onStop,
}) => {
  return (
    <div className="flex justify-center space-x-4 py-6">
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={isPlaying ? onStop : onPlay}
              disabled={!selectedPreset}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-3 ${
                isPlaying
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed'
              }`}
            >
              <span className="text-2xl">{isPlaying ? '⏹️' : '▶️'}</span>
              <span>{isPlaying ? 'Stop Session' : 'Start Healing Session'}</span>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content className="px-3 py-2 text-sm text-white bg-black rounded-lg">
            {selectedPreset ? `${isPlaying ? 'Stop' : 'Start'} ${selectedPreset.label} session` : 'Select a frequency preset first'}
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
};
