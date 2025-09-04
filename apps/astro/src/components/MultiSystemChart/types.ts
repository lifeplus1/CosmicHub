import type { TCMConstitutionType, WuXingElement, MeridianFlowData, MBTIResult, EnneagramResult } from '@cosmichub/types';

// Basic interfaces for spiritual systems data structures
interface _BasicSephirah {
  name: string;
  description?: string;
  attributes?: string[];
}

interface _BasicKabbalahPath {
  name: string;
  description?: string;
  sephirot?: string[];
}

interface _BasicCorrespondence {
  name: string;
  description?: string;
  associations?: string[];
}

interface BasicSpiritualInterpretation {
  content: string;
  themes?: string[];
  guidance?: string;
  timestamp?: string;
}

// Basic spiritual types until proper ones are defined
interface TarotCard {
  name: string;
  suit: string;
  number?: number;
  meaning?: string;
  reversed?: boolean;
  arcana: "major" | "minor";
  upright_meaning: string;
  reversed_meaning: string;
  astrological_correlation: string;
}

interface _Sephirah {
  name: string;
  number: number;
  title?: string;
  correspondences?: string[];
}

interface _SpiritualCorrespondence {
  name: string;
  symbolism?: string;
  guidance?: string;
}

export interface MultiSystemChartData {
  birth_info?: {
    date?: string;
    time?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      timezone?: string;
    };
  };
  western_tropical?: {
    planets: Record<string, { position: number; retrograde?: boolean }>;
    aspects: Array<{
      point1: string;
      point2: string;
      aspect: string;
      orb: number;
      exact: boolean;
      point1_sign?: string;
      point2_sign?: string;
      point1_house?: number;
      point2_house?: number;
    }>;
  };
  vedic_sidereal?: {
    description?: string;
    ayanamsa?: number;
    analysis?: { moon_sign?: string; analysis?: string };
    planets?: Record<
      string,
      { vedic_sign?: string; nakshatra?: { name?: string; pada?: string } }
    >;
  };
  chinese?: {
    description?: string;
    year?: { animal?: string; element?: string; traits?: string };
    month?: { animal?: string };
    day?: { animal?: string };
    hour?: { animal?: string };
    four_pillars?: string;
    elements_analysis?: { analysis?: string };
    personality_summary?: string;
  };
  mayan?: {
    description?: string;
    day_sign?: {
      symbol?: string;
      name?: string;
      meaning?: string;
      color?: string;
    };
    sacred_number?: { number?: number; meaning?: string };
    galactic_signature?: string;
    wavespell?: {
      tone?: { name?: string };
      position?: number;
      description?: string;
    };
    long_count?: { date?: string };
    life_purpose?: string;
    spiritual_guidance?: string;
  };
  uranian?: {
    description?: string;
    uranian_planets?: Record<
      string,
      { symbol?: string; position?: number; meaning?: string }
    >;
    dial_aspects?: Array<{
      body1?: string;
      body2?: string;
      angle?: number;
      orb?: number;
      meaning?: string;
    }>;
  };
  synthesis?: {
    primary_themes?: string[];
    life_purpose?: string[];
    personality_integration?: Record<string, string[]>;
    spiritual_path?: string[];
  };
  spiritual_systems?: {
    description?: string;
    tarot?: {
      daily_card?: TarotCard;
      life_path?: {
        card: string;
        meaning: string;
        guidance: string;
      };
      suits?: Array<{
        name: string;
        element: string;
        themes: string[];
        strength: number;
      }>;
    };
    kabbalah?: {
      primary_sephirah?: {
        name: string;
        hebrew_name: string;
        planetary_association: string;
        meaning: string;
        path_guidance: string;
      };
      secondary_sephirah?: {
        name: string;
        hebrew_name: string;
        planetary_association: string;
        meaning: string;
        path_guidance: string;
      };
      relevant_paths?: Array<{
        from: string;
        to: string;
        hebrew_letter: string;
        meaning: string;
        tarot_card: string;
        guidance: string;
      }>;
      spiritual_focus?: string;
      tree_guidance?: string;
    };
    correspondences?: {
      daily_focus?: {
        element: string;
        planet: string;
        theme: string;
        tarot?: string;
        hebrew_letter?: string;
        tree_path?: number;
        astrology?: string;
      };
      life_purpose?: {
        primary_energy: string;
        spiritual_goal: string;
        manifestation_style: string;
      };
      spiritual_center?: {
        chakra: string;
        color: string;
        focus_area: string;
        sephirah?: string;
        astrology?: string;
        tarot_association?: string;
        element?: string;
      };
    };
    synthesis?: {
      primary_themes?: string[];
      spiritual_guidance?: string;
      integration_focus?: string;
      daily_practice?: string;
    };
    ai_interpretation?: {
      spiritual_interpretation?: BasicSpiritualInterpretation;
      timestamp?: string;
    };
  };
  tcm?: {
    description?: string;
    constitutional_analysis?: {
      primary_type?: TCMConstitutionType;
      secondary_type?: TCMConstitutionType;
      constitution_summary?: string;
    };
    five_elements?: {
      elements?: WuXingElement[];
      balance_overview?: string;
      seasonal_guidance?: string;
    };
    meridian_system?: {
      meridians?: MeridianFlowData[];
      energy_flow_assessment?: string;
      blockage_areas?: string[];
    };
    health_correlations?: {
      astrological_health_risks?: string[];
      preventive_recommendations?: string[];
      optimal_timing?: Record<string, string>;
    };
    synthesis?: {
      tcm_astrology_integration?: string;
      personalized_wellness_plan?: string[];
      seasonal_adjustments?: Record<string, string[]>;
    };
  };
  psychology?: {
    description?: string;
    mbti?: {
      profile?: MBTIResult;
      birth_correlation?: {
        seasonal_pattern?: string;
        elemental_dominance?: string;
        planetary_influences?: string;
      };
      astrology_synthesis?: {
        chart_confirmation?: string[];
        contradictions?: string[];
        integration_notes?: string;
      };
    };
    enneagram?: {
      profile?: EnneagramResult;
      astrological_correlations?: {
        house_themes?: string;
        planetary_alignment?: string;
        aspect_patterns?: string;
      };
      spiritual_development?: {
        current_level?: string;
        growth_path?: string[];
        meditation_focus?: string;
      };
    };
    synthesis?: {
      personality_integration?: {
        mbti_enneagram_bridge?: string;
        spiritual_path_alignment?: string;
        growth_recommendations?: string[];
      };
      astrological_confirmation?: {
        chart_personality_match?: number;
        supporting_aspects?: string[];
        developmental_timing?: Record<string, string>;
      };
      tarot_correspondences?: {
        mbti_cards?: Record<string, string>;
        enneagram_cards?: Record<number, string>;
        personality_spread?: string[];
      };
    };
  };
}

export interface WesternChartData {
  planets: Record<string, { position: number; retrograde?: boolean }>;
  aspects: Array<{
    point1: string;
    point2: string;
    aspect: string;
    orb: number;
    exact: boolean;
    point1_sign?: string;
    point2_sign?: string;
    point1_house?: number;
    point2_house?: number;
  }>;
}

export interface VedicChartData {
  description?: string;
  ayanamsa?: number;
  analysis?: { moon_sign?: string; analysis?: string };
  planets?: Record<
    string,
    { vedic_sign?: string; nakshatra?: { name?: string; pada?: string } }
  >;
}

export interface ChineseChartData {
  description?: string;
  year?: { animal?: string; element?: string; traits?: string };
  month?: { animal?: string };
  day?: { animal?: string };
  hour?: { animal?: string };
  four_pillars?: string;
  elements_analysis?: { analysis?: string };
  personality_summary?: string;
}

export interface MayanChartData {
  description?: string;
  day_sign?: {
    symbol?: string;
    name?: string;
    meaning?: string;
    color?: string;
  };
  sacred_number?: { number?: number; meaning?: string };
  galactic_signature?: string;
  wavespell?: {
    tone?: { name?: string };
    position?: number;
    description?: string;
  };
  long_count?: { date?: string };
  life_purpose?: string;
  spiritual_guidance?: string;
}

export interface UranianChartData {
  description?: string;
  uranian_planets?: Record<
    string,
    { symbol?: string; position?: number; meaning?: string }
  >;
  dial_aspects?: Array<{
    body1?: string;
    body2?: string;
    angle?: number;
    orb?: number;
    meaning?: string;
  }>;
}

export interface SynthesisChartData {
  primary_themes?: string[];
  life_purpose?: string[];
  personality_integration?: Record<string, string[]>;
  spiritual_path?: string[];
}

export interface TCMChartData {
  description?: string;
  constitutional_analysis?: {
    primary_type?: TCMConstitutionType;
    secondary_type?: TCMConstitutionType;
    constitution_summary?: string;
  };
  five_elements?: {
    elements?: WuXingElement[];
    balance_overview?: string;
    seasonal_guidance?: string;
  };
  meridian_system?: {
    meridians?: MeridianFlowData[];
    energy_flow_assessment?: string;
    blockage_areas?: string[];
  };
  health_correlations?: {
    astrological_health_risks?: string[];
    preventive_recommendations?: string[];
    optimal_timing?: Record<string, string>;
  };
  synthesis?: {
    tcm_astrology_integration?: string;
    personalized_wellness_plan?: string[];
    seasonal_adjustments?: Record<string, string[]>;
  };
}

export interface PsychologyChartData {
  description?: string;
  mbti?: {
    profile?: MBTIResult;
    birth_correlation?: {
      seasonal_pattern?: string;
      elemental_dominance?: string;
      planetary_influences?: string;
    };
    astrology_synthesis?: {
      chart_confirmation?: string[];
      contradictions?: string[];
      integration_notes?: string;
    };
  };
  enneagram?: {
    profile?: EnneagramResult;
    astrological_correlations?: {
      house_themes?: string;
      planetary_alignment?: string;
      aspect_patterns?: string;
    };
    spiritual_development?: {
      current_level?: string;
      growth_path?: string[];
      meditation_focus?: string;
    };
  };
  synthesis?: {
    personality_integration?: {
      mbti_enneagram_bridge?: string;
      spiritual_path_alignment?: string;
      growth_recommendations?: string[];
    };
    astrological_confirmation?: {
      chart_personality_match?: number;
      supporting_aspects?: string[];
      developmental_timing?: Record<string, string>;
    };
    tarot_correspondences?: {
      mbti_cards?: Record<string, string>;
      enneagram_cards?: Record<number, string>;
      personality_spread?: string[];
    };
  };
}
