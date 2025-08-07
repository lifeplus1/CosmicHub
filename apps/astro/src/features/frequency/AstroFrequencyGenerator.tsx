import React, { useState, useCallback, useMemo } from 'react';
import { 
  AudioEngine, 
  FrequencyPreset, 
  AudioSettings, 
  PLANETARY_FREQUENCIES,
  SOLFEGGIO_FREQUENCIES 
} from '@cosmichub/frequency';

/**
 * Astrology-Enhanced Frequency Generator
 * Uses the same shared audio engine as HealWave, but adds astrology-specific features
 */

interface AstrologyEnhancement {
  planetaryAlignment: string;
  transitInfluence: string;
  recommendedDuration: number;
  chartHarmonic: number;
}

interface AstroFrequencyPreset extends FrequencyPreset {
  astrologyData?: AstrologyEnhancement;
}

export const AstroFrequencyGenerator: React.FC<{
  chartData?: any; // Current user's astrology chart
  currentTransits?: any; // Current planetary transits
}> = ({ chartData, currentTransits }) => {
  const [audioEngine] = useState(() => new AudioEngine());
  const [selectedPreset, setSelectedPreset] = useState<AstroFrequencyPreset | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({
    volume: 50,
    duration: 15, // Default longer for astrology sessions
    fadeIn: 3,
    fadeOut: 3
  });

  // Enhanced presets with astrology context
  const astroEnhancedPresets = useMemo((): AstroFrequencyPreset[] => {
    return [
      ...PLANETARY_FREQUENCIES.map(preset => ({
        ...preset,
        astrologyData: {
          planetaryAlignment: 'Venus trine Jupiter',
          transitInfluence: 'Harmonious energy for healing',
          recommendedDuration: 20,
          chartHarmonic: 5
        }
      })),
      ...SOLFEGGIO_FREQUENCIES.map(preset => ({
        ...preset,
        astrologyData: {
          planetaryAlignment: 'Current moon phase alignment',
          transitInfluence: 'Enhanced by lunar cycle',
          recommendedDuration: 15,
          chartHarmonic: 7
        }
      }))
    ];
  }, []);

  // Calculate personalized frequency based on chart data
  const getPersonalizedFrequency = useCallback((basePreset: AstroFrequencyPreset) => {
    if (!chartData) return basePreset;

    // Example: Adjust frequency based on user's dominant element
    const dominantElement = chartData.dominantElement || 'earth';
    const elementMultipliers = {
      fire: 1.05,
      earth: 1.0,
      air: 1.02,
      water: 0.98
    };

    return {
      ...basePreset,
      baseFrequency: basePreset.baseFrequency * elementMultipliers[dominantElement as keyof typeof elementMultipliers],
      description: `${basePreset.description} - Personalized for ${dominantElement} dominance`
    };
  }, [chartData]);

  const handlePlay = useCallback(async () => {
    if (!selectedPreset) return;

    try {
      const personalizedPreset = getPersonalizedFrequency(selectedPreset);
      await audioEngine.startFrequency(personalizedPreset, settings);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start astrology frequency:', error);
    }
  }, [audioEngine, selectedPreset, settings, getPersonalizedFrequency]);

  const handleStop = useCallback(() => {
    audioEngine.stopFrequency();
    setIsPlaying(false);
  }, [audioEngine]);

  return (
    <div className="astro-frequency-generator">
      <h2 className="text-2xl font-bold mb-6">🌟 Astrology-Enhanced Frequency Therapy</h2>
      
      {/* Chart Integration Notice */}
      {chartData && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-800">✨ Personalized for Your Chart</h3>
          <p className="text-purple-700 text-sm mt-1">
            Frequencies are automatically adjusted based on your dominant element and current transits
          </p>
        </div>
      )}

      {/* Preset Selection with Astrology Context */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Select Frequency</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {astroEnhancedPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedPreset?.id === preset.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-sm text-gray-600">{preset.baseFrequency} Hz</div>
              <div className="text-xs text-gray-500 mt-1">{preset.description}</div>
              
              {/* Astrology Enhancement Info */}
              {preset.astrologyData && (
                <div className="mt-2 p-2 bg-purple-100 rounded text-xs">
                  <div className="text-purple-700">
                    🌙 {preset.astrologyData.planetaryAlignment}
                  </div>
                  <div className="text-purple-600">
                    {preset.astrologyData.transitInfluence}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Controls with Astrology Features */}
      {selectedPreset && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-semibold mb-3">🎵 Session Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="volume-slider" className="block text-sm font-medium mb-1">
                Volume (%)
              </label>
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => setSettings(s => ({ ...s, volume: parseInt(e.target.value) }))}
                className="w-full"
                aria-label="Volume control"
              />
              <span className="text-sm text-gray-600">{settings.volume}%</span>
            </div>
            
            <div>
              <label htmlFor="duration-slider" className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <input
                id="duration-slider"
                type="range"
                min="1"
                max="60"
                value={settings.duration}
                onChange={(e) => setSettings(s => ({ ...s, duration: parseInt(e.target.value) }))}
                className="w-full"
                aria-label="Session duration"
              />
              <span className="text-sm text-gray-600">{settings.duration} min</span>
              
              {/* Astrology Recommendation */}
              {selectedPreset.astrologyData && (
                <div className="text-xs text-purple-600 mt-1">
                  Recommended: {selectedPreset.astrologyData.recommendedDuration} min
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isPlaying ? '🎵 Playing...' : '▶️ Start Astro Session'}
            </button>
            
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              ⏹️ Stop
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Info with Astrology Context */}
      {selectedPreset && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">🌟 {selectedPreset.name}</h4>
          <p className="text-sm text-gray-700 mb-3">{selectedPreset.description}</p>
          
          {selectedPreset.astrologyData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-sm font-medium text-purple-700">Current Alignment:</span>
                <p className="text-sm text-gray-600">{selectedPreset.astrologyData.planetaryAlignment}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-purple-700">Transit Influence:</span>
                <p className="text-sm text-gray-600">{selectedPreset.astrologyData.transitInfluence}</p>
              </div>
            </div>
          )}
          
          {selectedPreset.benefits && (
            <div>
              <span className="text-sm font-medium text-purple-700">Astrological Benefits:</span>
              <ul className="text-sm text-gray-600 mt-1">
                {selectedPreset.benefits.map((benefit, index) => (
                  <li key={index}>⭐ {benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
