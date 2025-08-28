import React, { memo, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { ChartHeader } from './ChartHeader';
import type { AstrologyChart as _AstrologyChart } from '@cosmichub/types';
import type {
  ChartDisplayPlanet,
  // ----------------------
  // Shared parsing helpers
  // ----------------------
  ChartDisplayAsteroid,
  ChartDisplayAngle,
} from './types';
import { useChartData } from './hooks/useChartData';
import { useProcessedSections } from './hooks/useProcessedSections';
import { useCategorizedPoints } from './hooks/useCategorizedPoints';
import { useEnhancedAspects } from './hooks/useEnhancedAspects';
import { CollapsibleTable } from './CollapsibleTable';
import { ViewSpecificSettings } from './ViewSpecificSettings';
import { parseIntFromUnknown } from './utils/number';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  TooltipProvider,
  Button,
  Badge,
  ErrorBoundary,
  Accordion,
  AccordionItem as _AccordionItem,
  AccordionTrigger as _AccordionTrigger,
  AccordionContent as _AccordionContent,
} from '@cosmichub/ui';
// Extracted table components (barrel export)
import {
  PlanetTable as _PlanetTable,
  CelestialBodiesTable as _CelestialBodiesTable,
  convertToCelestialBodies,
  HouseTable,
  type HouseRow,
  AngleTable,
  type AngleRow,
  AsteroidTable,
  type AsteroidRow,
  EnhancedAspectTable,
} from './tables';
import { VirtualizedList } from './VirtualizedList';

// Extracted table components (barrel export)
const PlanetTable = React.memo(_PlanetTable);
const CelestialBodiesTable = React.memo(_CelestialBodiesTable);
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
// (Legacy direct fetch imports removed; data now sourced via useChartData hook)
// Alias the array-based ChartData (planets/houses/aspects as arrays)

// Local type definitions
type ChartType = 'natal' | 'synastry' | 'composite' | 'transit';

import { isChartLike, hasChartContent, type ChartLike } from './normalizeChart';
import {
  AstrologySettingsPanel as _AstrologySettingsPanel,
  type AstrologySettings,
  defaultAstrologySettings,
  migrateAstrologySettings,
} from './AstrologySettings';

// Export shape used by exportChartData utility
interface ExportableChart {
  planets: ChartPlanet[];
  houses: ChartHouse[];
  aspects: ChartAspect[];
  asteroids?: ChartDisplayAsteroid[];
  angles?: ChartDisplayAngle[];
}

// Local lightweight data interfaces (were previously in-file)
interface ChartPlanet {
  name: string;
  sign: string;
  house?: string | number;
  degree: number;
  position?: number;
  retrograde?: boolean;
}
interface ChartHouse {
  number: number;
  house?: number;
  sign: string;
  cusp: number;
  ruler?: string;
}
interface ChartAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  applying?: string;
}

// Enhanced export functionality with serialization (removed unused *Like helper interfaces)

// (Removed unused isChartPlanet / isChartHouse / isChartAspect guards)
// Legacy type import required for house calculations

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

// Export chart data utility (restored after cleanup)
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
    ? chartData.asteroids.filter(
        (a): a is ChartDisplayAsteroid =>
          typeof a === 'object' && a !== null && 'name' in a
      )
    : undefined;
  const angles = Array.isArray(chartData.angles)
    ? chartData.angles.filter(
        (a): a is ChartDisplayAngle =>
          typeof a === 'object' && a !== null && 'name' in a
      )
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
  } catch (err) {
    log.error('Error generating export content', err);
    return;
  }
  try {
    const blob = new Blob([content], { type: mime });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}.${ext}`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    log.error('Error exporting chart', err);
  }
};

// Minimal share chart helper (restored)
const shareChart = async (raw: unknown): Promise<void> => {
  try {
    if (!raw || typeof raw !== 'object') return;
    if (navigator?.share) {
      await navigator.share({
        title: 'Astrology Chart',
        url: window.location.href,
      });
    } else if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(window.location.href);
      // simple toast substitute
    }
  } catch (e) {
    log.warn('Share failed', e);
  }
};

// ---------------- Component ----------------
export interface ChartDisplayProps {
  chart?: ChartLike | null;
  chartId?: string | null;
  chartType?: ChartType;
  onSaveChart?: (data: ChartLike) => void | Promise<void>;
}

const ChartDisplayComponent: React.FC<ChartDisplayProps> = ({
  chart,
  chartId,
  chartType = 'natal',
  onSaveChart: _onSaveChart,
}) => {
  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 250);
  const [useUnifiedView, setUseUnifiedView] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI001, setShowAI001] = useState(false);

  // (Settings logic trimmed for brevity of restoration - can be re-added from backup if needed)
  // Astrology settings with localStorage persistence
  const SETTINGS_KEY = 'cosmichub-astrology-settings-v2';
  const [astrologySettings, setAstrologySettings] = useState<AstrologySettings>(
    () => {
      try {
        const saved =
          localStorage.getItem(SETTINGS_KEY) ??
          localStorage.getItem('cosmichub-astrology-settings'); // migrate from legacy key
        if (saved) {
          return migrateAstrologySettings(JSON.parse(saved));
        }
      } catch {
        /* ignore */
      }
      return defaultAstrologySettings;
    }
  );

  // Hook-based data flow
  const { chartData, isLoading, error } = useChartData({
    chart,
    chartId: chartId ?? undefined,
    chartType,
  });
  const processedSections = useProcessedSections(chartData, debouncedSearch);
  const categorizedPoints = useCategorizedPoints(processedSections.points);
  const enhancedAspects = useEnhancedAspects(processedSections.aspects);

  // Settings change stub (full persistence logic trimmed in refactor phase)
  const handleSettingsChange = (newSettings: AstrologySettings): void => {
    const migrated = migrateAstrologySettings(newSettings);
    setAstrologySettings(migrated);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(migrated));
      // Clean legacy
      localStorage.removeItem('cosmichub-astrology-settings');
    } catch {
      /* non-fatal */
    }
  };

  // Map a generic chart display planet/point to PlanetTable row shape
  const mapPointToPlanetRow = (
    p: ChartDisplayPlanet,
    fallbackHouse: number
  ) => ({
    name: typeof p.name === 'string' ? p.name : '',
    sign: typeof p.sign === 'string' ? p.sign : '',
    house: parseIntFromUnknown(
      typeof p.house === 'string' || typeof p.house === 'number'
        ? p.house
        : fallbackHouse,
      fallbackHouse
    ),
    degree: typeof p.degree === 'number' ? p.degree.toFixed(2) : '0.00',
    position: typeof p.position === 'number' ? p.position : undefined,
    retrograde: typeof p.retrograde === 'boolean' ? p.retrograde : undefined,
  });

  // Type-safe wrapper to handle potentially unsafe objects
  const safeMapPointToPlanetRow = (p: unknown, fallbackHouse: number) => {
    if (typeof p !== 'object' || p === null) {
      return {
        name: '',
        sign: '',
        house: fallbackHouse,
        degree: '0.00',
        position: undefined,
        retrograde: undefined,
      };
    }

    const obj = p as Record<string, unknown>;
    return {
      name: typeof obj.name === 'string' ? obj.name : '',
      sign: typeof obj.sign === 'string' ? obj.sign : '',
      house: parseIntFromUnknown(
        typeof obj.house === 'string' || typeof obj.house === 'number'
          ? obj.house
          : fallbackHouse,
        fallbackHouse
      ),
      degree: typeof obj.degree === 'number' ? obj.degree.toFixed(2) : '0.00',
      position: typeof obj.position === 'number' ? obj.position : undefined,
      retrograde:
        typeof obj.retrograde === 'boolean' ? obj.retrograde : undefined,
    };
  };

  // ---------------- Render branches ----------------

  // (Old categorizedPoints/enhancedAspects blocks removed - provided by hooks)

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
          <div aria-live='polite' aria-atomic='true' className='sr-only'>
            {`Filtered results: ${processedSections.planets.length} planets, ${processedSections.asteroids.length} asteroids, ${processedSections.points.length} points, ${processedSections.aspects.length} aspects.`}
          </div>
          <Card className='w-full max-w-6xl mx-auto cosmic-glass border border-cosmic-purple/30 rounded-xl'>
            <CardHeader className='bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-cosmic-gold rounded-t-xl'>
              <ChartHeader
                chartType={chartType}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onShare={() => void shareChart(chartData)}
                onExport={(fmt: 'json' | 'csv' | 'txt') =>
                  exportChartData(chartData, fmt)
                }
              />
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
                    {/** categorizedPoints computed via top-level useMemo */}
                    {/* Planets Only */}
                    {processedSections.planets.length > 0 && (
                      <CollapsibleTable
                        value='planets'
                        title='Traditional & Modern Planets'
                        icon='🪐'
                        count={processedSections.planets.length}
                      >
                        {processedSections.planets.length > 40 ? (
                          <VirtualizedList
                            items={processedSections.planets.map(p => ({
                              name: p.name,
                              sign: p.sign,
                              house: parseIntFromUnknown(p.house, 0),
                              degree:
                                typeof p.degree === 'number'
                                  ? p.degree.toFixed(2)
                                  : String(p.degree),
                              position: p.position,
                              retrograde: p.retrograde,
                            }))}
                            itemHeight={48}
                            height={420}
                            width='100%'
                            ariaLabel='Virtualized planetary positions'
                            render={(row: {
                              name: string;
                              sign: string;
                              house: number;
                              degree: string;
                              position?: number;
                              retrograde?: boolean;
                            }) => <PlanetTable data={[row]} />}
                          />
                        ) : (
                          <PlanetTable
                            data={processedSections.planets.map(p => ({
                              name: p.name,
                              sign: p.sign,
                              house: parseIntFromUnknown(p.house, 0),
                              degree:
                                typeof p.degree === 'number'
                                  ? p.degree.toFixed(2)
                                  : String(p.degree),
                              position: p.position,
                              retrograde: p.retrograde,
                            }))}
                          />
                        )}
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
                              const bodyHouse = parseIntFromUnknown(
                                body.house,
                                -1
                              );
                              if (bodyHouse === house.house) {
                                planetsInHouse.push(body.name);
                              }
                            });

                            return {
                              number:
                                typeof house.house === 'number'
                                  ? house.house
                                  : 0,
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
                        {processedSections.asteroids.length > 60 ? (
                          <VirtualizedList
                            items={processedSections.asteroids.map(
                              (asteroid): AsteroidRow => ({
                                name: asteroid.name,
                                sign: asteroid.sign,
                                degree: asteroid.degree.toString(),
                                house: asteroid.house,
                              })
                            )}
                            itemHeight={44}
                            height={420}
                            width='100%'
                            ariaLabel='Virtualized asteroid list'
                            render={(row: AsteroidRow) => (
                              <AsteroidTable data={[row]} />
                            )}
                          />
                        ) : (
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
                        )}
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
                          count={categorizedPoints.lunar_nodes.length}
                        >
                          {categorizedPoints.lunar_nodes.length > 40 ? (
                            <VirtualizedList
                              items={categorizedPoints.lunar_nodes.map(p =>
                                safeMapPointToPlanetRow(p, 1)
                              )}
                              itemHeight={48}
                              height={360}
                              width='100%'
                              ariaLabel='Virtualized lunar nodes'
                              render={(
                                row: ReturnType<typeof safeMapPointToPlanetRow>
                              ) => <PlanetTable data={[row]} />}
                            />
                          ) : (
                            <PlanetTable
                              data={categorizedPoints.lunar_nodes.map(p =>
                                safeMapPointToPlanetRow(p, 1)
                              )}
                            />
                          )}
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
                          count={categorizedPoints.lilith_points.length}
                        >
                          {categorizedPoints.lilith_points.length > 40 ? (
                            <VirtualizedList
                              items={categorizedPoints.lilith_points.map(p =>
                                safeMapPointToPlanetRow(p, 1)
                              )}
                              itemHeight={48}
                              height={360}
                              width='100%'
                              ariaLabel='Virtualized lilith points'
                              render={(
                                row: ReturnType<typeof safeMapPointToPlanetRow>
                              ) => <PlanetTable data={[row]} />}
                            />
                          ) : (
                            <PlanetTable
                              data={categorizedPoints.lilith_points.map(p =>
                                safeMapPointToPlanetRow(p, 1)
                              )}
                            />
                          )}
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
                          count={categorizedPoints.special_points.length}
                        >
                          {categorizedPoints.special_points.length > 40 ? (
                            <VirtualizedList
                              items={categorizedPoints.special_points.map(p =>
                                safeMapPointToPlanetRow(p, 1)
                              )}
                              itemHeight={48}
                              height={360}
                              width='100%'
                              ariaLabel='Virtualized special points'
                              render={(
                                row: ReturnType<typeof safeMapPointToPlanetRow>
                              ) => <PlanetTable data={[row]} />}
                            />
                          ) : (
                            <PlanetTable
                              data={categorizedPoints.special_points.map(p =>
                                safeMapPointToPlanetRow(p, 1)
                              )}
                            />
                          )}
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
                          count={categorizedPoints.hypothetical.length}
                        >
                          <PlanetTable
                            data={categorizedPoints.hypothetical.map(p =>
                              mapPointToPlanetRow(p, 1)
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
