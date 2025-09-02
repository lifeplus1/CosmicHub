// Local frequency types to replace @cosmichub/frequency package
export interface FrequencyPreset {
  id: string;
  name: string;
  description: string;
  frequency: number;
  category: string;
  binauralBeat?: number;
  isochronicTone?: boolean;
  duration?: number;
  astrologyData?: {
    planet?: string;
    sign?: string;
    element?: string;
  };
}

export interface AudioSettings {
  volume: number;
  duration: number;
  frequency: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface BinauralSettings {
  leftFrequency: number;
  rightFrequency: number;
  beatFrequency: number;
  waveform: 'sine' | 'triangle' | 'square' | 'sawtooth';
}

// Default presets for astrology app
const _DEFAULT_FREQUENCY_PRESETS: FrequencyPreset[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    description: 'Communication and mental clarity',
    frequency: 126.22,
    category: 'planetary',
    astrologyData: {
      planet: 'Mercury',
      element: 'Air'
    }
  },
  {
    id: 'venus',
    name: 'Venus',
    description: 'Love and harmony',
    frequency: 210.42,
    category: 'planetary',
    astrologyData: {
      planet: 'Venus',
      element: 'Earth'
    }
  }
];
