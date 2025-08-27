import type { Planet, House, Aspect, Asteroid, Angle } from '@cosmichub/types';

// Local explicit aliases consumed by ChartDisplay to make intent clear and allow
// future divergence (e.g. adding UI-only fields) without refactoring callers.
export type ChartDisplayPlanet = Planet;
export type ChartDisplayHouse = House;
export type ChartDisplayAspect = Aspect;
export type ChartDisplayAsteroid = Asteroid;
export type ChartDisplayAngle = Angle;

// Also re-export the base types for external consumers that still import from this barrel.
export type { Planet, House, Aspect, Asteroid, Angle };
