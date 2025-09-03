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
