import React from 'react';
import { ValidatedFrequencyData } from '../../schemas/frequencySchemas';

interface StatusDisplayProps {
  isPlaying: boolean;
  currentFrequency: number;
  binauralEnabled: boolean;
  binauralBeat: number;
  selectedPreset: ValidatedFrequencyData | null;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  isPlaying,
  currentFrequency,
  binauralEnabled,
  binauralBeat,
  selectedPreset,
}) => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center space-x-6 bg-cosmic-purple/10 px-8 py-4 rounded-full border border-cosmic-purple/30">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className="text-sm font-medium text-white">
            {isPlaying ? 'Playing' : 'Stopped'}
          </span>
        </div>
        <div className="text-sm text-cosmic-gold font-mono">
          {currentFrequency.toFixed(1)} Hz
        </div>
        {binauralEnabled && binauralBeat > 0 && (
          <div className="text-sm text-purple-400 font-medium">
            Binaural: ±{binauralBeat.toFixed(1)} Hz
          </div>
        )}
        {selectedPreset && (
          <div className="text-sm text-cyan-400 capitalize">
            {selectedPreset.category}
          </div>
        )}
      </div>
    </div>
  );
};
