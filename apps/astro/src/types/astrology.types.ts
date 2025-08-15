// apps/astro/src/types/astrology.types.ts

export interface PlanetData {
  name: string;
  sign: string;
  house: number;
  degree: number;
  aspects: Array<{ type: string; target: string; orb: number }>;
}

export interface AsteroidData {
  name: string;
  sign: string;
  house: number;
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
  applying: boolean;
}

export interface ChartData {
  planets: PlanetData[];
  asteroids: AsteroidData[];
  angles: AngleData[];
  houses: HouseData[];
  aspects: AspectData[];
}

export type ChartType = 'natal' | 'transit' | 'synastry';