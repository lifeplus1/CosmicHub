// ===== CORE ASTROLOGY ENTITIES =====

export interface Planet {
  name: string;
  sign: string;
  degree: number;
  position: number;
  house: string;
  retrograde?: boolean;
  aspects?: Aspect[];
}

export interface House {
  house: number;
  number: number;
  sign: string;
  degree: number;
  cusp: number;
  ruler: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: string;
}

export interface Asteroid {
  name: string;
  sign: string;
  degree: number;
  house: string;
}

export interface Angle {
  name: string;
  sign: string;
  degree: number;
  position: number;
}

export interface AstrologyChart {
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
  asteroids: Asteroid[];
  angles: Angle[];
}

// ===== APP-SPECIFIC DATA VARIANTS =====
// These provide alternative structures for different use cases

export interface PlanetData {
  name: string;
  sign: string;
  house: number; // number instead of string
  degree: number;
  aspects: Array<{ type: string; target: string; orb: number }>;
}

export interface AsteroidData {
  name: string;
  sign: string;
  house: number; // number instead of string
  degree: number;
  aspects: Array<{ type: string; target: string; orb: number }>;
}

export interface AngleData {
  name: string;
  sign: string;
  degree: number;
}

export interface HouseData {
  number: number;
  sign: string;
  cusp: number;
  planets: string[];
}

export interface AspectData {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying: boolean; // boolean instead of string
}

export interface ChartData {
  planets: PlanetData[];
  asteroids: AsteroidData[];
  angles: AngleData[];
  houses: HouseData[];
  aspects: AspectData[];
}

// ===== CHART TYPES =====

export type ChartType = 'natal' | 'transit' | 'synastry';

// ===== USER AND PROFILE DATA =====

export interface UserProfile {
  userId: string;
  birthData: {
    date: string;
    time: string;
    location: string;
  };
}

export interface NumerologyData {
  lifePath: number;
  destiny: number;
  personalYear: number;
}
