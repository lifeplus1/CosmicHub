/**
 * Enhanced Backend Data Types for Type Bridge System
 * 
 * These interfaces mirror the Pydantic models in the backend
 * and provide type safety for API response transformation.
 */

import type { AspectType } from './astrology.types';

// Backend Planet Data (mirrors Pydantic model)
export interface BackendPlanetData {
  name: string;
  position: number;
  degree?: number;
  sign: string;
  house: number; // Always a number (1-12)
  retrograde?: boolean;
  speed?: number;
  dignity?: 'domicile' | 'exaltation' | 'fall' | 'detriment'; // Descriptive dignity types
  essential_dignity?: number;
  aspects?: BackendAspectData[];
  element?: 'fire' | 'earth' | 'air' | 'water'; // Descriptive element types
  modality?: 'cardinal' | 'fixed' | 'mutable'; // Descriptive modality types
  house_position?: 'early' | 'middle' | 'late'; // Descriptive house position
}

// Backend Aspect Data (mirrors Pydantic model)
export interface BackendAspectData {
  type?: AspectType; // Use existing AspectType from astrology.types
  aspect_type?: AspectType; // Use existing AspectType from astrology.types
  planet1: string;
  planet2: string;
  orb: number;
  exactness?: number;
  applying?: boolean;
  separating?: boolean;
  strength?: 'weak' | 'moderate' | 'strong' | 'very_strong'; // Descriptive strength types
}

// Backend House Data (mirrors Pydantic model)
export interface BackendHouseData {
  number: number;
  sign: string;
  degree: number;
  cusp?: number;
  ruler?: string;
  element?: string;
  modality?: string;
}

// Backend Chart Response (mirrors Pydantic model)
export interface BackendChartResponse {
  status: 'success' | 'error';
  data?: {
    planets?: Record<string, BackendPlanetData>;
    houses?: BackendHouseData[];
    aspects?: BackendAspectData[];
    angles?: Record<string, BackendPlanetData>;
    asteroids?: Record<string, BackendPlanetData>;
    points?: Record<string, BackendPlanetData>;
    birth_info?: {
      date: string;
      time: string;
      location: {
        latitude: number;
        longitude: number;
        city?: string;
        timezone: string;
      };
    };
  };
  error?: string;
}

// Multi-system response types (should match backend)
export interface BackendNumerologyData {
  life_path: number;
  destiny_number: number;
  soul_urge: number;
  personality_number: number;
  birth_day: number;
  // Add other numerology fields as needed
}

export interface BackendHumanDesignData {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  centers: Record<string, boolean>;
  channels?: string[];
  gates?: number[];
}

export interface BackendGeneKeysData {
  life_purpose: string;
  evolution: string;
  radiance: string;
  gift_sequence: string[];
  shadow_sequence: string[];
  // Add other Gene Keys fields
}
