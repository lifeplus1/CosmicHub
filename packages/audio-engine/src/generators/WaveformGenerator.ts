/**
 * Waveform Generator
 * 
 * Based on Grok Response 1: Advanced Waveform Generation
 * Beyond simple sine waves - square, triangle, sawtooth, noise
 */

import { WaveformType } from '../types';
import { AUDIO_CONSTANTS } from '../constants';

export class WaveformGenerator {
  private audioContext: AudioContext;
  private activeOscillators: Map<string, OscillatorNode> = new Map();
  private noiseBuffers: Map<string, AudioBuffer> = new Map();

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.initializeNoiseBuffers();
  }

  /**
   * Create an oscillator node with specified waveform
   */
  createOscillator(
    frequency: number, 
    waveform: WaveformType = 'sine',
    id?: string
  ): OscillatorNode {
    const oscillator = this.audioContext.createOscillator();
    
    // Set waveform type
    if (this.isBasicWaveform(waveform)) {
      oscillator.type = waveform as OscillatorType;
    } else {
      // Handle custom waveforms (noise types)
      this.applyCustomWaveform(oscillator, waveform);
    }

    // Set frequency with smoothing
    oscillator.frequency.setValueAtTime(
      frequency, 
      this.audioContext.currentTime
    );

    // Store reference if ID provided
    if (id) {
      this.activeOscillators.set(id, oscillator);
    }

    return oscillator;
  }

  /**
   * Create a noise source
   */
  createNoiseSource(noiseType: 'white-noise' | 'pink-noise'): AudioBufferSourceNode {
    const bufferSource = this.audioContext.createBufferSource();
    const buffer = this.noiseBuffers.get(noiseType);
    
    if (!buffer) {
      throw new Error(`Noise buffer not available for type: ${noiseType}`);
    }

    bufferSource.buffer = buffer;
    bufferSource.loop = true;
    
    return bufferSource;
  }

  /**
   * Create binaural beat setup (two oscillators with frequency difference)
   */
  createBinauralBeats(
    baseFrequency: number,
    beatFrequency: number,
    waveform: WaveformType = 'sine'
  ): { left: OscillatorNode; right: OscillatorNode } {
    const leftOsc = this.createOscillator(baseFrequency, waveform);
    const rightOsc = this.createOscillator(baseFrequency + beatFrequency, waveform);

    return { left: leftOsc, right: rightOsc };
  }

  /**
   * Update frequency of an active oscillator with smooth transition
   */
  updateFrequency(
    oscillator: OscillatorNode, 
    newFrequency: number, 
    transitionTime: number = AUDIO_CONSTANTS.PROCESSING.FREQUENCY_SMOOTHING
  ): void {
    const currentTime = this.audioContext.currentTime;
    
    oscillator.frequency.setTargetAtTime(
      newFrequency,
      currentTime,
      transitionTime
    );
  }

  /**
   * Create frequency modulated oscillator
   */
  createFMOscillator(
    carrierFreq: number,
    modulatorFreq: number,
    modulation: number,
    waveform: WaveformType = 'sine'
  ): { carrier: OscillatorNode; modulator: OscillatorNode; modulationGain: GainNode } {
    const carrier = this.createOscillator(carrierFreq, waveform);
    const modulator = this.createOscillator(modulatorFreq);
    const modulationGain = this.audioContext.createGain();

    // Set modulation depth
    modulationGain.gain.setValueAtTime(modulation, this.audioContext.currentTime);

    // Connect modulator to carrier frequency
    modulator.connect(modulationGain);
    modulationGain.connect(carrier.frequency);

    return { carrier, modulator, modulationGain };
  }

  /**
   * Stop and remove an oscillator
   */
  stopOscillator(id: string, fadeTime: number = AUDIO_CONSTANTS.PROCESSING.FADE_TIME): void {
    const oscillator = this.activeOscillators.get(id);
    if (!oscillator) return;

    const currentTime = this.audioContext.currentTime;
    
    // Fade out to prevent clicks
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(1, currentTime);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeTime);

    // Reconnect through gain node for fadeout
    oscillator.disconnect();
    oscillator.connect(gainNode);

    // Stop oscillator after fade
    oscillator.stop(currentTime + fadeTime);
    
    // Clean up
    setTimeout(() => {
      this.activeOscillators.delete(id);
    }, fadeTime * 1000);
  }

  /**
   * Stop all active oscillators
   */
  stopAllOscillators(): void {
    for (const id of this.activeOscillators.keys()) {
      this.stopOscillator(id);
    }
  }

  /**
   * Get list of active oscillator IDs
   */
  getActiveOscillators(): string[] {
    return Array.from(this.activeOscillators.keys());
  }

  /**
   * Create harmonic series oscillators
   */
  createHarmonics(
    fundamental: number,
    harmonics: number[],
    waveform: WaveformType = 'sine'
  ): OscillatorNode[] {
    return harmonics.map((harmonic, index) => {
      const frequency = fundamental * harmonic;
      return this.createOscillator(frequency, waveform, `harmonic-${index}`);
    });
  }

  // Private methods

  private isBasicWaveform(waveform: WaveformType): boolean {
    return ['sine', 'square', 'triangle', 'sawtooth'].includes(waveform);
  }

  private applyCustomWaveform(oscillator: OscillatorNode, waveform: WaveformType): void {
    switch (waveform) {
      case 'white-noise':
      case 'pink-noise':
        // For noise, we'll use a buffer source instead of oscillator
        // This is handled in createNoiseSource method
        oscillator.type = 'sine'; // Fallback to sine for oscillator
        break;
      default:
        oscillator.type = 'sine';
    }
  }

  private initializeNoiseBuffers(): void {
    this.createWhiteNoiseBuffer();
    this.createPinkNoiseBuffer();
  }

  private createWhiteNoiseBuffer(): void {
    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.noiseBuffers.set('white-noise', buffer);
  }

  private createPinkNoiseBuffer(): void {
    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise generation using Paul Kellet's algorithm
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] = pink * 0.11; // Scale down
      
      b6 = white * 0.115926;
    }

    this.noiseBuffers.set('pink-noise', buffer);
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.stopAllOscillators();
    this.noiseBuffers.clear();
  }
}
