import { useMemo } from 'react';
import type {
  ChartDisplayPlanet,
  ChartDisplayHouse,
  ChartDisplayAspect,
  ChartDisplayAsteroid,
  ChartDisplayAngle,
} from '../types';
import {
  normalizeChart,
  isChartLike,
  hasChartContent,
  getAspectOrb,
  type ChartLike,
} from '../normalizeChart';
import {
  getRulerFromSign,
  getSignFromDegrees,
  calculateHousePosition,
} from '../../../utils/astrologyUtils';
import { normalizePlanetName } from '../../../utils/type-bridge-utils';

export interface ProcessedSections {
  planets: ChartDisplayPlanet[];
  asteroids: ChartDisplayAsteroid[];
  angles: ChartDisplayAngle[];
  houses: ChartDisplayHouse[];
  aspects: ChartDisplayAspect[];
  points: ChartDisplayPlanet[];
}

const _PLANET_NAMES_SET: ReadonlySet<string> = new Set([
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
]);

// REMOVED: calculateHouseForPlanet - now using centralized calculateHousePosition

export function useProcessedSections(
  chartData: ChartLike | null,
  searchTerm: string
): ProcessedSections {
  return useMemo<ProcessedSections>(() => {
    if (
      !chartData ||
      typeof chartData !== 'object' ||
      !isChartLike(chartData) ||
      !hasChartContent(chartData)
    ) {
      return {
        planets: [],
        asteroids: [],
        angles: [],
        houses: [],
        aspects: [],
        points: [],
      };
    }
    const {
      planets: mainPlanetsArray,
      points: pointsArray,
      houses: housesArray,
      aspects: aspectsArray,
      asteroids: asteroidsArray,
      angles: anglesArray,
    } = normalizeChart(chartData);
    const isValidArray = <T>(arr: unknown): arr is T[] => Array.isArray(arr);
    const mainPlanets = isValidArray<ChartDisplayPlanet>(mainPlanetsArray)
      ? mainPlanetsArray
      : [];
    const points = isValidArray<ChartDisplayPlanet>(pointsArray)
      ? pointsArray
      : [];

    function filterEntities<T extends { [k in keyof T]: unknown }>(
      data: T[],
      fields: (keyof T)[],
      term: string
    ) {
      if (!term) return data;
      const lowered = term.toLowerCase();
      return data.filter(item =>
        fields.some(f => {
          const v = item[f];
          const stringValue = typeof v === 'string' ? v : String(v || '');
          return stringValue.toLowerCase().includes(lowered);
        })
      );
    }

    const enrichedPlanets = mainPlanets.map(p => {
      const hasHouse =
        p.house !== undefined && p.house !== null && typeof p.house === 'number';
      const position = typeof p.position === 'number' ? p.position : 0;
      const housesValid = Array.isArray(housesArray) && housesArray.length > 0;
      const calcHouse = hasHouse
        ? p.house
        : calculateHousePosition(
            position,
            housesValid ? housesArray.map(h => h.cusp ?? 0) : []
          );
      return { ...p, house: calcHouse };
    });
    const enrichedAngles = anglesArray.map(a => {
      const matchHouse = (_: string, idx: number) =>
        housesArray[idx]?.cusp ?? 0;
      if (a.name === 'Ascendant' && housesArray.length >= 1) {
        const pos = matchHouse('Ascendant', 0);
        return {
          ...a,
          sign: getSignFromDegrees(pos),
          degree: pos % 30,
        };
      }
      if (a.name?.toLowerCase() === 'mc' && housesArray.length >= 10) {
        const pos = housesArray[9]?.cusp ?? 0;
        return {
          ...a,
          sign: getSignFromDegrees(pos),
          degree: pos % 30,
        };
      }
      return a;
    });
    const enrichedHouses = housesArray.map(h => {
      const cusp = typeof h.cusp === 'number' ? h.cusp : 0;
      const signLowercase = getSignFromDegrees(cusp);
      const rulerString = h.ruler ?? getRulerFromSign(signLowercase);
      const rulerPlanet = rulerString ? normalizePlanetName(rulerString) : undefined;
      return {
        ...h,
        sign: signLowercase,
        degree: cusp % 30,
        ruler: rulerPlanet,
      };
    });
    const enrichedAspects = aspectsArray.map(a => {
      const hasApplying =
        typeof a.applying === 'string' && String(a.applying).length > 0;
      const isApplying = hasApplying
        ? String(a.applying).toLowerCase().includes('applying')
        : a.orb < 3; // Consider applying if orb is small
      return { ...a, orb: getAspectOrb(a.aspect_type, a.orb), applying: isApplying };
    });

    return {
      planets: filterEntities(
        enrichedPlanets,
        ['name', 'sign', 'house'],
        searchTerm
      ),
      asteroids: filterEntities(
        asteroidsArray,
        ['name', 'sign', 'house'],
        searchTerm
      ),
      angles: filterEntities(enrichedAngles, ['name', 'sign'], searchTerm),
      houses: filterEntities(enrichedHouses, ['number', 'sign'], searchTerm),
      aspects: filterEntities(
        enrichedAspects,
        ['planet1', 'planet2', 'aspect_type'],
        searchTerm
      ),
      points: filterEntities(points, ['name', 'sign', 'house'], searchTerm),
    };
  }, [chartData, searchTerm]);
}
