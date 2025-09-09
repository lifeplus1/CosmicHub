/**
 * HealWave Schema Exports
 * Centralized exports following CosmicHub Type Validation Strategy
 */

export * from './frequency.schema';
export * from './enhancedFrequencyGenerator.schema';

// Re-export common validation helpers
export {
  validateFrequency,
  validatePreset,
  validateSessionSettings,
  isValidFrequency,
  isValidPreset,
  validateSolfeggioFrequency,
  validateBrainwaveFrequency,
  validateBinauralBeat,
} from './frequency.schema';

// Re-export enhanced frequency generator validation helpers
export {
  validateComponentProps,
  validateComponentState,
  safeValidateComponentProps,
  safeValidateComponentState,
} from './enhancedFrequencyGenerator.schema';

// Re-export all schema types for easy consumption
export type {
  FrequencyValue,
  Volume,
  Duration,
  FrequencyCategory,
  BrainwaveRange,
  FrequencyPreset,
  SessionSettings,
  AudioSessionState,
  AudioEngineConfig,
  ChartPreferences,
  UserSettings,
  SavePresetRequest,
  UpdatePresetRequest,
  GetPresetsResponse,
  FrequencyAnalysis,
  AudioError,
} from './frequency.schema';

export type {
  EnhancedFrequencyGeneratorProps,
  AudioEngineState,
  VisualizationState,
  PresetState,
  UIState,
  EnhancedFrequencyGeneratorState,
  ComponentAudioConfig,
} from './enhancedFrequencyGenerator.schema';
