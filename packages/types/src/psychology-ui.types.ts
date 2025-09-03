/**
 * Psychology UI Component Types
 * These types are specifically designed for UI components and may differ
 * from backend calculation types to better serve presentation needs.
 */

export interface UICognitiveFunction {
  name: string;
  description: string;
  strength?: number;
  position?: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior';
}

export interface UIMBTIResult {
  type: string;
  title: string;
  description: string;
  cognitive_functions: UICognitiveFunction[];
  scores: Record<string, number>;
  dimension_scores: Record<string, number>;
  confidence: number;
  astrological_themes?: string;
  astrological_indicators?: Array<{
    aspect: string;
    planet: string;
    sign: string;
    house: number;
    influence: string;
  }>;
}

export interface UIEnneagramType {
  number: number;
  name: string;
  description: string;
  core_motivation: string;
  core_fear: string;
  healthy_traits: string[];
  average_traits: string[];
  unhealthy_traits: string[];
}

export interface UIEnneagramResult {
  core_type: number;
  primary_type: UIEnneagramType;
  type_name: string;
  description: string;
  top_three_types: Array<[number, number]>; // [typeNumber, score]
  wing?: number;
  instinct?: 'sp' | 'sx' | 'so';
  scores: Record<number, number>;
  confidence: number;
  core_motivation: string;
  core_fear: string;
  astrological_indicators?: Array<{
    aspect: string;
    planet: string;
    sign: string;
    house: number;
    influence: string;
  }>;
}

export interface PsychologyTabProps {
  mbtiResult?: UIMBTIResult;
  enneagramResult?: UIEnneagramResult;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export interface PersonalityInsight {
  title: string;
  description: string;
  confidence: number;
  source: 'mbti' | 'enneagram' | 'astrological' | 'combined';
}

export interface PsychologyAnalysis {
  insights: PersonalityInsight[];
  compatibility?: {
    romantic: number;
    friendship: number;
    business: number;
  };
  growth_areas?: string[];
  strengths?: string[];
}
