import React, { useState, useCallback, useMemo } from 'react';
import { devConsole } from '../config/devConsole';
import { useAuth } from '@cosmichub/auth';
import { savePreset } from '../services/api';
import AudioPlayer from './AudioPlayer.lazy';
import DurationTimer from './DurationTimer';
import FeatureGuard from './FeatureGuard';
import { useHealwaveFeatures, useUsageLimits } from '../hooks/useHealwaveFeatures';

// Enhanced preset data with tier restrictions
const ENHANCED_PRESETS = {
  solfeggio: {
    name: 'Solfeggio Frequencies',
    tier: 'free', // Available to all users
    frequencies: [
      { value: "174", label: "174 Hz (Pain Relief & Security)" },
      { value: "285", label: "285 Hz (Tissue Healing)" },
      { value: "396", label: "396 Hz (Liberation from Fear)" },
      { value: "417", label: "417 Hz (Facilitating Change)" },
      { value: "528", label: "528 Hz (Love & DNA Repair)" },
      { value: "639", label: "639 Hz (Heart Connections)" },
      { value: "741", label: "741 Hz (Intuitive Awakening)" },
      { value: "852", label: "852 Hz (Spiritual Order)" },
      { value: "963", label: "963 Hz (Divine Connection)" },
    ]
  },
  rife: {
    name: 'Rife Healing Frequencies',
    tier: 'premium', // Premium feature
    frequencies: [
      { value: "20", label: "20 Hz (General Vitality)" },
      { value: "72", label: "72 Hz (Immune System)" },
      { value: "95", label: "95 Hz (Immune Support)" },
      { value: "125", label: "125 Hz (Cellular Regeneration)" },
      { value: "465", label: "465 Hz (Immune Enhancement)" },
      { value: "660", label: "660 Hz (Anti-Inflammatory)" },
      { value: "727", label: "727 Hz (General Healing)" },
      { value: "880", label: "880 Hz (Streptococcus)" },
      { value: "1550", label: "1550 Hz (Eye Health)" },
      { value: "2008", label: "2008 Hz (Digestive Support)" },
    ]
  },
  clinical: {
    name: 'Clinical Protocols',
    tier: 'clinical', // Clinical feature
    frequencies: [
      { value: "40", label: "40 Hz (Alzheimer's Research Protocol)" },
      { value: "100", label: "100 Hz (Bone Healing Protocol)" },
      { value: "292", label: "292 Hz (Cancer Research Frequency)" },
      { value: "304", label: "304 Hz (Arthritis Protocol)" },
      { value: "666", label: "666 Hz (Fibromyalgia Protocol)" },
      { value: "1862", label: "1862 Hz (Joint Pain Protocol)" },
    ]
  }
};

interface FrequencyControlsProps {
  onFrequencyChange?: (frequency: number) => void;
  onVolumeChange?: (volume: number) => void;
  onDurationChange?: (duration: number) => void;
}

const FrequencyControls: React.FC<FrequencyControlsProps> = ({
  onFrequencyChange,
  onVolumeChange,
  onDurationChange
}) => {
  const { user } = useAuth();
  const features = useHealwaveFeatures();
  const limits = useUsageLimits();
  
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customFrequency, setCustomFrequency] = useState('');
  const [volume, setVolume] = useState(50);
  const [duration, setDuration] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  // Filter presets based on user's tier
  const availablePresets = useMemo(() => {
    return Object.entries(ENHANCED_PRESETS).filter(([_, preset]) => {
      if (preset.tier === 'free') return true;
      if (preset.tier === 'premium') return features.advancedFrequencies.isAllowed;
      if (preset.tier === 'clinical') return features.patientManagement.isAllowed;
      return false;
    });
  }, [features]);

  // Check if duration exceeds limits
  const isDurationRestricted = useMemo(() => {
    if (limits.sessionDurationMinutes === -1) return false;
    return duration > limits.sessionDurationMinutes;
  }, [duration, limits.sessionDurationMinutes]);

  // Handle preset selection
  const handlePresetChange = useCallback((presetType: string, frequency: string) => {
    setSelectedPreset(frequency);
    setCustomFrequency('');
    onFrequencyChange?.(parseFloat(frequency));
  }, [onFrequencyChange]);

  // Handle custom frequency with restrictions
  const handleCustomFrequencyChange = useCallback((freq: string) => {
    if (!features.customFrequencies.isAllowed) {
      return; // Block if not allowed
    }
    setCustomFrequency(freq);
    setSelectedPreset('');
    onFrequencyChange?.(parseFloat(freq));
  }, [features.customFrequencies.isAllowed, onFrequencyChange]);

  // Handle volume change
  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    onVolumeChange?.(vol / 100);
  }, [onVolumeChange]);

  // Handle duration change with limits
  const handleDurationChange = useCallback((dur: number) => {
    setDuration(dur);
    onDurationChange?.(dur);
  }, [onDurationChange]);

  // Save preset functionality
  const handleSavePreset = useCallback(async () => {
    if (!features.customPresets.isAllowed || !user || !presetName.trim()) {
      return;
    }

    try {
      await savePreset({
        id: `custom-${Date.now()}`,
        name: presetName,
        category: 'custom' as const,
        baseFrequency: parseFloat(selectedPreset || customFrequency),
        description: `Custom preset created by ${user.email}`,
        metadata: {
          volume,
          duration,
          userId: user.uid,
          createdAt: new Date().toISOString()
        }
      });
      setShowSavePreset(false);
      setPresetName('');
      devConsole.info('Preset saved successfully');
    } catch (error) {
      devConsole.error('Error saving preset:', error);
    }
  }, [features.customPresets.isAllowed, user, presetName, selectedPreset, customFrequency, volume, duration]);

  return (
    <div className="space-y-6">
      {/* Preset Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Frequency Presets</h3>
        
        {availablePresets.map(([presetKey, preset]) => (
          <div key={presetKey} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-cosmic-silver">{preset.name}</h4>
              {preset.tier !== 'free' && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  preset.tier === 'premium' 
                    ? 'bg-cosmic-purple/20 text-cosmic-purple' 
                    : 'bg-cosmic-gold/20 text-cosmic-gold'
                }`}>
                  {preset.tier.toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {preset.frequencies.map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => handlePresetChange(presetKey, freq.value)}
                  className={`p-3 text-sm rounded-lg border transition-all ${
                    selectedPreset === freq.value
                      ? 'border-cosmic-purple bg-cosmic-purple/20 text-white'
                      : 'border-cosmic-silver/20 bg-cosmic-dark/50 text-cosmic-silver hover:border-cosmic-purple/50'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Premium Rife Frequencies */}
        {!features.advancedFrequencies.isAllowed && (
          <FeatureGuard 
            requiredTier="premium" 
            feature="advanced-frequencies"
            showPreview={true}
          >
            <div className="space-y-2">
              <h4 className="font-medium text-cosmic-silver">Rife Healing Frequencies</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ENHANCED_PRESETS.rife.frequencies.slice(0, 6).map((freq) => (
                  <button
                    key={freq.value}
                    disabled
                    className="p-3 text-sm rounded-lg border border-cosmic-silver/20 bg-cosmic-dark/50 text-cosmic-silver/50"
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>
          </FeatureGuard>
        )}

        {/* Clinical Protocols */}
        {!features.patientManagement.isAllowed && (
          <FeatureGuard 
            requiredTier="clinical" 
            feature="clinical-protocols"
            showPreview={true}
          >
            <div className="space-y-2">
              <h4 className="font-medium text-cosmic-silver">Clinical Protocols</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ENHANCED_PRESETS.clinical.frequencies.map((freq) => (
                  <button
                    key={freq.value}
                    disabled
                    className="p-3 text-sm rounded-lg border border-cosmic-silver/20 bg-cosmic-dark/50 text-cosmic-silver/50"
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>
          </FeatureGuard>
        )}
      </div>

      {/* Custom Frequency */}
      <div className="space-y-2">
        <h4 className="font-medium text-cosmic-silver">Custom Frequency</h4>
        {features.customFrequencies.isAllowed ? (
          <input
            type="number"
            value={customFrequency}
            onChange={(e) => handleCustomFrequencyChange(e.target.value)}
            placeholder="Enter frequency in Hz (20-20000)"
            min="20"
            max="20000"
            className="w-full p-3 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-white placeholder:text-cosmic-silver/50"
          />
        ) : (
          <FeatureGuard requiredTier="premium" feature="custom-frequencies">
            <input
              type="number"
              placeholder="Enter frequency in Hz (20-20000)"
              disabled
              className="w-full p-3 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-cosmic-silver/50"
            />
          </FeatureGuard>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Volume Control */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-cosmic-silver">
            Volume: {volume}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="w-full"
            aria-label="Volume control"
          />
        </div>

        {/* Duration Control */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-cosmic-silver">
            Duration: {duration} minutes
            {limits.sessionDurationMinutes !== -1 && (
              <span className="text-xs text-cosmic-silver/60">
                {' '}(Max: {limits.sessionDurationMinutes} min)
              </span>
            )}
          </label>
          <input
            type="range"
            min="1"
            max={limits.sessionDurationMinutes === -1 ? 120 : limits.sessionDurationMinutes}
            value={Math.min(duration, limits.sessionDurationMinutes === -1 ? 120 : limits.sessionDurationMinutes)}
            onChange={(e) => handleDurationChange(parseInt(e.target.value))}
            className="w-full"
            aria-label="Duration control"
          />
          {isDurationRestricted && (
            <p className="text-sm text-yellow-400">
              Duration limited to {limits.sessionDurationMinutes} minutes on free plan.{' '}
              <button 
                onClick={() => window.location.href = '/upgrade'}
                className="text-cosmic-purple hover:underline"
              >
                Upgrade for unlimited sessions
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Save Preset */}
      {features.customPresets.isAllowed ? (
        <div className="space-y-2">
          {!showSavePreset ? (
            <button
              onClick={() => setShowSavePreset(true)}
              disabled={!selectedPreset && !customFrequency}
              className="px-4 py-2 bg-cosmic-purple/20 border border-cosmic-purple text-cosmic-purple rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Preset
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Preset name"
                className="flex-1 p-2 bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg text-white"
              />
              <button
                onClick={() => void handleSavePreset()}
                disabled={!presetName.trim()}
                className="px-4 py-2 bg-cosmic-purple text-white rounded-lg disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setShowSavePreset(false)}
                className="px-4 py-2 bg-cosmic-silver/20 text-cosmic-silver rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      ) : (
        <FeatureGuard requiredTier="premium" feature="custom-presets">
          <button
            disabled
            className="px-4 py-2 bg-cosmic-silver/20 text-cosmic-silver/50 rounded-lg cursor-not-allowed"
          >
            Save as Preset (Premium Feature)
          </button>
        </FeatureGuard>
      )}

      {/* Audio Player */}
      <div className="mt-6">
        <AudioPlayer
          frequency={parseFloat(selectedPreset || customFrequency) || 528}
          volume={volume / 100}
          isPlaying={isPlaying}
          onPlayStateChange={setIsPlaying}
        />
      </div>

      {/* Duration Timer */}
      {isPlaying && (
        <DurationTimer
          duration={duration} // Already in minutes
          isActive={isPlaying}
          onComplete={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
};

export default FrequencyControls;
