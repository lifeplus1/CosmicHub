// Simple logger for frequency package
const logger = {
  warn: (message: string, error?: unknown) => {
    console.warn('[FrequencyEngine]', message, error ?? '');
  },
  error: (message: string, error?: unknown) => {
    console.error('[FrequencyEngine]', message, error ?? '');
  },
  info: (message: string) => {
    console.info('[FrequencyEngine]', message);
  },
};

/**
 * @fileoverview Shared frequency generation and audio processing utilities
 * Used by both HealWave (standalone) and Astro (astrology-enhanced)
 * @version 1.0.0
 * @author CosmicHub Team
 */

export interface FrequencyPreset {
  readonly id: string;
  readonly name: string;
  readonly category:
    | 'solfeggio'
    | 'rife'
    | 'brainwave'
    | 'planetary'
    | 'chakra'
    | 'custom';
  readonly baseFrequency: number;
  readonly binauralBeat?: number;
  readonly description?: string;
  readonly benefits?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface AudioSettings {
  readonly volume: number;
  readonly duration: number; // in minutes
  readonly fadeIn: number; // in seconds
  readonly fadeOut: number; // in seconds
}

export interface AudioEngineState {
  readonly isPlaying: boolean;
  readonly currentPreset: FrequencyPreset | null;
  readonly currentSettings: AudioSettings | null;
}

export class AudioEngineError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'AUDIO_ENGINE_ERROR') {
    super(message);
    this.name = 'AudioEngineError';
    this.code = code;
  }
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillatorLeft: OscillatorNode | null = null;
  private oscillatorRight: OscillatorNode | null = null;
  private gainNodeLeft: GainNode | null = null;
  private gainNodeRight: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentPreset: FrequencyPreset | null = null;
  private currentSettings: AudioSettings | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      // Use modern AudioContext constructor with fallback
      interface ExtendedWindow extends Window {
        webkitAudioContext?: typeof AudioContext;
      }
      const win = window as ExtendedWindow;
      const AudioContextClass = window.AudioContext ?? win.webkitAudioContext;
      if (!AudioContextClass) {
        throw new AudioEngineError(
          'AudioContext not supported in this browser',
          'UNSUPPORTED_BROWSER'
        );
      }
      this.audioContext = new AudioContextClass();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new AudioEngineError(
        `Failed to initialize audio context: ${message}`,
        'INITIALIZATION_FAILED'
      );
    }
  }

  public async startFrequency(
    preset: FrequencyPreset,
    settings: AudioSettings
  ): Promise<void> {
    // Check if AudioContext exists and is not closed
    if (!this.audioContext || this.audioContext.state === 'closed') {
      logger.warn('AudioContext is closed or null, reinitializing...');
      try {
        this.initializeAudioContext();
      } catch {
        throw new AudioEngineError(
          'Failed to reinitialize audio context',
          'REINITIALIZATION_FAILED'
        );
      }
    }

    if (!this.audioContext) {
      throw new AudioEngineError(
        'Audio context not available after initialization',
        'CONTEXT_UNAVAILABLE'
      );
    }

    // Validate inputs with modern TypeScript assertion
    this.validatePreset(preset);
    this.validateSettings(settings);

    // Handle suspended state - this is common with user interaction requirements
    if (this.audioContext.state === 'suspended') {
      logger.info('AudioContext is suspended, attempting to resume...');
      try {
        await this.audioContext.resume();
        logger.info('AudioContext resumed successfully');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        throw new AudioEngineError(
          `Failed to resume audio context: ${message}. This may require user interaction.`,
          'RESUME_FAILED'
        );
      }
    }

    // Ensure AudioContext is in running state before proceeding
    if (this.audioContext.state !== 'running') {
      throw new AudioEngineError(
        `AudioContext is in "${this.audioContext.state}" state. Audio requires user interaction to activate.`,
        'CONTEXT_NOT_RUNNING'
      );
    }

    this.stopFrequency();

    const { baseFrequency, binauralBeat = 0 } = preset;
    const leftFreq = baseFrequency;
    const rightFreq = baseFrequency + binauralBeat;

    try {
      // Create stereo setup with modern Web Audio API
      this.oscillatorLeft = this.audioContext.createOscillator();
      this.oscillatorRight = this.audioContext.createOscillator();
      this.gainNodeLeft = this.audioContext.createGain();
      this.gainNodeRight = this.audioContext.createGain();

      // Create stereo panner for proper left/right separation
      const pannerLeft = this.audioContext.createStereoPanner();
      const pannerRight = this.audioContext.createStereoPanner();
      pannerLeft.pan.setValueAtTime(-1, this.audioContext.currentTime); // Full left
      pannerRight.pan.setValueAtTime(1, this.audioContext.currentTime); // Full right

      // Set frequencies with exponential ramp for smooth transition
      this.oscillatorLeft.frequency.setValueAtTime(
        leftFreq,
        this.audioContext.currentTime
      );
      this.oscillatorRight.frequency.setValueAtTime(
        rightFreq,
        this.audioContext.currentTime
      );

      // Use sine wave for pure tones (best for binaural beats)
      this.oscillatorLeft.type = 'sine';
      this.oscillatorRight.type = 'sine';

      // Connect audio graph: Oscillator -> Gain -> Panner -> Destination
      this.oscillatorLeft.connect(this.gainNodeLeft);
      this.gainNodeLeft.connect(pannerLeft);
      pannerLeft.connect(this.audioContext.destination);

      this.oscillatorRight.connect(this.gainNodeRight);
      this.gainNodeRight.connect(pannerRight);
      pannerRight.connect(this.audioContext.destination);

      // Apply smooth fade-in with exponential volume curve
      const volume = Math.max(0, Math.min(settings.volume / 100, 1));
      const currentTime = this.audioContext.currentTime;

      this.gainNodeLeft.gain.setValueAtTime(0.001, currentTime); // Start near zero to avoid clicks
      this.gainNodeRight.gain.setValueAtTime(0.001, currentTime);

      this.gainNodeLeft.gain.exponentialRampToValueAtTime(
        volume,
        currentTime + settings.fadeIn
      );
      this.gainNodeRight.gain.exponentialRampToValueAtTime(
        volume,
        currentTime + settings.fadeIn
      );

      // Start oscillators
      this.oscillatorLeft.start();
      this.oscillatorRight.start();

      // Schedule stop with fade-out if duration is specified
      if (settings.duration > 0) {
        const stopTime = currentTime + Math.max(settings.duration * 60, 0.01); // Ensure at least 10ms in the future
        const fadeOutStart = stopTime - settings.fadeOut;

        this.gainNodeLeft.gain.exponentialRampToValueAtTime(
          0.001,
          fadeOutStart + settings.fadeOut
        );
        this.gainNodeRight.gain.exponentialRampToValueAtTime(
          0.001,
          fadeOutStart + settings.fadeOut
        );

        this.oscillatorLeft.stop(stopTime);
        this.oscillatorRight.stop(stopTime);
      }

      // Listen for ended event to reset the started flag when scheduled stop occurs
      const handleEnded = () => {
        // Oscillator has ended, no action needed as cleanup will handle it
      };
      this.oscillatorLeft.addEventListener('ended', handleEnded);
      this.oscillatorRight.addEventListener('ended', handleEnded);

      this.isPlaying = true;
      this.currentPreset = preset;
      this.currentSettings = settings;
    } catch (error) {
      this.cleanup();
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new AudioEngineError(
        `Failed to start frequency: ${message}`,
        'START_FAILED'
      );
    }
  }

  public stopFrequency(): void {
    this.cleanup();
    this.isPlaying = false;
    this.currentPreset = null;
    this.currentSettings = null;
  }

  private cleanup(): void {
    try {
      if (this.oscillatorLeft) {
        try {
          this.oscillatorLeft.stop();
        } catch (error) {
          // Ignore errors when stopping oscillators that weren't started or already stopped
          logger.warn('Error stopping left oscillator (expected if not started or already stopped):', error);
        }
        try {
          this.oscillatorLeft.disconnect();
        } catch (error) {
          // Ignore errors when disconnecting
          logger.warn('Error disconnecting left oscillator:', error);
        }
        this.oscillatorLeft = null;
      }
      if (this.oscillatorRight) {
        try {
          this.oscillatorRight.stop();
        } catch (error) {
          // Ignore errors when stopping oscillators that weren't started or already stopped
          logger.warn('Error stopping right oscillator (expected if not started or already stopped):', error);
        }
        try {
          this.oscillatorRight.disconnect();
        } catch (error) {
          // Ignore errors when disconnecting
          logger.warn('Error disconnecting right oscillator:', error);
        }
        this.oscillatorRight = null;
      }
      if (this.gainNodeLeft) {
        try {
          this.gainNodeLeft.disconnect();
        } catch (error) {
          logger.warn('Error disconnecting left gain node:', error);
        }
        this.gainNodeLeft = null;
      }
      if (this.gainNodeRight) {
        try {
          this.gainNodeRight.disconnect();
        } catch (error) {
          logger.warn('Error disconnecting right gain node:', error);
        }
        this.gainNodeRight = null;
      }
      
      // No need to set oscillatorsStarted since we removed that property
    } catch (error) {
      // Ignore cleanup errors, but log them
      logger.warn('Error during audio cleanup:', error);
    }
  }

  public getState(): AudioEngineState {
    return {
      isPlaying: this.isPlaying,
      currentPreset: this.currentPreset,
      currentSettings: this.currentSettings,
    };
  }

  public async setVolume(volume: number): Promise<void> {
    if (!this.gainNodeLeft || !this.gainNodeRight || !this.audioContext) {
      throw new AudioEngineError(
        'Audio nodes not initialized',
        'NODES_NOT_INITIALIZED'
      );
    }

    try {
      // Ensure at least one awaited operation to satisfy require-await rule while preserving async API surface
      await Promise.resolve();
      const normalizedVolume = Math.max(0.001, Math.min(volume / 100, 1)); // Avoid zero for exponential ramp
      const currentTime = this.audioContext.currentTime;

      this.gainNodeLeft.gain.exponentialRampToValueAtTime(
        normalizedVolume,
        currentTime + 0.1
      );
      this.gainNodeRight.gain.exponentialRampToValueAtTime(
        normalizedVolume,
        currentTime + 0.1
      );

      // Update current settings
      if (this.currentSettings) {
        this.currentSettings = { ...this.currentSettings, volume };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new AudioEngineError(
        `Volume adjustment failed: ${message}`,
        'VOLUME_FAILED'
      );
    }
  }

  private validatePreset(
    preset: FrequencyPreset
  ): asserts preset is FrequencyPreset {
    if (!preset.id || typeof preset.id !== 'string') {
      throw new AudioEngineError(
        'Invalid preset: missing or invalid ID',
        'INVALID_PRESET'
      );
    }
    if (
      !preset.baseFrequency ||
      preset.baseFrequency < 1 ||
      preset.baseFrequency > 20000
    ) {
      throw new AudioEngineError(
        'Invalid preset: frequency must be between 1-20000 Hz',
        'INVALID_FREQUENCY'
      );
    }
    if (
      preset.binauralBeat !== undefined &&
      (preset.binauralBeat < 0 || preset.binauralBeat > 100)
    ) {
      throw new AudioEngineError(
        'Invalid preset: binaural beat must be between 0-100 Hz',
        'INVALID_BINAURAL'
      );
    }
  }

  private validateSettings(
    settings: AudioSettings
  ): asserts settings is AudioSettings {
    if (settings.volume < 0 || settings.volume > 100) {
      throw new AudioEngineError(
        'Invalid settings: volume must be between 0-100',
        'INVALID_VOLUME'
      );
    }
    if (settings.duration < 0 || settings.duration > 480) {
      // Max 8 hours
      throw new AudioEngineError(
        'Invalid settings: duration must be between 0-480 minutes',
        'INVALID_DURATION'
      );
    }
    if (settings.fadeIn < 0 || settings.fadeIn > 60) {
      throw new AudioEngineError(
        'Invalid settings: fade in must be between 0-60 seconds',
        'INVALID_FADE_IN'
      );
    }
    if (settings.fadeOut < 0 || settings.fadeOut > 60) {
      throw new AudioEngineError(
        'Invalid settings: fade out must be between 0-60 seconds',
        'INVALID_FADE_OUT'
      );
    }
  }

  /**
   * Attempts to activate the AudioContext with user gesture
   * Call this in response to user interaction before starting audio
   */
  public async activateAudioContext(): Promise<boolean> {
    if (!this.audioContext) {
      try {
        this.initializeAudioContext();
      } catch (error) {
        logger.error('Failed to initialize AudioContext during activation:', error);
        return false;
      }
    }

    if (!this.audioContext) {
      return false;
    }

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        logger.info('AudioContext activated successfully');
        return true;
      } catch (error) {
        logger.error('Failed to resume AudioContext:', error);
        return false;
      }
    }

    return this.audioContext.state === 'running';
  }

  public destroy(): void {
    this.stopFrequency();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      void this.audioContext.close();
    }
    this.audioContext = null;
  }
}

// Immutable preset collections with modern TypeScript patterns
const SOLFEGGIO_FREQUENCIES = [
  {
    id: 'ut-396',
    name: 'Ut - 396 Hz',
    category: 'solfeggio',
    baseFrequency: 396,
    description: 'Liberating guilt and fear',
    benefits: ['Releases fear', 'Eliminates guilt', 'Grounds to root chakra'],
    metadata: { chakra: 'root', intention: 'grounding' },
  },
  {
    id: 're-417',
    name: 'Re - 417 Hz',
    category: 'solfeggio',
    baseFrequency: 417,
    description: 'Facilitating change',
    benefits: [
      'Facilitates change',
      'Clears negativity',
      'Enhances creativity',
    ],
    metadata: { chakra: 'sacral', intention: 'transformation' },
  },
  {
    id: 'mi-528',
    name: 'Mi - 528 Hz',
    category: 'solfeggio',
    baseFrequency: 528,
    description: 'Transformation and DNA repair',
    benefits: ['DNA repair', 'Love frequency', 'Transformation'],
    metadata: { chakra: 'heart', intention: 'healing' },
  },
  {
    id: 'fa-639',
    name: 'Fa - 639 Hz',
    category: 'solfeggio',
    baseFrequency: 639,
    description: 'Connecting relationships',
    benefits: ['Harmonious relationships', 'Communication', 'Understanding'],
    metadata: { chakra: 'heart', intention: 'connection' },
  },
  {
    id: 'sol-741',
    name: 'Sol - 741 Hz',
    category: 'solfeggio',
    baseFrequency: 741,
    description: 'Awakening intuition',
    benefits: ['Intuition', 'Problem solving', 'Self-expression'],
    metadata: { chakra: 'throat', intention: 'expression' },
  },
  {
    id: 'la-852',
    name: 'La - 852 Hz',
    category: 'solfeggio',
    baseFrequency: 852,
    description: 'Returning to spiritual order',
    benefits: ['Spiritual insight', 'Intuition', 'Inner strength'],
    metadata: { chakra: 'third_eye', intention: 'intuition' },
  },
] as const satisfies readonly FrequencyPreset[];

const BRAINWAVE_FREQUENCIES = [
  {
    id: 'delta-sleep',
    name: 'Delta Sleep',
    category: 'brainwave',
    baseFrequency: 100, // Carrier frequency for binaural beat
    binauralBeat: 2,    // Target delta frequency (0.5-4Hz)
    description: 'Deep sleep and healing',
    benefits: ['Deep sleep', 'Healing', 'Growth hormone release'],
    metadata: { state: 'delta', frequency_range: '0.5-4Hz', leftEar: 100, rightEar: 102 },
  },
  {
    id: 'theta-meditation',
    name: 'Theta Meditation',
    category: 'brainwave',
    baseFrequency: 150, // Carrier frequency for binaural beat
    binauralBeat: 6,    // Target theta frequency (4-8Hz)
    description: 'Deep meditation and intuition',
    benefits: ['Deep meditation', 'Intuition', 'Creativity'],
    metadata: { state: 'theta', frequency_range: '4-8Hz', leftEar: 150, rightEar: 156 },
  },
  {
    id: 'alpha-relaxation',
    name: 'Alpha Relaxation',
    category: 'brainwave',
    baseFrequency: 200, // Carrier frequency for binaural beat
    binauralBeat: 10,   // Target alpha frequency (8-14Hz)
    description: 'Relaxed awareness',
    benefits: ['Relaxation', 'Learning', 'Stress reduction'],
    metadata: { state: 'alpha', frequency_range: '8-14Hz', leftEar: 200, rightEar: 210 },
  },
  {
    id: 'beta-focus',
    name: 'Beta Focus',
    category: 'brainwave',
    baseFrequency: 250, // Carrier frequency for binaural beat
    binauralBeat: 20,   // Target beta frequency (14-30Hz)
    description: 'Alert concentration',
    benefits: ['Mental alertness', 'Concentration', 'Problem solving'],
    metadata: { state: 'beta', frequency_range: '14-30Hz', leftEar: 250, rightEar: 270 },
  },
  {
    id: 'gamma-awareness',
    name: 'Gamma Awareness',
    category: 'brainwave',
    baseFrequency: 300, // Carrier frequency for binaural beat
    binauralBeat: 40,   // Target gamma frequency (30-100Hz)
    description: 'Heightened awareness',
    benefits: [
      'Peak awareness',
      'Cognitive enhancement',
      'Binding consciousness',
    ],
    metadata: { state: 'gamma', frequency_range: '30-100Hz', leftEar: 300, rightEar: 340 },
  },
] as const satisfies readonly FrequencyPreset[];

const PLANETARY_FREQUENCIES = [
  {
    id: 'earth-frequency',
    name: 'Earth - Schumann Resonance',
    category: 'planetary',
    baseFrequency: 7.83,
    description: "Earth's natural frequency",
    benefits: ['Grounding', 'Balance', 'Natural harmony'],
    metadata: { planet: 'earth', resonance: 'schumann' },
  },
  {
    id: 'venus-frequency',
    name: 'Venus - Love Planet',
    category: 'planetary',
    baseFrequency: 221.23,
    description: 'Venus orbital frequency',
    benefits: ['Love', 'Beauty', 'Harmony'],
    metadata: { planet: 'venus', orbital_period: '224.7_days' },
  },
  {
    id: 'jupiter-frequency',
    name: 'Jupiter - Growth and Expansion',
    category: 'planetary',
    baseFrequency: 183.58,
    description: 'Jupiter orbital frequency',
    benefits: ['Growth', 'Expansion', 'Wisdom'],
    metadata: { planet: 'jupiter', orbital_period: '11.86_years' },
  },
] as const satisfies readonly FrequencyPreset[];

const CHAKRA_FREQUENCIES = [
  {
    id: 'root-chakra',
    name: 'Root Chakra - Muladhara',
    category: 'chakra',
    baseFrequency: 194.18,
    description: 'Grounding and survival',
    benefits: ['Grounding', 'Stability', 'Security'],
    metadata: { chakra: 'root', color: 'red', element: 'earth' },
  },
  {
    id: 'sacral-chakra',
    name: 'Sacral Chakra - Svadhisthana',
    category: 'chakra',
    baseFrequency: 210.42,
    description: 'Creativity and sexuality',
    benefits: ['Creativity', 'Passion', 'Emotional balance'],
    metadata: { chakra: 'sacral', color: 'orange', element: 'water' },
  },
  {
    id: 'solar-plexus-chakra',
    name: 'Solar Plexus - Manipura',
    category: 'chakra',
    baseFrequency: 126.22,
    description: 'Personal power and confidence',
    benefits: ['Confidence', 'Personal power', 'Digestion'],
    metadata: { chakra: 'solar_plexus', color: 'yellow', element: 'fire' },
  },
  {
    id: 'heart-chakra',
    name: 'Heart Chakra - Anahata',
    category: 'chakra',
    baseFrequency: 341.3,
    description: 'Love and compassion',
    benefits: ['Love', 'Compassion', 'Healing'],
    metadata: { chakra: 'heart', color: 'green', element: 'air' },
  },
  {
    id: 'throat-chakra',
    name: 'Throat Chakra - Vishuddha',
    category: 'chakra',
    baseFrequency: 384,
    description: 'Communication and truth',
    benefits: ['Communication', 'Truth', 'Self-expression'],
    metadata: { chakra: 'throat', color: 'blue', element: 'ether' },
  },
  {
    id: 'third-eye-chakra',
    name: 'Third Eye - Ajna',
    category: 'chakra',
    baseFrequency: 426.7,
    description: 'Intuition and insight',
    benefits: ['Intuition', 'Insight', 'Clarity'],
    metadata: { chakra: 'third_eye', color: 'indigo', element: 'light' },
  },
  {
    id: 'crown-chakra',
    name: 'Crown Chakra - Sahasrara',
    category: 'chakra',
    baseFrequency: 963,
    description: 'Spiritual connection',
    benefits: ['Spiritual connection', 'Enlightenment', 'Divine consciousness'],
    metadata: { chakra: 'crown', color: 'violet', element: 'thought' },
  },
] as const satisfies readonly FrequencyPreset[];

// Export preset constants for direct access
export {
  SOLFEGGIO_FREQUENCIES,
  BRAINWAVE_FREQUENCIES,
  PLANETARY_FREQUENCIES,
  CHAKRA_FREQUENCIES,
};

// Modern getter functions with type safety and memoization
export const getAllPresets = (): readonly FrequencyPreset[] => [
  ...SOLFEGGIO_FREQUENCIES,
  ...BRAINWAVE_FREQUENCIES,
  ...PLANETARY_FREQUENCIES,
  ...CHAKRA_FREQUENCIES,
];

export const getPresetsByCategory = (
  category: FrequencyPreset['category']
): readonly FrequencyPreset[] => {
  return getAllPresets().filter(preset => preset.category === category);
};

export const getPresetById = (id: string): FrequencyPreset | undefined => {
  return getAllPresets().find(preset => preset.id === id);
};

export const getPresetsByBenefits = (
  benefit: string
): readonly FrequencyPreset[] => {
  return getAllPresets().filter(preset =>
    preset.benefits?.some(b => b.toLowerCase().includes(benefit.toLowerCase()))
  );
};

// Type guards for runtime validation
export const isValidFrequencyPreset = (
  preset: unknown
): preset is FrequencyPreset => {
  if (typeof preset !== 'object' || preset === null) return false;
  const p = preset as Record<string, unknown>;
  if (typeof p['id'] !== 'string') return false;
  if (typeof p['name'] !== 'string') return false;
  if (typeof p['category'] !== 'string') return false;
  if (typeof p['baseFrequency'] !== 'number' || p['baseFrequency'] <= 0)
    return false;
  return true;
};

export const isValidAudioSettings = (
  settings: unknown
): settings is AudioSettings => {
  if (typeof settings !== 'object' || settings === null) return false;
  const s = settings as Record<string, unknown>;
  return (
    typeof s['volume'] === 'number' &&
    typeof s['duration'] === 'number' &&
    typeof s['fadeIn'] === 'number' &&
    typeof s['fadeOut'] === 'number'
  );
};
