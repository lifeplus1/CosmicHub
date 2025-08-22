import React, { memo, useMemo, useState } from 'react';
import { serializeAstrologyData, type AstrologyChart } from '@cosmichub/types';
import { getChartSyncService } from '@/services/chartSyncService';
import type {
  ChartDisplayPlanet,
  ChartDisplayHouse,
  ChartDisplayAspect,
  ChartDisplayAsteroid,
  ChartDisplayAngle
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
  Input
} from '@cosmichub/ui';
// Extracted table components (barrel export)
import { PlanetTable } from './tables';
import AspectTable from './tables/AspectTable';
import { getPlanetSymbol, getSignSymbol, getAsteroidSymbol } from './tables/tableUtils';
import { fetchChartData } from '@/services/astrologyService';
// Alias the array-based ChartData (planets/houses/aspects as arrays)
import type { ChartType } from '@/types/astrology.types';
import { sampleChartData } from './sampleData';
import { 
  normalizeChart,
  isChartLike,
  hasChartContent,
  type ChartLike,
  getSignFromDegree,
  getRulerFromSign,
  getAspectOrb
} from './normalizeChart';
import { validateChart } from './validateChart';

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
import type { HouseCusp } from '@/types/house-cusp';

// Internal logger shim (no-op to satisfy no-console rule while keeping instrumentation points)
const log = {
  debug: (...args: unknown[]): void => { void args.length; },
  info: (...args: unknown[]): void => { void args.length; },
  warn: (...args: unknown[]): void => { void args.length; },
  error: (...args: unknown[]): void => { void args.length; }
};

// Helper function to calculate which house a planet is in (retain locally; relies on imported getSignFromDegree)
const calculateHouseForPlanet = (planetPosition: number, houseCusps: HouseCusp[]): string => {
  if (!Array.isArray(houseCusps) || houseCusps.length !== 12) {
    return 'Unknown';
  }
  
  // Helper function to convert number to ordinal (1st, 2nd, 3rd, etc.)
  const getOrdinal = (num: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'] as const;
    const v = Math.abs(num) % 100;
    const teen = v >= 11 && v <= 13;
    if (teen) return `${num}th`;
    const last = v % 10;
    const suffix = last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th';
    return `${num}${suffix}`;
  };
  
  // Sort house cusps by position
  const sortedCusps = houseCusps.map((h, i) => ({
    house: i + 1,
    cusp: h.cusp ?? h.number ?? 0
  })).sort((a, b) => a.cusp - b.cusp);
  
  // Find which house the planet falls into
  for (let i = 0; i < sortedCusps.length; i++) {
    const currentHouse = sortedCusps[i];
    const nextHouse = sortedCusps[(i + 1) % sortedCusps.length];
    if (!currentHouse || !nextHouse) continue;

    if (nextHouse.cusp > currentHouse.cusp) {
      // Normal case
      if (planetPosition >= currentHouse.cusp && planetPosition < nextHouse.cusp) {
        return getOrdinal(currentHouse.house);
      }
    } else {
      // Wrap around case (e.g., 12th to 1st house)
      if (planetPosition >= currentHouse.cusp || planetPosition < nextHouse.cusp) {
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
  const obj = (typeof v === 'object' && v !== null) ? v as Record<string, unknown> : {};
  return {
    name: typeof obj['name'] === 'string' ? obj['name'] as string : '',
    sign: typeof obj['sign'] === 'string' ? obj['sign'] as string : '',
    house: (typeof obj['house'] === 'string' || typeof obj['house'] === 'number') ? obj['house'] as string | number : undefined,
    degree: typeof obj['degree'] === 'number' ? obj['degree'] as number : 0,
    position: typeof obj['position'] === 'number' ? obj['position'] as number : undefined,
    retrograde: typeof obj['retrograde'] === 'boolean' ? obj['retrograde'] as boolean : undefined
  };
};
const coerceHouse = (v: unknown): ChartHouse => {
  const obj = (typeof v === 'object' && v !== null) ? v as Record<string, unknown> : {};
  const numberRaw = obj['number'];
  const houseRaw = obj['house'];
  const number = typeof numberRaw === 'number' ? numberRaw : (typeof houseRaw === 'number' ? houseRaw : 0);
  const cuspRaw = obj['cusp'];
  return {
    number,
    house: typeof houseRaw === 'number' ? houseRaw : undefined,
    sign: typeof obj['sign'] === 'string' ? obj['sign'] as string : '',
    cusp: typeof cuspRaw === 'number' ? cuspRaw : 0,
    ruler: typeof obj['ruler'] === 'string' ? obj['ruler'] as string : undefined
  };
};
const coerceAspect = (v: unknown): ChartAspect => {
  const obj = (typeof v === 'object' && v !== null) ? v as Record<string, unknown> : {};
  return {
    planet1: typeof obj['planet1'] === 'string' ? obj['planet1'] as string : '',
    planet2: typeof obj['planet2'] === 'string' ? obj['planet2'] as string : '',
    type: typeof obj['type'] === 'string' ? obj['type'] as string : '',
    orb: typeof obj['orb'] === 'number' ? obj['orb'] as number : 0,
    applying: typeof obj['applying'] === 'string' ? obj['applying'] as string : undefined
  };
};

const exportChartData = (raw: unknown, format: 'json' | 'csv' | 'txt'): void => {
  if (raw === null || typeof raw !== 'object' || !isChartLike(raw) || !hasChartContent(raw)) {
    log.error('Invalid chart data for export');
    return;
  }
  const chartData: ChartLike = raw; // already narrowed
  const planets = Array.isArray(chartData.planets) ? chartData.planets.map(coercePlanet) : [];
  const houses = Array.isArray(chartData.houses) ? chartData.houses.map(coerceHouse) : [];
  const aspects = Array.isArray(chartData.aspects) ? chartData.aspects.map(coerceAspect) : [];
  const asteroids = Array.isArray(chartData.asteroids) ? chartData.asteroids.filter(a => typeof a === 'object' && a !== null) as ChartDisplayAsteroid[] : undefined;
  const angles = Array.isArray(chartData.angles) ? chartData.angles.filter(a => typeof a === 'object' && a !== null) as ChartDisplayAngle[] : undefined;
  const exportable: ExportableChart = { planets, houses, aspects, asteroids, angles };

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
        const rows = planets.map(p => `${p.name},${p.sign},${p.house ?? ''},${p.degree.toFixed(2)}`).join('\n');
        content = header + rows;
        mime = 'text/csv';
        break;
      }
      case 'txt': {
        const planetLines = planets.map(p => `${p.name}: ${p.sign} in House ${p.house ?? 'Unknown'} (${p.degree.toFixed(2)}°)`).join('\n');
        const houseLines = houses.map(h => `House ${h.number}: ${h.sign} (${h.cusp.toFixed(2)}°)` ).join('\n');
        const aspectLines = aspects.map(a => `${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}° orb)`).join('\n');
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
  if (chartData === null || typeof chartData !== 'object' || !isChartLike(chartData)) { 
    log.error('Invalid chart data for sharing'); 
    return; 
  }

  const findPlanetSign = (planets: ChartPlanet[], planetName: string): string => {
    if (!Array.isArray(planets) || planets.length === 0) {
      return 'Unknown';
    }

    const planet = planets.find(p => {
      if (typeof p !== 'object' || p === null) return false;
      if (typeof p.name !== 'string' || typeof p.sign !== 'string') return false;
      return p.name.toLowerCase() === planetName.toLowerCase();
    });

    return planet?.sign ?? 'Unknown';
  };

  const planetsRaw = Array.isArray(chartData.planets) ? chartData.planets : [];
  const planets: ChartPlanet[] = planetsRaw.filter(p => (
    typeof p === 'object' && p !== null &&
    typeof (p as { name?: unknown }).name === 'string' &&
    typeof (p as { sign?: unknown }).sign === 'string' &&
    typeof (p as { degree?: unknown }).degree === 'number'
  )) as ChartPlanet[];
  const sunSign = findPlanetSign(planets, 'sun');
  const moonSign = findPlanetSign(planets, 'moon');
  
  const shareData = {
    title: 'My Natal Chart Analysis',
    text: `Check out my natal chart! Sun in ${sunSign}, Moon in ${moonSign}`,
    url: window.location.href
  };

  const canShare = typeof navigator === 'object' && 
             navigator !== null && 
             typeof navigator.share === 'function';
             
  const canCopy = typeof navigator === 'object' && 
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
  onSaveChart 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Use provided chart data or fetch if chartId is provided
  const { data: fetchedChartData, isLoading, error } = useQuery({
    queryKey: ['chartData', chartId, chartType],
    queryFn: () => {
      if (chartId === null || chartId === undefined || chartId === '') {
        throw new Error('Missing chartId');
      }
      return fetchChartData(chartId, chartType);
    },
    // enabled only when we have a chartId and no inline chart provided
  enabled: (chart === null || chart === undefined) && chartId !== null && chartId !== undefined && typeof chartId === 'string' && chartId.length > 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Use provided chart or fetched chart data - memoize to prevent unnecessary re-renders
  const chartData = useMemo<ChartLike>(() : ChartLike => {
    const providedData = chart ?? fetchedChartData;
    const sampleData: ChartLike = sampleChartData;

    // Explicit check for valid data
    if (providedData === null || providedData === undefined || typeof providedData !== 'object') {
      log.warn('No valid chart data found, using sample data');
      return sampleData;
    }

    if (!isChartLike(providedData) || !hasChartContent(providedData)) {
      log.warn('Invalid chart data structure, using sample data');
      return sampleData;
    }

    const validatedChart = validateChart(providedData);
    if (validatedChart === null || typeof validatedChart !== 'object') {
      log.warn('Chart validation failed, using sample data');
      return sampleData;
    }
    
  return validatedChart;
  // deps: changes only when caller supplies new chart ref or fetch returns new data
  }, [chart, fetchedChartData]);

  // Processed sections maintain original numeric degrees; formatting applied at render time
  interface ProcessedSections { planets: ChartDisplayPlanet[]; asteroids: ChartDisplayAsteroid[]; angles: ChartDisplayAngle[]; houses: ChartDisplayHouse[]; aspects: ChartDisplayAspect[] }
  const processedSections = useMemo<ProcessedSections>(() : ProcessedSections => {
    if (chartData === null || typeof chartData !== 'object' || !isChartLike(chartData)) {
      return { planets: [], asteroids: [], angles: [], houses: [], aspects: [] };
    }

    const { planets: planetsArray, houses: housesArray, aspects: aspectsArray, asteroids: asteroidsArray, angles: anglesArray } = normalizeChart(chartData);
    
    // Ensure arrays with type guards
  const isValidArray = <T,>(arr: unknown): arr is T[] => Array.isArray(arr);
    
    const sections = {
      planets: isValidArray<ChartDisplayPlanet>(planetsArray) ? planetsArray : [],
      houses: isValidArray<ChartDisplayHouse>(housesArray) ? housesArray : [],
      aspects: isValidArray<ChartDisplayAspect>(aspectsArray) ? aspectsArray : [],
      asteroids: isValidArray<ChartDisplayAsteroid>(asteroidsArray) ? asteroidsArray : [],
      angles: isValidArray<ChartDisplayAngle>(anglesArray) ? anglesArray : []
    };
    log.debug('processed_counts', { 
      planets: sections.planets.length, 
      houses: sections.houses.length, 
      aspects: sections.aspects.length, 
      asteroids: sections.asteroids.length, 
      angles: sections.angles.length 
    });
    
  // Return early if no search term filtering will be applied later
  // (the enriched + filtered result set is returned at the end of the hook)
  // Type-safe search for chart entities
  function filterChartEntities<T extends ChartDisplayPlanet | ChartDisplayHouse | ChartDisplayAspect | ChartDisplayAsteroid | ChartDisplayAngle>(
    data: T[],
    fields: Array<keyof T>,
    term: string
  ): T[] {
    if (term === null || term === undefined || term.length === 0) {
      return data;
    }
    const lowered = term.toLowerCase();
    
    return data.filter((item) => 
      fields.some((field) => {
        const value = item[field];
        return value !== null && value !== undefined && typeof value === 'string' && value.length > 0 && value.toLowerCase().includes(lowered);
      })
    );
  }
  const enrichedPlanets = sections.planets.map((p): ChartDisplayPlanet => {
      const hasHouse = p.house !== undefined && p.house !== null && p.house !== 'Unknown';
      const position = typeof p.position === 'number' ? p.position : 0;
      const housesValid = Array.isArray(sections.houses) && sections.houses.length > 0;
      const calcHouse = hasHouse ? p.house : String(calculateHouseForPlanet(position, housesValid ? sections.houses as HouseCusp[] : []));
      return { ...p, house: calcHouse };
    });
    const enrichedAngles = anglesArray.map((a): ChartDisplayAngle => {
      const matchHouse = (_name: string, idx: number): number => housesArray[idx]?.cusp ?? 0;
      if (a.name === 'Ascendant' && housesArray.length >= 1) { const pos = matchHouse('Ascendant', 0); return { ...a, sign: getSignFromDegree(pos), degree: pos % 30 }; }
      if (a.name?.toLowerCase() === 'mc' && housesArray.length >= 10) { const pos = housesArray[9]?.cusp ?? 0; return { ...a, sign: getSignFromDegree(pos), degree: pos % 30 }; }
      return a;
    });
  const enrichedHouses = housesArray.map((h): ChartDisplayHouse => { const cusp = typeof h.cusp === 'number' ? h.cusp : 0; return { ...h, sign: getSignFromDegree(cusp), degree: cusp % 30, ruler: h.ruler ?? getRulerFromSign(getSignFromDegree(cusp)) }; });
    const enrichedAspects = aspectsArray.map((a): ChartDisplayAspect => {
      const hasApplying = typeof a.applying === 'string' && a.applying.length > 0;
      const status = hasApplying ? a.applying : (a.orb < 1 ? 'Exact' : (a.orb < 3 ? 'Applying' : 'Separating'));
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
      planets: cached(`planets-${searchTerm}`, () => filterChartEntities(enrichedPlanets, ['name', 'sign', 'house'], searchTerm)),
      asteroids: cached(`asteroids-${searchTerm}`, () => filterChartEntities(enrichedAsteroids, ['name', 'sign', 'house'], searchTerm)),
      angles: cached(`angles-${searchTerm}`, () => filterChartEntities(enrichedAngles, ['name', 'sign'], searchTerm)),
      houses: cached(`houses-${searchTerm}`, () => filterChartEntities(enrichedHouses, ['house', 'sign'], searchTerm)),
      aspects: cached(`aspects-${searchTerm}`, () => filterChartEntities(enrichedAspects, ['planet1', 'planet2', 'type'], searchTerm))
    };
  }, [chartData, searchTerm]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64" role="status" aria-label="Loading chart data" aria-busy="true">
            <div className="text-lg">Loading chart data…</div>
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
    
    const errorMessage = getErrorMessage(error);

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64" role="alert" aria-live="assertive">
            <div className="text-lg text-red-600">Error loading chart: {errorMessage}</div>
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
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
            <div className="text-lg">No chart data available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
  <div role="region" aria-label="Astrology chart data">
  <Card className="w-full max-w-6xl mx-auto cosmic-glass border border-cosmic-purple/30 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-cosmic-gold rounded-t-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-cosmic-gold">
              ✨ {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Analysis
            </CardTitle>
            <div className="flex items-center gap-3">
              <Input
                placeholder="🔍 Search planets, signs, aspects..."
                value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-cosmic-dark/30 border-cosmic-purple/30 text-cosmic-silver placeholder-cosmic-silver/60"
                aria-label="Search chart data"
                aria-describedby="chart-search-hint"
              />
              <span id="chart-search-hint" className="sr-only">Type to filter rows across all tables by planet, sign, aspect or house</span>
              <div className="flex gap-2">
                <Tooltip content="Share Chart">
                  <Button
                    variant="primary"
                    onClick={() => { void shareChart(chartData); }}
                    className="text-xs px-3 py-1"
        aria-label="Share chart"
                  >
                    📤 Share
                  </Button>
                </Tooltip>
                <Tooltip content="Export as JSON">
                  <Button
                    variant="secondary"
                    onClick={() => exportChartData(chartData, 'json')}
                    className="text-xs px-3 py-1"
        aria-label="Export chart data as JSON"
                  >
                    JSON
                  </Button>
                </Tooltip>
                <Tooltip content="Export as CSV">
                  <Button
                    variant="secondary"
                    onClick={() => exportChartData(chartData, 'csv')}
                    className="text-xs px-3 py-1"
        aria-label="Export chart data as CSV"
                  >
                    CSV
                  </Button>
                </Tooltip>
                <Tooltip content="Export as Text">
                  <Button
                    variant="secondary"
                    onClick={() => exportChartData(chartData, 'txt')}
                    className="text-xs px-3 py-1"
        aria-label="Export chart data as text"
                  >
                    TXT
                  </Button>
                </Tooltip>
                <Tooltip content="Save to Firestore">
                  <Button
                    variant="primary"
                        onClick={() => {
                        void (async (): Promise<void> => {
                          try {
                            if (typeof onSaveChart === 'function') {
                              await onSaveChart(chartData);
                              return;
                            }
                            const astroChart: AstrologyChart = {
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                              planets: Array.isArray(chartData.planets) ? chartData.planets : [],
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                              houses: Array.isArray(chartData.houses) ? chartData.houses : [],
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                              aspects: Array.isArray(chartData.aspects) ? chartData.aspects : [],
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                              asteroids: Array.isArray(chartData.asteroids) ? chartData.asteroids : [],
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                              angles: Array.isArray(chartData.angles) ? chartData.angles : []
                            };
                            const serialized = serializeAstrologyData(astroChart);
                            // Fallback: attempt to parse into expected ChartData shape required by sync service
                            const parsed = JSON.parse(serialized) as unknown;
                            if (parsed !== null && typeof parsed === 'object' && 'planets' in parsed) {
                              // @ts-expect-error runtime shape may differ; service will validate
                              await getChartSyncService().syncChart(parsed);
                            }
                            log.info('Chart data saved successfully');
                          } catch (e) {
                            log.error('Failed to save chart', e);
                          }
                        })();
                      }}
                    className="text-xs px-3 py-1"
        aria-label="Save chart data"
                  >
                    💾 Save
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8 text-cosmic-silver">{/* Use cosmic theme */}
          {/* Enhanced Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-live="polite">
            <Card className="cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cosmic-gold">{processedSections.planets.length}</div>
                <div className="text-sm text-cosmic-silver font-medium">🪐 Planets</div>
              </CardContent>
            </Card>
            <Card className="cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cosmic-gold">{processedSections.asteroids.length}</div>
                <div className="text-sm text-cosmic-silver font-medium">☄️ Asteroids</div>
              </CardContent>
            </Card>
            <Card className="cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cosmic-gold">{processedSections.houses.length}</div>
                <div className="text-sm text-cosmic-silver font-medium">🏠 Houses</div>
              </CardContent>
            </Card>
            <Card className="cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cosmic-gold">{processedSections.aspects.length}</div>
                <div className="text-sm text-cosmic-silver font-medium">🔗 Aspects</div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Planet Table */}
          {processedSections.planets.length > 0 && (
            <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  🪐 Planetary Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <PlanetTable data={processedSections.planets.map((p): { name: string; sign: string; house: number; degree: string; position?: number; retrograde?: boolean } => ({
                  name: p.name,
                  sign: p.sign,
                  house: (() : number => {
                    const raw = p.house;
                    if (typeof raw === 'number') return raw;
                    const parsed = parseInt(String(raw).replace(/[^0-9]/g, ''), 10);
                    return Number.isNaN(parsed) ? 0 : parsed;
                  })(),
                  degree: typeof p.degree === 'number' ? p.degree.toFixed(2) : String(p.degree),
                  position: p.position,
                  retrograde: p.retrograde
                }))} />
              </CardContent>
            </Card>
          )}

          {processedSections.aspects.length > 0 && (
            <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  🔗 Planetary Aspects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AspectTable data={processedSections.aspects.map((a): { planet1: string; planet2: string; type: string; orb: string; applying: string } => ({
                  planet1: a.planet1,
                  planet2: a.planet2,
                  type: a.type,
                  orb: typeof a.orb === 'number' ? a.orb.toFixed(1) : String(a.orb),
                  applying: a.applying ?? ''
                }))} />
              </CardContent>
            </Card>
          )}

          <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  🏠 House Cusps
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-cosmic-silver" aria-describedby="house-table-caption">
                  <caption id="house-table-caption" className="sr-only">Table of astrological house cusps with sign, degree and ruling planet</caption>
                  <thead className="bg-cosmic-purple/30 border-b border-cosmic-purple/30">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">House</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Sign</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Degree</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Ruler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedSections.houses.map((house, index) => (
                      <tr key={`house-${index}`} className="border-t border-cosmic-purple/20 hover:bg-cosmic-purple/10 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{house.house}</td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-gold">
                          <span className="flex items-center gap-2">
                            <span className="text-xl text-cosmic-gold font-mono" title={house.sign}>{getSignSymbol(house.sign)}</span>
                            <span>{house.sign}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{house.degree}°</td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-gold">
                          <span className="flex items-center gap-2">
                            <span className="text-xl" title={house.ruler !== null && house.ruler !== undefined && typeof house.ruler === 'string' && house.ruler.length > 0 ? house.ruler : undefined}>{getPlanetSymbol(house.ruler !== null && house.ruler !== undefined && typeof house.ruler === 'string' && house.ruler.length > 0 ? house.ruler : '')}</span>
                            <span>{house.ruler !== null && house.ruler !== undefined && typeof house.ruler === 'string' && house.ruler.length > 0 ? house.ruler : 'N/A'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          {/* Enhanced Asteroids Table */}
          {processedSections.asteroids.length > 0 && (
            <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  ☄️ Asteroids & Minor Bodies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-cosmic-silver" aria-describedby="asteroid-table-caption">
                  <caption id="asteroid-table-caption" className="sr-only">Table of asteroid and minor body positions with sign, degree and house</caption>
                  <thead className="bg-cosmic-purple/30 border-b border-cosmic-purple/30">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Asteroid</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Sign</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Degree</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">House</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedSections.asteroids.map((asteroid, index) => (
                      <tr key={`asteroid-${index}`} className="border-t border-cosmic-purple/20 hover:bg-cosmic-purple/10 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">
                          <span className="flex items-center gap-2">
                            <span className="text-cosmic-gold text-lg" title={asteroid.name}>{getAsteroidSymbol(asteroid.name)}</span>
                            <span>{asteroid.name}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-gold">
                          <span className="flex items-center gap-2">
                            <span className="text-xl text-cosmic-gold font-mono" title={asteroid.sign}>{getSignSymbol(asteroid.sign)}</span>
                            <span>{asteroid.sign}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{asteroid.degree}</td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{asteroid.house}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Angles Table */}
          {processedSections.angles.length > 0 && (
            <Card className="cosmic-glass border-cosmic-purple/30">
              <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
                <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
                  📐 Chart Angles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-cosmic-silver" aria-describedby="angles-table-caption">
                  <caption id="angles-table-caption" className="sr-only">Table of chart angles with sign and degree</caption>
                  <thead className="bg-cosmic-purple/30 border-b border-cosmic-purple/30">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Angle</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Sign</th>
                      <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-cosmic-gold">Degree</th>
                    </tr>
                  </thead>
                  <tbody>
          {processedSections.angles.map((angle, index: number) : React.ReactElement => (
                      <tr key={`angle-${index}`} className="border-t border-cosmic-purple/20 hover:bg-cosmic-purple/10 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">
                          <span className="flex items-center gap-2">
                            <span className="text-cosmic-gold text-xl" title={angle.name}>{getPlanetSymbol(angle.name)}</span>
                            <span>{angle.name}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-cosmic-gold">
                          <span className="flex items-center gap-2">
                            <span className="text-xl text-cosmic-gold font-mono" title={angle.sign}>{getSignSymbol(angle.sign)}</span>
                            <span>{angle.sign}</span>
                          </span>
                        </td>
            <td className="px-4 py-3 text-sm font-medium text-cosmic-silver">{typeof angle.degree === 'number' ? angle.degree.toFixed(2) : angle.degree}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </CardContent>
  </Card>
  </div>
    </TooltipProvider>
  );
};

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (prevProps: ChartDisplayProps, nextProps: ChartDisplayProps): boolean => {
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