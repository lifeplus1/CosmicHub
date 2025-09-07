/**
 * Frequency Domain Validation Schemas
 * Following CosmicHub Type Safety & Validation Strategy
 */

import { z } from 'zod';

// Core frequency validation
export const FrequencyValueSchema = z
  .number()
  .min(0.1, 'Frequency must be at least 0.1 Hz')
  .max(20000, 'Frequency must be below 20,000 Hz (human hearing range)')
  .finite('Frequency must be a finite number');

export const VolumeSchema = z
  .number()
  .min(0, 'Volume must be between 0 and 1')
  .max(1, 'Volume must be between 0 and 1');

export const DurationSchema = z
  .number()
  .min(1, 'Duration must be at least 1 second')
  .max(7200, 'Duration must not exceed 2 hours');

// Frequency categories following HealWave domain patterns
export const FrequencyCategorySchema = z.enum([
  'solfeggio',
  'rife',
  'golden',
  'planetary',
  'brainwave',
  'chakra',
  'other',
]);

// Brainwave frequency ranges
export const BrainwaveRangeSchema = z.enum([
  'delta',    // 0.5-4 Hz
  'theta',    // 4-8 Hz
  'alpha',    // 8-14 Hz
  'beta',     // 14-30 Hz
  'gamma',    // 30-100 Hz
]);

// Preset configuration schema
export const FrequencyPresetSchema = z.object({
  id: z.string().min(1, 'Preset ID is required'),
  name: z.string().min(1, 'Preset name is required'),
  description: z.string().optional(),
  category: FrequencyCategorySchema,
  frequency: FrequencyValueSchema,
  leftFrequency: FrequencyValueSchema.optional(),
  rightFrequency: FrequencyValueSchema.optional(),
  isBinaural: z.boolean().default(false),
  defaultVolume: VolumeSchema.default(0.5),
  defaultDuration: DurationSchema.default(300), // 5 minutes
  benefits: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  brainwaveRange: BrainwaveRangeSchema.optional(),
  isBuiltIn: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Session settings schema
export const SessionSettingsSchema = z.object({
  volume: VolumeSchema,
  duration: DurationSchema,
  fadeIn: z.boolean().default(true),
  fadeOut: z.boolean().default(true),
  fadeInDuration: z.number().min(0).max(30).default(3),
  fadeOutDuration: z.number().min(0).max(30).default(3),
});

// Audio session state schema
export const AudioSessionStateSchema = z.enum([
  'idle',
  'loading',
  'playing',
  'paused',
  'stopped',
  'error',
]);

// Audio engine configuration
export const AudioEngineConfigSchema = z.object({
  sampleRate: z.number().positive().default(44100),
  bufferSize: z.number().positive().default(4096),
  enableAnalyzer: z.boolean().default(false),
  analyzerFFTSize: z.number().positive().default(2048),
});

// Chart preferences (astrology integration)
export const ChartPreferencesSchema = z.object({
  includeTransits: z.boolean().default(false),
  includePlanetaryHours: z.boolean().default(false),
  usePersonalizedFrequencies: z.boolean().default(false),
  birthData: z.object({
    date: z.string().date().optional(),
    time: z.string().optional(),
    location: z.string().optional(),
  }).optional(),
});

// User settings schema
export const UserSettingsSchema = z.object({
  preferences: z.object({
    defaultVolume: VolumeSchema.default(0.5),
    defaultDuration: DurationSchema.default(300),
    autoPlay: z.boolean().default(false),
    showTimer: z.boolean().default(true),
    enableNotifications: z.boolean().default(true),
    preferredCategory: FrequencyCategorySchema.optional(),
  }),
  chartPreferences: ChartPreferencesSchema.optional(),
  audioEngine: AudioEngineConfigSchema.optional(),
});

// API request/response schemas
export const SavePresetRequestSchema = FrequencyPresetSchema.omit({ 
  id: true, 
  isBuiltIn: true, 
  createdAt: true, 
  updatedAt: true 
});

export const UpdatePresetRequestSchema = FrequencyPresetSchema.partial().extend({
  id: z.string().min(1, 'Preset ID is required'),
});

export const GetPresetsResponseSchema = z.object({
  presets: z.array(FrequencyPresetSchema),
  total: z.number().nonnegative(),
  page: z.number().positive().optional(),
  limit: z.number().positive().optional(),
});

export const FrequencyAnalysisSchema = z.object({
  frequency: FrequencyValueSchema,
  amplitude: z.number().min(0).max(1),
  phase: z.number().min(0).max(2 * Math.PI),
  harmonics: z.array(z.object({
    frequency: FrequencyValueSchema,
    amplitude: z.number().min(0).max(1),
  })).optional(),
});

// Error schemas
export const AudioErrorSchema = z.object({
  code: z.enum([
    'AUDIO_CONTEXT_ERROR',
    'OSCILLATOR_ERROR',
    'GAIN_ERROR',
    'PLAYBACK_ERROR',
    'PERMISSION_DENIED',
    'HARDWARE_ERROR',
  ]),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

// Type exports for TypeScript
export type FrequencyValue = z.infer<typeof FrequencyValueSchema>;
export type Volume = z.infer<typeof VolumeSchema>;
export type Duration = z.infer<typeof DurationSchema>;
export type FrequencyCategory = z.infer<typeof FrequencyCategorySchema>;
export type BrainwaveRange = z.infer<typeof BrainwaveRangeSchema>;
export type FrequencyPreset = z.infer<typeof FrequencyPresetSchema>;
export type SessionSettings = z.infer<typeof SessionSettingsSchema>;
export type AudioSessionState = z.infer<typeof AudioSessionStateSchema>;
export type AudioEngineConfig = z.infer<typeof AudioEngineConfigSchema>;
export type ChartPreferences = z.infer<typeof ChartPreferencesSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type SavePresetRequest = z.infer<typeof SavePresetRequestSchema>;
export type UpdatePresetRequest = z.infer<typeof UpdatePresetRequestSchema>;
export type GetPresetsResponse = z.infer<typeof GetPresetsResponseSchema>;
export type FrequencyAnalysis = z.infer<typeof FrequencyAnalysisSchema>;
export type AudioError = z.infer<typeof AudioErrorSchema>;

// Validation helper functions
export const validateFrequency = (value: unknown): FrequencyValue => {
  return FrequencyValueSchema.parse(value);
};

export const validatePreset = (preset: unknown): FrequencyPreset => {
  return FrequencyPresetSchema.parse(preset);
};

export const validateSessionSettings = (settings: unknown): SessionSettings => {
  return SessionSettingsSchema.parse(settings);
};

export const isValidFrequency = (value: unknown): value is FrequencyValue => {
  return FrequencyValueSchema.safeParse(value).success;
};

export const isValidPreset = (preset: unknown): preset is FrequencyPreset => {
  return FrequencyPresetSchema.safeParse(preset).success;
};

// Preset validation for specific categories
export const validateSolfeggioFrequency = (frequency: number): boolean => {
  const solfeggioFreqs = [174, 285, 396, 417, 528, 639, 741, 852, 963];
  return solfeggioFreqs.includes(frequency);
};

export const validateBrainwaveFrequency = (frequency: number, range: BrainwaveRange): boolean => {
  const ranges: Record<BrainwaveRange, [number, number]> = {
    delta: [0.5, 4],
    theta: [4, 8],
    alpha: [8, 14],
    beta: [14, 30],
    gamma: [30, 100],
  };
  
  const [min, max] = ranges[range];
  return frequency >= min && frequency <= max;
};

// Binaural beat validation
export const validateBinauralBeat = (leftFreq: number, rightFreq: number): boolean => {
  const difference = Math.abs(leftFreq - rightFreq);
  return difference >= 0.5 && difference <= 40; // Valid binaural beat range
};
