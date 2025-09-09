/**
 * Comprehensive Validation Schemas for Audio Engine
 * Following Component Best Practices Checklist:
 * ✅ Type Safety & Validation - Zod schemas for runtime validation
 * ✅ Branded Types - Domain-specific type safety
 * ✅ Error Handling - Descriptive error messages
 */

import { z } from 'zod';

// Branded types for domain safety
export type FrequencyHz = number & { readonly __brand: 'FrequencyHz' };
export type VolumeLevel = number & { readonly __brand: 'VolumeLevel' };
export type DurationSeconds = number & { readonly __brand: 'DurationSeconds' };
export type SampleRate = number & { readonly __brand: 'SampleRate' };

// Core validation schemas
export const FrequencySchema = z
  .number()
  .min(20, 'Frequency must be at least 20 Hz (human hearing range)')
  .max(20000, 'Frequency must not exceed 20,000 Hz (human hearing range)')
  .transform((val) => val as FrequencyHz);

export const VolumeSchema = z
  .number()
  .min(0, 'Volume cannot be negative')
  .max(1, 'Volume cannot exceed 1.0')
  .transform((val) => val as VolumeLevel);

export const DurationSchema = z
  .number()
  .min(0.1, 'Duration must be at least 0.1 seconds')
  .max(3600, 'Duration cannot exceed 1 hour for safety')
  .transform((val) => val as DurationSeconds);

export const SampleRateSchema = z
  .number()
  .refine(
    (rate) => [8000, 16000, 22050, 44100, 48000, 96000].includes(rate),
    'Sample rate must be a standard audio rate (8kHz, 16kHz, 22.05kHz, 44.1kHz, 48kHz, or 96kHz)'
  )
  .transform((val) => val as SampleRate);

// Waveform type validation
export const WaveformTypeSchema = z.enum([
  'sine',
  'square', 
  'triangle',
  'sawtooth',
  'white-noise',
  'pink-noise'
]);

// Audio context latency validation
export const LatencyHintSchema = z.enum(['balanced', 'interactive', 'playback']);

// Spatial position validation (-1 to 1 range)
export const SpatialPositionSchema = z
  .number()
  .min(-1, 'Spatial position must be between -1 and 1')
  .max(1, 'Spatial position must be between -1 and 1');

// Audio Engine Configuration Schema
export const AudioEngineConfigSchema = z.object({
  sampleRate: SampleRateSchema.optional().default(44100 as SampleRate),
  bufferSize: z.number().int().min(128).max(16384).optional().default(4096),
  channels: z.number().int().min(1).max(8).optional().default(2),
  maxOscillators: z.number().int().min(1).max(32).optional().default(8),
  enableSpatialAudio: z.boolean().optional().default(false),
  enableBiometrics: z.boolean().optional().default(false),
  latencyHint: LatencyHintSchema.optional().default('interactive' as const)
}).strict();

// Frequency Transition Schema
export const FrequencyTransitionSchema = z.object({
  type: z.enum(['linear', 'exponential', 'logarithmic', 'instant']),
  duration: DurationSchema,
  easing: z.enum(['ease-in', 'ease-out', 'ease-in-out', 'linear']).optional().default('ease-in-out')
}).strict();

// Session Phase Schema
export const SessionPhaseSchema = z.object({
  id: z.string().min(1, 'Phase ID cannot be empty'),
  duration: DurationSchema,
  frequency: FrequencySchema,
  binauralBeat: FrequencySchema.optional(),
  waveform: WaveformTypeSchema.optional().default('sine'),
  volume: VolumeSchema.optional().default(0.5 as VolumeLevel),
  transition: FrequencyTransitionSchema.optional()
}).strict();

// Spatial Configuration Schema
export const SpatialConfigSchema = z.object({
  enable3D: z.boolean().optional().default(false),
  positionX: SpatialPositionSchema.optional().default(0),
  positionY: SpatialPositionSchema.optional().default(0),
  positionZ: SpatialPositionSchema.optional().default(0),
  orientationX: SpatialPositionSchema.optional().default(0),
  orientationY: SpatialPositionSchema.optional().default(0),
  orientationZ: SpatialPositionSchema.optional().default(-1),
  roomSize: z.number().min(0).max(100).optional().default(10),
  reverbAmount: z.number().min(0).max(1).optional().default(0.3)
}).strict();

// Biometric Data Schema
export const BiometricDataSchema = z.object({
  heartRate: z.number().min(40).max(200).optional(),
  hrv: z.number().min(0).max(1000).optional(),
  stressLevel: z.number().min(0).max(100).optional(),
  breathingRate: z.number().min(5).max(60).optional(),
  timestamp: z.number().int().positive()
}).strict();

// Session Configuration Schema
export const SessionConfigSchema = z.object({
  duration: DurationSchema,
  baseFrequency: FrequencySchema,
  binauralBeat: FrequencySchema.optional(),
  waveform: WaveformTypeSchema.optional().default('sine'),
  volume: VolumeSchema.optional().default(0.5 as VolumeLevel),
  fadeIn: DurationSchema.optional().default(3 as DurationSeconds),
  fadeOut: DurationSchema.optional().default(3 as DurationSeconds),
  phases: z.array(SessionPhaseSchema).optional(),
  spatial: SpatialConfigSchema.optional(),
  backgroundProcessing: z.boolean().optional().default(false)
}).strict()
.refine(
  (config) => {
    // Validate total phase duration doesn't exceed session duration
    if (config.phases) {
      const totalPhaseDuration = config.phases.reduce((sum, phase) => sum + phase.duration, 0);
      return totalPhaseDuration <= config.duration;
    }
    return true;
  },
  {
    message: 'Total phase duration cannot exceed session duration',
    path: ['phases']
  }
);

// Audio Engine State Schema
export const AudioEngineStateSchema = z.object({
  state: z.enum(['idle', 'initializing', 'playing', 'paused', 'stopping', 'error']),
  currentSession: SessionConfigSchema.optional(),
  currentPhase: z.number().int().min(0).optional(),
  progress: z.number().min(0).max(1),
  currentFrequency: FrequencySchema,
  currentVolume: VolumeSchema,
  audioContextState: z.enum(['suspended', 'running', 'closed']),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    timestamp: z.number().int(),
    recoverable: z.boolean()
  }).optional(),
  biometrics: BiometricDataSchema.optional()
}).strict();

// Engine Error Schema
export const AudioEngineErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.unknown().optional(),
  timestamp: z.number().int().positive(),
  recoverable: z.boolean()
}).strict();

// Audio Node Configuration Schema
export const AudioNodeConfigSchema = z.object({
  oscillator: z.object({
    type: WaveformTypeSchema,
    frequency: FrequencySchema,
    detune: z.number().min(-1200).max(1200).optional().default(0)
  }),
  gain: z.object({
    value: VolumeSchema,
    maxValue: VolumeSchema.optional().default(1 as VolumeLevel)
  }),
  filter: z.object({
    type: z.enum(['lowpass', 'highpass', 'bandpass', 'notch']).optional(),
    frequency: FrequencySchema.optional(),
    Q: z.number().min(0.0001).max(1000).optional().default(1)
  }).optional(),
  panner: SpatialConfigSchema.optional()
}).strict();

// Session Metrics Schema
export const SessionMetricsSchema = z.object({
  startTime: z.number().int().positive(),
  endTime: z.number().int().positive().optional(),
  durationPlayed: DurationSchema,
  averageFrequency: FrequencySchema,
  frequencyRange: z.tuple([FrequencySchema, FrequencySchema]),
  volumeAdjustments: z.number().int().min(0),
  interruptions: z.number().int().min(0),
  audioQuality: z.object({
    dropouts: z.number().int().min(0),
    averageLatency: z.number().min(0),
    cpuUsage: z.number().min(0).max(100)
  })
}).strict();

// Validation helper functions
export const validateFrequency = (freq: number): FrequencyHz => {
  return FrequencySchema.parse(freq);
};

export const validateVolume = (vol: number): VolumeLevel => {
  return VolumeSchema.parse(vol);
};

export const validateDuration = (dur: number): DurationSeconds => {
  return DurationSchema.parse(dur);
};

export const validateSessionConfig = (config: unknown) => {
  return SessionConfigSchema.parse(config);
};

export const validateAudioEngineConfig = (config: unknown) => {
  return AudioEngineConfigSchema.parse(config);
};

// Type inference for validated schemas
export type ValidatedAudioEngineConfig = z.infer<typeof AudioEngineConfigSchema>;
export type ValidatedSessionConfig = z.infer<typeof SessionConfigSchema>;
export type ValidatedAudioEngineState = z.infer<typeof AudioEngineStateSchema>;
export type ValidatedBiometricData = z.infer<typeof BiometricDataSchema>;
export type ValidatedSpatialConfig = z.infer<typeof SpatialConfigSchema>;
export type ValidatedSessionPhase = z.infer<typeof SessionPhaseSchema>;
export type ValidatedFrequencyTransition = z.infer<typeof FrequencyTransitionSchema>;
export type ValidatedAudioNodeConfig = z.infer<typeof AudioNodeConfigSchema>;
export type ValidatedSessionMetrics = z.infer<typeof SessionMetricsSchema>;
