// TCM (Traditional Chinese Medicine) System Types

export interface WuXingElement {
  name: string;
  chineseName: string;
  season: string;
  organ: string;
  emotion: string;
  balanceLevel: 'high' | 'medium' | 'low';
  percentage: number;
  characteristics: string[];
  vulnerabilities: string[];
  balancing_elements: string[];
  recommendations: string[];
}

export interface TCMConstitutionType {
  name: string;
  description: string;
  characteristics: string[];
  vulnerabilities: string[];
  season?: string;
  organ?: string;
  emotion?: string;
  recommendations?: string[];
}

export interface TCMAnalysisData {
  primary_type: TCMConstitutionType;
  secondary_type?: TCMConstitutionType;
  constitution_types?: TCMConstitutionType[];
  wuxing_elements?: WuXingElement[];
  balance_score?: number;
  recommendations?: string[];
}

export interface OrganSystemBalance {
  name: string;
  balance: number;
  season: string;
  element: string;
  characteristics: string[];
  vulnerabilities: string[];
}

export interface MeridianFlowData {
  name: string;
  timeWindow: string;
  energy_level: number;
  blockages?: string[];
  flow_direction: 'ascending' | 'descending' | 'circular';
}

// ===== API-SPECIFIC TYPES =====

export interface ElementInfo {
  season?: string;
  organ_yin?: string;
  organ_yang?: string;
  emotion_balanced?: string;
  emotion_imbalanced?: string;
  planets?: string[];
  hours?: Record<string, string | number>;
}

export interface ElementalBalance {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface ConstitutionAnalysis {
  constitutional_type?: string;
  constitution_traits?: string[];
  primary_element?: string;
  element_strength?: number;
}

export interface TCMCalculationData {
  primary_element?: string;
  elemental_balance?: Record<string, number>;
  constitution_analysis?: ConstitutionAnalysis;
  analysis_confidence?: number;
  dietary_recommendations?: string[];
  lifestyle_recommendations?: string[];
  seasonal_guidance?: Record<string, string | number>;
}

export interface TCMResponse {
  success: boolean;
  data: TCMCalculationData;
  calculation_method: string;
  processing_time_ms: number;
  api_version: string;
  generated_at: string;
  includes_detailed_analysis: boolean;
}

// ===== REQUEST/RESPONSE MODELS =====

export interface TCMRequest {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  lat?: number;
  lon?: number;
  timezone?: string;
  user_id?: string;
  include_detailed_analysis?: boolean;
}

export interface ElementalBalanceResponse {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface ConstitutionAnalysisResponse {
  primary_element: string;
  secondary_element?: string;
  constitutional_type: string;
  element_strength: number;
  constitution_traits: string[];
}

export interface HealthRecommendationsResponse {
  element: string;
  dietary_recommendations: string[];
  lifestyle_recommendations: string[];
  optimal_season: string;
  balanced_emotion: string;
  dominant_organs: string[];
  generated_at: string;
}

export interface ElementInfoResponse {
  element: string;
  season?: string;
  organs: {
    yin?: string;
    yang?: string;
  };
  emotions: {
    balanced?: string;
    imbalanced?: string;
  };
  planetary_influences: string[];
  optimal_hours: Record<string, string | number>;
  generated_at: string;
}

// ===== TYPE ALIASES =====
export type ElementData = ElementInfo;
export type EngineElementData = Record<string, ElementData>;
export type TCMElementName = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// ===== UTILITY TYPES =====
export interface TCMHealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy';
  engine_available: boolean;
  version: string;
  timestamp: string;
}
