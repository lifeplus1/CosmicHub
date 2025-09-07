/**
 * TCM Chart component types
 * Following Type Bridge System for frontend-backend consistency
 */

import type { UnifiedBirthData } from '@cosmichub/types';
import type { EducationalContent } from './educationalContent';
import type { TCMChartData as MainTCMChartData } from '../../types';

/**
 * Main TCM Chart component props - accepts main system type
 */
export interface TCMChartProps {
  data?: MainTCMChartData;
  birthData?: UnifiedBirthData;
  isLoading?: boolean;
}

/**
 * Local component data types for backward compatibility
 */
export interface ComponentTCMChartData {
  constitution?: ConstitutionData;
  elements?: ElementalBalance;
  meridians?: MeridianData;
  health?: HealthRecommendations;
  synthesis?: SynthesisData;
}

/**
 * Constitutional analysis data
 */
export interface ConstitutionData {
  primaryType: string;
  secondaryType?: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

/**
 * Five elements balance data
 */
export interface ElementalBalance {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

/**
 * Meridian system data
 */
export interface MeridianData {
  primary: string[];
  secondary: string[];
  blocked?: string[];
  recommendations: string[];
}

/**
 * Health recommendations data
 */
export interface HealthRecommendations {
  dietary: string[];
  lifestyle: string[];
  seasonal: string[];
  exercise: string[];
}

/**
 * Synthesis analysis data
 */
export interface SynthesisData {
  overview: string;
  keyInsights: string[];
  integration: string[];
  practicalSteps: string[];
}

/**
 * Tab types for navigation
 */
export type TCMTabType = 'constitution' | 'elements' | 'meridians' | 'health' | 'synthesis';

/**
 * Educational dialog state
 */
export interface EducationalDialogState {
  isOpen: boolean;
  topic: string;
  content: EducationalContent | null;
}

/**
 * Individual tab component props - uses transformed component data
 */
export interface TCMTabProps {
  chartData?: ComponentTCMChartData;
  isLoading?: boolean;
  onEducationalHelp?: (topic: string) => void;
}

/**
 * Educational dialog component props
 */
export interface TCMEducationDialogProps {
  isOpen: boolean;
  topic: string;
  content: EducationalContent | null;
  onClose: () => void;
}
