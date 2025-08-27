/**
 * Security and validation utilities for binaural settings
 * Ensures all user inputs are properly sanitized and validated
 */

import type {
  BinauralSettingsError,
  AudioSettingsConstraints,
  FrequencyConstraints,
  InputValidation,
} from '../types/binaural.types';

/**
 * Input sanitization hook for React components
 */

  return {
    validateAndSanitize: (input: string) =>
      validator.preventXSS(validator.sanitize(input)),
    validateFrequency: (
      freq: number,
      constraints: FrequencyConstraints['baseFrequency']
    ) => validator.validateFrequencyInput(freq, constraints),
    validateBeat: (
      beat: number,
      constraints: FrequencyConstraints['binauralBeat']
    ) => validator.validateBeatInput(beat, constraints),
    validateVolume: (
      vol: number,
      constraints: AudioSettingsConstraints['volume']
    ) => validator.validateVolumeInput(vol, constraints),
    isRateLimited: (id: string) => BinauralSecurityValidator.isRateLimited(id),
  };
};
