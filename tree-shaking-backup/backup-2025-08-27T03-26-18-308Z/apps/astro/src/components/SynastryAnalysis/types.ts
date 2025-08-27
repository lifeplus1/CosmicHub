import type { BirthData } from '../../types';

export interface SynastryAnalysisProps {
  person1: BirthData;
  person2: BirthData;
  person1Name?: string;
  person2Name?: string;
}

export interface SynastryResult {
  compatibility_analysis: {
    overall_score: number;
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
export interface ProgressBarProps {
  score: number;
  tier: 'excellent' | 'good' | 'moderate' | 'low';
}

export interface StarRatingProps {
  score: number;
}

export interface CompatibilityScoreProps {
  synastryResult: SynastryResult;
}

export interface KeyAspectsProps {
  synastryResult: SynastryResult;
  getAspectColor: (aspect: string) => string;
  formatPlanetName: (planet: string) => string;
}

export interface HouseOverlaysProps {
  synastryResult: SynastryResult;
  formatPlanetName: (planet: string) => string;
}

export interface CompositeChartProps {
  synastryResult: SynastryResult;
}

export interface RelationshipSummaryProps {
  synastryResult: SynastryResult;
}
