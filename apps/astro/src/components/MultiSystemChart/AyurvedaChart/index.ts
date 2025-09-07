/**
 * AyurvedaChart Component Barrel Exports
 * Provides clean imports for the modular AyurvedaChart system
 */

// Main display component
export { default as AyurvedaChartDisplay } from './AyurvedaChartDisplay';
export type { AyurvedaChartDisplayProps, TabKey } from './AyurvedaChartDisplay';

// Individual tab components
export { default as ConstitutionTab } from './ConstitutionTab';
export { default as DoshasTab } from './DoshasTab';
export { default as PlanetaryHealthTab } from './PlanetaryHealthTab';
export { default as WellnessPlanTab } from './WellnessPlanTab';
export { default as SynthesisTab } from './SynthesisTab';

// Types and utilities
export type {
  AyurvedaChartData,
  AyurvedaChartProps,
  ConstitutionalAnalysis,
  DoshaProfile,
  PlanetaryHealth,
  TabType,
  TabComponentProps
} from './types';

export {
  getDoshaIcon,
  getDoshaColor,
  getPlanetIcon
} from './utils';

// Default export for backwards compatibility
export { default } from './AyurvedaChartDisplay';
