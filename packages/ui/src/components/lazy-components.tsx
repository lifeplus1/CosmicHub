/**
 * Lazy Loaded UI Components
 * Implements code splitting for heavy UI components
 */

import React from 'react';
import type { ComponentType } from 'react';
import { 
  createLazyComponent, 
  lazyLoadChart, 
  lazyLoadModal,
  DefaultLoadingSpinner,
  SmartPreloader
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
export interface SmartPreloadFunctions {
  preloadOnHover: (
    elementRef: React.RefObject<HTMLElement>,
    componentImport: () => Promise<any>,
    componentName: string
  ) => (() => void) | undefined;
  
  preloadOnIntersection: (
    elementRef: React.RefObject<HTMLElement>,
    componentImport: () => Promise<any>,
    componentName: string
  ) => (() => void) | undefined;
}

export function useSmartPreloading(): SmartPreloadFunctions {
  const preloader = React.useMemo(() => SmartPreloader.getInstance(), []);

  const preloadOnHover = React.useCallback((
    elementRef: React.RefObject<HTMLElement>,
    componentImport: () => Promise<any>,
    componentName: string
  ) => {
    if (elementRef.current) {
      return preloader.preloadOnHover(
        elementRef.current,
        componentImport,
        componentName
      );
    }
    return undefined;
  }, [preloader]);

  const preloadOnIntersection = React.useCallback((
    elementRef: React.RefObject<HTMLElement>,
    componentImport: () => Promise<any>,
    componentName: string
  ) => {
    if (elementRef.current) {
      return preloader.preloadOnIntersection(
        elementRef.current,
        componentImport,
        componentName
      );
    }
    return undefined;
  }, [preloader]);

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

export const ComponentRegistry: Record<ComponentRegistryKeys, () => Promise<any>> = {
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
export function useDynamicComponent(componentKey: ComponentRegistryKeys) {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!componentKey) return;

    setLoading(true);
    setError(null);

    const importFn = ComponentRegistry[componentKey];
    if (!importFn) {
      setError(new Error(`Component "${componentKey}" not found in registry`));
      setLoading(false);
      return;
    }

    importFn()
      .then(module => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [componentKey]);

  return { Component, loading, error };
}

// Lazy component wrapper with performance optimization
export interface LazyComponentWrapperProps {
  /** Key of the component in the registry */
  componentKey: ComponentRegistryKeys;
  /** Props to pass to the loaded component */
  props?: Record<string, any>;
  /** Component to show while loading */
  fallback?: React.ComponentType;
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({ 
  componentKey, 
  props = {}, 
  fallback: Fallback = DefaultLoadingSpinner 
}) => {
  const { Component, loading, error } = useDynamicComponent(componentKey);

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600 text-sm">Failed to load component: {error.message}</p>
      </div>
    );
  }

  if (loading || !Component) {
    return <Fallback />;
  }

  return <Component {...props} />;
};
