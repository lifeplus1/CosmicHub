// apps/astro/src/types/astrology.types.ts

export interface Planet {
  sign: string;
  house: number;
  degree: number;
  aspects: Array<{ type: string; target: string; orb: number }>;
}

export interface TransitPlanet {
  sign: string;
  house: number;
  degree: number;
  aspects: Array<{ type: string; target: string; orb: number }>;
}

export interface Asteroid {
  sign: string;
  degree: number;
}

export interface House {
  sign: string;
  cusp: number;
  planets: string[];
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: boolean;
}

export interface ChartData {
  asteroids: Asteroid[];
  angles: Asteroid[]; // Using Asteroid temporarily as AngleData is similar
  houses: House[];
  aspects: Aspect[];
}
