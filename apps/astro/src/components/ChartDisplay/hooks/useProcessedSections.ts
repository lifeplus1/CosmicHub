import { useMemo } from 'react';
import type { ChartDisplayPlanet, ChartDisplayHouse, ChartDisplayAspect, ChartDisplayAsteroid, ChartDisplayAngle } from '../types';
import { normalizeChart, isChartLike, hasChartContent, getAspectOrb, type ChartLike } from '../normalizeChart';
import { getRulerFromSign, getSignFromDegreesCapitalized, getSignFromDegrees } from '../../../utils/astrologyUtils';
import type { HouseCusp } from '../../../types/house-cusp';

export interface ProcessedSections {
  planets: ChartDisplayPlanet[];
  asteroids: ChartDisplayAsteroid[];
  angles: ChartDisplayAngle[];
  houses: ChartDisplayHouse[];
  aspects: ChartDisplayAspect[];
  points: ChartDisplayPlanet[];
}

const _PLANET_NAMES_SET: ReadonlySet<string> = new Set([
  'sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'
]);

export function calculateHouseForPlanet(planetPosition: number, houseCusps: HouseCusp[]): string {
  if (!Array.isArray(houseCusps) || houseCusps.length !== 12) return 'Unknown';
  const getOrdinal = (n: number) => {
    const v = Math.abs(n) % 100;
    if (v >= 11 && v <= 13) return `${n}th`;
    const last = v % 10;
    return `${n}${last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th'}`;
  };
  const sorted = houseCusps.map((h,i)=>({house:i+1,cusp:h.cusp ?? h.number ?? 0})).sort((a,b)=>a.cusp-b.cusp);
  for (let i=0;i<sorted.length;i++) {
    const cur = sorted[i]; const next = sorted[(i+1)%sorted.length];
    if (!cur || !next) continue;
    if (next.cusp > cur.cusp) {
      if (planetPosition >= cur.cusp && planetPosition < next.cusp) return getOrdinal(cur.house);
    } else {
      if (planetPosition >= cur.cusp || planetPosition < next.cusp) return getOrdinal(cur.house);
    }
  }
  return getOrdinal(1);
}

export function useProcessedSections(chartData: ChartLike | null, searchTerm: string): ProcessedSections {
  return useMemo<ProcessedSections>(() => {
    if (!chartData || typeof chartData !== 'object' || !isChartLike(chartData) || !hasChartContent(chartData)) {
      return { planets: [], asteroids: [], angles: [], houses: [], aspects: [], points: [] };
    }
  const { planets: mainPlanetsArray, points: pointsArray, houses: housesArray, aspects: aspectsArray, asteroids: asteroidsArray, angles: anglesArray } = normalizeChart(chartData);
    const isValidArray = <T,>(arr: unknown): arr is T[] => Array.isArray(arr);
  const mainPlanets = isValidArray<ChartDisplayPlanet>(mainPlanetsArray) ? mainPlanetsArray : [];
  const points = isValidArray<ChartDisplayPlanet>(pointsArray) ? pointsArray : [];

    function filterEntities<T extends { [k in keyof T]: unknown }>(data: T[], fields: (keyof T)[], term: string) {
      if (!term) return data; const lowered = term.toLowerCase();
      return data.filter(item => fields.some(f => { const v = item[f]; return typeof v === 'string' && v.toLowerCase().includes(lowered); }));
    }

    const enrichedPlanets = mainPlanets.map(p => {
      const hasHouse = p.house !== undefined && p.house !== null && p.house !== 'Unknown';
      const position = typeof p.position === 'number' ? p.position : 0;
      const housesValid = Array.isArray(housesArray) && housesArray.length > 0;
      const calcHouse = hasHouse ? p.house : String(calculateHouseForPlanet(position, housesValid ? (housesArray as HouseCusp[]) : []));
      return { ...p, house: calcHouse };
    });
    const enrichedAngles = anglesArray.map(a => {
      const matchHouse = (_: string, idx: number) => housesArray[idx]?.cusp ?? 0;
      if (a.name === 'Ascendant' && housesArray.length >= 1) {
        const pos = matchHouse('Ascendant', 0);
        return { ...a, sign: getSignFromDegreesCapitalized(pos), degree: pos % 30 };
      }
      if (a.name?.toLowerCase() === 'mc' && housesArray.length >= 10) {
        const pos = housesArray[9]?.cusp ?? 0;
        return { ...a, sign: getSignFromDegreesCapitalized(pos), degree: pos % 30 };
      }
      return a;
    });
    const enrichedHouses = housesArray.map(h => {
      const cusp = typeof h.cusp === 'number' ? h.cusp : 0;
      return { ...h, sign: getSignFromDegreesCapitalized(cusp), degree: cusp % 30, ruler: h.ruler ?? getRulerFromSign(getSignFromDegrees(cusp)) };
    });
    const enrichedAspects = aspectsArray.map(a => {
      const hasApplying = typeof a.applying === 'string' && a.applying.length > 0;
      const status = hasApplying ? a.applying : a.orb < 1 ? 'Exact' : a.orb < 3 ? 'Applying' : 'Separating';
      return { ...a, orb: getAspectOrb(a.type, a.orb), applying: status };
    });

    return {
      planets: filterEntities(enrichedPlanets, ['name','sign','house'], searchTerm),
      asteroids: filterEntities(asteroidsArray, ['name','sign','house'], searchTerm),
      angles: filterEntities(enrichedAngles, ['name','sign'], searchTerm),
      houses: filterEntities(enrichedHouses, ['house','sign'], searchTerm),
      aspects: filterEntities(enrichedAspects, ['planet1','planet2','type'], searchTerm),
      points: filterEntities(points, ['name','sign','house'], searchTerm),
    };
  }, [chartData, searchTerm]);
}
