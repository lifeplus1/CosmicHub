/**
 * Shared frequency generation and audio processing utilities
 * Used by both HealWave (standalone) and Astro (astrology-enhanced)
 */

export interface FrequencyPreset {
  id: string;
  name: string;
  category: 'solfeggio' | 'rife' | 'brainwave' | 'planetary' | 'chakra' | 'custom';
  baseFrequency: number;
  binauralBeat?: number;
  description?: string;
  benefits?: string[];
}

export interface AudioSettings {
  volume: number;
  duration: number; // in minutes
  fadeIn: number;   // in seconds
  fadeOut: number;  // in seconds
}

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillatorLeft: OscillatorNode | null = null;
  private oscillatorRight: OscillatorNode | null = null;
  private gainNodeLeft: GainNode | null = null;
  private gainNodeRight: GainNode | null = null;
  private isPlaying = false;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async startFrequency(preset: FrequencyPreset, settings: AudioSettings): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.stopFrequency();

    const { baseFrequency, binauralBeat = 0 } = preset;
    const leftFreq = baseFrequency;
    const rightFreq = baseFrequency + binauralBeat;

    // Create oscillators
    this.oscillatorLeft = this.audioContext.createOscillator();
    this.oscillatorRight = this.audioContext.createOscillator();

    // Create gain nodes for volume control
    this.gainNodeLeft = this.audioContext.createGain();
    this.gainNodeRight = this.audioContext.createGain();

    // Set frequencies
    this.oscillatorLeft.frequency.setValueAtTime(leftFreq, this.audioContext.currentTime);
    this.oscillatorRight.frequency.setValueAtTime(rightFreq, this.audioContext.currentTime);

    // Set waveform
    this.oscillatorLeft.type = 'sine';
    this.oscillatorRight.type = 'sine';

    // Connect left channel
    this.oscillatorLeft.connect(this.gainNodeLeft);
    this.gainNodeLeft.connect(this.audioContext.destination);

    // Connect right channel
    this.oscillatorRight.connect(this.gainNodeRight);
    this.gainNodeRight.connect(this.audioContext.destination);

    // Apply fade-in
    const volume = settings.volume / 100;
    this.gainNodeLeft.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNodeRight.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNodeLeft.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + settings.fadeIn);
    this.gainNodeRight.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + settings.fadeIn);

    // Start oscillators
    this.oscillatorLeft.start();
    this.oscillatorRight.start();

    this.isPlaying = true;
  }

  stopFrequency(): void {
    if (this.oscillatorLeft) {
      this.oscillatorLeft.stop();
      this.oscillatorLeft = null;
    }
    if (this.oscillatorRight) {
      this.oscillatorRight.stop();
      this.oscillatorRight = null;
    }
    this.isPlaying = false;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async setVolume(volume: number): Promise<void> {
    if (this.gainNodeLeft && this.gainNodeRight && this.audioContext) {
      const normalizedVolume = volume / 100;
      this.gainNodeLeft.gain.setValueAtTime(normalizedVolume, this.audioContext.currentTime);
      this.gainNodeRight.gain.setValueAtTime(normalizedVolume, this.audioContext.currentTime);
    }
  }
}

// Predefined frequency libraries
export const SOLFEGGIO_FREQUENCIES: FrequencyPreset[] = [
  {
    id: 'ut-396',
    name: 'Ut - 396 Hz',
    category: 'solfeggio',
    baseFrequency: 396,
    description: 'Liberating guilt and fear',
    benefits: ['Releases fear', 'Eliminates guilt', 'Grounds to root chakra']
  },
  {
    id: 're-417',
    name: 'Re - 417 Hz',
    category: 'solfeggio',
    baseFrequency: 417,
    description: 'Facilitating change',
    benefits: ['Facilitates change', 'Clears negativity', 'Enhances creativity']
  },
  {
    id: 'mi-528',
    name: 'Mi - 528 Hz',
    category: 'solfeggio',
    baseFrequency: 528,
    description: 'Transformation and DNA repair',
    benefits: ['DNA repair', 'Love frequency', 'Transformation']
  }
];

export const BRAINWAVE_FREQUENCIES: FrequencyPreset[] = [
  {
    id: 'delta-sleep',
    name: 'Delta Sleep',
    category: 'brainwave',
    baseFrequency: 40,
    binauralBeat: 2,
    description: 'Deep sleep and healing',
    benefits: ['Deep sleep', 'Healing', 'Growth hormone release']
  },
  {
    id: 'theta-meditation',
    name: 'Theta Meditation',
    category: 'brainwave',
    baseFrequency: 40,
    binauralBeat: 6,
    description: 'Deep meditation and intuition',
    benefits: ['Deep meditation', 'Intuition', 'Creativity']
  },
  {
    id: 'alpha-relaxation',
    name: 'Alpha Relaxation',
    category: 'brainwave',
    baseFrequency: 40,
    binauralBeat: 10,
    description: 'Relaxed awareness',
    benefits: ['Relaxation', 'Learning', 'Stress reduction']
  }
];

export const PLANETARY_FREQUENCIES: FrequencyPreset[] = [
  {
    id: 'earth-frequency',
    name: 'Earth - Schumann Resonance',
    category: 'planetary',
    baseFrequency: 7.83,
    description: 'Earth\'s natural frequency',
    benefits: ['Grounding', 'Balance', 'Natural harmony']
  },
  {
    id: 'venus-frequency',
    name: 'Venus - Love Planet',
    category: 'planetary',
    baseFrequency: 221.23,
    description: 'Venus orbital frequency',
    benefits: ['Love', 'Beauty', 'Harmony']
  }
];

export const getAllPresets = (): FrequencyPreset[] => [
  ...SOLFEGGIO_FREQUENCIES,
  ...BRAINWAVE_FREQUENCIES,
  ...PLANETARY_FREQUENCIES
];

export const getPresetsByCategory = (category: FrequencyPreset['category']): FrequencyPreset[] => {
  return getAllPresets().filter(preset => preset.category === category);
};
