import React, { useState, useCallback } from 'react';
import { Waves, Plus } from 'lucide-react';

interface FrequencyControlsProps {
  currentFrequency?: number;
  onFrequencyChange?: (frequency: number) => void;
}

const FrequencyControls: React.FC<FrequencyControlsProps> = ({
  currentFrequency = 528,
  onFrequencyChange
}) => {
  const [frequency, setFrequency] = useState(currentFrequency);
  const [presetName, setPresetName] = useState('');
  const [showPresetCreator, setShowPresetCreator] = useState(false);

  const handleFrequencyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFreq = Number(e.target.value);
    setFrequency(newFreq);
    onFrequencyChange?.(newFreq);
  }, [onFrequencyChange]);

  const handlePresetNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPresetName(e.target.value);
  }, []);

  const handleCreatePreset = useCallback(() => {
    if (presetName.trim()) {
      // Handle preset creation logic here
      setPresetName('');
      setShowPresetCreator(false);
    }
  }, [presetName]);

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Waves className="w-5 h-5 text-cyan-400" />
        Frequency Controls
      </h3>

      <div className="space-y-4">
        {/* Frequency Input */}
        <div className="space-y-2">
          <label htmlFor="frequency-input" className="text-sm font-medium text-slate-300">
            Frequency (Hz)
          </label>
          <input
            id="frequency-input"
            type="number"
            value={frequency}
            onChange={handleFrequencyChange}
            min="1"
            max="20000"
            step="1"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            title="Frequency in Hz"
          />
        </div>

        {/* Preset Creator */}
        <div className="space-y-2">
          {!showPresetCreator ? (
            <button
              onClick={() => setShowPresetCreator(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Custom Preset
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Preset name..."
                value={presetName}
                onChange={handlePresetNameChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreatePreset}
                  disabled={!presetName.trim()}
                  className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 rounded-md text-white disabled:text-slate-400 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowPresetCreator(false)}
                  className="px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

FrequencyControls.displayName = 'FrequencyControls';

export default FrequencyControls;
