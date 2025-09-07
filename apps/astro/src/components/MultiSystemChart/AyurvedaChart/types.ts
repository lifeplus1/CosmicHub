/**
 * AyurvedaChart Type Definitions
 * Centralized type definitions for Ayurveda system components
 */

import type { UnifiedBirthData } from '@cosmichub/types';

export interface DoshaProfile {
  name: 'Vata' | 'Pitta' | 'Kapha';
  percentage: number;
  state: 'balanced' | 'excess' | 'deficient';
  qualities: string[];
  planetaryRuler: string;
  elementCorrelation: string;
  seasonalPeak: string;
  timeOfDay: string;
  characteristics: string[];
  imbalanceSymptoms: string[];
  balancingPractices: string[];
}

export interface ConstitutionalAnalysis {
  prakruti: {
    primary_dosha: DoshaProfile;
    secondary_dosha?: DoshaProfile;
    constitution_type: string;
    birth_constitution_summary: string;
  };
  vikruti: {
    current_state: string;
    imbalances: string[];
    seasonal_factors: string[];
    lifestyle_factors: string[];
  };
}

export interface PlanetaryHealth {
  planet: string;
  bodySystem: string;
  doshicInfluence: string;
  astrological_placement: string;
  health_correlation: string;
  preventive_measures: string[];
  optimal_timing: string;
}

export interface AyurvedaChartData {
  description?: string;
  constitutional_analysis?: ConstitutionalAnalysis;
  doshas_analysis?: {
    detailed_breakdown: DoshaProfile[];
    seasonal_variations: Record<string, string>;
    daily_rhythms: Record<string, string>;
    life_stage_considerations: string;
  };
  planetary_health?: {
    correlations: PlanetaryHealth[];
    birth_chart_health_map: string;
    vulnerable_periods: Record<string, string>;
  };
  wellness_plan?: {
    personalized_diet: {
      foods_to_favor: string[];
      foods_to_avoid: string[];
      seasonal_adjustments: Record<string, string[]>;
    };
    lifestyle_recommendations: {
      daily_routine: string[];
      exercise_guidelines: string[];
      sleep_optimization: string[];
    };
    herbal_support: {
      constitutional_herbs: string[];
      seasonal_herbs: Record<string, string[]>;
      contraindications: string[];
    };
  };
  synthesis?: {
    ayurveda_astrology_integration: string;
    dharmic_alignment: string;
    spiritual_development_path: string[];
    karmic_health_patterns: string;
  };
}

export interface AyurvedaChartProps {
  data?: AyurvedaChartData;
  birthData?: UnifiedBirthData;
  isLoading?: boolean;
}

export type TabType = 'constitution' | 'doshas' | 'planetary' | 'wellness' | 'synthesis';

// Tab component props
export interface TabComponentProps {
  data?: AyurvedaChartData;
  birthData?: UnifiedBirthData;
}
