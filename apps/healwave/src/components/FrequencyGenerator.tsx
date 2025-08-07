import React, { useState, useCallback } from 'react';
import { AudioEngine, FrequencyPreset, AudioSettings, getAllPresets } from '@cosmichub/frequency';

/**
 * HealWave Standalone Frequency Generator
 * Uses shared audio engine but remains completely independent
 */
export const HealWaveFrequencyGenerator: React.FC = () => {
  const [audioEngine] = useState(() => new AudioEngine());
  const [selectedPreset, setSelectedPreset] = useState<FrequencyPreset | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({
    volume: 50,
    duration: 10,
    fadeIn: 2,
    fadeOut: 2
  });

  const presets = getAllPresets();

  const handlePlay = useCallback(async () => {
    if (!selectedPreset) return;

    try {
      await audioEngine.startFrequency(selectedPreset, settings);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start frequency:', error);
    }
  }, [audioEngine, selectedPreset, settings]);

  const handleStop = useCallback(() => {
    audioEngine.stopFrequency();
    setIsPlaying(false);
  }, [audioEngine]);

  return (
    <div className="healwave-frequency-generator">
      <h2 className="mb-6 text-2xl font-bold">HealWave Frequency Generator</h2>
      
      {/* Preset Selection */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">Select Frequency</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedPreset?.id === preset.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-sm text-gray-600">{preset.baseFrequency} Hz</div>
              <div className="mt-1 text-xs text-gray-500">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      {selectedPreset && (
        <div className="p-4 mb-6 border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-semibold">Session Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Volume (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => setSettings(s => ({ ...s, volume: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{settings.volume}%</span>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium">Duration (minutes)</label>
              <input
                type="range"
                min="1"
                max="60"
                value={settings.duration}
                onChange={(e) => setSettings(s => ({ ...s, duration: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{settings.duration} min</span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isPlaying ? 'Playing...' : 'Start Session'}
            </button>
            
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Frequency Info */}
      {selectedPreset && (
        <div className="p-4 rounded-lg bg-gray-50">
          <h4 className="mb-2 font-semibold">{selectedPreset.name}</h4>
          <p className="mb-2 text-sm text-gray-700">{selectedPreset.description}</p>
          
          {selectedPreset.benefits && (
            <div>
              <span className="text-sm font-medium">Benefits:</span>
              <ul className="mt-1 text-sm text-gray-600">
                {selectedPreset.benefits.map((benefit, index) => (
                  <li key={index}>• {benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
