import React, { useCallback } from 'react';
import { Brain, Zap } from 'lucide-react';

interface BinauralControlsProps {
  binauralEnabled: boolean;
  onBinauralEnabledChange: (enabled: boolean) => void;
  binauralBeat: number;
  onBinauralBeatChange: (beat: number) => void;
}

export const BinauralControls: React.FC<BinauralControlsProps> = ({
  binauralEnabled,
  onBinauralEnabledChange,
  binauralBeat,
  onBinauralBeatChange
}) => {
  const handleBeatChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onBinauralBeatChange(Number(e.target.value));
  }, [onBinauralBeatChange]);

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-400" />
        Binaural Beats
      </h3>

      <div className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">
            Enable Binaural Beats
          </label>
          <button
            onClick={() => onBinauralEnabledChange(!binauralEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${
              binauralEnabled ? 'bg-purple-600' : 'bg-slate-600'
            }`}
            aria-label={binauralEnabled ? 'Disable binaural beats' : 'Enable binaural beats'}
            title={binauralEnabled ? 'Disable binaural beats' : 'Enable binaural beats'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                binauralEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Beat Selection */}
        {binauralEnabled && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Beat Frequency
            </label>
            <select
              value={binauralBeat}
              onChange={handleBeatChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              title="Select binaural beat frequency"
            >
              <option value={0.5}>0.5 Hz (Theta)</option>
              <option value={1}>1 Hz (Alpha)</option>
              <option value={2}>2 Hz (Beta)</option>
              <option value={4}>4 Hz (Gamma)</option>
              <option value={6}>6 Hz (SMR)</option>
              <option value={10}>10 Hz (High Beta)</option>
            </select>
            <p className="text-xs text-slate-400">
              Current: {binauralBeat} Hz binaural beat
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
