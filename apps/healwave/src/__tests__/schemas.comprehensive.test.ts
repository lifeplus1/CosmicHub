/**
 * Comprehensive schema validation tests
 * Tests all Zod schemas following the unified type validation strategy
 */

import { describe, it, expect } from 'vitest';
import {
  FrequencyValueSchema,
  VolumeSchema,
  DurationSchema,
  FrequencyCategorySchema,
  BrainwaveRangeSchema,
  FrequencyPresetSchema,
  SessionSettingsSchema,
  AudioSessionStateSchema,
  // AudioEngineConfigSchema, // Commented out as unused
  UserSettingsSchema,
  validateFrequency,
  // validatePreset, // Commented out as unused
  // validateSessionSettings, // Commented out as unused
  isValidFrequency,
  // isValidPreset, // Commented out as unused
  validateSolfeggioFrequency,
  validateBrainwaveFrequency,
  validateBinauralBeat,
} from '../schemas/frequency.schema';

describe('FrequencyValueSchema', () => {
  it('should accept valid frequencies', () => {
    expect(FrequencyValueSchema.parse(440)).toBe(440);
    expect(FrequencyValueSchema.parse(528)).toBe(528);
    expect(FrequencyValueSchema.parse(19999)).toBe(19999);
  });

  it('should reject invalid frequencies', () => {
    expect(() => FrequencyValueSchema.parse(0)).toThrow();
    expect(() => FrequencyValueSchema.parse(-10)).toThrow();
    expect(() => FrequencyValueSchema.parse(25000)).toThrow();
    expect(() => FrequencyValueSchema.parse(Infinity)).toThrow();
    expect(() => FrequencyValueSchema.parse(NaN)).toThrow();
  });
});

describe('VolumeSchema', () => {
  it('should accept valid volumes', () => {
    expect(VolumeSchema.parse(0)).toBe(0);
    expect(VolumeSchema.parse(0.5)).toBe(0.5);
    expect(VolumeSchema.parse(1)).toBe(1);
  });

  it('should reject invalid volumes', () => {
    expect(() => VolumeSchema.parse(-0.1)).toThrow();
    expect(() => VolumeSchema.parse(1.1)).toThrow();
    expect(() => VolumeSchema.parse(2)).toThrow();
  });
});

describe('DurationSchema', () => {
  it('should accept valid durations', () => {
    expect(DurationSchema.parse(60)).toBe(60);
    expect(DurationSchema.parse(300)).toBe(300);
    expect(DurationSchema.parse(7200)).toBe(7200);
  });

  it('should reject invalid durations', () => {
    expect(() => DurationSchema.parse(0)).toThrow();
    expect(() => DurationSchema.parse(-10)).toThrow();
    expect(() => DurationSchema.parse(7201)).toThrow();
  });
});

describe('FrequencyCategorySchema', () => {
  it('should accept valid categories', () => {
    expect(FrequencyCategorySchema.parse('solfeggio')).toBe('solfeggio');
    expect(FrequencyCategorySchema.parse('rife')).toBe('rife');
    expect(FrequencyCategorySchema.parse('brainwave')).toBe('brainwave');
  });

  it('should reject invalid categories', () => {
    expect(() => FrequencyCategorySchema.parse('invalid')).toThrow();
    expect(() => FrequencyCategorySchema.parse('')).toThrow();
    expect(() => FrequencyCategorySchema.parse(123)).toThrow();
  });
});

describe('BrainwaveRangeSchema', () => {
  it('should accept valid brainwave ranges', () => {
    expect(BrainwaveRangeSchema.parse('delta')).toBe('delta');
    expect(BrainwaveRangeSchema.parse('alpha')).toBe('alpha');
    expect(BrainwaveRangeSchema.parse('gamma')).toBe('gamma');
  });

  it('should reject invalid ranges', () => {
    expect(() => BrainwaveRangeSchema.parse('invalid')).toThrow();
    expect(() => BrainwaveRangeSchema.parse('ultra')).toThrow();
  });
});

describe('FrequencyPresetSchema', () => {
  it('should accept valid presets', () => {
    const validPreset = {
      id: 'test-preset',
      name: 'Test Preset',
      category: 'brainwave' as const,
      frequency: 440,
      defaultVolume: 0.5,
      defaultDuration: 300,
      isBuiltIn: false,
    };

    expect(FrequencyPresetSchema.parse(validPreset)).toMatchObject(validPreset);
  });

  it('should reject invalid presets', () => {
    expect(() => FrequencyPresetSchema.parse({})).toThrow();
    expect(() => FrequencyPresetSchema.parse({
      id: '',
      name: 'Test',
      category: 'brainwave',
      frequency: 440,
    })).toThrow();
  });

  it('should handle optional fields', () => {
    const preset = {
      id: 'test',
      name: 'Test',
      category: 'solfeggio' as const,
      frequency: 528,
      description: 'Test preset',
      leftFrequency: 440,
      rightFrequency: 444,
      isBinaural: true,
    };

    const parsed = FrequencyPresetSchema.parse(preset);
    expect(parsed.description).toBe('Test preset');
    expect(parsed.isBinaural).toBe(true);
    expect(parsed.defaultVolume).toBe(0.5); // default value
  });
});

describe('SessionSettingsSchema', () => {
  it('should accept valid session settings', () => {
    const settings = {
      volume: 0.7,
      duration: 600,
      fadeIn: true,
      fadeOut: true,
      fadeInDuration: 5,
      fadeOutDuration: 5,
    };

    expect(SessionSettingsSchema.parse(settings)).toMatchObject(settings);
  });

  it('should apply defaults', () => {
    const minimal = {
      volume: 0.5,
      duration: 300,
    };

    const parsed = SessionSettingsSchema.parse(minimal);
    expect(parsed.fadeIn).toBe(true);
    expect(parsed.fadeOut).toBe(true);
    expect(parsed.fadeInDuration).toBe(3);
    expect(parsed.fadeOutDuration).toBe(3);
  });
});

describe('AudioSessionStateSchema', () => {
  it('should accept valid states', () => {
    expect(AudioSessionStateSchema.parse('idle')).toBe('idle');
    expect(AudioSessionStateSchema.parse('playing')).toBe('playing');
    expect(AudioSessionStateSchema.parse('error')).toBe('error');
  });

  it('should reject invalid states', () => {
    expect(() => AudioSessionStateSchema.parse('invalid')).toThrow();
    expect(() => AudioSessionStateSchema.parse('')).toThrow();
  });
});

describe('UserSettingsSchema', () => {
  it('should accept valid user settings', () => {
    const settings = {
      preferences: {
        defaultVolume: 0.6,
        defaultDuration: 900,
        autoPlay: true,
        showTimer: false,
        enableNotifications: false,
      },
    };

    const parsed = UserSettingsSchema.parse(settings);
    expect(parsed.preferences.autoPlay).toBe(true);
    expect(parsed.preferences.showTimer).toBe(false);
  });

  it('should apply preference defaults', () => {
    const minimal = {
      preferences: {},
    };

    const parsed = UserSettingsSchema.parse(minimal);
    expect(parsed.preferences.defaultVolume).toBe(0.5);
    expect(parsed.preferences.autoPlay).toBe(false);
    expect(parsed.preferences.showTimer).toBe(true);
  });
});

describe('Validation helper functions', () => {
  describe('validateFrequency', () => {
    it('should validate frequencies correctly', () => {
      expect(validateFrequency(440)).toBe(440);
      expect(() => validateFrequency(-10)).toThrow();
    });
  });

  describe('isValidFrequency', () => {
    it('should return boolean validation results', () => {
      expect(isValidFrequency(440)).toBe(true);
      expect(isValidFrequency(-10)).toBe(false);
      expect(isValidFrequency('invalid')).toBe(false);
    });
  });

  describe('validateSolfeggioFrequency', () => {
    it('should validate solfeggio frequencies', () => {
      expect(validateSolfeggioFrequency(528)).toBe(true);
      expect(validateSolfeggioFrequency(639)).toBe(true);
      expect(validateSolfeggioFrequency(440)).toBe(false);
    });
  });

  describe('validateBrainwaveFrequency', () => {
    it('should validate frequencies within brainwave ranges', () => {
      expect(validateBrainwaveFrequency(2, 'delta')).toBe(true);
      expect(validateBrainwaveFrequency(6, 'theta')).toBe(true);
      expect(validateBrainwaveFrequency(10, 'alpha')).toBe(true);
      expect(validateBrainwaveFrequency(20, 'beta')).toBe(true);
      expect(validateBrainwaveFrequency(40, 'gamma')).toBe(true);
      
      // Invalid ranges
      expect(validateBrainwaveFrequency(10, 'delta')).toBe(false);
      expect(validateBrainwaveFrequency(2, 'gamma')).toBe(false);
    });
  });

  describe('validateBinauralBeat', () => {
    it('should validate binaural beat differences', () => {
      expect(validateBinauralBeat(440, 444)).toBe(true); // 4Hz difference
      expect(validateBinauralBeat(440, 450)).toBe(true); // 10Hz difference
      expect(validateBinauralBeat(440, 480)).toBe(true); // 40Hz difference
      
      // Invalid differences
      expect(validateBinauralBeat(440, 440.2)).toBe(false); // 0.2Hz too small
      expect(validateBinauralBeat(440, 485)).toBe(false); // 45Hz too large
    });
  });
});

describe('Complex validation scenarios', () => {
  it('should validate complete frequency preset with binaural beats', () => {
    const binauralPreset = {
      id: 'binaural-test',
      name: 'Binaural Test',
      category: 'brainwave' as const,
      frequency: 440,
      leftFrequency: 440,
      rightFrequency: 444,
      isBinaural: true,
      brainwaveRange: 'alpha' as const,
    };

    const parsed = FrequencyPresetSchema.parse(binauralPreset);
    expect(parsed.isBinaural).toBe(true);
    expect(parsed.leftFrequency).toBe(440);
    expect(parsed.rightFrequency).toBe(444);

    // Validate binaural beat difference
    if (parsed.leftFrequency && parsed.rightFrequency) {
      expect(validateBinauralBeat(parsed.leftFrequency, parsed.rightFrequency)).toBe(true);
    }
  });

  it('should validate solfeggio preset with proper frequency', () => {
    const solfeggioPreset = {
      id: 'solfeggio-528',
      name: 'Love Frequency',
      category: 'solfeggio' as const,
      frequency: 528,
      description: 'DNA repair frequency',
      benefits: ['healing', 'love', 'transformation'],
    };

    const parsed = FrequencyPresetSchema.parse(solfeggioPreset);
    expect(validateSolfeggioFrequency(parsed.frequency)).toBe(true);
    expect(parsed.benefits).toContain('healing');
  });

  it('should validate user settings with chart preferences', () => {
    const userSettings = {
      preferences: {
        defaultVolume: 0.7,
        defaultDuration: 1200,
        preferredCategory: 'chakra' as const,
      },
      chartPreferences: {
        includeTransits: true,
        usePersonalizedFrequencies: true,
        birthData: {
          date: '1990-01-01',
          time: '12:00',
          location: 'New York, NY',
        },
      },
      audioEngine: {
        sampleRate: 48000,
        enableAnalyzer: true,
        analyzerFFTSize: 4096,
      },
    };

    const parsed = UserSettingsSchema.parse(userSettings);
    expect(parsed.chartPreferences?.includeTransits).toBe(true);
    expect(parsed.audioEngine?.sampleRate).toBe(48000);
  });
});

describe('Error handling validation', () => {
  it('should provide detailed error messages', () => {
    try {
      FrequencyValueSchema.parse(-100);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues.length).toBeGreaterThan(0);
        expect(zodError.issues[0]?.message).toContain('at least 0.1 Hz');
      }
    }

    try {
      VolumeSchema.parse(2);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ message: string }> };
        expect(zodError.issues.length).toBeGreaterThan(0);
        expect(zodError.issues[0]?.message).toContain('between 0 and 1');
      }
    }
  });

  it('should handle multiple validation errors', () => {
    const invalidPreset = {
      id: '', // Invalid: empty string
      name: '', // Invalid: empty string
      category: 'invalid', // Invalid: not in enum
      frequency: -1, // Invalid: negative
    };

    try {
      FrequencyPresetSchema.parse(invalidPreset);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ message: string }> };
        const messages = zodError.issues.map(issue => issue.message);
        expect(messages.length).toBeGreaterThan(1);
      }
    }
  });
});
