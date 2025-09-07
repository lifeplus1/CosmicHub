import React, { useState, useCallback, useMemo } from 'react';
import { devConsole } from '../config/devConsole';
import {
  AudioEngine,
  AudioSettings,
} from '@cosmichub/integrations';

import BinauralRangeSelector, { type BinauralRangeWithKey } from './binaural/BinauralRangeSelector';
import VolumeControl from './binaural/VolumeControl';
import DurationControl from './binaural/DurationControl';
import AdvancedSettings from './binaural/AdvancedSettings';
import TipsSection from './binaural/TipsSection';

interface BinauralSettingsProps {
  onSettingsChange: (settings: AudioSettings) => void;
  currentSettings: AudioSettings;
  audioEngine: AudioEngine;
}

/**
 * HealWave Binaural Settings Component
 * Refactored into modular sub-components for better maintainability
 * Provides advanced binaural beat configuration using shared frequency engine
 */
export const BinauralSettings: React.FC<BinauralSettingsProps> = React.memo(
  ({ onSettingsChange, currentSettings, audioEngine }) => {
    const [advancedMode, setAdvancedMode] = useState<boolean>(false);
    const [customFrequency, setCustomFrequency] = useState<number>(40);
    const [binauralBeat, setBinauralBeat] = useState<number>(6);

    // Calculate current binaural range based on current beat frequency
    const currentRange = useMemo<BinauralRangeWithKey>(() => {
      if (binauralBeat >= 0.5 && binauralBeat <= 4) {
        return { min: 0.5, max: 4, name: 'Delta (Deep Sleep)', color: 'purple', key: 'delta' };
      }
      if (binauralBeat > 4 && binauralBeat <= 8) {
        return { min: 4, max: 8, name: 'Theta (Meditation)', color: 'blue', key: 'theta' };
      }
      if (binauralBeat > 8 && binauralBeat <= 14) {
        return { min: 8, max: 14, name: 'Alpha (Relaxation)', color: 'green', key: 'alpha' };
      }
      if (binauralBeat > 14 && binauralBeat <= 30) {
        return { min: 14, max: 30, name: 'Beta (Focus)', color: 'yellow', key: 'beta' };
      }
      if (binauralBeat > 30 && binauralBeat <= 100) {
        return { min: 30, max: 100, name: 'Gamma (High Focus)', color: 'red', key: 'gamma' };
      }
      return { min: 0, max: 100, name: 'Custom', color: 'gray', key: 'custom' };
    }, [binauralBeat]);

    const handleVolumeChange = useCallback(
      (value: number): void => {
        if (value < 0 || value > 100) return;
        const newSettings: AudioSettings = {
          ...currentSettings,
          volume: value,
        };
        onSettingsChange(newSettings);
        // Optimistically set volume on engine
        audioEngine.setVolume(value).catch((error: unknown) => {
          devConsole.error('Volume set failed', { error });
        });
      },
      [currentSettings, onSettingsChange, audioEngine]
    );

    const handleDurationChange = useCallback(
      (value: number): void => {
        if (value < 1 || value > 120) return;
        onSettingsChange({ ...currentSettings, duration: value });
      },
      [currentSettings, onSettingsChange]
    );

    const handleFadeInChange = useCallback(
      (value: number): void => {
        if (value < 0 || value > 30) return;
        onSettingsChange({ ...currentSettings, fadeIn: value });
      },
      [currentSettings, onSettingsChange]
    );

    const handleFadeOutChange = useCallback(
      (value: number): void => {
        if (value < 0 || value > 30) return;
        onSettingsChange({ ...currentSettings, fadeOut: value });
      },
      [currentSettings, onSettingsChange]
    );

    const handleCustomFrequencyChange = useCallback(
      (value: number): void => {
        setCustomFrequency(value);
        // Could trigger frequency update if needed
        devConsole.info('Custom frequency changed', { value });
      },
      []
    );

    const handleBinauralBeatChange = useCallback(
      (value: number): void => {
        setBinauralBeat(value);
        // Update audio settings with new binaural beat
        const newSettings: AudioSettings = {
          ...currentSettings,
          // Note: Adjust this based on actual AudioSettings interface
        };
        onSettingsChange(newSettings);
      },
      [currentSettings, onSettingsChange]
    );

    const handleRangeSelect = useCallback(
      (range: BinauralRangeWithKey) => {
        // Set binaural beat to the middle of the selected range
        if (range.key !== 'custom') {
          const middleFreq = (range.min + range.max) / 2;
          setBinauralBeat(middleFreq);
          handleBinauralBeatChange(middleFreq);
        }
      },
      [handleBinauralBeatChange]
    );

    const toggleAdvancedMode = useCallback(() => {
      setAdvancedMode(prev => !prev);
    }, []);

    return (
      <div className="space-y-6 p-6 bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <span className="text-2xl" aria-hidden="true">🌊</span>
            <span>Binaural Settings</span>
          </h3>
          <button
            type="button"
            onClick={toggleAdvancedMode}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-cyan-400
              ${advancedMode
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
              }
            `}
            {...(advancedMode && { 'aria-pressed': 'true' })}
            aria-label={`${advancedMode ? 'Hide' : 'Show'} advanced settings`}
          >
            {advancedMode ? '🔧 Advanced' : '⚙️ Simple'}
          </button>
        </div>

        {/* Binaural Range Selector */}
        <BinauralRangeSelector
          currentBeat={binauralBeat}
          onRangeSelect={handleRangeSelect}
        />

        {/* Main Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Control */}
          <VolumeControl
            value={currentSettings.volume}
            onChange={handleVolumeChange}
          />

          {/* Duration Control */}
          <DurationControl
            value={currentSettings.duration}
            onChange={handleDurationChange}
          />
        </div>

        {/* Advanced Settings */}
        {advancedMode && (
          <div className="pt-6 border-t border-white/20">
            <AdvancedSettings
              fadeIn={currentSettings.fadeIn}
              fadeOut={currentSettings.fadeOut}
              customFrequency={customFrequency}
              binauralBeat={binauralBeat}
              onFadeInChange={handleFadeInChange}
              onFadeOutChange={handleFadeOutChange}
              onCustomFrequencyChange={handleCustomFrequencyChange}
              onBinauralBeatChange={handleBinauralBeatChange}
              currentRange={currentRange}
            />
          </div>
        )}

        {/* Tips Section */}
        <TipsSection />
      </div>
    );
  }
);

BinauralSettings.displayName = 'BinauralSettings';

export default BinauralSettings;
