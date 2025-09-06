import type { UnifiedBirthData, SimpleChartData, SimpleTransitData } from '@cosmichub/types';

export type BirthData = UnifiedBirthData;

// Use SimpleChartData for basic frontend operations
export type ChartData = SimpleChartData;

export interface AspectInterpretation {
  name: string;
  description?: string;
  keywords?: string[];
  influence?: string;
  advice?: string;
  type?: 'harmonious' | 'challenging' | 'neutral' | 'powerful';
  strength?: number;
  planets?: string[];
  icon?: string;
}

export interface AIInterpretation {
  core_identity?: AspectInterpretation[];
  life_purpose?: AspectInterpretation[];
  relationships?: AspectInterpretation[];
  career?: AspectInterpretation[];
  growth?: AspectInterpretation[];
  spiritual?: AspectInterpretation[];
  integration?: AspectInterpretation[];
  summary?: string;
  action_items?: string[];
}

export type TransitData = SimpleTransitData;

export * from './astrology.types';
