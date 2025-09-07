/**
 * Type definitions for SPIRITUAL-003.5 sacred geometry data
 */

export interface ChakraData {
  frequency: number;
  activation: number;
  color: string;
}

export interface ChakraResonance {
  root: ChakraData;
  sacral: ChakraData;
  solar_plexus: ChakraData;
  heart: ChakraData;
  throat: ChakraData;
  third_eye: ChakraData;
  crown: ChakraData;
}

export interface FlowerOfLifePattern {
  sacred_radius: number;
  golden_ratio_factor: number;
  pattern_layers: number;
  fibonacci_scaling: number[];
  resonance_frequencies: number[];
}

export interface MetatronsCube {
  vertex_count: number;
  sacred_connections: number;
  dimensional_bridges: number;
  platonic_solids_embedded: boolean;
  merkaba_activation: number;
}

export interface SacredPatterns {
  flower_of_life: FlowerOfLifePattern;
  metatrons_cube: MetatronsCube;
}

export interface ElementalBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface ConstitutionalProfile {
  primary_type: string;
  elemental_balance: ElementalBalance;
  chakra_resonance: ChakraResonance;
}

export interface StressPatterns {
  primary_trigger: string;
  sacred_geometry_affinity: number;
  flower_of_life_resonance: number;
  recommended_meditation: string;
}

export interface GrowthPotential {
  spiritual_expansion: number;
  geometric_intuition: number;
  sacred_pattern_recognition: number;
}

export interface PsychologicalInsights {
  stress_patterns: StressPatterns;
  growth_potential: GrowthPotential;
}

export interface SPIRITUAL_003_5_Meta {
  version: string;
  timestamp: string;
  chakra_system: string;
  sacred_geometry_level: string;
}

export interface SPIRITUAL_003_5_Data {
  meta: SPIRITUAL_003_5_Meta;
  constitutional_profile: ConstitutionalProfile;
  sacred_patterns: SacredPatterns;
  psychological_insights: PsychologicalInsights;
}
