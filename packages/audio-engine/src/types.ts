/**
 * Core Audio Engine Types
 * Based on Grok Response 1 - Advanced Audio Engine Architecture
 */

export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'white-noise' | 'pink-noise';

export interface AudioEngineConfig {
  /** Sample rate for audio context */
  sampleRate?: number;
  /** Buffer size for processing */
  bufferSize?: number;
  /** Number of audio channels */
  channels?: number;
  /** Maximum number of simultaneous oscillators */
  maxOscillators?: number;
  /** Enable spatial audio processing */
  enableSpatialAudio?: boolean;
  /** Enable biometric integration */
  enableBiometrics?: boolean;
  /** Audio context latency hint */
  latencyHint?: AudioContextLatencyCategory;
}

export interface SessionConfig {
  /** Session duration in seconds */
  duration: number;
  /** Base frequency in Hz */
  baseFrequency: number;
  /** Optional binaural beat frequency difference */
  binauralBeat?: number;
  /** Waveform type */
  waveform?: WaveformType;
  /** Volume level (0-1) */
  volume?: number;
  /** Fade in duration in seconds */
  fadeIn?: number;
  /** Fade out duration in seconds */
  fadeOut?: number;
  /** Session phases for multi-phase sessions */
  phases?: SessionPhase[];
  /** Spatial audio configuration */
  spatial?: SpatialConfig;
  /** Enable background processing */
  backgroundProcessing?: boolean;
}

export interface SessionPhase {
  /** Phase identifier */
  id: string;
  /** Phase duration in seconds */
  duration: number;
  /** Target frequency for this phase */
  frequency: number;
  /** Optional binaural beat */
  binauralBeat?: number;
  /** Waveform type for this phase */
  waveform?: WaveformType;
  /** Volume for this phase */
  volume?: number;
  /** Transition configuration to next phase */
  transition?: FrequencyTransition;
}

export interface FrequencyTransition {
  /** Transition type */
  type: 'linear' | 'exponential' | 'logarithmic' | 'instant';
  /** Transition duration in seconds */
  duration: number;
  /** Easing function */
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

export interface SpatialConfig {
  /** Enable 3D spatial positioning */
  enable3D?: boolean;
  /** X position (-1 to 1, left to right) */
  positionX?: number;
  /** Y position (-1 to 1, down to up) */
  positionY?: number;
  /** Z position (-1 to 1, back to front) */
  positionZ?: number;
  /** Orientation forward vector */
  orientationX?: number;
  orientationY?: number;
  orientationZ?: number;
  /** Room size for reverb */
  roomSize?: number;
  /** Reverb amount */
  reverbAmount?: number;
}

export interface BiometricData {
  /** Heart rate in beats per minute */
  heartRate?: number;
  /** Heart rate variability in milliseconds */
  hrv?: number;
  /** Stress level (0-100) */
  stressLevel?: number;
  /** Breathing rate in breaths per minute */
  breathingRate?: number;
  /** Timestamp of measurement */
  timestamp: number;
}

export interface AudioEngineState {
  /** Current engine state */
  state: 'idle' | 'initializing' | 'playing' | 'paused' | 'stopping' | 'error';
  /** Current session configuration */
  currentSession?: SessionConfig;
  /** Current phase index */
  currentPhase?: number;
  /** Playback progress (0-1) */
  progress: number;
  /** Current frequency being played */
  currentFrequency: number;
  /** Current volume */
  currentVolume: number;
  /** Audio context state */
  audioContextState: AudioContextState;
  /** Error information if any */
  error?: AudioEngineError;
  /** Biometric data if available */
  biometrics?: BiometricData;
}

export interface AudioEngineError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Technical details */
  details?: unknown;
  /** Timestamp of error */
  timestamp: number;
  /** Whether error is recoverable */
  recoverable: boolean;
}

export interface AudioNode {
  /** Oscillator node */
  oscillator: OscillatorNode;
  /** Gain node for volume control */
  gainNode: GainNode;
  /** Panner node for spatial audio */
  pannerNode?: PannerNode;
  /** Filter node for frequency shaping */
  filterNode?: BiquadFilterNode;
}

export interface SessionMetrics {
  /** Session start time */
  startTime: number;
  /** Session end time */
  endTime?: number;
  /** Total duration played */
  durationPlayed: number;
  /** Average frequency */
  averageFrequency: number;
  /** Frequency range */
  frequencyRange: [number, number];
  /** Volume adjustments made */
  volumeAdjustments: number;
  /** Interruptions during session */
  interruptions: number;
  /** Quality metrics */
  audioQuality: {
    /** Audio dropouts detected */
    dropouts: number;
    /** Average latency in ms */
    averageLatency: number;
    /** CPU usage percentage */
    cpuUsage: number;
  };
}

export type AudioEngineEventType = 
  | 'stateChange'
  | 'phaseChange' 
  | 'frequencyChange'
  | 'volumeChange'
  | 'error'
  | 'sessionStart'
  | 'sessionComplete'
  | 'biometricUpdate'
  | 'qualityChange';

export interface AudioEngineEvent<T = unknown> {
  type: AudioEngineEventType;
  data: T;
  timestamp: number;
}
