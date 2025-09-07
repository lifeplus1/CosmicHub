/**
 * Spiritual Chart component types
 * Following Type Bridge System for frontend-backend consistency
 */

import type { UnifiedBirthData } from '@cosmichub/types';
import type {
  SpiritualSystemsData,
  SpiritualSynthesisData as _SpiritualSynthesisData,
  SephirahData as _SephirahData,
  KabbalahSystemData as _KabbalahSystemData,
  KabbalahPathData as _KabbalahPathData
} from '../../types';

/**
 * Main Spiritual Chart component props
 */
export interface SpiritualChartProps {
  chartData?: SpiritualSystemsData;
  birthData?: UnifiedBirthData;
  isLoading?: boolean;
}

/**
 * Local correspondence interfaces for spiritual analysis
 */
export interface DailyFocusCorrespondence {
  element: string;
  planet: string;
  theme: string;
  tarot?: string;
  hebrew_letter?: string;
  tree_path?: number;
  astrology?: string;
}

export interface LifePurposeCorrespondence {
  primary_energy: string;
  spiritual_goal: string;
  manifestation_style: string;
}

export interface SpiritualCenterCorrespondence {
  chakra: string;
  color: string;
  focus_area: string;
  sephirah?: string;
  astrology?: string;
  tarot_association?: string;
  element?: string;
}

export interface LocalCorrespondences {
  daily_focus?: DailyFocusCorrespondence;
  life_purpose?: LifePurposeCorrespondence;
  spiritual_center?: SpiritualCenterCorrespondence;
}

/**
 * Tab types for navigation
 */
export type SpiritualTabType = 'tarot' | 'kabbalah' | 'tree' | 'synthesis';

/**
 * Individual tab component props
 */
export interface SpiritualTabProps {
  chartData?: SpiritualSystemsData;
  isLoading?: boolean;
}

/**
 * Tarot card data interface
 */
export interface TarotCardData {
  name: string;
  number?: number;
  suit?: string;
  element?: string;
  meaning: string;
  guidance: string;
  keywords: string[];
  path?: number;
  hebrew_letter?: string;
}

/**
 * Sephirah interface for Tree of Life
 */
export interface SephirahInfo {
  id: number;
  name: string;
  meaning: string;
  element?: string;
  planet?: string;
  color?: string;
  attribute?: string;
  spiritual_experience?: string;
  virtue?: string;
  vice?: string;
}

/**
 * Kabbalah path interface
 */
export interface KabbalahPathInfo {
  id: number;
  from_sephirah: number;
  to_sephirah: number;
  hebrew_letter: string;
  tarot_card: string;
  element?: string;
  meaning: string;
  spiritual_lesson: string;
}

/**
 * Synthesis data for holistic overview
 */
export interface SpiritualSynthesis {
  overall_theme: string;
  key_insights: string[];
  spiritual_path: string;
  daily_practices: string[];
  integration_guidance: string[];
  chakra_focus?: string;
  primary_sephirah?: string;
  guiding_tarot?: string;
}

export type {
  SpiritualSystemsData,
  SpiritualSynthesisData,
  SephirahData,
  KabbalahSystemData,
  KabbalahPathData
} from '../../types';
