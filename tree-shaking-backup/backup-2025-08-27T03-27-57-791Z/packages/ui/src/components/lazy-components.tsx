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
  SmartPreloader as _SmartPreloader,
} from '@cosmichub/config/lazy-loading';

// Chart components (heavy libraries)

// Modal components

// Heavy form components
);

);

);

// Analytics and reporting components
);

);

);

// Advanced calculation components
);

);

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

  preloadOnIntersection: <K extends keyof LazyComponentPropsMap>(
    elementRef: React.RefObject<HTMLElement>,
    componentImport: () => Promise<LazyLoadedModule<LazyComponentPropsMap[K]>>,
    componentName: K
  ) => (() => void) | undefined;
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
  [K in ComponentRegistryKeys]: () => Promise<
    LazyLoadedModule<LazyComponentPropsMap[K]>
  >;
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
  'frequency-calculator': () => import('./calculators/FrequencyCalculator'),
};

// Dynamic component loader
export function useDynamicComponent<K extends ComponentRegistryKeys>(
  componentKey: K
) {
  const [Component, setComponent] = React.useState<React.ComponentType<
    LazyComponentPropsMap[K]
  > | null>(null);
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
  fallback: Fallback = DefaultLoadingSpinner,
}: LazyComponentWrapperProps<K>): JSX.Element => {
  const { Component, loading, error } = useDynamicComponent(componentKey);

  if (error !== null) {
    return (
      <div className='p-4 border border-red-200 rounded-lg bg-red-50'>
        <p className='text-red-600 text-sm'>
          Failed to load component: {error.message}
        </p>
      </div>
    );
  }

  if (loading || Component === null) {
    return <Fallback />;
  }

  return <Component {...props} />;
};
