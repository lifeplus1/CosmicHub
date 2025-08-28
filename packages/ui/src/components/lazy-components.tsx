/**
 * Lazy Loaded UI Components
 * Implements code splitting for heavy UI components
 */

import React from 'react';

// Chart components (heavy libraries)
const LazyAstrologyChartComponent = React.lazy(
  () => import('./charts/AstrologyChart')
);
const LazyBiofeedbackChartComponent = React.lazy(
  () => import('./charts/BiofeedbackChart')
);
const LazyFrequencyVisualizerComponent = React.lazy(
  () => import('./charts/FrequencyVisualizer')
);
const LazyTransitChartComponent = React.lazy(
  () => import('./charts/TransitChart')
);
const LazySynastryChartComponent = React.lazy(
  () => import('./charts/SynastryChart')
);

// Modal components
const LazyProfileModalComponent = React.lazy(
  () => import('./modals/ProfileModal')
);
const LazySettingsModalComponent = React.lazy(
  () => import('./modals/SettingsModal')
);
const LazyChartModalComponent = React.lazy(() => import('./modals/ChartModal'));
const LazyFrequencyPlayerModalComponent = React.lazy(
  () => import('./modals/FrequencyPlayerModal')
);
const LazyShareModalComponent = React.lazy(() => import('./modals/ShareModal'));

// Form components
const LazyAdvancedFormComponent = React.lazy(
  () => import('./forms/AdvancedForm')
);
const LazyBirthDataFormComponent = React.lazy(
  () => import('./forms/BirthDataForm')
);
const LazyFrequencyFormComponent = React.lazy(
  () => import('./forms/FrequencyForm')
);

// Analytics components
const LazyAnalyticsPanelComponent = React.lazy(
  () => import('./analytics/AnalyticsPanel')
);
const LazyReportGeneratorComponent = React.lazy(
  () => import('./reports/ReportGenerator')
);
const LazyExportToolsComponent = React.lazy(
  () => import('./tools/ExportTools')
);

// Calculator components
const LazyEphemerisCalculatorComponent = React.lazy(
  () => import('./calculators/EphemerisCalculator')
);
const LazyGeneKeysCalculatorComponent = React.lazy(
  () => import('./calculators/GeneKeysCalculator')
);
const LazyFrequencyCalculatorComponent = React.lazy(
  () => import('./calculators/FrequencyCalculator')
);

// Type-erased exports to avoid prop type inference issues
export const LazyAstrologyChart =
  LazyAstrologyChartComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyBiofeedbackChart =
  LazyBiofeedbackChartComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyFrequencyVisualizer =
  LazyFrequencyVisualizerComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyTransitChart =
  LazyTransitChartComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazySynastryChart =
  LazySynastryChartComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;

export const LazyProfileModal =
  LazyProfileModalComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazySettingsModal =
  LazySettingsModalComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyChartModal =
  LazyChartModalComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyFrequencyPlayerModal =
  LazyFrequencyPlayerModalComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyShareModal =
  LazyShareModalComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;

export const LazyAdvancedForm =
  LazyAdvancedFormComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyBirthDataForm =
  LazyBirthDataFormComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyFrequencyForm =
  LazyFrequencyFormComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;

export const LazyAnalyticsPanel =
  LazyAnalyticsPanelComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyReportGenerator =
  LazyReportGeneratorComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyExportTools =
  LazyExportToolsComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;

export const LazyEphemerisCalculator =
  LazyEphemerisCalculatorComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyGeneKeysCalculator =
  LazyGeneKeysCalculatorComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
export const LazyFrequencyCalculator =
  LazyFrequencyCalculatorComponent as unknown as React.LazyExoticComponent<
    React.ComponentType<Record<string, unknown>>
  >;
