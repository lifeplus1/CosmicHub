/**
 * Security and validation utilities for binaural settings
 * Ensures all user inputs are properly sanitized and validated
 */

import type { 
  BinauralSettingsError, 
  AudioSettingsConstraints, 
  FrequencyConstraints,
  InputValidation 
} from '../types/binaural.types';

export class BinauralSecurityValidator implements InputValidation {
  /**
   * Sanitize string inputs to prevent XSS attacks
   */
  sanitize(input: string): string {
    return input
      .replace(/[<>"']/g, '') // Remove potential HTML/script characters
      .replace(/javascript:/gi, '') // Remove javascript protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .substring(0, 100); // Limit length to prevent buffer overflow
  }

  /**
   * Validate numeric inputs against constraints
   */
  validateNumeric(value: number, constraints: { min: number; max: number }): boolean {
    return (
      typeof value === 'number' &&
      !isNaN(value) &&
      isFinite(value) &&
      value >= constraints.min &&
      value <= constraints.max
    );
  }

  /**
   * Advanced XSS prevention
   */
  preventXSS(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Validate frequency parameters for security
   */
  validateFrequencyInput(
    frequency: number, 
    constraints: FrequencyConstraints['baseFrequency']
  ): BinauralSettingsError | null {
    if (!this.validateNumeric(frequency, constraints)) {
      return {
        type: 'INVALID_FREQUENCY',
        frequency,
        constraints
      };
    }
    return null;
  }

  /**
   * Validate binaural beat parameters
   */
  validateBeatInput(
    beat: number,
    constraints: FrequencyConstraints['binauralBeat']
  ): BinauralSettingsError | null {
    if (!this.validateNumeric(beat, constraints)) {
      return {
        type: 'INVALID_BEAT',
        beat,
        constraints
      };
    }
    return null;
  }

  /**
   * Validate volume parameters
   */
  validateVolumeInput(
    volume: number,
    constraints: AudioSettingsConstraints['volume']
  ): BinauralSettingsError | null {
    if (!this.validateNumeric(volume, constraints)) {
      return {
        type: 'INVALID_VOLUME',
        volume,
        constraints
      };
    }
    return null;
  }

  /**
   * Rate limiting for API calls to prevent abuse
   */
  private static callCounts = new Map<string, { count: number; lastReset: number }>();
  
  static isRateLimited(identifier: string, maxCalls: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const existing = this.callCounts.get(identifier);
    
    if (!existing || now - existing.lastReset > windowMs) {
      this.callCounts.set(identifier, { count: 1, lastReset: now });
      return false;
    }
    
    if (existing.count >= maxCalls) {
      return true;
    }
    
    existing.count++;
    return false;
  }
}

/**
 * Input sanitization hook for React components
 */
export const useBinauralSecurity = () => {
  const validator = new BinauralSecurityValidator();
  
  return {
    validateAndSanitize: (input: string) => validator.preventXSS(validator.sanitize(input)),
    validateFrequency: (freq: number, constraints: FrequencyConstraints['baseFrequency']) => 
      validator.validateFrequencyInput(freq, constraints),
    validateBeat: (beat: number, constraints: FrequencyConstraints['binauralBeat']) => 
      validator.validateBeatInput(beat, constraints),
    validateVolume: (vol: number, constraints: AudioSettingsConstraints['volume']) => 
      validator.validateVolumeInput(vol, constraints),
    isRateLimited: (id: string) => BinauralSecurityValidator.isRateLimited(id)
  };
};
