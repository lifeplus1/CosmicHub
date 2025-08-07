import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/AuthContext';
import { savePreset, getUserPresets, deletePreset } from '../services/api';

interface Preset {
  id: string;
  name: string;
  leftFreq: number;
  rightFreq: number;
  volume: number;
  duration: number;
  description?: string;
  createdAt: string;
}

interface PresetSelectorProps {
  onSelectPreset: (preset: Preset) => void;
  currentSettings: {
    leftFreq: number;
    rightFreq: number;
    volume: number;
    duration: number;
  };
}

const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectPreset,
  currentSettings
}) => {
  const { user } = useAuth();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');

  // Built-in presets
  const builtInPresets: Preset[] = [
    {
      id: 'relaxation',
      name: 'Deep Relaxation',
      leftFreq: 40,
      rightFreq: 44,
      volume: 0.7,
      duration: 1800, // 30 minutes
      description: 'Promote deep relaxation and stress relief',
      createdAt: ''
    },
    {
      id: 'focus',
      name: 'Enhanced Focus',
      leftFreq: 40,
      rightFreq: 50,
      volume: 0.6,
      duration: 2400, // 40 minutes
      description: 'Improve concentration and mental clarity',
      createdAt: ''
    },
    {
      id: 'meditation',
      name: 'Meditation',
      leftFreq: 30,
      rightFreq: 36,
      volume: 0.5,
      duration: 1200, // 20 minutes
      description: 'Support deep meditative states',
      createdAt: ''
    },
    {
      id: 'sleep',
      name: 'Sleep Induction',
      leftFreq: 20,
      rightFreq: 24,
      volume: 0.4,
      duration: 3600, // 60 minutes
      description: 'Promote restful sleep',
      createdAt: ''
    },
    {
      id: 'creativity',
      name: 'Creative Flow',
      leftFreq: 60,
      rightFreq: 68,
      volume: 0.6,
      duration: 1800, // 30 minutes
      description: 'Enhance creative thinking',
      createdAt: ''
    }
  ];

  useEffect(() => {
    if (user) {
      loadUserPresets();
    }
  }, [user]);

  const loadUserPresets = async () => {
    try {
      setLoading(true);
      const userPresets = await getUserPresets();
      setPresets(userPresets);
    } catch (error) {
      console.error('Failed to load presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!user || !newPresetName.trim()) return;

    try {
      setLoading(true);
      const preset = {
        name: newPresetName.trim(),
        leftFreq: currentSettings.leftFreq,
        rightFreq: currentSettings.rightFreq,
        volume: currentSettings.volume,
        duration: currentSettings.duration,
        description: newPresetDescription.trim() || undefined
      };

      const savedPreset = await savePreset(preset);
      setPresets(prev => [...prev, savedPreset]);
      setNewPresetName('');
      setNewPresetDescription('');
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      setLoading(true);
      await deletePreset(presetId);
      setPresets(prev => prev.filter(p => p.id !== presetId));
    } catch (error) {
      console.error('Failed to delete preset:', error);
      alert('Failed to delete preset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="preset-selector">
      <div className="preset-header">
        <h3 className="mb-4 text-lg font-semibold">Frequency Presets</h3>
        {user && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            Save Current Settings
          </button>
        )}
      </div>

      {/* Built-in Presets */}
      <div className="mb-6 preset-section">
        <h4 className="mb-3 font-medium text-gray-700 text-md">Built-in Presets</h4>
        <div className="grid gap-3">
          {builtInPresets.map((preset) => (
            <div
              key={preset.id}
              className="p-4 transition-colors border rounded-lg cursor-pointer preset-card bg-gray-50 hover:bg-gray-100"
              onClick={() => onSelectPreset(preset)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{preset.name}</h5>
                  <p className="mt-1 text-sm text-gray-600">{preset.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Left: {preset.leftFreq}Hz | Right: {preset.rightFreq}Hz | 
                    Duration: {formatDuration(preset.duration)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Presets */}
      {user && (
        <div className="preset-section">
          <h4 className="mb-3 font-medium text-gray-700 text-md">Your Presets</h4>
          {loading && presets.length === 0 ? (
            <div className="py-4 text-center text-gray-500">Loading presets...</div>
          ) : presets.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              No saved presets yet. Save your current settings to create your first preset.
            </div>
          ) : (
            <div className="grid gap-3">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 transition-colors bg-white border rounded-lg preset-card hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onSelectPreset(preset)}
                    >
                      <h5 className="font-medium text-gray-900">{preset.name}</h5>
                      {preset.description && (
                        <p className="mt-1 text-sm text-gray-600">{preset.description}</p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Left: {preset.leftFreq}Hz | Right: {preset.rightFreq}Hz | 
                        Duration: {formatDuration(preset.duration)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                      className="p-1 ml-2 text-red-500 transition-colors hover:text-red-700"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!user && (
        <div className="py-4 text-center text-gray-500">
          <p>Sign in to save and manage your custom presets</p>
        </div>
      )}

      {/* Save Preset Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg w-96 max-w-90vw">
            <h3 className="mb-4 text-lg font-semibold">Save Preset</h3>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Preset Name
              </label>
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter preset name..."
                maxLength={50}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <textarea
                value={newPresetDescription}
                onChange={(e) => setNewPresetDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this preset is for..."
                rows={3}
                maxLength={200}
              />
            </div>

            <div className="p-3 mb-4 rounded-lg bg-gray-50">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Current Settings:</h4>
              <div className="text-sm text-gray-600">
                <div>Left Frequency: {currentSettings.leftFreq}Hz</div>
                <div>Right Frequency: {currentSettings.rightFreq}Hz</div>
                <div>Volume: {Math.round(currentSettings.volume * 100)}%</div>
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
                className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || !newPresetName.trim()}
              >
                {loading ? 'Saving...' : 'Save Preset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresetSelector;