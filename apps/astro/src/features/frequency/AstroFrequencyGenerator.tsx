import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { devConsole } from '../../config/environment';
import { AudioEngine, PLANETARY_FREQUENCIES, SOLFEGGIO_FREQUENCIES, type FrequencyPreset, type AudioSettings } from '@cosmichub/frequency';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';

const LazyAstroInfo = lazy(() => import('./AstroInfo')); // Lazy load for performance

interface AstrologyEnhancement {
  planetaryAlignment: string;
  transitInfluence: string;
  recommendedDuration: number;
  chartHarmonic: number;
}

type AstroFrequencyPreset = FrequencyPreset & {
  astrologyData?: AstrologyEnhancement;
};

interface AstroFrequencyGeneratorProps {
  chartData?: Record<string, unknown>; // Strict type if available
  currentTransits?: Record<string, unknown>;
}

/**
 * Astrology-Enhanced Frequency Generator
 * Uses the same shared audio engine as HealWave, but adds astrology-specific features
 */
const AstroFrequencyGenerator: React.FC<AstroFrequencyGeneratorProps> = React.memo(({ 
  chartData 
}) => {
  const [audioEngine] = useState(() => new AudioEngine());
  const [selectedPreset, setSelectedPreset] = useState<AstroFrequencyPreset | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [settings, setSettings] = useState<AudioSettings>({
    volume: 50,
    duration: 15,
    fadeIn: 3,
    fadeOut: 3,
  });

  // Enhanced presets with astrology context - Memoized
  const astroEnhancedPresets = useMemo<AstroFrequencyPreset[]>(() => [
    ...PLANETARY_FREQUENCIES.map((preset) => ({
      ...preset,
      astrologyData: {
        planetaryAlignment: 'Venus trine Jupiter',
        transitInfluence: 'Harmonious energy for healing',
        recommendedDuration: 20,
        chartHarmonic: 5,
      },
    })),
    ...SOLFEGGIO_FREQUENCIES.map((preset) => ({
      ...preset,
      astrologyData: {
        planetaryAlignment: 'Current moon phase alignment',
        transitInfluence: 'Enhanced by lunar cycle',
        recommendedDuration: 15,
        chartHarmonic: 7,
      },
    })),
  ], []);

  // Calculate personalized frequency based on chart data
  const getPersonalizedFrequency = useCallback((basePreset: AstroFrequencyPreset): AstroFrequencyPreset => {
    if (chartData === null || chartData === undefined) return basePreset;

    // Access via bracket to satisfy noPropertyAccessFromIndexSignature and narrow
    const dominantRaw = chartData['dominantElement'];
    const dominantElement = (typeof dominantRaw === 'string' && dominantRaw.length > 0)
      ? dominantRaw
      : 'earth';
    const elementMultipliers: Record<string, number> = {
      fire: 1.05,
      earth: 1.0,
      air: 1.02,
      water: 0.98,
    };

    const adjustedFrequency = basePreset.baseFrequency * (elementMultipliers[dominantElement] ?? 1.0);
    return Object.assign({}, basePreset, {
      baseFrequency: adjustedFrequency,
      description: `${basePreset.description ?? ''} - Personalized for ${dominantElement} dominance`.trim()
    });
  }, [chartData]);

  const handlePlay = useCallback(async () => {
    if (selectedPreset === null || selectedPreset === undefined) return;
    try {
      const personalizedPreset = getPersonalizedFrequency(selectedPreset);
      await audioEngine.startFrequency(personalizedPreset, settings);
      setIsPlaying(true);
    } catch (error) {
      devConsole.error('❌ Failed to start astrology frequency:', error);
    }
  }, [audioEngine, selectedPreset, settings, getPersonalizedFrequency]);

  const handleStop = useCallback(() => {
    audioEngine.stopFrequency();
    setIsPlaying(false);
  }, [audioEngine]);

  const updateSettings = useCallback((key: keyof AudioSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="astro-frequency-generator" role="region" aria-label="Astro Frequency Generator">
      <h2 className="mb-6 text-2xl font-bold">🌟 Astrology-Enhanced Frequency Therapy</h2>
      
      {/* Chart Integration Notice */}
      {chartData !== null && chartData !== undefined && (
        <div className="p-4 mb-6 border border-purple-200 rounded-lg bg-purple-50">
          <h3 className="font-semibold text-purple-800">✨ Personalized for Your Chart</h3>
          <p className="mt-1 text-sm text-purple-700">
            Frequencies are automatically adjusted based on your dominant element and current transits
          </p>
        </div>
      )}

      {/* Preset Selection with Astrology Context */}
      <div className="mb-6">
        <TooltipProvider>
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            role="radiogroup"
            aria-label="Astrology frequency presets"
          >
            {astroEnhancedPresets.map((preset) => {
              const isSelected = selectedPreset?.id === preset.id;
              return (
                <Tooltip.Root key={preset.id}>
                  <Tooltip.Trigger asChild>
                    {isSelected ? (
                      <button
                        onClick={() => setSelectedPreset(preset)}
                        className="p-4 rounded-lg border text-left transition-colors border-purple-500 bg-purple-50"
                        role="radio"
                        aria-checked="true"
                        aria-label={`${preset.name} preset (${preset.baseFrequency} Hz)`}
                        tabIndex={0}
                      >
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-gray-600">{preset.baseFrequency} Hz</div>
                        <div className="mt-1 text-xs text-gray-500">{preset.description}</div>
                        
                        {/* Astrology Enhancement Info */}
                        {preset.astrologyData !== null && preset.astrologyData !== undefined && (
                          <div className="p-2 mt-2 text-xs bg-purple-100 rounded">
                            <div className="text-purple-700">
                              🌙 {preset.astrologyData.planetaryAlignment}
                            </div>
                            <div className="text-purple-600">
                              {preset.astrologyData.transitInfluence}
                            </div>
                          </div>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedPreset(preset)}
                        className="p-4 rounded-lg border text-left transition-colors border-gray-200 hover:border-gray-300"
                        role="radio"
                        aria-checked="false"
                        aria-label={`${preset.name} preset (${preset.baseFrequency} Hz)`}
                        tabIndex={-1}
                      >
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-sm text-gray-600">{preset.baseFrequency} Hz</div>
                        <div className="mt-1 text-xs text-gray-500">{preset.description}</div>
                        
                        {/* Astrology Enhancement Info */}
                        {preset.astrologyData !== null && preset.astrologyData !== undefined && (
                          <div className="p-2 mt-2 text-xs bg-purple-100 rounded">
                            <div className="text-purple-700">
                              🌙 {preset.astrologyData.planetaryAlignment}
                            </div>
                            <div className="text-purple-600">
                              {preset.astrologyData.transitInfluence}
                            </div>
                          </div>
                        )}
                      </button>
                    )}
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="p-2 bg-white border rounded shadow">Premium: Integrate with HealWave for more</Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
            </div>
          </TooltipProvider>
        </div>

      {/* Enhanced Controls with Astrology Features */}
      {selectedPreset !== null && selectedPreset !== undefined && (
        <div className="p-4 mb-6 border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-semibold">🎵 Session Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="volume-slider" className="block mb-1 text-sm font-medium">
                Volume (%)
              </label>
              <Slider.Root
                id="volume-slider"
                className="relative flex items-center w-full h-5"
                value={[settings.volume]}
                min={0}
                max={100}
                onValueChange={([value]) => updateSettings('volume', typeof value === 'number' ? value : settings.volume)}
                aria-label="Volume control"
              >
                <Slider.Track className="relative flex-grow h-1 bg-gray-200 rounded-full">
                  <Slider.Range className="absolute h-1 bg-purple-500 rounded-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-purple-500 rounded-full" />
              </Slider.Root>
              <span className="text-sm text-gray-600">{settings.volume}%</span>
            </div>
            
            <div>
              <label htmlFor="duration-slider" className="block mb-1 text-sm font-medium">
                Duration (minutes)
              </label>
              <Slider.Root
                id="duration-slider"
                className="relative flex items-center w-full h-5"
                value={[settings.duration]}
                min={1}
                max={60}
                onValueChange={([value]) => updateSettings('duration', typeof value === 'number' ? value : settings.duration)}
                aria-label="Session duration"
              >
                <Slider.Track className="relative flex-grow h-1 bg-gray-200 rounded-full">
                  <Slider.Range className="absolute h-1 bg-purple-500 rounded-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-purple-500 rounded-full" />
              </Slider.Root>
              <span className="text-sm text-gray-600">{settings.duration} min</span>
              
              {/* Astrology Recommendation */}
              {selectedPreset.astrologyData !== null && selectedPreset.astrologyData !== undefined && (
                <div className="mt-1 text-xs text-purple-600">
                  Recommended: {selectedPreset.astrologyData.recommendedDuration} min
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => void handlePlay()}
              disabled={isPlaying}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isPlaying ? '🎵 Playing...' : '▶️ Start Astro Session'}
            </button>
            
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              ⏹️ Stop
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Info with Astrology Context - Lazy loaded */}
      <Suspense fallback={<div>Loading...</div>}>
        {selectedPreset !== null && selectedPreset !== undefined && <LazyAstroInfo preset={selectedPreset} />}
      </Suspense>
    </div>
  );
});

// Add display name
AstroFrequencyGenerator.displayName = 'AstroFrequencyGenerator';

export { AstroFrequencyGenerator };

// Suggested Vitest test: 
// test('personalizes frequency', () => { ... });