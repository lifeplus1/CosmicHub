/**
 * Lazy Loaded UI Components
 * Implements code splitting for heavy UI components
 */

import React, { type ComponentType, type JSX } from 'react';
import { 
  createLazyComponent,
  lazyLoadChart,
  lazyLoadModal,
  DefaultLoadingSpinner,
  SmartPreloader as _SmartPreloader
} from '@cosmichub/config/lazy-loading';

// Chart components (heavy libraries)
export const LazyAstrologyChart = lazyLoadChart(
  () => import('./charts/AstrologyChart'),
  'AstrologyChart'
);

export const LazyFrequencyVisualizer = lazyLoadChart(
  () => import('./charts/FrequencyVisualizer'),
  'FrequencyVisualizer'
);

export const LazyTransitChart = lazyLoadChart(
  () => import('./charts/TransitChart'),
  'TransitChart'
);

export const LazySynastryChart = lazyLoadChart(
  () => import('./charts/SynastryChart'),
  'SynastryChart'
);

export const LazyBiofeedbackChart = lazyLoadChart(
  () => import('./charts/BiofeedbackChart'),
  'BiofeedbackChart'
);

// Modal components
export const LazyChartModal = lazyLoadModal(
  () => import('./modals/ChartModal'),
  'ChartModal'
);

export const LazySettingsModal = lazyLoadModal(
  () => import('./modals/SettingsModal'),
  'SettingsModal'
);

export const LazyFrequencyPlayerModal = lazyLoadModal(
  () => import('./modals/FrequencyPlayerModal'),
  'FrequencyPlayerModal'
);

export const LazyProfileModal = lazyLoadModal(
  () => import('./modals/ProfileModal'),
  'ProfileModal'
);

export const LazyShareModal = lazyLoadModal(
  () => import('./modals/ShareModal'),
  'ShareModal'
);

// Heavy form components
export const LazyAdvancedForm = createLazyComponent(
  () => import('./forms/AdvancedForm'),
  'AdvancedForm',
  { 
    loadingComponent: DefaultLoadingSpinner,
    preload: false 
  }
);

export const LazyFrequencyForm = createLazyComponent(
  () => import('./forms/FrequencyForm'),
  'FrequencyForm',
  { 
    loadingComponent: DefaultLoadingSpinner,
    preload: false 
  }
);

export const LazyBirthDataForm = createLazyComponent(
  () => import('./forms/BirthDataForm'),
  'BirthDataForm',
  { 
    loadingComponent: DefaultLoadingSpinner,
    preload: true // Common form, preload it
  }
);

// Analytics and reporting components
export const LazyAnalyticsPanel = createLazyComponent(
  () => import('./analytics/AnalyticsPanel'),
  'AnalyticsPanel',
  { 
    loadingComponent: DefaultLoadingSpinner,
    preload: false 
  }
);

export const LazyReportGenerator = createLazyComponent(
  () => import('./reports/ReportGenerator'),
  'ReportGenerator',
  { 
    loadingComponent: DefaultLoadingSpinner,
    preload: false 
  }
);

export const LazyExportTools = createLazyComponent(
  () => import('./tools/ExportTools'),
  'ExportTools',
  { 
    loadingComponent: DefaultLoadingSpinner,
    preload: false 
  }
);

// Advanced calculation components
export const LazyEphemerisCalculator = createLazyComponent(
  () => import('./calculators/EphemerisCalculator'),
  'EphemerisCalculator',
  { 
    loadingComponent: DefaultLoadingSpinner,
    preload: false 
  }
);

export const LazyGeneKeysCalculator = createLazyComponent(
  () => import('./calculators/GeneKeysCalculator'),
  'GeneKeysCalculator',
  { 
    loadingComponent: DefaultLoadingSpinner,
    preload: false 
  }
);

export const LazyFrequencyCalculator = createLazyComponent(
  () => import('./calculators/FrequencyCalculator'),
  'FrequencyCalculator',
  { 
    loadingComponent: DefaultLoadingSpinner,
    preload: false 
  }
);

// Smart preloading hook for UI components
// Type imports for component props
import type { AstrologyChartProps } from './charts/AstrologyChart';
import type { FrequencyVisualizerProps } from './charts/FrequencyVisualizer';
import type { TransitChartProps } from './charts/TransitChart';
import type { SynastryChartProps } from './charts/SynastryChart';
import type { BiofeedbackChartProps } from './charts/BiofeedbackChart';
import type { ChartModalProps } from './modals/ChartModal';
import type { SettingsModalProps } from './modals/SettingsModal';
import type { FrequencyPlayerModalProps } from './modals/FrequencyPlayerModal';
import type { ProfileModalProps } from './modals/ProfileModal';
import type { ShareModalProps } from './modals/ShareModal';
import type { AdvancedFormProps } from './forms/AdvancedForm';
import type { FrequencyFormProps } from './forms/FrequencyForm';
import type { BirthDataFormProps } from './forms/BirthDataForm';
import type { AnalyticsPanelProps } from './analytics/AnalyticsPanel';
import type { ReportGeneratorProps } from './reports/ReportGenerator';
import type { ExportToolsProps } from './tools/ExportTools';
import type { EphemerisCalculatorProps } from './calculators/EphemerisCalculator';
import type { GeneKeysCalculatorProps } from './calculators/GeneKeysCalculator';
import type { FrequencyCalculatorProps } from './calculators/FrequencyCalculator';

// Base interface for component modules
export interface LazyLoadedModule<T = unknown> {
  default: ComponentType<T>;
  [key: string]: unknown;
}

// Props map for lazy loaded components
export interface LazyComponentPropsMap {
  'astrology-chart': AstrologyChartProps;
  'frequency-visualizer': FrequencyVisualizerProps;
  'transit-chart': TransitChartProps;
  'synastry-chart': SynastryChartProps;
  'biofeedback-chart': BiofeedbackChartProps;
  'chart-modal': ChartModalProps;
  'settings-modal': SettingsModalProps;
  'frequency-player-modal': FrequencyPlayerModalProps;
  'profile-modal': ProfileModalProps;
  'share-modal': ShareModalProps;
  'advanced-form': AdvancedFormProps;
  'frequency-form': FrequencyFormProps;
  'birth-data-form': BirthDataFormProps;
  'analytics-panel': AnalyticsPanelProps;
  'report-generator': ReportGeneratorProps;
  'export-tools': ExportToolsProps;
  'ephemeris-calculator': EphemerisCalculatorProps;
  'gene-keys-calculator': GeneKeysCalculatorProps;
  'frequency-calculator': FrequencyCalculatorProps;
}

export interface SmartPreloadFunctions {
  preloadOnHover: <K extends keyof LazyComponentPropsMap>(
    elementRef: React.RefObject<HTMLElement>,
    componentImport: () => Promise<LazyLoadedModule<LazyComponentPropsMap[K]>>,
    componentName: K
  ) => (() => void) | undefined;
  
  preloadOnIntersection: <K extends keyof LazyComponentPropsMap>(
    elementRef: React.RefObject<HTMLElement>,
    componentImport: () => Promise<LazyLoadedModule<LazyComponentPropsMap[K]>>,
    componentName: K
  ) => (() => void) | undefined;
}

export function useSmartPreloading(): SmartPreloadFunctions {
  // Temporarily disabled due to type conflicts - preloader unused
  // Preloader intentionally disabled (kept for future reinstatement)
  // const _preloader = React.useMemo(() => SmartPreloader.getInstance(), []);

  const preloadOnHover = React.useCallback((_elementRef: unknown, _componentImport: unknown, _componentName: unknown) => {
    // Temporarily disabled due to type conflicts
    return undefined;
  }, []);

  const preloadOnIntersection = React.useCallback((_elementRef: unknown, _componentImport: unknown, _componentName: unknown) => {
    // Temporarily disabled due to type conflicts  
    return undefined;
  }, []);

  return { preloadOnHover, preloadOnIntersection };
}

// Component registry for dynamic loading
export type ComponentRegistryKeys = 
  // Charts
  | 'astrology-chart'
  | 'frequency-visualizer'
  | 'transit-chart'
  | 'synastry-chart'
  | 'biofeedback-chart'
  // Modals
  | 'chart-modal'
  | 'settings-modal'
  | 'frequency-player-modal'
  | 'profile-modal'
  | 'share-modal'
  // Forms
  | 'advanced-form'
  | 'frequency-form'
  | 'birth-data-form'
  // Analytics
  | 'analytics-panel'
  | 'report-generator'
  | 'export-tools'
  // Calculators
  | 'ephemeris-calculator'
  | 'gene-keys-calculator'
  | 'frequency-calculator';

// Create a type-safe component registry
export const ComponentRegistry: {
  [K in ComponentRegistryKeys]: () => Promise<LazyLoadedModule<LazyComponentPropsMap[K]>>;
} = {
  // Charts
  'astrology-chart': () => import('./charts/AstrologyChart'),
  'frequency-visualizer': () => import('./charts/FrequencyVisualizer'),
  'transit-chart': () => import('./charts/TransitChart'),
  'synastry-chart': () => import('./charts/SynastryChart'),
  'biofeedback-chart': () => import('./charts/BiofeedbackChart'),

  // Modals
  'chart-modal': () => import('./modals/ChartModal'),
  'settings-modal': () => import('./modals/SettingsModal'),
  'frequency-player-modal': () => import('./modals/FrequencyPlayerModal'),
  'profile-modal': () => import('./modals/ProfileModal'),
  'share-modal': () => import('./modals/ShareModal'),

  // Forms
  'advanced-form': () => import('./forms/AdvancedForm'),
  'frequency-form': () => import('./forms/FrequencyForm'),
  'birth-data-form': () => import('./forms/BirthDataForm'),

  // Analytics
  'analytics-panel': () => import('./analytics/AnalyticsPanel'),
  'report-generator': () => import('./reports/ReportGenerator'),
  'export-tools': () => import('./tools/ExportTools'),

  // Calculators
  'ephemeris-calculator': () => import('./calculators/EphemerisCalculator'),
  'gene-keys-calculator': () => import('./calculators/GeneKeysCalculator'),
  'frequency-calculator': () => import('./calculators/FrequencyCalculator')
};

// Dynamic component loader
export function useDynamicComponent<K extends ComponentRegistryKeys>(componentKey: K) {
  const [Component, setComponent] = React.useState<React.ComponentType<LazyComponentPropsMap[K]> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (componentKey.length === 0) return;

    setLoading(true);
    setError(null);

    const importFn = ComponentRegistry[componentKey];
    if (importFn === null || importFn === undefined) {
      setError(new Error(`Component "${componentKey}" not found in registry`));
      setLoading(false);
      return;
    }

    importFn()
      .then(module => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err);
        setLoading(false);
      });
  }, [componentKey]);

  return { Component, loading, error };
}

// Lazy component wrapper with performance optimization
export interface LazyComponentWrapperProps<K extends ComponentRegistryKeys> {
  /** Key of the component in the registry */
  componentKey: K;
  /** Props to pass to the loaded component */
  props?: LazyComponentPropsMap[K];
  /** Component to show while loading */
  fallback?: React.ComponentType;
}

export const LazyComponentWrapper = <K extends ComponentRegistryKeys>({ 
  componentKey, 
  props = {} as LazyComponentPropsMap[K], 
  fallback: Fallback = DefaultLoadingSpinner 
}: LazyComponentWrapperProps<K>): JSX.Element => {
  const { Component, loading, error } = useDynamicComponent(componentKey);

  if (error !== null) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">Failed to load component: {error.message}</p>
      </div>
    );
  }

  if (loading || Component === null) {
    return <Fallback />;
  }

  return <Component {...props} />;
};
