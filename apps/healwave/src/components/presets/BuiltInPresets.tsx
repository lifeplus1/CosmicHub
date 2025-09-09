import React from 'react';
import { FrequencyPreset } from '@cosmichub/integrations';
import PresetCard from './PresetCard';

interface BuiltInPresetsProps {
  presets: FrequencyPreset[];
  selectedPreset?: FrequencyPreset | null;
  onSelectPreset: (preset: FrequencyPreset) => void;
  loading?: boolean;
}

export const BuiltInPresets: React.FC<BuiltInPresetsProps> = ({
  presets,
  selectedPreset,
  onSelectPreset,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Built-in Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6) as unknown[]].map((_, index) => (
            <div
              key={index}
              className="h-32 bg-slate-700/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (presets.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Built-in Presets</h3>
        <div className="text-center py-8 text-slate-400">
          <p>No built-in presets available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Built-in Presets
        <span className="ml-2 text-sm text-slate-400 font-normal">
          ({presets.length} available)
        </span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onSelect={onSelectPreset}
            isSelected={selectedPreset?.id === preset.id}
            disabled={loading}
            showDeleteButton={false}
          />
        ))}
      </div>
    </div>
  );
};

export default BuiltInPresets;
