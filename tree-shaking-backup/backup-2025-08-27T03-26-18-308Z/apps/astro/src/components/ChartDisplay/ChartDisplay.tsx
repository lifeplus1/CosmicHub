import React, { memo, useMemo, useState } from 'react';
import type { AstrologyChart as _AstrologyChart } from '@cosmichub/types';
import type { ChartData as _ChartData } from '../../services/api.types';
import type {
  ChartDisplayPlanet,
  ChartDisplayHouse,
  ChartDisplayAspect,
  ChartDisplayAsteroid,
  ChartDisplayAngle,
} from './types';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipProvider,
  Button,
  Input,
  Badge,
  ErrorBoundary,
  Accordion,
  AccordionItem as _AccordionItem,
  AccordionTrigger as _AccordionTrigger,
  AccordionContent as _AccordionContent,
} from '@cosmichub/ui';
// Extracted table components (barrel export)
import {
  PlanetTable,
  CelestialBodiesTable,
  convertToCelestialBodies,
} from './tables';
import { default as _AspectTable } from './tables/AspectTable';
import HouseTable, { type HouseRow } from './tables/HouseTable';
import AngleTable, { type AngleRow } from './tables/AngleTable';
import AsteroidTable, { type AsteroidRow } from './tables/AsteroidTable';
import EnhancedAspectTable, {
  type AspectType,
} from './tables/EnhancedAspectTable';
// AI-001 Enhanced Components
import { AI001Dashboard as _AI001Dashboard } from '../AI001/AI001Dashboard';
import { useAI001Analysis as _useAI001Analysis } from '../../services/ai-001-enhanced';
import {
  getPlanetSymbol as _getPlanetSymbol,
  getSignSymbol as _getSignSymbol,
  getAsteroidSymbol as _getAsteroidSymbol,
  getAspectSymbol as _getAspectSymbol,
} from './tables/tableUtils';
// FIXED: Import both services with descriptive names for clarity
import { fetchSavedChart } from '../../services/astrologyService'; // Fetch saved charts from Firebase
import { fetchChartData as _fetchChartData } from '../../services/api'; // Calculate new charts from birth data
// Alias the array-based ChartData (planets/houses/aspects as arrays)
import type { ChartType } from '../../types/astrology.types';
import { sampleChartData } from './sampleData';
import {
  normalizeChart,
  isChartLike,
  hasChartContent,
  type ChartLike,
  getAspectOrb,
} from './normalizeChart';
import {
  getRulerFromSign,
  getSignFromDegreesCapitalized,
  getSignFromDegrees,
} from '../../utils/astrologyUtils';
import { validateChart } from './validateChart';
import {
  AstrologySettingsPanel as _AstrologySettingsPanel,
  type AstrologySettings,
  defaultAstrologySettings,
} from './AstrologySettings';
import { CollapsibleTable } from './CollapsibleTable';
import { ViewSpecificSettings } from './ViewSpecificSettings';
import { getCelestialBodyCategory } from '../../utils/celestialBodyCategorization';
import { type PlanetRow } from './tables/PlanetTable';

// Type definitions for chart data structures
// Base interfaces for chart entities
export interface ChartPlanet {
  name: string;
  sign: string;
  house?: string | number;
  degree: number;
  position?: number;
  retrograde?: boolean;
}

export interface ChartHouse {
  number: number;
  house?: number; // Legacy support
  sign: string;
  cusp: number;
  ruler?: string;
}

export interface ChartAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying?: string;
}

export interface ExportableChart {
  planets: ChartPlanet[];
  houses: ChartHouse[];
  aspects: ChartAspect[];
  asteroids?: ChartDisplayAsteroid[];
  angles?: ChartDisplayAngle[];
}

// Enhanced export functionality with serialization (removed unused *Like helper interfaces)

// (Removed unused isChartPlanet / isChartHouse / isChartAspect guards)
// Legacy type import required for house calculations
import type { HouseCusp } from '../../types/house-cusp';

// Internal logger shim (no-op to satisfy no-console rule while keeping instrumentation points)
const log = {
  debug: (...args: unknown[]): void => {
    void args.length;
  },
  info: (...args: unknown[]): void => {
    void args.length;
  },
  warn: (...args: unknown[]): void => {
    void args.length;
  },
  error: (...args: unknown[]): void => {
    void args.length;
  },
};

// Helper function to calculate which house a planet is in (retain locally; uses centralized astrology utils)
const calculateHouseForPlanet = (
  planetPosition: number,
  houseCusps: HouseCusp[]
): string => {
  if (!Array.isArray(houseCusps) || houseCusps.length !== 12) {
    return 'Unknown';
  }

  // Helper function to convert number to ordinal (1st, 2nd, 3rd, etc.)
  const getOrdinal = (num: number): string => {
    const v = Math.abs(num) % 100;
    const teen = v >= 11 && v <= 13;
    if (teen) return `${num}th`;
    const last = v % 10;
    const suffix =
      last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
    return `${num}${suffix}`;
  };

  // Sort house cusps by position
  const sortedCusps = houseCusps
    .map((h, i) => ({
      house: i + 1,
      cusp: h.cusp ?? h.number ?? 0,
    }))
    .sort((a, b) => a.cusp - b.cusp);

  // Find which house the planet falls into
  for (let i = 0; i < sortedCusps.length; i++) {
    const currentHouse = sortedCusps[i];
    const nextHouse = sortedCusps[(i + 1) % sortedCusps.length];
    if (!currentHouse || !nextHouse) continue;

    if (nextHouse.cusp > currentHouse.cusp) {
      // Normal case
      if (
        planetPosition >= currentHouse.cusp &&
        planetPosition < nextHouse.cusp
      ) {
        return getOrdinal(currentHouse.house);
      }
    } else {
      // Wrap around case (e.g., 12th to 1st house)
      if (
        planetPosition >= currentHouse.cusp ||
        planetPosition < nextHouse.cusp
      ) {
        return getOrdinal(currentHouse.house);
      }
    }
  }

  return getOrdinal(1); // Default fallback
};

// (getSignFromDegree, getRulerFromSign, getAspectOrb, isChartLike, hasChartContent now imported)

// Enhanced export functionality with serialization (unused helper interfaces removed)

// Moved ExportableChart interface to the top of the file

// Safe coercion helpers for export (avoid unsafe member access)
const coercePlanet = (v: unknown): ChartPlanet => {
  const obj =
    typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};
  return {
    name: typeof obj['name'] === 'string' ? obj['name'] : '',
    sign: typeof obj['sign'] === 'string' ? obj['sign'] : '',
    house:
      typeof obj['house'] === 'string' || typeof obj['house'] === 'number'
        ? obj['house']
        : undefined,
    degree: typeof obj['degree'] === 'number' ? obj['degree'] : 0,
    position: typeof obj['position'] === 'number' ? obj['position'] : undefined,
    retrograde:
      typeof obj['retrograde'] === 'boolean' ? obj['retrograde'] : undefined,
  };
};
const coerceHouse = (v: unknown): ChartHouse => {
  const obj =
    typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};
  const numberRaw = obj['number'];
  const houseRaw = obj['house'];
  const number =
    typeof numberRaw === 'number'
      ? numberRaw
      : typeof houseRaw === 'number'
        ? houseRaw
        : 0;
  const cuspRaw = obj['cusp'];
  return {
    number,
    house: typeof houseRaw === 'number' ? houseRaw : undefined,
    sign: typeof obj['sign'] === 'string' ? obj['sign'] : '',
    cusp: typeof cuspRaw === 'number' ? cuspRaw : 0,
    ruler: typeof obj['ruler'] === 'string' ? obj['ruler'] : undefined,
  };
};
const coerceAspect = (v: unknown): ChartAspect => {
  const obj =
    typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};
  return {
    planet1: typeof obj['planet1'] === 'string' ? obj['planet1'] : '',
    planet2: typeof obj['planet2'] === 'string' ? obj['planet2'] : '',
    type: typeof obj['type'] === 'string' ? obj['type'] : '',
    orb: typeof obj['orb'] === 'number' ? obj['orb'] : 0,
    applying: typeof obj['applying'] === 'string' ? obj['applying'] : undefined,
  };
};

const exportChartData = (
  raw: unknown,
  format: 'json' | 'csv' | 'txt'
): void => {
  if (
    raw === null ||
    typeof raw !== 'object' ||
    !isChartLike(raw) ||
    !hasChartContent(raw)
  ) {
    log.error('Invalid chart data for export');
    return;
  }
  const chartData: ChartLike = raw; // already narrowed
  const planets = Array.isArray(chartData.planets)
    ? chartData.planets.map(coercePlanet)
    : [];
  const houses = Array.isArray(chartData.houses)
    ? chartData.houses.map(coerceHouse)
    : [];
  const aspects = Array.isArray(chartData.aspects)
    ? chartData.aspects.map(coerceAspect)
    : [];
  const asteroids = Array.isArray(chartData.asteroids)
    ? (chartData.asteroids.filter(
        a => typeof a === 'object' && a !== null
      ) as ChartDisplayAsteroid[])
    : undefined;
  const angles = Array.isArray(chartData.angles)
    ? (chartData.angles.filter(
        a => typeof a === 'object' && a !== null
      ) as ChartDisplayAngle[])
    : undefined;
  const exportable: ExportableChart = {
    planets,
    houses,
    aspects,
    asteroids,
    angles,
  };

  const ts = new Date().toISOString().split('T')[0];
  const base = `natal-chart-${ts}`;
  let content = '';
  let mime = '';
  const ext: 'json' | 'csv' | 'txt' = format;
  try {
    switch (format) {
      case 'json': {
        content = JSON.stringify(exportable, null, 2);
        mime = 'application/json';
        break;
      }
      case 'csv': {
        const header = 'Planet,Sign,House,Degree\n';
        const rows = planets
          .map(
            p => `${p.name},${p.sign},${p.house ?? ''},${p.degree.toFixed(2)}`
          )
          .join('\n');
        content = header + rows;
        mime = 'text/csv';
        break;
      }
      case 'txt': {
        const planetLines = planets
          .map(
            p =>
              `${p.name}: ${p.sign} in House ${p.house ?? 'Unknown'} (${p.degree.toFixed(2)}°)`
          )
          .join('\n');
        const houseLines = houses
          .map(h => `House ${h.number}: ${h.sign} (${h.cusp.toFixed(2)}°)`)
          .join('\n');
        const aspectLines = aspects
          .map(
            a =>
              `${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}° orb)`
          )
          .join('\n');
        content = `NATAL CHART DATA\n\nPLANETS:\n${planetLines}\n\nHOUSES:\n${houseLines}\n\nASPECTS:\n${aspectLines}`;
        mime = 'text/plain';
        break;
      }
    }
  } catch (e) {
    log.error('Export serialization failed', e);
    return;
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${base}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Planet interpretation imported from tableUtils
// (Removed unused PlanetMinimal + guard)

const shareChart = async (chartData: unknown): Promise<void> => {
  if (
    chartData === null ||
    typeof chartData !== 'object' ||
    !isChartLike(chartData)
  ) {
    log.error('Invalid chart data for sharing');
    return;
  }

  const findPlanetSign = (
    planets: ChartPlanet[],
    planetName: string
  ): string => {
    if (!Array.isArray(planets) || planets.length === 0) {
      return 'Unknown';
    }

    const planet = planets.find(p => {
      if (typeof p !== 'object' || p === null) return false;
      if (typeof p.name !== 'string' || typeof p.sign !== 'string')
        return false;
      return p.name.toLowerCase() === planetName.toLowerCase();
    });

    return planet?.sign ?? 'Unknown';
  };

  const planetsRaw = Array.isArray(chartData.planets) ? chartData.planets : [];
  const planets: ChartPlanet[] = planetsRaw.filter(
    p =>
      typeof p === 'object' &&
      p !== null &&
      typeof (p as { name?: unknown }).name === 'string' &&
      typeof (p as { sign?: unknown }).sign === 'string' &&
      typeof (p as { degree?: unknown }).degree === 'number'
  ) as ChartPlanet[];
  const sunSign = findPlanetSign(planets, 'sun');
  const moonSign = findPlanetSign(planets, 'moon');

  const shareData = {
    title: 'My Natal Chart Analysis',
    text: `Check out my natal chart! Sun in ${sunSign}, Moon in ${moonSign}`,
    url: window.location.href,
  };

  const canShare =
    typeof navigator === 'object' &&
    navigator !== null &&
    typeof navigator.share === 'function';

  const canCopy =
    typeof navigator === 'object' &&
    navigator !== null &&
    typeof navigator.clipboard === 'object' &&
    navigator.clipboard !== null &&
    typeof navigator.clipboard.writeText === 'function';

  try {
    if (canShare) {
      await navigator.share(shareData);
    } else if (canCopy) {
      await navigator.clipboard.writeText(window.location.href);
      alert('Chart link copied to clipboard!');
    } else {
      log.warn('No sharing methods available');
    }
  } catch (error) {
    if (error instanceof Error) {
      log.error('Share failed:', error.message);
    } else {
      log.error('Share failed with unknown error');
    }
  }
};

// Reusable table components for modularity
// PlanetTable extracted to separate file

// AngleTable extracted to separate file

// HouseTable extracted to separate file

// Removed unused ProcessedAngleData interface (angles rendered directly)

// AspectTable extracted to separate file

export interface ChartDisplayProps {
  /**
   * Unified chart object. Must provide an object that at least
   * exposes one of planets/houses/aspects/asteroids/angles.
   * If both chart and chartId are provided, chart takes precedence.
   */
  chart?: ChartLike | null;
  /** Remote chart id to fetch if chart prop not provided */
  chartId?: string | null;
  /** Astrology chart category (affects fetch + header copy) */
  chartType?: ChartType;
  /** Callback invoked when user saves chart (skips internal sync when supplied) */
  onSaveChart?: (data: ChartLike) => void | Promise<void>;
}

const ChartDisplayComponent: React.FC<ChartDisplayProps> = ({
  chart,
  chartId,
  chartType = 'natal',
  onSaveChart: _onSaveChart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [useUnifiedView, setUseUnifiedView] = useState(true); // Start with unified view
  const [showSettings, setShowSettings] = useState(false);
  const [showAI001, setShowAI001] = useState(false); // AI-001 enhanced features toggle

  // Professional astrology settings with persistence and error handling
  const [astrologySettings, setAstrologySettings] = useState<AstrologySettings>(
    () => {
      try {
        const savedSettings = localStorage.getItem(
          'cosmichub-astrology-settings'
        );
        if (savedSettings) {
          const parsed = JSON.parse(
            savedSettings
          ) as Partial<AstrologySettings>;
          // Merge with defaults to handle version updates
          return { ...defaultAstrologySettings, ...parsed };
        }
      } catch (error) {
        log.warn('Failed to load saved astrology settings:', error);
      }
      return defaultAstrologySettings;
    }
  );

  // Persist expanded table sections for better UX
  const [_expandedSections, setExpandedSections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cosmichub-expanded-sections');
      if (saved) {
        return JSON.parse(saved) as string[];
      }
      // Smart defaults: expand planets and houses by default
      return useUnifiedView ? ['unified-celestial'] : ['planets', 'houses'];
    } catch (error) {
      log.warn('Failed to load expanded sections:', error);
      return useUnifiedView ? ['unified-celestial'] : ['planets', 'houses'];
    }
  });

  // Persist settings and expanded sections changes
  const handleSettingsChange = (newSettings: AstrologySettings) => {
    try {
      setAstrologySettings(newSettings);
      localStorage.setItem(
        'cosmichub-astrology-settings',
        JSON.stringify(newSettings)
      );
    } catch (error) {
      log.warn('Failed to save astrology settings:', error);
      // Still update state even if saving fails
      setAstrologySettings(newSettings);
    }
  };

  const _handleExpandedSectionsChange = (newExpandedSections: string[]) => {
    try {
      setExpandedSections(newExpandedSections);
      localStorage.setItem(
        'cosmichub-expanded-sections',
        JSON.stringify(newExpandedSections)
      );
    } catch (error) {
      log.warn('Failed to save expanded sections:', error);
      // Still update state even if saving fails
      setExpandedSections(newExpandedSections);
    }
  };

  // Enhanced chart data fetching with robust error handling
  const {
    data: fetchedChartData,
    isLoading,
    error,
    refetch: _refetch,
  } = useQuery({
    queryKey: ['chartData', chartId, chartType],
    queryFn: async () => {
      if (chartId === null || chartId === undefined || chartId === '') {
        throw new Error('Missing chartId');
      }

      try {
        return await fetchSavedChart(chartId, chartType);
      } catch (err) {
        log.error('Failed to fetch chart data:', err);
        throw err;
      }
    },
    // enabled only when we have a chartId and no inline chart provided
    enabled:
      chart === null &&
      chartId !== null &&
      typeof chartId === 'string' &&
      chartId.length > 0,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors, but not for validation errors
      if (failureCount < 2) {
        const errorMessage = error?.message || '';
        return (
          !errorMessage.includes('Missing chartId') &&
          !errorMessage.includes('validation')
        );
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  });

  // Use provided chart or fetched chart data - memoize to prevent unnecessary re-renders
  const chartData = useMemo<ChartLike>((): ChartLike => {
    const providedData = chart ?? fetchedChartData;
    const sampleData: ChartLike = sampleChartData as ChartLike;

    log.debug('🔄 ChartDisplay: chartData useMemo triggered');
    log.debug('  - chart prop:', chart ? 'provided' : 'null');
    log.debug('  - fetchedChartData:', fetchedChartData ? 'available' : 'null');
    log.debug('  - providedData:', providedData ? 'available' : 'null');

    // TEMPORARY DEBUG: Log data source for troubleshooting
    if (typeof window !== 'undefined' && window.console) {
      window.console.group('🔍 ChartDisplay Data Source Debug');
      window.console.log('Chart prop provided:', !!chart);
      window.console.log('Fetched chart data available:', !!fetchedChartData);
      window.console.log(
        'Data source:',
        chart ? 'DIRECT_PROP' : fetchedChartData ? 'SAVED_CHART' : 'NONE'
      );
      if (providedData) {
        window.console.log('Provided data keys:', Object.keys(providedData));
        window.console.log(
          'Has __raw_backend_response:',
          !!(providedData as Record<string, unknown>).__raw_backend_response
        );
      }
      window.console.groupEnd();
    }

    // Explicit check for valid data
    if (
      providedData === null ||
      providedData === undefined ||
      typeof providedData !== 'object'
    ) {
      log.debug(
        '🚨 ChartDisplay: No valid chart data found, using sample data'
      );
      log.warn('No valid chart data found, using sample data');
      return sampleData;
    }

    log.debug('🔍 ChartDisplay: Checking data structure...', {
      isChartLike: isChartLike(providedData as ChartLike),
      hasContent: hasChartContent(providedData as ChartLike),
    });

    if (
      !isChartLike(providedData as ChartLike) ||
      !hasChartContent(providedData as ChartLike)
    ) {
      log.debug(
        '🚨 ChartDisplay: Invalid chart data structure, using sample data'
      );
      log.warn('Invalid chart data structure, using sample data');
      return sampleData;
    }

    log.debug('🔍 ChartDisplay: Validating chart...');
    const validatedChart = validateChart(providedData as ChartLike);
    if (validatedChart === null || typeof validatedChart !== 'object') {
      log.debug('🚨 ChartDisplay: Chart validation failed, using sample data');
      log.warn('Chart validation failed, using sample data');
      return sampleData;
    }

    log.debug(
      '✅ ChartDisplay: Using real chart data, first planet:',
      Object.entries(validatedChart.planets ?? {})[0]
    );

    return validatedChart;
    // deps: changes only when caller supplies new chart ref or fetch returns new data
  }, [chart, fetchedChartData]);

  // Processed sections maintain original numeric degrees; formatting applied at render time
  interface ProcessedSections {
    planets: ChartDisplayPlanet[];
    asteroids: ChartDisplayAsteroid[];
    angles: ChartDisplayAngle[];
    houses: ChartDisplayHouse[];
    aspects: ChartDisplayAspect[];
    points: ChartDisplayPlanet[]; // Points like nodes and Lilith
  }
  const processedSections =
    useMemo<ProcessedSections>((): ProcessedSections => {
      if (
        chartData === null ||
        typeof chartData !== 'object' ||
        !isChartLike(chartData)
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

      // TEMPORARY DEBUG: Log data being passed to normalizeChart
      if (typeof window !== 'undefined' && window.console) {
        window.console.group('🔄 ProcessedSections normalization');
        window.console.log('ChartData being normalized:', chartData);
        window.console.log('ChartData keys:', Object.keys(chartData));
        window.console.log('ChartData type check results:', {
          isChartLike: isChartLike(chartData),
          hasContent: hasChartContent(chartData),
        });
        window.console.groupEnd();
      }

      const {
        planets: allBodiesArray,
        houses: housesArray,
        aspects: aspectsArray,
        asteroids: asteroidsArray,
        angles: anglesArray,
      } = normalizeChart(chartData);

      // Ensure arrays with type guards
      const isValidArray = <T,>(arr: unknown): arr is T[] => Array.isArray(arr);

      // Separate main planets from points based on categorization
      const allBodies = isValidArray<ChartDisplayPlanet>(allBodiesArray)
        ? allBodiesArray
        : [];
      const mainPlanets: ChartDisplayPlanet[] = [];
      const points: ChartDisplayPlanet[] = [];

      const planetNames = [
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
      ];
      allBodies.forEach(body => {
        if (planetNames.includes(body.name.toLowerCase())) {
          mainPlanets.push(body);
        } else {
          points.push(body); // All non-traditional planets are points (nodes, lilith, uranian, etc.)
        }
      });

      const sections = {
        planets: mainPlanets,
        houses: isValidArray<ChartDisplayHouse>(housesArray) ? housesArray : [],
        aspects: isValidArray<ChartDisplayAspect>(aspectsArray)
          ? aspectsArray
          : [],
        asteroids: isValidArray<ChartDisplayAsteroid>(asteroidsArray)
          ? asteroidsArray
          : [],
        angles: isValidArray<ChartDisplayAngle>(anglesArray) ? anglesArray : [],
        points: points,
      };
      log.debug('processed_counts', {
        planets: sections.planets.length,
        houses: sections.houses.length,
        aspects: sections.aspects.length,
        asteroids: sections.asteroids.length,
        angles: sections.angles.length,
        points: sections.points.length,
      });

      // TEMPORARY: Debug actual data structure for troubleshooting
      if (sections.planets.length === 0 && sections.aspects.length > 0) {
        log.debug(
          '🔍 Data Issue: No planets but aspects exist - possible data structure problem'
        );
      }

      // Return early if no search term filtering will be applied later
      // (the enriched + filtered result set is returned at the end of the hook)
      // Type-safe search for chart entities
      function filterChartEntities<
        T extends
          | ChartDisplayPlanet
          | ChartDisplayHouse
          | ChartDisplayAspect
          | ChartDisplayAsteroid
          | ChartDisplayAngle,
      >(data: T[], fields: Array<keyof T>, term: string): T[] {
        if (term === null || term === undefined || term.length === 0) {
          return data;
        }
        const lowered = term.toLowerCase();

        return data.filter(item =>
          fields.some(field => {
            const value = item[field];
            return (
              value !== null &&
              value !== undefined &&
              typeof value === 'string' &&
              value.length > 0 &&
              value.toLowerCase().includes(lowered)
            );
          })
        );
      }
      const enrichedPlanets = sections.planets.map((p): ChartDisplayPlanet => {
        const hasHouse =
          p.house !== undefined && p.house !== null && p.house !== 'Unknown';
        const position = typeof p.position === 'number' ? p.position : 0;
        const housesValid =
          Array.isArray(sections.houses) && sections.houses.length > 0;
        const calcHouse = hasHouse
          ? p.house
          : String(
              calculateHouseForPlanet(
                position,
                housesValid ? (sections.houses as HouseCusp[]) : []
              )
            );
        return { ...p, house: calcHouse };
      });
      const enrichedAngles = anglesArray.map((a): ChartDisplayAngle => {
        const matchHouse = (_name: string, idx: number): number =>
          housesArray[idx]?.cusp ?? 0;
        if (a.name === 'Ascendant' && housesArray.length >= 1) {
          const pos = matchHouse('Ascendant', 0);
          return {
            ...a,
            sign: getSignFromDegreesCapitalized(pos),
            degree: pos % 30,
          };
        }
        if (a.name?.toLowerCase() === 'mc' && housesArray.length >= 10) {
          const pos = housesArray[9]?.cusp ?? 0;
          return {
            ...a,
            sign: getSignFromDegreesCapitalized(pos),
            degree: pos % 30,
          };
        }
        return a;
      });
      const enrichedHouses = housesArray.map((h): ChartDisplayHouse => {
        const cusp = typeof h.cusp === 'number' ? h.cusp : 0;
        return {
          ...h,
          sign: getSignFromDegreesCapitalized(cusp),
          degree: cusp % 30,
          ruler: h.ruler ?? getRulerFromSign(getSignFromDegrees(cusp)),
        };
      });
      const enrichedAspects = aspectsArray.map((a): ChartDisplayAspect => {
        const hasApplying =
          typeof a.applying === 'string' && a.applying.length > 0;
        const status = hasApplying
          ? a.applying
          : a.orb < 1
            ? 'Exact'
            : a.orb < 3
              ? 'Applying'
              : 'Separating';
        return { ...a, orb: getAspectOrb(a.type, a.orb), applying: status };
      });
      const enrichedAsteroids = asteroidsArray; // keep numeric degree
      // Simple per-render cache keyed by section + term to avoid repeated filter passes when React re-renders
      const cache = new Map<string, unknown>();
      const cached = <T,>(key: string, producer: () => T): T => {
        const hit = cache.get(key) as T | undefined;
        if (hit !== undefined) return hit;
        const value = producer();
        cache.set(key, value);
        return value;
      };
      return {
        planets: cached(`planets-${searchTerm}`, () =>
          filterChartEntities(
            enrichedPlanets,
            ['name', 'sign', 'house'],
            searchTerm
          )
        ),
        asteroids: cached(`asteroids-${searchTerm}`, () =>
          filterChartEntities(
            enrichedAsteroids,
            ['name', 'sign', 'house'],
            searchTerm
          )
        ),
        angles: cached(`angles-${searchTerm}`, () =>
          filterChartEntities(enrichedAngles, ['name', 'sign'], searchTerm)
        ),
        houses: cached(`houses-${searchTerm}`, () =>
          filterChartEntities(enrichedHouses, ['house', 'sign'], searchTerm)
        ),
        aspects: cached(`aspects-${searchTerm}`, () =>
          filterChartEntities(
            enrichedAspects,
            ['planet1', 'planet2', 'type'],
            searchTerm
          )
        ),
        points: cached(`points-${searchTerm}`, () =>
          filterChartEntities(
            sections.points,
            ['name', 'sign', 'house'],
            searchTerm
          )
        ),
      };
    }, [chartData, searchTerm]);

  // Memoized aspect mapping for EnhancedAspectTable to prevent re-computation on every render
  const enhancedAspects = useMemo(() => {
    return processedSections.aspects.map((aspect, _index) => {
      const mappedAspect = {
        planet1: aspect.planet1,
        planet2: aspect.planet2,
        aspect: aspect.type,
        aspectType: aspect.type.toLowerCase() as AspectType,
        orb: aspect.orb,
        strength:
          Math.abs(aspect.orb) < 1
            ? ('exact' as const)
            : Math.abs(aspect.orb) < 2
              ? ('strong' as const)
              : Math.abs(aspect.orb) < 4
                ? ('moderate' as const)
                : ('weak' as const),
        applying: (() => {
          if (typeof aspect.applying === 'boolean') {
            return aspect.applying;
          }
          if (typeof aspect.applying === 'string') {
            const applyingStr = aspect.applying.toLowerCase();
            return applyingStr === 'applying' || applyingStr === 'exact';
          }
          return Math.abs(aspect.orb) < 3;
        })(),
        isMajor: [
          'conjunction',
          'opposition',
          'trine',
          'square',
          'sextile',
        ].includes(aspect.type.toLowerCase()),
        angularDifference: Math.abs(aspect.orb),
      };

      return mappedAspect;
    });
  }, [processedSections.aspects]);

  if (isLoading) {
    return (
      <Card className='w-full max-w-4xl mx-auto cosmic-glass border border-cosmic-purple/30'>
        <CardHeader className='bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-cosmic-gold rounded-t-xl'>
          <CardTitle className='text-xl font-bold flex items-center gap-2'>
            ✨ Loading Chart Data
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div
            className='flex flex-col items-center justify-center py-12 space-y-6'
            role='status'
            aria-label='Loading chart data'
            aria-busy='true'
          >
            {/* Animated loading spinner */}
            <div className='relative'>
              <div className='w-16 h-16 border-4 border-cosmic-purple/30 border-t-cosmic-purple rounded-full animate-spin'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-8 h-8 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-full opacity-60 animate-pulse'></div>
              </div>
            </div>

            {/* Loading message */}
            <div className='text-center space-y-2'>
              <div className='text-lg font-medium text-cosmic-silver'>
                Calculating celestial positions...
              </div>
              <div className='text-sm text-cosmic-silver/70 max-w-md'>
                Connecting to ephemeris server and processing{' '}
                {astrologySettings?.celestialBodies?.minorAsteroids
                  ? '28+'
                  : '11+'}{' '}
                celestial bodies
              </div>
            </div>

            {/* Progress dots */}
            <div className='flex space-x-2'>
              <div className='w-2 h-2 bg-cosmic-purple rounded-full animate-bounce [animation-delay:0ms]'></div>
              <div className='w-2 h-2 bg-cosmic-purple rounded-full animate-bounce [animation-delay:150ms]'></div>
              <div className='w-2 h-2 bg-cosmic-purple rounded-full animate-bounce [animation-delay:300ms]'></div>
            </div>

            {/* Timeout warning */}
            <div className='text-xs text-cosmic-silver/50 text-center max-w-sm'>
              This may take a moment for complex charts with many celestial
              bodies
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error !== null && error !== undefined) {
    const getErrorMessage = (err: unknown): string => {
      if (err instanceof Error) {
        return err.message;
      }
      if (typeof err === 'string') {
        return err;
      }
      return 'Unknown error occurred';
    };

    const getErrorType = (
      err: unknown
    ): 'network' | 'data' | 'calculation' | 'unknown' => {
      if (err instanceof Error) {
        if (err.message.includes('Network') || err.message.includes('fetch')) {
          return 'network';
        }
        if (
          err.message.includes('calculation') ||
          err.message.includes('ephemeris')
        ) {
          return 'calculation';
        }
        if (err.message.includes('data') || err.message.includes('parse')) {
          return 'data';
        }
      }
      return 'unknown';
    };

    const errorMessage = getErrorMessage(error);
    const errorType = getErrorType(error);

    return (
      <Card className='w-full max-w-4xl mx-auto cosmic-glass border border-red-500/30'>
        <CardHeader className='bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-xl'>
          <CardTitle className='text-xl font-bold flex items-center gap-2'>
            🚨 Chart Loading Error
            {errorType === 'network' && '🌐'}
            {errorType === 'calculation' && '🧮'}
            {errorType === 'data' && '📊'}
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <div
              className='flex flex-col items-center justify-center p-6 bg-cosmic-dark/30 border border-red-500/30 rounded-lg'
              role='alert'
              aria-live='assertive'
            >
              <div className='text-lg text-red-400 font-medium mb-2'>
                {errorType === 'network' && 'Connection Problem'}
                {errorType === 'calculation' && 'Calculation Error'}
                {errorType === 'data' && 'Data Processing Error'}
                {errorType === 'unknown' && 'Unexpected Error'}
              </div>
              <div className='text-sm text-red-300 text-center mb-4'>
                {errorMessage}
              </div>

              <div className='flex flex-col sm:flex-row gap-3 items-center'>
                <Button
                  onClick={() => window.location.reload()}
                  variant='default'
                  className='bg-red-500 hover:bg-red-600 text-white'
                >
                  🔄 Retry Loading
                </Button>

                {errorType === 'network' && (
                  <div className='text-xs text-red-400 text-center max-w-md'>
                    Check your internet connection and ensure the ephemeris
                    server is running on port 8001
                  </div>
                )}

                {errorType === 'calculation' && (
                  <div className='text-xs text-red-400 text-center max-w-md'>
                    Astrological calculation services may be temporarily
                    unavailable. Try again in a moment.
                  </div>
                )}
              </div>
            </div>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === 'development' && (
              <details className='mt-4'>
                <summary className='text-sm text-red-600 cursor-pointer hover:text-red-800'>
                  🔧 Developer Details
                </summary>
                <pre className='mt-2 p-3 bg-cosmic-dark/50 border border-cosmic-purple/30 text-xs text-cosmic-silver rounded overflow-auto'>
                  {JSON.stringify(error, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isValidChartData = (data: unknown): data is ChartLike => {
    if (data === null || typeof data !== 'object') return false;
    if (!isChartLike(data)) return false;
    return hasChartContent(data);
  };

  if (!isValidChartData(chartData)) {
    return (
      <Card className='w-full max-w-4xl mx-auto cosmic-glass border border-yellow-500/30'>
        <CardHeader className='bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-t-xl'>
          <CardTitle className='text-xl font-bold flex items-center gap-2'>
            ⚠️ No Chart Data Available
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>
          <div
            className='flex flex-col items-center justify-center py-8 space-y-4'
            role='status'
            aria-live='polite'
          >
            <div className='text-center space-y-4'>
              <div className='text-lg font-medium text-yellow-700'>
                Chart data is not available or incomplete
              </div>
              <div className='text-sm text-yellow-600 max-w-md space-y-2'>
                <p>This could happen if:</p>
                <ul className='list-disc list-inside text-left space-y-1'>
                  <li>The chart calculation is still in progress</li>
                  <li>Required birth data (date, time, location) is missing</li>
                  <li>The ephemeris server is not responding</li>
                  <li>There was an issue processing the chart data</li>
                </ul>
              </div>
              <div className='flex flex-col sm:flex-row gap-3 items-center mt-6'>
                <Button
                  onClick={() => window.location.reload()}
                  variant='default'
                  className='bg-yellow-600 hover:bg-yellow-700 text-white'
                >
                  🔄 Try Again
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  variant='secondary'
                  className='border-yellow-500 text-yellow-700 hover:bg-yellow-50'
                >
                  ← Go Back
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary
      name='ChartDisplay'
      level='component'
      onError={(error, errorInfo) => {
        log.error('Chart display error:', error, errorInfo);
      }}
    >
      <TooltipProvider>
        <div role='region' aria-label='Astrology chart data'>
          <Card className='w-full max-w-6xl mx-auto cosmic-glass border border-cosmic-purple/30 rounded-xl'>
            <CardHeader className='bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-cosmic-gold rounded-t-xl'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <CardTitle className='text-2xl font-bold text-cosmic-gold'>
                  ✨ {chartType.charAt(0).toUpperCase() + chartType.slice(1)}{' '}
                  Chart Analysis
                </CardTitle>
                <div className='flex items-center gap-3'>
                  <Input
                    placeholder='🔍 Search planets, signs, aspects...'
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                      setSearchTerm(e.target.value)
                    }
                    className='w-full sm:w-64 bg-cosmic-dark/30 border-cosmic-purple/30 text-cosmic-silver placeholder-cosmic-silver/60'
                    aria-label='Search chart data'
                    aria-describedby='chart-search-hint'
                  />
                  <span id='chart-search-hint' className='sr-only'>
                    Type to filter rows across all tables by planet, sign,
                    aspect or house
                  </span>
                  <div className='flex gap-2'>
                    <Tooltip content='Share Chart'>
                      <Button
                        variant='default'
                        onClick={() => {
                          void shareChart(chartData);
                        }}
                        className='text-xs px-3 py-1'
                        aria-label='Share chart'
                      >
                        📤 Share
                      </Button>
                    </Tooltip>
                    <Tooltip content='Export as JSON'>
                      <Button
                        variant='secondary'
                        onClick={() => exportChartData(chartData, 'json')}
                        className='text-xs px-3 py-1'
                        aria-label='Export chart data as JSON'
                      >
                        JSON
                      </Button>
                    </Tooltip>
                    <Tooltip content='Export as CSV'>
                      <Button
                        variant='secondary'
                        onClick={() => exportChartData(chartData, 'csv')}
                        className='text-xs px-3 py-1'
                        aria-label='Export chart data as CSV'
                      >
                        CSV
                      </Button>
                    </Tooltip>
                    <Tooltip content='Export as Text'>
                      <Button
                        variant='secondary'
                        onClick={() => exportChartData(chartData, 'txt')}
                        className='text-xs px-3 py-1'
                        aria-label='Export chart data as text'
                      >
                        TXT
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-6 space-y-8 text-cosmic-silver'>
              {/* Use cosmic theme */}
              {/* Enhanced Overview Cards */}
              <div
                className='grid grid-cols-2 md:grid-cols-4 gap-4'
                aria-live='polite'
              >
                <Card className='cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200'>
                  <CardContent className='p-4 text-center'>
                    <div className='text-3xl font-bold text-cosmic-gold'>
                      {processedSections.planets.length}
                    </div>
                    <div className='text-sm text-cosmic-silver font-medium'>
                      🪐 Planets
                    </div>
                  </CardContent>
                </Card>
                <Card className='cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200'>
                  <CardContent className='p-4 text-center'>
                    <div className='text-3xl font-bold text-cosmic-gold'>
                      {processedSections.asteroids.length}
                    </div>
                    <div className='text-sm text-cosmic-silver font-medium'>
                      ☄️ Asteroids
                    </div>
                  </CardContent>
                </Card>
                <Card className='cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200'>
                  <CardContent className='p-4 text-center'>
                    <div className='text-3xl font-bold text-cosmic-gold'>
                      {processedSections.houses.length}
                    </div>
                    <div className='text-sm text-cosmic-silver font-medium'>
                      🏠 Houses
                    </div>
                  </CardContent>
                </Card>
                <Card className='cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200'>
                  <CardContent className='p-4 text-center'>
                    <div className='text-3xl font-bold text-cosmic-gold'>
                      {processedSections.aspects.length}
                    </div>
                    <div className='text-sm text-cosmic-silver font-medium'>
                      🔗 Aspects
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* View Toggle */}
              <div className='flex justify-center mb-6'>
                <div className='bg-cosmic-purple/20 rounded-lg p-1 border border-cosmic-purple/30'>
                  <button
                    onClick={() => setUseUnifiedView(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      useUnifiedView
                        ? 'bg-cosmic-gold text-cosmic-dark shadow-md'
                        : 'text-cosmic-silver hover:text-cosmic-gold'
                    }`}
                  >
                    🌌 Unified View
                  </button>
                  <button
                    onClick={() => setUseUnifiedView(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      !useUnifiedView
                        ? 'bg-cosmic-gold text-cosmic-dark shadow-md'
                        : 'text-cosmic-silver hover:text-cosmic-gold'
                    }`}
                  >
                    📊 Separate Tables
                  </button>
                </div>
              </div>
              {/* View-Specific Professional Astrology Settings Panel */}
              <div className='mb-6'>
                <ViewSpecificSettings
                  settings={astrologySettings}
                  onSettingsChange={handleSettingsChange}
                  isOpen={showSettings}
                  onToggle={() => setShowSettings(!showSettings)}
                  isUnifiedView={useUnifiedView}
                />
              </div>
              {/* Create reusable aspect table component to avoid duplication */}
              {(() => {
                // Shared aspect table logic
                const renderAspectTable = () => {
                  if (
                    !astrologySettings.displayOptions.showAspectGrid ||
                    processedSections.aspects.length === 0
                  ) {
                    return null;
                  }

                  return (
                    <Card className='cosmic-glass border-cosmic-purple/30'>
                      <CardHeader className='bg-cosmic-purple/20 border-b border-cosmic-purple/30'>
                        <CardTitle className='text-xl text-cosmic-gold flex items-center gap-2'>
                          ⚹ Planetary Aspects
                          {astrologySettings.displayOptions
                            .showMinorAspects && (
                            <span className='text-sm text-cosmic-silver font-normal'>
                              (Including Minor Aspects)
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='p-6'>
                        <EnhancedAspectTable
                          aspects={enhancedAspects}
                          includeMinorAspects={
                            astrologySettings.displayOptions.showMinorAspects
                          }
                          maxMajorOrb={astrologySettings.orbs.major}
                          maxMinorOrb={astrologySettings.orbs.minor}
                        />
                      </CardContent>
                    </Card>
                  );
                };

                // Conditional Rendering: Unified View vs Separate Tables
                return useUnifiedView ? (
                  // UNIFIED VIEW: Single comprehensive table with all celestial bodies
                  <Accordion type='multiple' className='space-y-6'>
                    <CollapsibleTable
                      value='unified-celestial'
                      title='Complete Chart Analysis'
                      icon='🌌'
                      subtitle='All celestial bodies, houses, and chart angles in one comprehensive view'
                      count={
                        processedSections.planets.length +
                        processedSections.asteroids.length +
                        processedSections.angles.length
                      }
                    >
                      <div className='p-6'>
                        <CelestialBodiesTable
                          bodies={convertToCelestialBodies({
                            planets: processedSections.planets,
                            asteroids: processedSections.asteroids,
                            points: processedSections.points,
                            angles: (() => {
                              const angleObj = {
                                ascendant: 0,
                                midheaven: 0,
                                descendant: 0,
                                imumcoeli: 0,
                                vertex: undefined as number | undefined,
                                antivertex: undefined as number | undefined,
                                part_of_fortune: undefined as
                                  | number
                                  | undefined,
                              };

                              processedSections.angles.forEach(angle => {
                                const name = angle.name.toLowerCase();
                                const position =
                                  typeof angle.position === 'number'
                                    ? angle.position
                                    : 0;

                                if (name === 'ascendant')
                                  angleObj.ascendant = position;
                                else if (name === 'midheaven' || name === 'mc')
                                  angleObj.midheaven = position;
                                else if (name === 'descendant')
                                  angleObj.descendant = position;
                                else if (name === 'imumcoeli' || name === 'ic')
                                  angleObj.imumcoeli = position;
                                else if (name === 'vertex')
                                  angleObj.vertex = position;
                                else if (name === 'antivertex')
                                  angleObj.antivertex = position;
                                else if (name === 'part_of_fortune')
                                  angleObj.part_of_fortune = position;
                              });

                              return angleObj;
                            })(),
                            houses: processedSections.houses,
                          })}
                          showHouseRulers={true}
                          settings={astrologySettings}
                        />
                      </div>
                    </CollapsibleTable>

                    {/* Shared aspect table */}
                    {renderAspectTable() && (
                      <CollapsibleTable
                        value='unified-aspects'
                        title='Planetary Aspects'
                        icon='⚹'
                        subtitle={
                          astrologySettings.displayOptions.showMinorAspects
                            ? 'Including minor aspects'
                            : 'Major aspects only'
                        }
                        count={processedSections.aspects.length}
                      >
                        <div className='p-6'>
                          <EnhancedAspectTable
                            aspects={enhancedAspects}
                            includeMinorAspects={
                              astrologySettings.displayOptions.showMinorAspects
                            }
                            maxMajorOrb={astrologySettings.orbs.major}
                            maxMinorOrb={astrologySettings.orbs.minor}
                          />
                        </div>
                      </CollapsibleTable>
                    )}
                  </Accordion>
                ) : (
                  // SEPARATE VIEW: Distinct focused tables for each celestial body category
                  <Accordion type='multiple' className='space-y-4'>
                    {/* Planets Only */}
                    {processedSections.planets.length > 0 && (
                      <CollapsibleTable
                        value='planets'
                        title='Traditional & Modern Planets'
                        icon='🪐'
                        count={processedSections.planets.length}
                      >
                        <PlanetTable
                          data={processedSections.planets.map(p => ({
                            name: p.name,
                            sign: p.sign,
                            house: ((): number => {
                              const raw = p.house;
                              if (typeof raw === 'number') return raw;
                              const parsed = parseInt(
                                String(raw).replace(/[^0-9]/g, ''),
                                10
                              );
                              return Number.isNaN(parsed) ? 0 : parsed;
                            })(),
                            degree:
                              typeof p.degree === 'number'
                                ? p.degree.toFixed(2)
                                : String(p.degree),
                            position: p.position,
                            retrograde: p.retrograde,
                          }))}
                        />
                      </CollapsibleTable>
                    )}

                    {/* Houses with Occupants */}
                    <CollapsibleTable
                      value='houses'
                      title='House Cusps & Occupants'
                      icon='🏠'
                      subtitle='Shows which celestial bodies occupy each house'
                      count={processedSections.houses.length}
                    >
                      <HouseTable
                        data={processedSections.houses.map(
                          (house): HouseRow => {
                            const planetsInHouse: string[] = [];

                            // Check all celestial bodies in this house
                            [
                              ...processedSections.planets,
                              ...processedSections.asteroids,
                              ...processedSections.points,
                            ].forEach(body => {
                              const bodyHouse =
                                typeof body.house === 'number'
                                  ? body.house
                                  : parseInt(
                                      String(body.house).replace(/[^0-9]/g, ''),
                                      10
                                    );
                              if (bodyHouse === house.house) {
                                planetsInHouse.push(body.name);
                              }
                            });

                            return {
                              number: house.house,
                              sign: house.sign,
                              cuspDegree: `${house.degree.toFixed(2)}`,
                              planetsInHouse:
                                planetsInHouse.length > 0
                                  ? planetsInHouse.join(', ')
                                  : 'Empty',
                            };
                          }
                        )}
                      />
                    </CollapsibleTable>

                    {/* Asteroids & Minor Bodies */}
                    {processedSections.asteroids.length > 0 && (
                      <CollapsibleTable
                        value='asteroids'
                        title='Asteroids & Minor Bodies'
                        icon='☄️'
                        subtitle={
                          astrologySettings.celestialBodies.minorAsteroids
                            ? 'Including minor asteroids'
                            : 'Major asteroids only'
                        }
                        count={processedSections.asteroids.length}
                      >
                        <AsteroidTable
                          data={processedSections.asteroids.map(
                            (asteroid): AsteroidRow => ({
                              name: asteroid.name,
                              sign: asteroid.sign,
                              degree: asteroid.degree.toString(),
                              house: asteroid.house,
                            })
                          )}
                        />
                      </CollapsibleTable>
                    )}

                    {/* Chart Angles */}
                    {processedSections.angles.length > 0 && (
                      <CollapsibleTable
                        value='angles'
                        title='Chart Angles'
                        icon='📐'
                        subtitle='Fundamental chart structure points'
                        count={processedSections.angles.length}
                      >
                        <AngleTable
                          data={processedSections.angles.map(
                            (angle): AngleRow => ({
                              name: angle.name,
                              sign: angle.sign,
                              degree:
                                typeof angle.degree === 'number'
                                  ? angle.degree.toFixed(2)
                                  : String(angle.degree),
                            })
                          )}
                        />
                      </CollapsibleTable>
                    )}

                    {/* Lunar Nodes - Only when enabled */}
                    {astrologySettings.celestialBodies.lunarNodes &&
                      processedSections.points.length > 0 && (
                        <CollapsibleTable
                          value='lunar-nodes'
                          title='Lunar Nodes'
                          icon='☊'
                          subtitle='North Node, South Node'
                          count={
                            processedSections.points.filter(point => {
                              const category = getCelestialBodyCategory(
                                point.name
                              );
                              return category === 'lunar_nodes';
                            }).length
                          }
                        >
                          <PlanetTable
                            data={processedSections.points
                              .filter(point => {
                                const category = getCelestialBodyCategory(
                                  point.name
                                );
                                return category === 'lunar_nodes';
                              })
                              .map(
                                (point): PlanetRow => ({
                                  name: point.name,
                                  sign: point.sign,
                                  house: parseInt(point.house) || 1,
                                  degree:
                                    typeof point.degree === 'number'
                                      ? point.degree.toFixed(2)
                                      : String(point.degree),
                                  position: point.position,
                                  retrograde: point.retrograde,
                                })
                              )}
                          />
                        </CollapsibleTable>
                      )}

                    {/* Lilith Points - Only when enabled */}
                    {astrologySettings.celestialBodies.lilithPoints &&
                      processedSections.points.length > 0 && (
                        <CollapsibleTable
                          value='lilith-points'
                          title='Lilith Points'
                          icon='⚸'
                          subtitle='Mean Lilith, True Lilith'
                          count={
                            processedSections.points.filter(point => {
                              const category = getCelestialBodyCategory(
                                point.name
                              );
                              return category === 'lilith_points';
                            }).length
                          }
                        >
                          <PlanetTable
                            data={processedSections.points
                              .filter(point => {
                                const category = getCelestialBodyCategory(
                                  point.name
                                );
                                return category === 'lilith_points';
                              })
                              .map(
                                (point): PlanetRow => ({
                                  name: point.name,
                                  sign: point.sign,
                                  house: parseInt(point.house) || 1,
                                  degree:
                                    typeof point.degree === 'number'
                                      ? point.degree.toFixed(2)
                                      : String(point.degree),
                                  position: point.position,
                                  retrograde: point.retrograde,
                                })
                              )}
                          />
                        </CollapsibleTable>
                      )}

                    {/* Special Points - Only when enabled */}
                    {astrologySettings.celestialBodies.specialPoints &&
                      processedSections.points.length > 0 && (
                        <CollapsibleTable
                          value='special-points'
                          title='Special Points'
                          icon='◊'
                          subtitle='Vertex, Antivertex, Part of Fortune'
                          count={
                            processedSections.points.filter(point => {
                              const category = getCelestialBodyCategory(
                                point.name
                              );
                              return category === 'special_points';
                            }).length
                          }
                        >
                          <PlanetTable
                            data={processedSections.points
                              .filter(point => {
                                const category = getCelestialBodyCategory(
                                  point.name
                                );
                                return category === 'special_points';
                              })
                              .map(
                                (point): PlanetRow => ({
                                  name: point.name,
                                  sign: point.sign,
                                  house: parseInt(point.house) || 1,
                                  degree:
                                    typeof point.degree === 'number'
                                      ? point.degree.toFixed(2)
                                      : String(point.degree),
                                  position: point.position,
                                  retrograde: point.retrograde,
                                })
                              )}
                          />
                        </CollapsibleTable>
                      )}

                    {/* Uranian Points - Only when enabled */}
                    {astrologySettings.celestialBodies.hypotheticalPoints &&
                      processedSections.points.length > 0 && (
                        <CollapsibleTable
                          value='uranian-points'
                          title='Uranian Points'
                          icon='🔮'
                          subtitle='Hamburg School Hypothetical Bodies'
                          count={
                            processedSections.points.filter(point => {
                              const category = getCelestialBodyCategory(
                                point.name
                              );
                              return category === 'hypothetical';
                            }).length
                          }
                        >
                          <PlanetTable
                            data={processedSections.points
                              .filter(point => {
                                const category = getCelestialBodyCategory(
                                  point.name
                                );
                                return category === 'hypothetical';
                              })
                              .map(
                                (point): PlanetRow => ({
                                  name: point.name,
                                  sign: point.sign,
                                  house: parseInt(point.house) || 1,
                                  degree:
                                    typeof point.degree === 'number'
                                      ? point.degree.toFixed(2)
                                      : String(point.degree),
                                  position: point.position,
                                  retrograde: point.retrograde,
                                })
                              )}
                          />
                        </CollapsibleTable>
                      )}

                    {/* Shared aspect table */}
                    {renderAspectTable() && (
                      <CollapsibleTable
                        value='aspects'
                        title='Planetary Aspects'
                        icon='⚹'
                        subtitle={
                          astrologySettings.displayOptions.showMinorAspects
                            ? 'Including minor aspects'
                            : 'Major aspects only'
                        }
                        count={processedSections.aspects.length}
                      >
                        <div className='p-6'>
                          <EnhancedAspectTable
                            aspects={enhancedAspects}
                            includeMinorAspects={
                              astrologySettings.displayOptions.showMinorAspects
                            }
                            maxMajorOrb={astrologySettings.orbs.major}
                            maxMinorOrb={astrologySettings.orbs.minor}
                          />
                        </div>
                      </CollapsibleTable>
                    )}
                  </Accordion>
                );
              })()}{' '}
              {/* AI-001 ENHANCED FEATURES */}
              {chartId && (
                <Card className='cosmic-glass border-cosmic-gold/30 mt-8'>
                  <CardHeader className='bg-gradient-to-r from-cosmic-gold/10 to-cosmic-purple/10 border-b border-cosmic-gold/30'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle className='text-xl text-cosmic-gold flex items-center gap-2'>
                          🚀 AI-001 Enhanced Analysis
                          <Badge className='bg-cosmic-gold/20 text-cosmic-gold border-cosmic-gold/30 text-xs'>
                            Next-Gen AI
                          </Badge>
                        </CardTitle>
                        <p className='text-cosmic-silver/80 text-sm mt-1'>
                          Advanced astrological insights with predictive
                          analysis, growth coaching, and multi-system synthesis
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowAI001(!showAI001)}
                        variant='secondary'
                        className='text-cosmic-gold hover:bg-cosmic-gold/10'
                      >
                        {showAI001 ? '🔽 Hide AI-001' : '🔼 Show AI-001'}
                      </Button>
                    </div>
                  </CardHeader>
                  {showAI001 && chartData && (
                    <CardContent className='p-0'>
                      <div className='p-6 text-center text-cosmic-silver'>
                        <p className='mb-4'>🚀 AI-001 Analysis</p>
                        <p className='text-sm'>
                          Chart analysis features coming soon...
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: ChartDisplayProps,
  nextProps: ChartDisplayProps
): boolean => {
  return (
    prevProps.chartId === nextProps.chartId &&
    prevProps.chartType === nextProps.chartType &&
    prevProps.onSaveChart === nextProps.onSaveChart &&
    JSON.stringify(prevProps.chart) === JSON.stringify(nextProps.chart)
  );
};

// Memoized component with custom comparison
export const ChartDisplay = memo(ChartDisplayComponent, arePropsEqual);

ChartDisplay.displayName = 'ChartDisplay';

// Default export
export default ChartDisplay;
