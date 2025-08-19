/**
 * Type declarations for @cosmichub/frequency package
 */

declare module '@cosmichub/frequency' {
  export interface FrequencyPreset {
    readonly id: string;
    readonly name: string;
    readonly category: 'solfeggio' | 'rife' | 'brainwave' | 'planetary' | 'chakra' | 'custom';
    readonly baseFrequency: number;
    readonly binauralBeat?: number;
    readonly description?: string;
    readonly benefits?: readonly string[];
    readonly metadata?: Readonly<Record<string, unknown>>;
  }

  export interface AudioSettings {
    readonly volume: number;
    readonly duration: number; // in minutes
    readonly fadeIn: number;  // in seconds
    readonly fadeOut: number; // in seconds
  }

  export interface AudioEngineState {
    readonly isPlaying: boolean;
    readonly currentPreset: FrequencyPreset | null;
    readonly currentSettings: AudioSettings | null;
  }

  export class AudioEngineError extends Error {
    public readonly code: string;
    constructor(message: string, code?: string);
  }

  export class AudioEngine {
    constructor();
    public startFrequency(preset: FrequencyPreset, settings: AudioSettings): Promise<void>;
    public stopFrequency(): void;
    public getState(): AudioEngineState;
    public setVolume(volume: number): Promise<void>;
    public destroy(): void;
  }

  // Preset collections
  export const SOLFEGGIO_FREQUENCIES: readonly FrequencyPreset[];
  export const BRAINWAVE_FREQUENCIES: readonly FrequencyPreset[];
  export const PLANETARY_FREQUENCIES: readonly FrequencyPreset[];
  export const CHAKRA_FREQUENCIES: readonly FrequencyPreset[];

  // Helper functions
  export function getAllPresets(): readonly FrequencyPreset[];
  export function getPresetsByCategory(category: FrequencyPreset['category']): readonly FrequencyPreset[];
  export function getPresetById(id: string): FrequencyPreset | undefined;
  export function getPresetsByBenefits(benefit: string): readonly FrequencyPreset[];
  export function isValidFrequencyPreset(preset: unknown): preset is FrequencyPreset;
  export function isValidAudioSettings(settings: unknown): settings is AudioSettings;
}
