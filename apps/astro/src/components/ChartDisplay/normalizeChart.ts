import type {
  ChartDisplayPlanet,
  ChartDisplayHouse,
  ChartDisplayAspect,
  ChartDisplayAsteroid,
  ChartDisplayAngle,
} from './types';
import type { ChartData as ArrayChartData } from '@/types/astrology.types';
import type { ChartData as RecordChartData } from '@/types';

// Unified loose chart shape supporting legacy and new forms
export interface ChartLike {
  planets?: unknown;
  houses?: unknown;
  aspects?: unknown;
  asteroids?: unknown;
  angles?: unknown;
}

interface LoosePlanetInput {
  name?: string;
  sign?: string;
  position?: number;
  degree?: number;
  house?: string | number;
  aspects?: unknown[];
  retrograde?: boolean;
}
interface LooseHouseInput {
  house?: number;
  number?: number;
  sign?: string;
  degree?: number;
  cusp?: number;
  ruler?: string;
}
interface LooseAspectInput {
  planet1?: string;
  planet2?: string;
  type?: string;
  orb?: number | string;
  applying?: string;
}
interface LooseAsteroidInput {
  name?: string;
  sign?: string;
  degree?: number;
  house?: string | number;
}
interface LooseAngleInput {
  name?: string;
  sign?: string;
  degree?: number;
  position?: number | string;
}

export function isChartLike(obj: unknown): obj is ChartLike {
  if (obj === null || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return (
    'planets' in c ||
    'houses' in c ||
    'aspects' in c ||
    'asteroids' in c ||
    'angles' in c
  );
}

export function hasChartContent(chart: ChartLike): boolean {
  return [
    chart.planets,
    chart.houses,
    chart.aspects,
    chart.asteroids,
    chart.angles,
  ].some(section => {
    if (Array.isArray(section)) return section.length > 0;
    return section !== null && section !== undefined;
  });
}

// Helpers -------------------------------------------------------
export const getSignFromDegree = (degree: number): string => {
  const signs = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  const idx = Math.floor(degree / 30);
  const value = signs[idx];
  return typeof value === 'string' && value.length > 0 ? value : 'Unknown';
};

export const getRulerFromSign = (sign: string): string => {
  const rulers: Record<string, string> = {
    Aries: 'Mars',
    Taurus: 'Venus',
    Gemini: 'Mercury',
    Cancer: 'Moon',
    Leo: 'Sun',
    Virgo: 'Mercury',
    Libra: 'Venus',
    Scorpio: 'Mars',
    Sagittarius: 'Jupiter',
    Capricorn: 'Saturn',
    Aquarius: 'Uranus',
    Pisces: 'Neptune',
  };
  const value = rulers[sign];
  return typeof value === 'string' && value.length > 0 ? value : 'Unknown';
};

export const getAspectOrb = (
  aspectType: string,
  currentOrb?: number
): number => {
  const aspectTypeLower =
    typeof aspectType === 'string' ? aspectType.toLowerCase() : '';
  if (
    currentOrb !== null &&
    currentOrb !== undefined &&
    Number.isNaN(currentOrb) === false
  )
    return currentOrb;
  if (
    aspectTypeLower.includes('conjunction') ||
    aspectTypeLower.includes('opposition')
  )
    return 10;
  return 8;
};

function toPlanetArray(input: unknown): ChartDisplayPlanet[] {
  if (input === null || input === undefined) return [];
  if (Array.isArray(input)) return input as ChartDisplayPlanet[];
  if (typeof input === 'object') {
    return Object.entries(input as Record<string, LoosePlanetInput>).map(
      ([name, data]) => {
        const pos =
          typeof data.position === 'number'
            ? data.position
            : typeof data.degree === 'number'
              ? data.degree
              : 0;
        const degWithinSign = pos % 30;
        const displaySign = data.sign ?? getSignFromDegree(pos);
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          sign: displaySign,
          degree: degWithinSign,
          house:
            typeof data.house === 'number'
              ? String(data.house)
              : (data.house ?? 'Unknown'),
          aspects: Array.isArray(data.aspects) ? data.aspects : [],
          position: pos,
          retrograde: Boolean(data.retrograde),
        } as ChartDisplayPlanet;
      }
    );
  }
  return [];
}

function toHouseArray(input: unknown): ChartDisplayHouse[] {
  if (input === null || input === undefined) return [];
  const mapOne = (h: LooseHouseInput): ChartDisplayHouse => {
    const cusp =
      typeof h.cusp === 'number'
        ? h.cusp
        : typeof h.degree === 'number'
          ? h.degree
          : 0;
    return {
      house: h.number ?? h.house ?? 0,
      number: h.number ?? h.house ?? 0,
      sign: h.sign ?? getSignFromDegree(cusp),
      degree: cusp % 30,
      cusp,
      ruler: h.ruler ?? getRulerFromSign(h.sign ?? getSignFromDegree(cusp)),
    } as ChartDisplayHouse;
  };
  if (Array.isArray(input)) return (input as LooseHouseInput[]).map(mapOne);
  if (typeof input === 'object')
    return Object.values(input as Record<string, LooseHouseInput>).map(mapOne);
  return [];
}

function toAspectArray(input: unknown): ChartDisplayAspect[] {
  if (!Array.isArray(input)) return [];
  return (input as LooseAspectInput[]).map(a => {
    const type = a.type ?? 'Unknown';
    const rawOrb =
      typeof a.orb === 'number'
        ? a.orb
        : typeof a.orb === 'string'
          ? Number.isNaN(parseFloat(a.orb))
            ? 0
            : parseFloat(a.orb)
          : 0;
    const orb = getAspectOrb(type, rawOrb !== 0 ? rawOrb : undefined);
    return {
      planet1: a.planet1 ?? 'Unknown',
      planet2: a.planet2 ?? 'Unknown',
      type,
      orb,
      applying: a.applying ?? '',
    } as ChartDisplayAspect;
  });
}

function toAsteroidArray(input: unknown): ChartDisplayAsteroid[] {
  if (!Array.isArray(input)) return [];
  return (input as LooseAsteroidInput[]).map(a => ({
    name: a.name ?? 'Unknown',
    sign: a.sign ?? 'Unknown',
    degree: a.degree ?? 0,
    house: a.house ?? 'Unknown',
  })) as ChartDisplayAsteroid[];
}

function toAngleArray(input: unknown): ChartDisplayAngle[] {
  if (Array.isArray(input)) return input as ChartDisplayAngle[];
  if (input !== null && typeof input === 'object') {
    return Object.entries(
      input as Record<string, number | string | LooseAngleInput>
    ).map(([name, val]) => {
      let position: number = 0;
      if (typeof val === 'number') position = val;
      else if (typeof val === 'string')
        position = Number.isNaN(parseFloat(val)) ? 0 : parseFloat(val);
      else if (typeof val === 'object')
        position =
          typeof val.position === 'number'
            ? val.position
            : typeof val.degree === 'number'
              ? val.degree
              : 0;
      const degree = parseFloat((position % 30).toFixed(2));
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        sign: getSignFromDegree(position),
        degree,
        position,
      } as ChartDisplayAngle;
    });
  }
  return [];
}

export interface NormalizedChart {
  planets: ChartDisplayPlanet[];
  houses: ChartDisplayHouse[];
  aspects: ChartDisplayAspect[];
  asteroids: ChartDisplayAsteroid[];
  angles: ChartDisplayAngle[];
}

export function normalizeChart(raw: unknown): NormalizedChart {
  const planets = toPlanetArray((raw as ChartLike)?.planets);
  const houses = toHouseArray((raw as ChartLike)?.houses);
  const aspects = toAspectArray((raw as ChartLike)?.aspects);
  const asteroids = toAsteroidArray((raw as ChartLike)?.asteroids);
  const angles = toAngleArray((raw as ChartLike)?.angles);
  return { planets, houses, aspects, asteroids, angles };
}

export type { ArrayChartData, RecordChartData };
