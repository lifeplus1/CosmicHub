/**
 * Enhanced Frequency Generator Component Schemas
 * Following CosmicHub Type Validation Strategy
 */

import { z } from 'zod';
import { ValidatedFrequencyData } from './frequencySchemas';

// Component props schema
export const EnhancedFrequencyGeneratorPropsSchema = z.object({
  className: z.string().optional(),
  initialFrequency: z.number().positive().default(528),
  showVisualization: z.boolean().default(true),
  realTimeUpdates: z.boolean().default(true),
  onFrequencyChange: z.function().optional(),
  onPresetSelect: z.function().optional(),
  onVolumeChange: z.function().optional(),
  onDurationChange: z.function().optional(),
  onPlayStateChange: z.function().optional(),
});

// Component state schemas
export const AudioEngineStateSchema = z.object({
  isPlaying: z.boolean(),
  currentFrequency: z.number().positive(),
  volume: z.number().min(0).max(1),
  duration: z.number().positive(),
  binauralEnabled: z.boolean(),
  binauralBeat: z.number().min(0).max(40),
});

export const VisualizationStateSchema = z.object({
  showSacredGeometry: z.boolean(),
  showVisualization: z.boolean(),
  visualizationData: z.array(z.custom<ValidatedFrequencyData>()),
  geometryPattern: z.any().optional(), // GeometryPattern from sacredGeometry
});

export const PresetStateSchema = z.object({
  selectedPreset: z.custom<ValidatedFrequencyData>().nullable(),
  categoryFilter: z.enum([
    'all', 'solfeggio', 'chakra', 'brainwave', 'planetary',
    'rife', 'sacred_geometry', 'binaural', 'biological',
    'elemental', 'stellar', 'metallic', 'other'
  ]),
  customPresets: z.array(z.custom<ValidatedFrequencyData>()),
  presetName: z.string(),
  showPresetCreator: z.boolean(),
});

export const UIStateSchema = z.object({
  activeTab: z.enum(['frequencies', 'chakras', 'custom']),
  selectedChakra: z.string().nullable(),
  inView: z.boolean(),
});

// Combined component state schema
export const EnhancedFrequencyGeneratorStateSchema = z.object({
  audio: AudioEngineStateSchema,
  visualization: VisualizationStateSchema,
  presets: PresetStateSchema,
  ui: UIStateSchema,
});

// Audio engine configuration for component
export const ComponentAudioConfigSchema = z.object({
  fadeIn: z.number().positive().default(2),
  fadeOut: z.number().positive().default(2),
  volumeMultiplier: z.number().positive().default(100),
});

// Validation functions
export const validateComponentProps = (props: unknown) => {
  return EnhancedFrequencyGeneratorPropsSchema.parse(props);
};

export const validateComponentState = (state: unknown) => {
  return EnhancedFrequencyGeneratorStateSchema.parse(state);
};

export const safeValidateComponentProps = (props: unknown) => {
  return EnhancedFrequencyGeneratorPropsSchema.safeParse(props);
};

export const safeValidateComponentState = (state: unknown) => {
  return EnhancedFrequencyGeneratorStateSchema.safeParse(state);
};

// Type exports
export type EnhancedFrequencyGeneratorProps = z.infer<typeof EnhancedFrequencyGeneratorPropsSchema>;
export type AudioEngineState = z.infer<typeof AudioEngineStateSchema>;
export type VisualizationState = z.infer<typeof VisualizationStateSchema>;
export type PresetState = z.infer<typeof PresetStateSchema>;
export type UIState = z.infer<typeof UIStateSchema>;
export type EnhancedFrequencyGeneratorState = z.infer<typeof EnhancedFrequencyGeneratorStateSchema>;
export type ComponentAudioConfig = z.infer<typeof ComponentAudioConfigSchema>;
