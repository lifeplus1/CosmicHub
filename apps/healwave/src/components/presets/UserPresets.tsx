import React from 'react';
import { FrequencyPreset } from '@cosmichub/integrations';
import { User } from '@cosmichub/auth';
import PresetCard from './PresetCard';

interface UserPresetsProps {
  presets: FrequencyPreset[];
  selectedPreset?: FrequencyPreset | null;
  onSelectPreset: (preset: FrequencyPreset) => void;
  onDeletePreset: (presetId: string) => void;
  loading?: boolean;
  error?: string | null;
  user?: User | null;
}

export const UserPresets: React.FC<UserPresetsProps> = ({
  presets,
  selectedPreset,
  onSelectPreset,
  onDeletePreset,
  loading = false,
  error = null,
  user,
}) => {
  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Your Presets</h3>
        <div className="text-center py-8 text-slate-400 bg-slate-800/30 rounded-lg border border-slate-600">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">Sign in to save custom presets</p>
          <p className="text-sm">Create and save your own frequency presets for quick access.</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Your Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3) as unknown[]].map((_, index) => (
            <div
              key={index}
              className="h-32 bg-slate-700/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Your Presets</h3>
        <div className="text-center py-8 text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="font-medium mb-2">Failed to load your presets</p>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state for logged-in users with no presets
  if (presets.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Your Presets</h3>
        <div className="text-center py-8 text-slate-400 bg-slate-800/30 rounded-lg border border-slate-600">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">No custom presets yet</p>
          <p className="text-sm">Save your current settings as a preset to get started.</p>
        </div>
      </div>
    );
  }

  // Show user presets
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Your Presets
        <span className="ml-2 text-sm text-cyan-400 font-normal">
          ({presets.length} saved)
        </span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            onSelect={onSelectPreset}
            onDelete={onDeletePreset}
            isSelected={selectedPreset?.id === preset.id}
            disabled={loading}
            showDeleteButton={true}
          />
        ))}
      </div>
    </div>
  );
};

export default UserPresets;
