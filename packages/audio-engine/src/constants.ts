/**
 * Audio Engine Constants
 * Based on Grok Response 1 - Performance optimization and Web Audio API best practices
 */

export const AUDIO_CONSTANTS = {
  /** Default audio configuration */
  DEFAULT_CONFIG: {
    sampleRate: 44100,
    bufferSize: 4096,
    channels: 2,
    maxOscillators: 8,
    latencyHint: 'interactive' as AudioContextLatencyCategory,
  },

  /** Frequency limits */
  FREQUENCY: {
    MIN: 0.1,
    MAX: 20000,
    DEFAULT: 440,
    BINAURAL_MIN: 0.5,
    BINAURAL_MAX: 100,
  },

  /** Volume limits */
  VOLUME: {
    MIN: 0,
    MAX: 1,
    DEFAULT: 0.5,
    FADE_STEP: 0.01,
  },

  /** Session limits */
  SESSION: {
    MIN_DURATION: 1, // 1 second
    MAX_DURATION: 7200, // 2 hours
    DEFAULT_DURATION: 600, // 10 minutes
    MAX_PHASES: 20,
    MIN_PHASE_DURATION: 1,
  },

  /** Performance thresholds */
  PERFORMANCE: {
    MAX_LATENCY_MS: 50,
    MAX_CPU_USAGE: 0.8,
    MAX_MEMORY_MB: 100,
    QUALITY_CHECK_INTERVAL: 1000,
  },

  /** Audio processing */
  PROCESSING: {
    FADE_TIME: 0.01, // 10ms fade to prevent clicks
    FREQUENCY_SMOOTHING: 0.01, // Smoothing for frequency changes
    VOLUME_SMOOTHING: 0.1, // Smoothing for volume changes
    SPATIAL_UPDATE_RATE: 60, // Updates per second for spatial audio
  },

  /** Biometric integration */
  BIOMETRICS: {
    HEART_RATE_MIN: 40,
    HEART_RATE_MAX: 200,
    HRV_MIN: 10,
    HRV_MAX: 300,
    STRESS_MIN: 0,
    STRESS_MAX: 100,
    UPDATE_INTERVAL: 5000, // 5 seconds
  },

  /** Error codes */
  ERRORS: {
    AUDIO_CONTEXT_FAILED: 'AUDIO_CONTEXT_FAILED',
    INVALID_FREQUENCY: 'INVALID_FREQUENCY',
    INVALID_DURATION: 'INVALID_DURATION',
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    BIOMETRIC_CONNECTION_FAILED: 'BIOMETRIC_CONNECTION_FAILED',
    SPATIAL_AUDIO_NOT_SUPPORTED: 'SPATIAL_AUDIO_NOT_SUPPORTED',
    PERFORMANCE_DEGRADED: 'PERFORMANCE_DEGRADED',
    OSCILLATOR_LIMIT_REACHED: 'OSCILLATOR_LIMIT_REACHED',
  },

  /** Browser compatibility */
  BROWSER_SUPPORT: {
    REQUIRED_FEATURES: [
      'AudioContext',
      'OscillatorNode',
      'GainNode',
      'StereoPannerNode',
    ],
    OPTIONAL_FEATURES: [
      'PannerNode',
      'ConvolverNode',
      'AnalyserNode',
      'AudioWorklet',
    ],
  },

  /** Waveform lookup tables */
  WAVEFORMS: {
    SINE: 'sine',
    SQUARE: 'square',
    TRIANGLE: 'triangle',
    SAWTOOTH: 'sawtooth',
  } as const,

  /** Spatial audio constants */
  SPATIAL: {
    MAX_DISTANCE: 10000,
    REF_DISTANCE: 1,
    ROLLOFF_FACTOR: 1,
    CONE_INNER_ANGLE: 360,
    CONE_OUTER_ANGLE: 0,
    CONE_OUTER_GAIN: 0,
    DEFAULT_ROOM_SIZE: 5,
    DEFAULT_REVERB: 0.3,
  },
} as const;
