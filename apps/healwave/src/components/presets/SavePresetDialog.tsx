import React, { useState, useCallback } from 'react';
import { FrequencyPreset, AudioSettings } from '@cosmichub/integrations';

interface SavePresetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description?: string) => Promise<void>;
  currentSettings: AudioSettings;
  currentPreset?: FrequencyPreset | null;
}

export const SavePresetDialog: React.FC<SavePresetDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings,
  currentPreset,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSaving(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || saving) return;

    try {
      setSaving(true);
      await onSave(name.trim(), description.trim() || undefined);
      onClose();
    } catch {
      // Error handling is managed by parent component
      // Silently fail - parent should show error UI
    } finally {
      setSaving(false);
    }
  }, [name, description, onSave, onClose, saving]);

  const handleClose = useCallback(() => {
    if (!saving) {
      onClose();
    }
  }, [saving, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !saving) {
      onClose();
    }
  }, [saving, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-preset-title"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 id="save-preset-title" className="text-xl font-semibold text-white">
            Save Preset
          </h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
          {/* Current Settings Summary */}
          <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Current Settings:</h3>
            {currentPreset && (
              <div className="text-sm text-slate-400">
                <span className="font-medium">Base Frequency:</span> {currentPreset.baseFrequency}Hz
                {currentPreset.binauralBeat && (
                  <span className="ml-4">
                    <span className="font-medium">Binaural Beat:</span> {currentPreset.binauralBeat}Hz
                  </span>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
              <div>
                <span className="font-medium">Volume:</span> {Math.round(currentSettings.volume * 100)}%
              </div>
              <div>
                <span className="font-medium">Duration:</span> {Math.floor(currentSettings.duration / 60)}m
              </div>
              <div>
                <span className="font-medium">Fade In:</span> {currentSettings.fadeIn}s
              </div>
              <div>
                <span className="font-medium">Fade Out:</span> {currentSettings.fadeOut}s
              </div>
            </div>
          </div>

          {/* Preset Name */}
          <div>
            <label htmlFor="preset-name" className="block text-sm font-medium text-slate-300 mb-2">
              Preset Name *
            </label>
            <input
              id="preset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your preset"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              disabled={saving}
              maxLength={50}
              autoFocus
              required
            />
          </div>

          {/* Preset Description */}
          <div>
            <label htmlFor="preset-description" className="block text-sm font-medium text-slate-300 mb-2">
              Description (optional)
            </label>
            <textarea
              id="preset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose or benefits of this preset"
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
              disabled={saving}
              maxLength={200}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 px-4 py-2 text-slate-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 flex items-center justify-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Preset'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavePresetDialog;
