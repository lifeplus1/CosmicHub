import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@cosmichub/auth';
import { FrequencyPreset, AudioSettings } from '@cosmichub/frequency';
import { savePreset, getUserPresets, deletePreset } from '../services/api';

interface PresetSelectorProps {
  onSelectPreset: (preset: FrequencyPreset) => void;
  currentSettings: AudioSettings;
  currentPreset?: FrequencyPreset | null;
}

const PresetSelector: React.FC<PresetSelectorProps> = React.memo(({
  onSelectPreset,
  currentSettings,
  currentPreset
}) => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<FrequencyPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Built-in presets - memoized to prevent recreation on every render
  const builtInPresets: FrequencyPreset[] = useMemo(() => [
    {
      id: 'relaxation',
      name: 'Deep Relaxation',
      category: 'brainwave',
      baseFrequency: 40,
      binauralBeat: 4,
      description: 'Promote deep relaxation and stress relief'
    },
    {
      id: 'focus',
      name: 'Enhanced Focus',
      category: 'brainwave',
      baseFrequency: 40,
      binauralBeat: 10,
      description: 'Improve concentration and mental clarity'
    },
    {
      id: 'meditation',
      name: 'Meditation',
      category: 'brainwave',
      baseFrequency: 30,
      binauralBeat: 6,
      description: 'Support deep meditative states'
    },
    {
      id: 'sleep',
      name: 'Sleep Induction',
      category: 'brainwave',
      baseFrequency: 20,
      binauralBeat: 4,
      description: 'Promote restful sleep'
    },
    {
      id: 'creativity',
      name: 'Creative Flow',
      category: 'brainwave',
      baseFrequency: 60,
      binauralBeat: 8,
      description: 'Enhance creative thinking'
    }
  ], []);

  useEffect(() => {
    if (user) {
      loadUserPresets();
    }
  }, [user]);

  const loadUserPresets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userPresets = await getUserPresets();
      setPresets(userPresets);
    } catch (err) {
      // Handle error with better UX
      setError('Failed to load presets. Please try again.');
      setPresets([]);
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error loading user presets:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSavePreset = useCallback(async () => {
    if (!user || !newPresetName.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const preset: any = {
        id: `user-${Date.now()}`,
        name: newPresetName.trim(),
        category: 'custom',
        baseFrequency: currentPreset?.baseFrequency || 40,
        binauralBeat: currentPreset?.binauralBeat || 0,
        description: newPresetDescription.trim() || undefined,
        metadata: {
          volume: currentSettings.volume,
          duration: currentSettings.duration,
          fadeIn: currentSettings.fadeIn,
          fadeOut: currentSettings.fadeOut
        }
      };

      const savedPreset = await savePreset(preset);
      setPresets(prev => [...prev, savedPreset]);
      setNewPresetName('');
      setNewPresetDescription('');
      setShowSaveDialog(false);
    } catch (err) {
      setError('Failed to save preset. Please try again.');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error saving preset:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user, newPresetName, newPresetDescription, currentPreset, currentSettings]);

  const handleDeletePreset = useCallback(async (presetId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      setLoading(true);
      setError(null);
      await deletePreset(presetId);
      setPresets(prev => prev.filter(p => p.id !== presetId));
    } catch (err) {
      setError('Failed to delete preset. Please try again.');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error deleting preset:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  }, []);

  return (
    <div className="preset-selector" role="region" aria-label="Frequency Presets">
      {/* Error Alert */}
      {error && (
        <div 
          role="alert" 
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg"
          aria-live="polite"
        >
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <div className="preset-header flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Frequency Presets</h3>
        {user && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            aria-describedby="save-preset-help"
          >
            Save Current Settings
          </button>
        )}
      </div>
      <div id="save-preset-help" className="sr-only">
        Save your current frequency and audio settings as a custom preset
      </div>

      {/* Built-in Presets */}
      <section className="mb-6 preset-section" aria-labelledby="builtin-presets-heading">
        <h4 id="builtin-presets-heading" className="mb-3 font-medium text-gray-700 text-md">Built-in Presets</h4>
        <div className="grid gap-3" role="list">
          {builtInPresets.map((preset) => (
            <div
              key={preset.id}
              role="listitem"
              className="p-4 transition-colors border rounded-lg cursor-pointer preset-card bg-gray-50 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1"
              onClick={() => onSelectPreset(preset)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPreset(preset);
                }
              }}
              tabIndex={0}
              aria-label={`Select ${preset.name} preset: ${preset.description}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{preset.name}</h5>
                  <p className="mt-1 text-sm text-gray-600">{preset.description}</p>
                  <div className="mt-2 text-xs text-gray-500" aria-label={`Base frequency ${preset.baseFrequency} hertz, binaural beat ${preset.binauralBeat} hertz`}>
                    Base: {preset.baseFrequency}Hz | Beat: {preset.binauralBeat}Hz
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* User Presets */}
      {user && (
        <section className="preset-section" aria-labelledby="user-presets-heading">
          <h4 id="user-presets-heading" className="mb-3 font-medium text-gray-700 text-md">Your Presets</h4>
          {loading && presets.length === 0 ? (
            <div className="py-4 text-center text-gray-500" role="status" aria-live="polite">
              <span className="sr-only">Loading presets...</span>
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading presets...
              </div>
            </div>
          ) : presets.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              No saved presets yet. Save your current settings to create your first preset.
            </div>
          ) : (
            <div className="grid gap-3" role="list">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  role="listitem"
                  className="p-4 transition-colors bg-white border rounded-lg preset-card hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onSelectPreset(preset)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectPreset(preset);
                        }
                      }}
                      tabIndex={0}
                      aria-label={`Select ${preset.name} preset${preset.description ? `: ${preset.description}` : ''}`}
                    >
                      <h5 className="font-medium text-gray-900">{preset.name}</h5>
                      {preset.description && (
                        <p className="mt-1 text-sm text-gray-600">{preset.description}</p>
                      )}
                      <div className="mt-2 text-xs text-gray-500" aria-label={`Base frequency ${preset.baseFrequency} hertz, binaural beat ${preset.binauralBeat} hertz`}>
                        Base: {preset.baseFrequency}Hz | Beat: {preset.binauralBeat}Hz
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                      className="p-1 ml-2 text-red-500 transition-colors hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50"
                      disabled={loading}
                      aria-label={`Delete ${preset.name} preset`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!user && (
        <div className="py-4 text-center text-gray-500" role="status">
          <p>Sign in to save and manage your custom presets</p>
        </div>
      )}

      {/* Save Preset Dialog */}
      {showSaveDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-preset-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSaveDialog(false);
              setNewPresetName('');
              setNewPresetDescription('');
            }
          }}
        >
          <div className="p-6 bg-white rounded-lg w-96 max-w-90vw" onClick={(e) => e.stopPropagation()}>
            <h3 id="save-preset-title" className="mb-4 text-lg font-semibold">Save Preset</h3>
            
            <div className="mb-4">
              <label htmlFor="preset-name" className="block mb-2 text-sm font-medium text-gray-700">
                Preset Name *
              </label>
              <input
                id="preset-name"
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter preset name..."
                maxLength={50}
                required
                aria-describedby="preset-name-help"
                aria-label="Preset Name"
                autoFocus
              />
              <div id="preset-name-help" className="mt-1 text-xs text-gray-500">
                Required. Maximum 50 characters.
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="preset-description" className="block mb-2 text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <textarea
                id="preset-description"
                value={newPresetDescription}
                onChange={(e) => setNewPresetDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this preset is for..."
                rows={3}
                maxLength={200}
                aria-describedby="preset-description-help"
                aria-label="Description"
              />
              <div id="preset-description-help" className="mt-1 text-xs text-gray-500">
                Optional. Maximum 200 characters.
              </div>
            </div>

            <div className="p-3 mb-4 rounded-lg bg-gray-50" role="region" aria-labelledby="current-settings-title">
              <h4 id="current-settings-title" className="mb-2 text-sm font-medium text-gray-700">Current Settings:</h4>
              <div className="text-sm text-gray-600">
                {currentPreset ? (
                  <>
                    <div>Preset: {currentPreset.name}</div>
                    <div>Base Frequency: {currentPreset.baseFrequency}Hz</div>
                    {currentPreset.binauralBeat && (
                      <div>Binaural Beat: {currentPreset.binauralBeat}Hz</div>
                    )}
                  </>
                ) : (
                  <div>No preset selected</div>
                )}
                <div>Volume: {Math.round(currentSettings.volume)}%</div>
                <div>Duration: {formatDuration(currentSettings.duration)}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewPresetName('');
                  setNewPresetDescription('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={loading || !newPresetName.trim()}
                aria-describedby="save-button-help"
              >
                {loading ? 'Saving...' : 'Save Preset'}
              </button>
              <div id="save-button-help" className="sr-only">
                {!newPresetName.trim() ? 'Enter a preset name to enable saving' : 'Save your current settings as a new preset'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PresetSelector.displayName = 'PresetSelector';

export default PresetSelector;