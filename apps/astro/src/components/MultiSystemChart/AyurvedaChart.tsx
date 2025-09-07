/**
 * AyurvedaChart.tsx
 * Bridge component for backwards compatibility
 * This file now imports from the new modular AyurvedaChart directory structure
 */

// Import everything from the new modular structure
export {
  default,
  AyurvedaChartDisplay,
  type AyurvedaChartDisplayProps,
  type AyurvedaChartData,
  type AyurvedaChartProps,
  type ConstitutionalAnalysis,
  type DoshaProfile,
  type PlanetaryHealth,
  ConstitutionTab,
  DoshasTab,
  PlanetaryHealthTab,
  WellnessPlanTab,
  SynthesisTab,
  getDoshaIcon,
  getDoshaColor,
  getPlanetIcon
} from './AyurvedaChart/index';

// Named export for backwards compatibility 
export { AyurvedaChartDisplay as AyurvedaChart } from './AyurvedaChart/index';
