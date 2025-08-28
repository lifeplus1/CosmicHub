import { useMemo } from 'react';
import type { ChartDisplayAspect } from '../types';
import type { AspectType } from '../tables';

export interface EnhancedAspectRow {
  planet1: string;
  planet2: string;
  aspect: string;
  aspectType: AspectType;
  orb: number;
  strength: 'exact' | 'strong' | 'moderate' | 'weak';
  applying: boolean;
  isMajor: boolean;
  angularDifference: number;
}

export function useEnhancedAspects(aspects: ChartDisplayAspect[]) {
  return useMemo<EnhancedAspectRow[]>(
    () =>
      aspects.map(a => {
        const absOrb = Math.abs(a.orb);
        const applying = (() => {
          if (typeof a.applying === 'boolean') return a.applying;
          if (typeof a.applying === 'string') {
            const s = a.applying.toLowerCase();
            return s === 'applying' || s === 'exact';
          }
          return absOrb < 3;
        })();
        return {
          planet1: a.planet1,
          planet2: a.planet2,
          aspect: a.type,
          aspectType: a.type.toLowerCase() as AspectType,
          orb: a.orb,
          strength:
            absOrb < 1
              ? 'exact'
              : absOrb < 2
                ? 'strong'
                : absOrb < 4
                  ? 'moderate'
                  : 'weak',
          applying,
          isMajor: [
            'conjunction',
            'opposition',
            'trine',
            'square',
            'sextile',
          ].includes(a.type.toLowerCase()),
          angularDifference: absOrb,
        };
      }),
    [aspects]
  );
}
