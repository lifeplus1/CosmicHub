import React from 'react';
import { FrequencyPreset } from '@cosmichub/integrations';

interface PresetCardProps {
  preset: FrequencyPreset;
  onSelect: (preset: FrequencyPreset) => void;
  onDelete?: (presetId: string) => void;
  isSelected?: boolean;
  showDeleteButton?: boolean;
  disabled?: boolean;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  onSelect,
  onDelete,
  isSelected = false,
  showDeleteButton = false,
  disabled = false,
}) => {
  // Check if this is a user-created preset (custom category or custom metadata)
  const isUserPreset = (preset.category as string) === 'custom';

  const handleCardClick = () => {
    if (!disabled) {
      onSelect(preset);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onSelect(preset);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && !disabled) {
      onDelete(preset.id);
    }
  };

  const getPresetTypeIcon = () => {
    if (isUserPreset) return '👤';
    
    switch (preset.category as string) {
      case 'brainwave': return '🧠';
      case 'solfeggio': return '🎵';
      case 'rife': return '⚡';
      case 'planetary': return '🪐';
      case 'chakra': return '🕉️';
      case 'custom': return '⚙️';
      default: return '🎵';
    }
  };

  const getBinauralRangeInfo = () => {
    const beat = preset.binauralBeat ?? 0;
    if (beat >= 0.5 && beat <= 4) return { name: 'Delta', color: 'purple', description: 'Deep Sleep' };
    if (beat > 4 && beat <= 8) return { name: 'Theta', color: 'blue', description: 'Meditation' };
    if (beat > 8 && beat <= 14) return { name: 'Alpha', color: 'green', description: 'Relaxation' };
    if (beat > 14 && beat <= 30) return { name: 'Beta', color: 'yellow', description: 'Focus' };
    if (beat > 30) return { name: 'Gamma', color: 'red', description: 'High Focus' };
    return null;
  };

  const binauralInfo = preset.binauralBeat ? getBinauralRangeInfo() : null;

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className={`
        relative p-4 rounded-lg border cursor-pointer transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-1
        ${isSelected 
          ? 'bg-cyan-900/50 border-cyan-400 shadow-lg shadow-cyan-500/20' 
          : 'bg-slate-800/50 border-slate-600 hover:border-slate-500 hover:bg-slate-800/70'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${preset.name} preset`}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
      )}

      {/* Preset Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <span className="text-lg" aria-hidden="true">
            {getPresetTypeIcon()}
          </span>
          <div className="flex-1 min-w-0">
            <h5 className="font-semibold text-white truncate">
              {preset.name}
            </h5>
            {isUserPreset && (
              <span className="text-xs text-cyan-400 font-medium">
                Custom Preset
              </span>
            )}
          </div>
        </div>

        {showDeleteButton && onDelete && (
          <button
            onClick={handleDelete}
            className="p-1 ml-2 text-red-400 hover:text-red-300 transition-colors 
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
            aria-label={`Delete ${preset.name} preset`}
            tabIndex={disabled ? -1 : 0}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Frequency Information */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Base Frequency:</span>
          <span className="text-white font-mono">
            {preset.baseFrequency}Hz
          </span>
        </div>

        {/* Binaural Beat Information */}
        {binauralInfo && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Binaural Beat:</span>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs font-medium bg-${binauralInfo.color}-900/50 text-${binauralInfo.color}-300`}>
                {binauralInfo.name}
              </span>
              <span className="text-white font-mono">{preset.binauralBeat}Hz</span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {preset.description && (
        <p className="text-sm text-slate-300 mb-3 line-clamp-2">
          {preset.description}
        </p>
      )}

      {/* Benefits */}
      {preset.benefits && preset.benefits.length > 0 && (
        <div className="mb-3">
          <h6 className="text-xs font-medium text-slate-400 mb-1">Benefits:</h6>
          <div className="flex flex-wrap gap-1">
            {preset.benefits.slice(0, 3).map((benefit: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded"
              >
                {benefit}
              </span>
            ))}
            {preset.benefits.length > 3 && (
              <span className="px-2 py-1 text-xs bg-slate-700/50 text-slate-400 rounded">
                +{preset.benefits.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Additional Metadata for User Presets */}
      {isUserPreset && preset.metadata && (
        <div className="pt-3 border-t border-white/10">
          <div className="text-xs text-white/60">
            <div className="mb-1">Custom Settings:</div>
            {Object.entries(preset.metadata).slice(0, 4).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetCard;
