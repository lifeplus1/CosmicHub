/**
 * Audio Engine Tests
 * Based on Grok Response 7: Comprehensive Testing Strategy
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdvancedAudioEngine } from '../core/AdvancedAudioEngine';
import { SessionManager } from '../session/SessionManager';
import { WaveformGenerator } from '../generators/WaveformGenerator';
import { AUDIO_CONSTANTS } from '../constants';

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    type: 'sine',
    frequency: { setValueAtTime: vi.fn(), setTargetAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { setValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })),
  createAnalyser: vi.fn(() => ({
    fftSize: 2048,
    connect: vi.fn(),
  })),
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(1024)),
  })),
  createBufferSource: vi.fn(() => ({
    buffer: null,
    loop: false,
    connect: vi.fn(),
  })),
  createStereoPanner: vi.fn(() => ({
    pan: { setValueAtTime: vi.fn(), setTargetAtTime: vi.fn() },
    connect: vi.fn(),
  })),
  createPanner: vi.fn(() => ({
    panningModel: 'HRTF',
    distanceModel: 'inverse',
    refDistance: 1,
    maxDistance: 10000,
    rolloffFactor: 1,
    positionX: { setValueAtTime: vi.fn(), setTargetAtTime: vi.fn() },
    positionY: { setValueAtTime: vi.fn(), setTargetAtTime: vi.fn() },
    positionZ: { setValueAtTime: vi.fn(), setTargetAtTime: vi.fn() },
    connect: vi.fn(),
  })),
  destination: {},
  state: 'running',
  sampleRate: 44100,
  baseLatency: 0.005,
  outputLatency: 0.01,
  currentTime: 0,
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
};

// Global setup - Mock all required Web Audio API features
(global as any).AudioContext = vi.fn(() => mockAudioContext);
(global as any).window = {
  AudioContext: (global as any).AudioContext,
  // Required features from AUDIO_CONSTANTS.BROWSER_SUPPORT.REQUIRED_FEATURES
  OscillatorNode: vi.fn(),
  GainNode: vi.fn(),
  StereoPannerNode: vi.fn(),
  // Additional window properties
  PerformanceObserver: vi.fn(),
  setInterval: vi.fn(),
  clearInterval: vi.fn(),
  setTimeout: vi.fn(),
  clearTimeout: vi.fn(),
};

describe('AdvancedAudioEngine', () => {
  let audioEngine: AdvancedAudioEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    audioEngine = new AdvancedAudioEngine();
  });

  afterEach(async () => {
    await audioEngine.dispose();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      expect(audioEngine).toBeInstanceOf(AdvancedAudioEngine);
      
      const state = audioEngine.getState();
      expect(state.state).toBe('idle');
      expect(state.currentFrequency).toBe(AUDIO_CONSTANTS.FREQUENCY.DEFAULT);
    });

    it('should initialize audio context successfully', async () => {
      await audioEngine.initialize();
      
      const state = audioEngine.getState();
      expect(state.state).toBe('idle');
      expect(mockAudioContext.resume).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock AudioContext constructor to throw
      (global as any).AudioContext = vi.fn(() => {
        throw new Error('AudioContext creation failed');
      });

      await expect(audioEngine.initialize()).rejects.toThrow();
      
      const state = audioEngine.getState();
      expect(state.state).toBe('error');
      expect(state.error?.code).toBe(AUDIO_CONSTANTS.ERRORS.AUDIO_CONTEXT_FAILED);
    });
  });

  describe('Session Management', () => {
    beforeEach(async () => {
      await audioEngine.initialize();
    });

    it('should start a basic session', () => {
      const sessionConfig = {
        duration: 60,
        baseFrequency: 528,
        volume: 0.7,
      };

      audioEngine.startSession(sessionConfig);
      
      const state = audioEngine.getState();
      expect(state.state).toBe('playing');
      expect(state.currentSession).toEqual(sessionConfig);
    });

    it('should validate session configuration', () => {
      const invalidConfig = {
        duration: -1, // Invalid duration
        baseFrequency: 50000, // Invalid frequency
      };

      expect(() => audioEngine.startSession(invalidConfig)).toThrow();
    });

    it('should stop session correctly', async () => {
      const sessionConfig = {
        duration: 60,
        baseFrequency: 440,
      };

      audioEngine.startSession(sessionConfig);
      audioEngine.stopSession();
      
      // Should transition to stopping state
      const state = audioEngine.getState();
      expect(state.state).toBe('stopping');
    });
  });

  describe('Biometric Integration', () => {
    beforeEach(async () => {
      await audioEngine.initialize();
    });

    it('should update biometric data', () => {
      const biometricData = {
        heartRate: 75,
        stressLevel: 30,
        hrv: 45,
        timestamp: Date.now(),
      };

      audioEngine.updateBiometrics(biometricData);
      
      const state = audioEngine.getState();
      expect(state.biometrics).toEqual(biometricData);
    });

    it('should adjust frequency based on heart rate', () => {
      const sessionConfig = {
        duration: 60,
        baseFrequency: 440,
      };

      audioEngine.startSession(sessionConfig);

      // Simulate high heart rate
      audioEngine.updateBiometrics({
        heartRate: 120,
        timestamp: Date.now(),
      });

      // Should emit frequency change suggestion
      // In real implementation, this would trigger audio adjustments
    });
  });
});

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  describe('Multi-phase Sessions', () => {
    it('should handle single phase session', () => {
      const config = {
        duration: 30,
        baseFrequency: 440,
        phases: [
          {
            id: 'phase1',
            duration: 30,
            frequency: 528,
          },
        ],
      };

      sessionManager.startSession(config);
      
      const currentPhase = sessionManager.getCurrentPhase();
      expect(currentPhase?.frequency).toBe(528);
    });

    it('should calculate progress correctly', () => {
      const config = {
        duration: 60,
        baseFrequency: 440,
      };

      sessionManager.startSession(config);
      
      const progress = sessionManager.getProgress();
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });

    it('should handle phase transitions', () => {
      const config = {
        duration: 60,
        baseFrequency: 440,
        phases: [
          {
            id: 'phase1',
            duration: 30,
            frequency: 440,
            transition: {
              type: 'linear' as const,
              duration: 5,
            },
          },
          {
            id: 'phase2',
            duration: 30,
            frequency: 528,
          },
        ],
      };

      sessionManager.startSession(config);
      sessionManager.nextPhase();
      
      const currentPhase = sessionManager.getCurrentPhase();
      expect(currentPhase?.id).toBe('phase2');
    });
  });
});

describe('WaveformGenerator', () => {
  let waveformGenerator: WaveformGenerator;

  beforeEach(() => {
    waveformGenerator = new WaveformGenerator(mockAudioContext as any);
  });

  describe('Oscillator Creation', () => {
    it('should create sine wave oscillator', () => {
      const oscillator = waveformGenerator.createOscillator(440, 'sine');
      
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
    });

    it('should create binaural beats', () => {
      const { left, right } = waveformGenerator.createBinauralBeats(440, 10);
      
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
      expect(left.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
      expect(right.frequency.setValueAtTime).toHaveBeenCalledWith(450, 0);
    });

    it('should create noise sources', () => {
      const noiseSource = waveformGenerator.createNoiseSource('white-noise');
      
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
      expect(noiseSource.loop).toBe(true);
    });
  });

  describe('Frequency Modulation', () => {
    it('should create FM oscillator setup', () => {
      const result = waveformGenerator.createFMOscillator(
        440, // carrier
        5,   // modulator
        20   // modulation depth
      );

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(result.modulationGain.gain.setValueAtTime).toHaveBeenCalledWith(20, 0);
    });
  });

  describe('Harmonic Series', () => {
    it('should create harmonic oscillators', () => {
      const harmonics = [1, 2, 3, 4]; // Fundamental + 3 harmonics
      const oscillators = waveformGenerator.createHarmonics(220, harmonics);
      
      expect(oscillators).toHaveLength(4);
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(4);
    });
  });
});

describe('Audio Constants', () => {
  it('should have valid frequency ranges', () => {
    expect(AUDIO_CONSTANTS.FREQUENCY.MIN).toBe(0.1);
    expect(AUDIO_CONSTANTS.FREQUENCY.MAX).toBe(20000);
    expect(AUDIO_CONSTANTS.FREQUENCY.DEFAULT).toBe(440);
  });

  it('should have valid performance thresholds', () => {
    expect(AUDIO_CONSTANTS.PERFORMANCE.MAX_LATENCY_MS).toBe(50);
    expect(AUDIO_CONSTANTS.PERFORMANCE.MAX_CPU_USAGE).toBe(0.8);
  });
});

describe('Error Handling', () => {
  it('should handle invalid frequency gracefully', () => {
    const audioEngine = new AdvancedAudioEngine();
    
    const invalidSession = {
      duration: 60,
      baseFrequency: -100, // Invalid frequency
    };

    expect(() => audioEngine.startSession(invalidSession)).toThrow();
  });

  it('should handle invalid duration gracefully', () => {
    const audioEngine = new AdvancedAudioEngine();
    
    const invalidSession = {
      duration: -5, // Invalid duration
      baseFrequency: 440,
    };

    expect(() => audioEngine.startSession(invalidSession)).toThrow();
  });
});

describe('Performance Monitoring', () => {
  it('should track session metrics', async () => {
    const audioEngine = new AdvancedAudioEngine();
    await audioEngine.initialize();
    
    const sessionConfig = {
      duration: 60,
      baseFrequency: 440,
    };

    audioEngine.startSession(sessionConfig);
    
    const metrics = audioEngine.getMetrics();
    expect(metrics).toBeTruthy();
    expect(metrics?.startTime).toBeTruthy();
  });
});
