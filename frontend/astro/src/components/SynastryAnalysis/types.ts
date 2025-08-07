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

export interface ProgressBarProps {
  score: number;
  colorClass: string;
}

export interface StarRatingProps {
  score: number;
}

export interface CompatibilityScoreProps {
  synastryResult: SynastryResult;
  getCompatibilityColor: (score: number) => string;
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
