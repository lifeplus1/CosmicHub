// Type definitions for MultiSystemChart components
// This file provides proper TypeScript types to replace 'any' usage

// TCM Chart Data Types
export interface TCMChartData {
  constitutional_analysis?: {
    primary_type?: string;
    secondary_type?: string;
    description?: string;
    characteristics?: string[];
    recommendations?: string[];
  };
  five_elements?: {
    elements?: Array<{
      element: string;
      strength: number;
      description: string;
    }>;
    balance_overview?: string;
    dominant_element?: string;
    deficient_element?: string;
  };
  meridian_system?: {
    meridians?: Array<{
      name: string;
      status: 'balanced' | 'excess' | 'deficient';
      energy_level: number;
      associated_organs: string[];
    }>;
    energy_flow_assessment?: string;
    blocked_pathways?: string[];
  };
  seasonal_recommendations?: {
    current_season?: string;
    dietary_guidance?: string[];
    lifestyle_adjustments?: string[];
    meditation_practices?: string[];
  };
}

// Psychology Chart Data Types  
export interface PsychologyChartData {
  mbti?: {
    profile?: {
      type?: string;
      name?: string;
      description?: string;
      temperament?: string;
      cognitive_functions?: Array<{
        name: string;
        position: string;
        strength: number;
      }>;
    };
    birth_correlation?: {
      planetary_influences?: Record<string, number>;
      elemental_matches?: Record<string, number>;
    };
    astrology_synthesis?: {
      confirmation_factors?: string[];
      contradictions?: string[];
      integration_suggestions?: string[];
    };
  };
  enneagram?: {
    profile?: {
      type?: number;
      name?: string;
      description?: string;
      core_motivation?: string;
      basic_fear?: string;
      wings?: Array<{
        number: number;
        name: string;
        influence: number;
      }>;
    };
    astrological_correlations?: {
      planetary_resonance?: Record<string, number>;
      house_emphasis?: Record<string, number>;
    };
  };
  synthesis?: {
    personality_integration?: string;
    astrological_confirmation?: string[];
    development_recommendations?: string[];
    shadow_work_guidance?: string[];
  };
}

// Synthesis Data Types
export interface SynthesisData {
  overall_harmony?: number;
  integration_score?: number;
  contradictions?: string[];
  confirmations?: string[];
  unified_interpretation?: string;
  development_path?: {
    short_term_goals?: string[];
    long_term_vision?: string;
    spiritual_practices?: string[];
    psychological_work?: string[];
  };
  timing_guidance?: {
    favorable_periods?: Array<{
      timeframe: string;
      focus_areas: string[];
      recommended_actions: string[];
    }>;
    challenging_periods?: Array<{
      timeframe: string;
      potential_obstacles: string[];
      coping_strategies: string[];
    }>;
  };
}

// Multi-System Display Data
export interface MultiSystemDisplayData {
  western?: any; // Keep existing ChartData type
  vedic?: any;   // Keep existing VedicChartData type  
  chinese?: any; // Keep existing ChineseChartData type
  mayan?: any;   // Keep existing MayanChartData type
  uranian?: any; // Keep existing UranianChartData type
  spiritual?: any; // Keep existing SpiritualChartData type
  tcm?: TCMChartData;
  psychology?: PsychologyChartData;
  synthesis?: SynthesisData;
}

// Type guard functions
export const isTCMChartData = (data: unknown): data is TCMChartData => {
  return typeof data === 'object' && data !== null;
};

export const isPsychologyChartData = (data: unknown): data is PsychologyChartData => {
  return typeof data === 'object' && data !== null;
};

export const isSynthesisData = (data: unknown): data is SynthesisData => {
  return typeof data === 'object' && data !== null;
};
