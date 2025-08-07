// Types for Gene Keys Chart Components
export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}

export interface GeneKey {
  number: number;
  name: string;
  shadow: string;
  gift: string;
  siddhi: string;
  codon: string;
  description: string;
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
  activation: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  iq: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  eq: {
    name: string;
    description: string;
    keys: GeneKey[];
  };
  sq: {
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
