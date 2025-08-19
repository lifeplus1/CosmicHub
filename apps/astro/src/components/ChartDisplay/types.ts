import type { Planet, House, Aspect, Asteroid, Angle } from '@cosmichub/types';

// Type aliases for ChartDisplay component
export type ChartDisplayPlanet = Planet;
export type ChartDisplayHouse = House;
export type ChartDisplayAspect = Aspect;
export type ChartDisplayAsteroid = Asteroid;
export type ChartDisplayAngle = Angle;

// Re-export the main types for convenience
export type { Planet, House, Aspect, Asteroid, Angle };