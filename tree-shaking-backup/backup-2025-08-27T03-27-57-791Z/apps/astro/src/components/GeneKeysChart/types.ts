// Types for Gene Keys Chart Components
import type { ChartBirthData as BirthData } from '@cosmichub/types';

// Re-export the BirthData type for use in tests and other components
export type { BirthData };

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

  description: string;
  keys: GeneKey[];
}

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

  onCalculate?: (data: BirthData) => void;
}

  title: string;
  description?: string;
  onKeySelect: (key: GeneKey) => void;
}

  onKeySelect: (key: GeneKey) => void;
}

}

  onKeySelect: (key: GeneKey) => void;
}

  onKeySelect: (key: GeneKey) => void;
}
