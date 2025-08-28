/**
 * Security and validation utilities for binaural settings
 * Ensures all user inputs are properly sanitized and validated
 */

import type {
  AudioSettingsConstraints,
  FrequencyConstraints,
  InputValidation,
} from '../types/binaural.types';

class BinauralSecurityValidator {
  static isRateLimited(id: string): boolean {
    // Mock implementation for rate limiting check
    // In production, this would check against a rate limit store
    return id.length === 0; // Simple validation for demo
  }

  static sanitize(input: string): string {
    // Basic XSS prevention
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  static preventXSS(input: string): string {
    return this.sanitize(input);
  }

  static validateFrequencyInput(
    freq: number,
    constraints: FrequencyConstraints['baseFrequency']
  ): boolean {
    return freq >= constraints.min && freq <= constraints.max;
  }

  static validateBeatInput(
    beat: number,
    constraints: FrequencyConstraints['binauralBeat']
  ): boolean {
    return beat >= constraints.min && beat <= constraints.max;
  }

  static validateVolumeInput(
    vol: number,
    constraints: AudioSettingsConstraints['volume']
  ): boolean {
    return vol >= constraints.min && vol <= constraints.max;
  }
}

/**
 * Input sanitization hook for React components
 */
export const useInputValidation = () => {
  const validator: InputValidation = {
    validateNumeric: (
      value: number,
      constraints: { min: number; max: number }
    ) => {
      return value >= constraints.min && value <= constraints.max;
    },
    preventXSS: (input: string) => BinauralSecurityValidator.preventXSS(input),
  };

  return {
    validateAndSanitize: (input: string) =>
      validator.preventXSS(BinauralSecurityValidator.sanitize(input)),
    validateFrequency: (
      freq: number,
      constraints: FrequencyConstraints['baseFrequency']
    ) => BinauralSecurityValidator.validateFrequencyInput(freq, constraints),
    validateBeat: (
      beat: number,
      constraints: FrequencyConstraints['binauralBeat']
    ) => BinauralSecurityValidator.validateBeatInput(beat, constraints),
    validateVolume: (
      vol: number,
      constraints: AudioSettingsConstraints['volume']
    ) => BinauralSecurityValidator.validateVolumeInput(vol, constraints),
    isRateLimited: (id: string) => BinauralSecurityValidator.isRateLimited(id),
  };
};
