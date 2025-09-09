/**
 * Advanced Audio Engine Package
 * 
 * Based on Grok Consultation Response 1:
 * Production-ready audio system with comprehensive Web Audio API implementation
 */

export { AdvancedAudioEngine } from './core/AdvancedAudioEngine';
export { SessionManager } from './session/SessionManager';
export { WaveformGenerator } from './generators/WaveformGenerator';
export { SpatialAudioProcessor } from './spatial/SpatialAudioProcessor';
export { BiometricIntegration } from './biometric/BiometricIntegration';
export { BackgroundProcessor } from './background/BackgroundProcessor';

// Types
export type {
  AudioEngineConfig,
  SessionConfig,
  WaveformType,
  SpatialConfig,
  BiometricData,
  AudioEngineState,
  SessionPhase,
  FrequencyTransition
} from './types';

// Constants
export { AUDIO_CONSTANTS } from './constants';
