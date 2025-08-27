import type { BirthData } from '../../types';

  person2: BirthData;
  person1Name?: string;
  person2Name?: string;
}

    interpretation: string;
    breakdown: Record<string, number>;
    meta?: {
      planet_weights: Record<string, number>;
      aspect_scores: Record<string, number>;
      overlay_bonus_applied: number;
      aspect_type_counts: Record<string, number>;
    };
  };
  interaspects: Array<{
    person1_planet: string;
    person2_planet: string;
    aspect: string;
    orb: number;
    strength: string;
    interpretation: string;
  }>;
  house_overlays: Array<{
    person1_planet: string;
    person2_house: number;
    interpretation: string;
  }>;
  composite_chart: {
    midpoint_sun: number;
    midpoint_moon: number;
    relationship_purpose: string;
  };
  summary: {
    key_themes: string[];
    strengths: string[];
    challenges: string[];
    advice: string[];
  };
}

// Updated in component usage: tier mapped to safe class sets
  tier: 'excellent' | 'good' | 'moderate' | 'low';
}

}

}

  getAspectColor: (aspect: string) => string;
  formatPlanetName: (planet: string) => string;
}

  formatPlanetName: (planet: string) => string;
}

}

}
