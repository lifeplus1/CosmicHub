// Types for Gene Keys Chart Components
import type { ChartBirthData as BirthData } from '@cosmichub/types';

// Re-export the BirthData type for use in tests and other components
export type { BirthData };

export interface GeneKey {
  number: number;
  name: string;
  shadow: string;
  gift: string;
  siddhi: string;
  codon: string;
  description: string;
  line?: number;
  line_theme?: string;
  sphere?: string;
  sphere_context?: string;
}

export interface Sequence {
  name: string;
  description: string;
  keys: GeneKey[];
}

export interface GeneKeysData {
  life_work: GeneKey;
  evolution: GeneKey;
  radiance: GeneKey;
  purpose: GeneKey;
  attraction: GeneKey;
  iq: GeneKey;
  eq: GeneKey;
  sq: GeneKey;
  core_wound: GeneKey;
  activation: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  venus_sequence: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  pearl_sequence: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  contemplation_sequence: string[];
  hologenetic_profile: {
    description: string;
    integration_path: string[];
  };
}

export interface GeneKeysChartProps {
  birthData?: BirthData;
  onCalculate?: (data: BirthData) => void;
}

export interface GeneKeyDisplayProps {
  geneKey: GeneKey;
  title: string;
  description?: string;
  onKeySelect: (key: GeneKey) => void;
}

export interface SequenceDisplayProps {
  sequence: Sequence;
  onKeySelect: (key: GeneKey) => void;
}

export interface GeneKeyDetailsProps {
  selectedKey: GeneKey | null;
}

export interface VenusSequenceProps {
  geneKeysData: GeneKeysData;
  onKeySelect: (key: GeneKey) => void;
}

export interface HologenicProfileProps {
  geneKeysData: GeneKeysData;
  onKeySelect: (key: GeneKey) => void;
}
