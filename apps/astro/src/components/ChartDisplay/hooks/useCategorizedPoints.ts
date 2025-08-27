import { useMemo } from 'react';
import type { ChartDisplayPlanet } from '../types';
import { getCelestialBodyCategory } from '../../../utils/celestialBodyCategorization';

export type CelestialPointCategory = 'lunar_nodes' | 'lilith_points' | 'special_points' | 'hypothetical';

export interface CategorizedPointsBuckets {
  lunar_nodes: ChartDisplayPlanet[];
  lilith_points: ChartDisplayPlanet[];
  special_points: ChartDisplayPlanet[];
  hypothetical: ChartDisplayPlanet[];
}

export function useCategorizedPoints(points: ChartDisplayPlanet[]) {
  return useMemo<CategorizedPointsBuckets>(() => {
    const buckets: CategorizedPointsBuckets = {
      lunar_nodes: [], lilith_points: [], special_points: [], hypothetical: []
    };
    points.forEach(p => {
      const cat = getCelestialBodyCategory(p.name) as CelestialPointCategory | undefined;
      if (cat && buckets[cat]) buckets[cat].push(p);
    });
    if (process.env.NODE_ENV === 'development') {
      (window as unknown as Record<string, unknown>).__categorizedPoints = buckets;
    }
    return buckets;
  }, [points]);
}
