import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioEngine, FrequencyPreset } from '@cosmichub/integrations';
import { ValidatedFrequencyData } from '../../schemas/frequencySchemas';
import { devConsole } from '../../config/devConsole';
import { FREQUENCY_CONSTANTS } from '../constants/frequencyConstants';

interface UseAudioEngineManagerProps {
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const useAudioEngineManager = ({ onPlayStateChange }: UseAudioEngineManagerProps = {}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioEngineRef = useRef<AudioEngine | null>(null);

  // Initialize AudioEngine with proper cleanup
  const initializeAudioEngine = useCallback((): boolean => {
    try {
      // Only create if it doesn't exist
      if (!audioEngineRef.current) {
        audioEngineRef.current = new AudioEngine();
        devConsole.info('✅ AudioEngine initialized successfully');
        return true;
      }

      // Check if existing engine is in a good state
      try {
        const state = audioEngineRef.current.getState();
        devConsole.info('🎵 Current AudioEngine state:', state);

        // If engine exists, we can reuse it (don't destroy unless necessary)
        devConsole.info('✅ Reusing existing AudioEngine');
        return true;
      } catch (stateError) {
        // If getting state fails, the engine might be corrupted, recreate it
        devConsole.warn('🔄 AudioEngine state check failed, recreating...', stateError);
        try {
          audioEngineRef.current.destroy();
        } catch {
          // Ignore destroy errors
        }
        audioEngineRef.current = new AudioEngine();
        devConsole.info('✅ AudioEngine recreated successfully');
        return true;
      }
    } catch (error) {
      devConsole.error('❌ Failed to initialize AudioEngine:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }, []);

  // Initialize audio engine on mount
  useEffect(() => {
    initializeAudioEngine();

    return () => {
      if (audioEngineRef.current) {
        try {
          // Stop any playing audio before destroying
          if (audioEngineRef.current.getState().isPlaying) {
            audioEngineRef.current.stopFrequency();
          }
          audioEngineRef.current.destroy();
          devConsole.info('🗑️ AudioEngine destroyed successfully');
        } catch (error) {
          devConsole.error('❌ Failed to destroy AudioEngine:', error instanceof Error ? error.message : String(error));
        } finally {
          // Ensure state is reset
          setIsPlaying(false);
        }
      }
    };
  }, [initializeAudioEngine]);

  // Helper to update playing state and notify parent
  const updatePlayingState = useCallback((playing: boolean) => {
    setIsPlaying(playing);
    onPlayStateChange?.(playing);
  }, [onPlayStateChange]);

  // Convert FrequencyData to FrequencyPreset for AudioEngine
  const convertToFrequencyPreset = useCallback((
    preset: ValidatedFrequencyData,
    binauralEnabled: boolean,
    binauralBeat: number
  ): FrequencyPreset => {
    // Map extended categories to compatible AudioEngine categories
    const getCategoryMapping = (category: string): FrequencyPreset['category'] => {
      switch (category) {
        case 'stellar':
        case 'metallic':
          return 'custom';
        case 'solfeggio':
        case 'rife':
        case 'brainwave':
        case 'planetary':
        case 'chakra':
          return category as FrequencyPreset['category'];
        default:
          return 'custom';
      }
    };

    // Handle binaural beats correctly
    const isBinauralPreset = preset.metadata?.isBinaural;
    const presetBinauralBeat = preset.metadata?.binauralBeat as number | undefined;
    const presetBaseFreq = preset.metadata?.baseFrequency as number | undefined;

    return {
      id: preset.label.toLowerCase().replace(/\s+/g, '-'),
      name: preset.label,
      category: getCategoryMapping(preset.category),
      // For binaural presets, use the original base frequency
      baseFrequency: isBinauralPreset && presetBaseFreq ? presetBaseFreq : preset.frequency,
      // For binaural presets, use the preset's binaural beat, otherwise use UI setting
      binauralBeat: isBinauralPreset ? presetBinauralBeat : (binauralEnabled ? binauralBeat : undefined),
      description: preset.benefits?.join(', '),
      benefits: preset.benefits || []
    };
  }, []);

  // Main play function
  const playFrequency = useCallback(async (
    selectedPreset: ValidatedFrequencyData,
    volume: number,
    duration: number,
    binauralEnabled: boolean,
    binauralBeat: number
  ) => {
    if (!selectedPreset || !audioEngineRef.current) {
      devConsole.warn('⚠️ No preset selected or audio engine not initialized');
      return;
    }

    // Ensure AudioEngine exists and try to activate AudioContext with user gesture
    if (!initializeAudioEngine()) {
      devConsole.error('❌ Failed to initialize AudioEngine');
      return;
    }

    try {
      devConsole.info('▶️ Starting enhanced audio session:', {
        preset: selectedPreset.label,
        frequency: selectedPreset.frequency,
        duration,
        volume,
        binauralEnabled,
        binauralBeat: binauralEnabled ? binauralBeat : undefined
      });

      // Debug Beta High Focus specifically
      if (selectedPreset.label?.includes('Beta High Focus')) {
        devConsole.info('🔍 DEBUG: Beta High Focus audio parameters:', {
          selectedPreset,
          metadata: selectedPreset.metadata,
          isBinauralPreset: selectedPreset.metadata?.isBinaural,
          audioEngineRef: !!audioEngineRef.current
        });
      }

      // Try to activate AudioContext with user gesture first
      if (!audioEngineRef.current) {
        throw new Error('AudioEngine not available');
      }

      // Check if the activateAudioContext method exists before calling it
      if (typeof audioEngineRef.current.activateAudioContext === 'function') {
        const activated = await audioEngineRef.current.activateAudioContext();
        if (!activated) {
          devConsole.warn('AudioContext activation returned false, but continuing...');
        }
      } else {
        devConsole.info('activateAudioContext method not available, relying on startFrequency for activation');
      }

      // Check AudioEngine state before starting
      const engineState = audioEngineRef.current.getState();
      devConsole.info('🎵 AudioEngine state before start:', engineState);

      // Ensure we stop any current playback first
      if (engineState.isPlaying) {
        devConsole.info('🛑 Stopping current playback before starting new session');
        audioEngineRef.current.stopFrequency();
      }

      // Validate frequency before creating preset
      if (selectedPreset.frequency < FREQUENCY_CONSTANTS.MIN_FREQUENCY || selectedPreset.frequency > FREQUENCY_CONSTANTS.MAX_FREQUENCY) {
        throw new Error(`Invalid frequency: ${selectedPreset.frequency}Hz. Must be between ${FREQUENCY_CONSTANTS.MIN_FREQUENCY}-${FREQUENCY_CONSTANTS.MAX_FREQUENCY} Hz`);
      }

      const preset = convertToFrequencyPreset(selectedPreset, binauralEnabled, binauralBeat);

      devConsole.info('🎵 Created preset for AudioEngine:', preset);

      const settings = {
        volume: volume * FREQUENCY_CONSTANTS.VOLUME_MULTIPLIER, // Convert from 0-1 to 0-100 for AudioEngine
        duration,
        fadeIn: FREQUENCY_CONSTANTS.FADE_IN_DURATION, // 2 second fade in
        fadeOut: FREQUENCY_CONSTANTS.FADE_OUT_DURATION  // 2 second fade out
      };

      await audioEngineRef.current.startFrequency(preset, settings);

      // Verify the audio actually started
      const finalState = audioEngineRef.current.getState();
      if (finalState.isPlaying) {
        updatePlayingState(true);
        devConsole.info('✅ Audio session started successfully');
      } else {
        throw new Error('AudioEngine reported not playing after start');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      devConsole.error('❌ Failed to start audio session:', errorMessage);

      // Show user-friendly error message based on error type
      if (errorMessage.includes('suspended') || errorMessage.includes('CONTEXT_UNAVAILABLE') || errorMessage.includes('CONTEXT_NOT_RUNNING')) {
        devConsole.warn('💡 Audio needs user interaction. Click play again to activate audio.');
        // Don't try to reinitialize for context issues - user needs to click again
        updatePlayingState(false);
        return;
      } else if (errorMessage.includes('frequency')) {
        devConsole.warn('💡 Invalid frequency detected. Please select a different preset.');
      } else {
        devConsole.warn('💡 Audio failed to start. Attempting to recover...');
      }

      // If AudioEngine fails, try reinitializing
      devConsole.info('🔄 Attempting to reinitialize AudioEngine...');
      updatePlayingState(false); // Ensure state is reset

      if (initializeAudioEngine() && audioEngineRef.current) {
        try {
          const preset = convertToFrequencyPreset(selectedPreset, binauralEnabled, binauralBeat);

          await audioEngineRef.current.startFrequency(preset, {
            volume: volume * FREQUENCY_CONSTANTS.VOLUME_MULTIPLIER,
            duration,
            fadeIn: FREQUENCY_CONSTANTS.FADE_IN_DURATION,
            fadeOut: FREQUENCY_CONSTANTS.FADE_OUT_DURATION
          });

          // Verify retry succeeded
          const retryState = audioEngineRef.current.getState();
          if (retryState.isPlaying) {
            updatePlayingState(true);
            devConsole.info('✅ Audio session started successfully after reinitialization');
            return; // Success after retry
          } else {
            throw new Error('AudioEngine still not playing after reinitialization');
          }
        } catch (retryError) {
          devConsole.error('❌ Failed to start audio session even after reinitialization:', retryError instanceof Error ? retryError.message : String(retryError));
        }
      }

      updatePlayingState(false);
    }
  }, [initializeAudioEngine, updatePlayingState, convertToFrequencyPreset]);

  // Stop function
  const stopFrequency = useCallback(() => {
    devConsole.info('⏹️ Stopping enhanced audio session');

    if (audioEngineRef.current) {
      try {
        audioEngineRef.current.stopFrequency();
        devConsole.info('✅ Audio session stopped successfully');
      } catch (error) {
        devConsole.error('❌ Failed to stop audio session:', error instanceof Error ? error.message : String(error));
      }
    }

    // Ensure state is updated after stopping
    updatePlayingState(false);
  }, [updatePlayingState]);

  // Update volume function
  const updateVolume = useCallback(async (volume: number) => {
    if (audioEngineRef.current && isPlaying) {
      try {
        await audioEngineRef.current.setVolume(volume * FREQUENCY_CONSTANTS.VOLUME_MULTIPLIER);
      } catch (error) {
        devConsole.error('Failed to update volume:', error);
      }
    }
  }, [isPlaying]);

  return {
    isPlaying,
    playFrequency,
    stopFrequency,
    updateVolume,
    initializeAudioEngine,
  };
};
