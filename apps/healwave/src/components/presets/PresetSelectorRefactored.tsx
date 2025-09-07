import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@cosmichub/auth';
import { FrequencyPreset, AudioSettings } from '@cosmichub/integrations';
import { savePreset, getUserPresets, deletePreset } from '../../services/api';
import ErrorBoundary from '../ErrorBoundary';

// Import the new modular components
import BuiltInPresets from './BuiltInPresets';
import UserPresets from './UserPresets';
import SavePresetDialog from './SavePresetDialog';

interface PresetSelectorProps {
  onSelectPreset: (preset: FrequencyPreset) => void;
  currentSettings: AudioSettings;
  currentPreset?: FrequencyPreset | null;
}

const PresetSelector: React.FC<PresetSelectorProps> = React.memo(
  ({ onSelectPreset, currentSettings, currentPreset }) => {
    const { user } = useAuth();
    const [presets, setPresets] = useState<FrequencyPreset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    // Built-in presets - memoized to prevent recreation on every render
    const builtInPresets: FrequencyPreset[] = useMemo(
      () => [
        {
          id: 'relaxation',
          name: 'Deep Relaxation',
          category: 'brainwave',
          baseFrequency: 40,
          binauralBeat: 4,
          description: 'Promote deep relaxation and stress relief',
        },
        {
          id: 'focus',
          name: 'Enhanced Focus',
          category: 'brainwave',
          baseFrequency: 40,
          binauralBeat: 10,
          description: 'Improve concentration and mental clarity',
        },
        {
          id: 'meditation',
          name: 'Meditation',
          category: 'brainwave',
          baseFrequency: 30,
          binauralBeat: 6,
          description: 'Support deep meditative states',
        },
        {
          id: 'sleep',
          name: 'Sleep Induction',
          category: 'brainwave',
          baseFrequency: 20,
          binauralBeat: 4,
          description: 'Promote restful sleep',
        },
        {
          id: 'creativity',
          name: 'Creative Flow',
          category: 'brainwave',
          baseFrequency: 60,
          binauralBeat: 8,
          description: 'Enhance creative thinking',
        },
      ],
      []
    );

    const loadUserPresets = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const userPresets = await getUserPresets();
        if (userPresets.success) {
          // Constrain to expected shape; fallback to empty array if invalid
          const data = Array.isArray(userPresets.data)
            ? (userPresets.data)
            : [];
          setPresets(data);
        } else {
          setError(userPresets.error);
          setPresets([]);
        }
      } catch (err) {
        // Handle error with better UX
        setError('Failed to load presets. Please try again.');
        setPresets([]);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      if (user) {
        void loadUserPresets();
      } else {
        setPresets([]);
        setError(null);
      }
    }, [user, loadUserPresets]);

    const handleSavePreset = useCallback(async (name: string, description?: string) => {
      if (!user || !currentPreset) {
        throw new Error('User must be logged in and have a current preset to save');
      }

      interface NewPreset {
        id: string;
        name: string;
        category: FrequencyPreset['category'];
        baseFrequency: number;
        binauralBeat?: number;
        description?: string;
        benefits?: readonly string[];
        metadata: {
          volume: number;
          duration: number;
          fadeIn: number;
          fadeOut: number;
        };
      }

      const preset: NewPreset = {
        id: `user-${Date.now()}`,
        name: name,
        category: 'custom' as const,
        baseFrequency: currentPreset.baseFrequency,
        binauralBeat: currentPreset.binauralBeat,
        description: description,
        metadata: {
          volume: currentSettings.volume,
          duration: currentSettings.duration,
          fadeIn: currentSettings.fadeIn,
          fadeOut: currentSettings.fadeOut,
        },
      };

      const result = await savePreset(preset);
      if (result.success) {
        // Reload user presets to show the new one
        await loadUserPresets();
        setShowSaveDialog(false);
      } else {
        throw new Error(result.error || 'Failed to save preset');
      }
    }, [user, currentPreset, currentSettings, loadUserPresets]);

    const handleDeletePreset = useCallback(async (presetId: string) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const result = await deletePreset(presetId);
        if (result.success) {
          // Remove the preset from local state immediately for better UX
          setPresets(prevPresets => prevPresets.filter(p => p.id !== presetId));
        } else {
          setError(result.error || 'Failed to delete preset');
        }
      } catch (err) {
        setError('Failed to delete preset. Please try again.');
      } finally {
        setLoading(false);
      }
    }, [user]);

    const canSavePreset = user && currentPreset;

    return (
      <ErrorBoundary>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Frequency Presets</h2>
            {canSavePreset && (
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Save Current</span>
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-300">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-300"
                  aria-label="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Built-in Presets */}
          <BuiltInPresets
            presets={builtInPresets}
            selectedPreset={currentPreset}
            onSelectPreset={onSelectPreset}
            loading={loading}
          />

          {/* User Presets */}
          <UserPresets
            presets={presets}
            selectedPreset={currentPreset}
            onSelectPreset={onSelectPreset}
            onDeletePreset={handleDeletePreset}
            loading={loading}
            error={error}
            user={user}
          />

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-slate-400">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading presets...</span>
              </div>
            </div>
          )}

          {/* Save Preset Dialog */}
          <SavePresetDialog
            isOpen={showSaveDialog}
            onClose={() => setShowSaveDialog(false)}
            onSave={handleSavePreset}
            currentSettings={currentSettings}
            currentPreset={currentPreset}
          />
        </div>
      </ErrorBoundary>
    );
  }
);

PresetSelector.displayName = 'PresetSelector';

export default PresetSelector;
