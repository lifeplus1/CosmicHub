/**
 * Frequency Validation and Processing Utilities
 * Handles proper validation and conversion of frequency data
 */

import { ValidatedFrequencyData as FrequencyData } from '../schemas/frequencySchemas';
import { FrequencyPreset } from '@cosmichub/integrations';

export interface ProcessedFrequencyData extends FrequencyData {
  isBinaural: boolean;
  leftEarFreq?: number;
  rightEarFreq?: number;
  displayLabel: string;
}

/**
 * Validates and processes frequency data for audio playback
 */
export const processFrequencyForAudio = (frequency: FrequencyData): ProcessedFrequencyData => {
  const isBinaural = !!(frequency.metadata?.isBinaural);
  const baseFreq = frequency.metadata?.baseFrequency as number || frequency.frequency;
  const binauralBeat = frequency.metadata?.binauralBeat as number || 0;

  let leftEarFreq = frequency.frequency;
  let rightEarFreq = frequency.frequency;
  let displayLabel = frequency.label;

  if (isBinaural && binauralBeat > 0) {
    // For binaural beats, use the base frequency for left ear and base + beat for right ear
    leftEarFreq = baseFreq;
    rightEarFreq = baseFreq + binauralBeat;
    displayLabel = `${frequency.label} (${binauralBeat} Hz binaural beat)`;
  }

  return {
    ...frequency,
    isBinaural,
    leftEarFreq,
    rightEarFreq,
    displayLabel
  };
};

/**
 * Creates a FrequencyPreset suitable for AudioEngine from processed frequency data
 */
export const createAudioEnginePreset = (processedFreq: ProcessedFrequencyData): FrequencyPreset => {
  const baseFrequency = processedFreq.isBinaural && processedFreq.leftEarFreq 
    ? processedFreq.leftEarFreq 
    : processedFreq.frequency;
    
  const binauralBeat = processedFreq.isBinaural && processedFreq.leftEarFreq && processedFreq.rightEarFreq
    ? processedFreq.rightEarFreq - processedFreq.leftEarFreq
    : undefined;

  return {
    id: processedFreq.label.toLowerCase().replace(/\s+/g, '-'),
    name: processedFreq.displayLabel,
    category: mapCategoryToAudioEngine(processedFreq.category),
    baseFrequency,
    binauralBeat,
    description: processedFreq.benefits?.join(', ') || '',
    benefits: processedFreq.benefits || []
  };
};

/**
 * Maps UI categories to AudioEngine categories
 */
const mapCategoryToAudioEngine = (category: string): FrequencyPreset['category'] => {
  switch (category) {
    case 'solfeggio':
    case 'rife':
    case 'brainwave':
    case 'planetary':
    case 'chakra':
      return category as FrequencyPreset['category'];
    case 'stellar':
    case 'metallic':
    case 'elemental':
    case 'sacred_geometry':
    case 'biological':
    case 'other':
    case 'custom':
    default:
      return 'custom';
  }
};

/**
 * Validates that frequency is within safe audio range
 */
export const isFrequencySafe = (frequency: number): boolean => {
  return frequency >= 1 && frequency <= 20000;
};

/**
 * Deduplicates frequencies that are too close together
 */
export const deduplicateFrequencies = (frequencies: FrequencyData[], tolerance = 0.1): FrequencyData[] => {
  const result: FrequencyData[] = [];
  
  frequencies.forEach(freq => {
    const existingIndex = result.findIndex(existing => 
      Math.abs(existing.frequency - freq.frequency) < tolerance
    );
    
    if (existingIndex === -1) {
      result.push(freq);
    } else {
      // Merge benefits and keep the more detailed entry
      const existing = result[existingIndex]!;
      const mergedBenefits = Array.from(new Set([
        ...(existing.benefits || []),
        ...(freq.benefits || [])
      ]));
      
      result[existingIndex] = {
        ...existing,
        benefits: mergedBenefits,
        // Use the longer, more descriptive label
        label: freq.label.length > existing.label.length ? freq.label : existing.label
      };
    }
  });
  
  return result.sort((a, b) => a.frequency - b.frequency);
};
