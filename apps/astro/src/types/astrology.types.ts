// apps/astro/src/types/astrology.types.ts
// Re-exports from consolidated @cosmichub/types package

export type {
  // App-specific data variants (with number house fields and boolean applying)
  PlanetData,
  AsteroidData, 
  AngleData,
  HouseData,
  AspectData,
  ChartData,
  ChartType,
  
  // Core astrology entities (for compatibility)
  Planet,
  House,
  Aspect,
  Asteroid,
  Angle,
  AstrologyChart,
  UserProfile,
  NumerologyData,
} from '@cosmichub/types';
