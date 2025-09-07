/**
 * Chart Display Component Schemas
 * Following Type Bridge system and validation strategies with descriptive types
 * Supports component splitting with type safety guarantees
 */

import { z } from 'zod';

// Base Chart Data Validation Schemas
export const ChartPlanetSchema = z.object({
  name: z.string().min(1, 'Planet name is required'),
  symbol: z.string().min(1, 'Planet symbol is required'),
  degree: z.number().min(0).max(360, 'Degree must be between 0-360'),
  sign: z.string().min(1, 'Astrological sign is required'),
  house: z.number().int().min(1).max(12, 'House must be between 1-12'),
  retrograde: z.boolean().default(false),
  speed: z.number().optional(),
  distance: z.number().positive().optional(),
});

export const ChartHouseSchema = z.object({
  number: z.number().int().min(1).max(12, 'House number must be between 1-12'),
  cusp: z.number().min(0).max(360, 'House cusp must be between 0-360 degrees'),
  sign: z.string().min(1, 'House sign is required'),
  ruler: z.string().optional(),
  size: z.number().positive().optional(),
});

export const ChartAspectSchema = z.object({
  planet1: z.string().min(1, 'First planet is required'),
  planet2: z.string().min(1, 'Second planet is required'),
  aspect: z.string().min(1, 'Aspect type is required'),
  angle: z.number().min(0).max(360, 'Aspect angle must be between 0-360'),
  orb: z.number().min(0).max(12, 'Orb must be between 0-12 degrees'),
  applying: z.boolean().default(false),
  exact: z.boolean().default(false),
  strength: z.number().min(0).max(100, 'Aspect strength must be 0-100%').optional(),
});

export const ChartAsteroidSchema = z.object({
  name: z.string().min(1, 'Asteroid name is required'),
  number: z.number().int().positive().optional(),
  degree: z.number().min(0).max(360, 'Degree must be between 0-360'),
  sign: z.string().min(1, 'Astrological sign is required'),
  house: z.number().int().min(1).max(12, 'House must be between 1-12'),
  retrograde: z.boolean().default(false),
});

export const ChartAngleSchema = z.object({
  name: z.enum(['ASC', 'DESC', 'MC', 'IC'], {
    errorMap: () => ({ message: 'Angle must be ASC, DESC, MC, or IC' })
  }),
  degree: z.number().min(0).max(360, 'Degree must be between 0-360'),
  sign: z.string().min(1, 'Astrological sign is required'),
});

// Chart Display Configuration Schemas
export const AstrologyDisplayOptionsSchema = z.object({
  showPlanets: z.boolean().default(true),
  showAsteroids: z.boolean().default(true),
  showHouses: z.boolean().default(true),
  showAspects: z.boolean().default(true),
  showAngles: z.boolean().default(true),
  showAspectGrid: z.boolean().default(false),
  showRetrogrades: z.boolean().default(true),
  showMinorAspects: z.boolean().default(false),
  showDegreeMarkers: z.boolean().default(true),
  showElementalBalance: z.boolean().default(false),
  showModalityBalance: z.boolean().default(false),
});

export const ChartViewModeSchema = z.enum(['unified', 'separate'], {
  errorMap: () => ({ message: 'View mode must be unified or separate' })
});

export const ExportFormatSchema = z.enum(['json', 'csv', 'txt', 'pdf'], {
  errorMap: () => ({ message: 'Export format must be json, csv, txt, or pdf' })
});

export const AstrologySettingsSchema = z.object({
  displayOptions: AstrologyDisplayOptionsSchema,
  viewMode: ChartViewModeSchema.default('unified'),
  aspectOrbs: z.record(z.string(), z.number().min(0).max(12)).optional(),
  houseSystem: z.enum(['placidus', 'koch', 'equal', 'whole_sign']).default('placidus'),
  zodiacType: z.enum(['tropical', 'sidereal']).default('tropical'),
  coordinateSystem: z.enum(['geocentric', 'heliocentric']).default('geocentric'),
});

// Chart Data Processing Schemas
export const ProcessedSectionsSchema = z.object({
  planets: z.array(ChartPlanetSchema),
  houses: z.array(ChartHouseSchema),
  aspects: z.array(ChartAspectSchema),
  asteroids: z.array(ChartAsteroidSchema),
  angles: z.array(ChartAngleSchema),
});

export const CategorizedPointsSchema = z.object({
  luminaries: z.array(ChartPlanetSchema),
  personalPlanets: z.array(ChartPlanetSchema),
  socialPlanets: z.array(ChartPlanetSchema),
  outerPlanets: z.array(ChartPlanetSchema),
  modernPlanets: z.array(ChartPlanetSchema),
  asteroids: z.array(ChartAsteroidSchema),
  angles: z.array(ChartAngleSchema),
});

export const EnhancedAspectSchema = z.object({
  ...ChartAspectSchema.shape,
  category: z.enum(['major', 'minor', 'composite']),
  energy: z.enum(['harmonious', 'challenging', 'neutral']),
  interpretation: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

// Export Data Schemas
export const ExportableChartSchema = z.object({
  planets: z.array(ChartPlanetSchema),
  houses: z.array(ChartHouseSchema),
  aspects: z.array(ChartAspectSchema),
  asteroids: z.array(ChartAsteroidSchema),
  angles: z.array(ChartAngleSchema),
  metadata: z.object({
    exportedAt: z.string().datetime(),
    format: ExportFormatSchema,
    settings: AstrologySettingsSchema,
    chartId: z.string().optional(),
    userId: z.string().optional(),
  }),
});

// Component State Schemas
export const ChartDisplayStateSchema = z.object({
  isLoading: z.boolean().default(false),
  hasError: z.boolean().default(false),
  errorMessage: z.string().optional(),
  useUnifiedView: z.boolean().default(true),
  showSettings: z.boolean().default(false),
  selectedAspectFilter: z.string().optional(),
  sortOrder: z.enum(['default', 'degree', 'strength', 'name']).default('default'),
  searchQuery: z.string().default(''),
});

// Table Configuration Schemas
export const TableSortConfigSchema = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

export const TableFilterConfigSchema = z.object({
  searchTerm: z.string().default(''),
  categories: z.array(z.string()).default([]),
  showOnly: z.record(z.string(), z.boolean()).default({}),
});

export const VirtualizationConfigSchema = z.object({
  enabled: z.boolean().default(false),
  itemHeight: z.number().positive().default(48),
  overscan: z.number().int().min(1).max(20).default(5),
  threshold: z.number().int().positive().default(100),
});

// Performance and Optimization Schemas
export const ChartPerformanceMetricsSchema = z.object({
  renderTime: z.number().min(0),
  itemCount: z.number().int().min(0),
  memoryUsage: z.number().min(0).optional(),
  recomputeCount: z.number().int().min(0).default(0),
  lastUpdate: z.string().datetime(),
});

export const OptimizationConfigSchema = z.object({
  enableMemoization: z.boolean().default(true),
  enableVirtualization: z.boolean().default(false),
  enableLazyLoading: z.boolean().default(false),
  chunkSize: z.number().int().positive().default(50),
  debounceMs: z.number().int().min(0).max(1000).default(300),
});

// Component Props Schemas
export const ChartDisplayPropsSchema = z.object({
  chartData: z.unknown(), // Will be validated at runtime
  isLoading: z.boolean().default(false),
  onExport: z.function().optional(),
  onSettingsChange: z.function().optional(),
  className: z.string().optional(),
  'data-testid': z.string().optional(),
});

export const ChartOverviewCardsPropsSchema = z.object({
  processedSections: ProcessedSectionsSchema,
  className: z.string().optional(),
  animate: z.boolean().default(true),
});

export const ChartDataExportPropsSchema = z.object({
  chartData: ExportableChartSchema,
  onExport: z.function(),
  supportedFormats: z.array(ExportFormatSchema).default(['json', 'csv', 'txt']),
  className: z.string().optional(),
});

export const ViewToggleControlsPropsSchema = z.object({
  useUnifiedView: z.boolean(),
  onToggle: z.function(),
  disabled: z.boolean().default(false),
  className: z.string().optional(),
});

export const AstrologySettingsPanelPropsSchema = z.object({
  settings: AstrologySettingsSchema,
  onSettingsChange: z.function(),
  isOpen: z.boolean().default(false),
  onToggle: z.function(),
  isUnifiedView: z.boolean().default(true),
  className: z.string().optional(),
});

// Error Handling Schemas
export const ChartDisplayErrorSchema = z.object({
  type: z.enum(['validation', 'computation', 'rendering', 'export', 'network']),
  message: z.string().min(1),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  recoverable: z.boolean().default(true),
  timestamp: z.string().datetime(),
});

// Analytics and Tracking Schemas
export const ChartDisplayAnalyticsSchema = z.object({
  action: z.enum([
    'view_chart',
    'toggle_view',
    'export_data',
    'change_settings',
    'sort_table',
    'filter_data',
    'search_data'
  ]),
  chartType: z.string().optional(),
  dataSize: z.number().int().min(0).optional(),
  renderTime: z.number().min(0).optional(),
  userSettings: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().datetime(),
});

// Type exports for Type Bridge system
export type ChartPlanet = z.infer<typeof ChartPlanetSchema>;
export type ChartHouse = z.infer<typeof ChartHouseSchema>;
export type ChartAspect = z.infer<typeof ChartAspectSchema>;
export type ChartAsteroid = z.infer<typeof ChartAsteroidSchema>;
export type ChartAngle = z.infer<typeof ChartAngleSchema>;
export type AstrologyDisplayOptions = z.infer<typeof AstrologyDisplayOptionsSchema>;
export type ChartViewMode = z.infer<typeof ChartViewModeSchema>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export type AstrologySettings = z.infer<typeof AstrologySettingsSchema>;
export type ProcessedSections = z.infer<typeof ProcessedSectionsSchema>;
export type CategorizedPoints = z.infer<typeof CategorizedPointsSchema>;
export type EnhancedAspect = z.infer<typeof EnhancedAspectSchema>;
export type ExportableChart = z.infer<typeof ExportableChartSchema>;
export type ChartDisplayState = z.infer<typeof ChartDisplayStateSchema>;
export type TableSortConfig = z.infer<typeof TableSortConfigSchema>;
export type TableFilterConfig = z.infer<typeof TableFilterConfigSchema>;
export type VirtualizationConfig = z.infer<typeof VirtualizationConfigSchema>;
export type ChartPerformanceMetrics = z.infer<typeof ChartPerformanceMetricsSchema>;
export type OptimizationConfig = z.infer<typeof OptimizationConfigSchema>;
export type ChartDisplayProps = z.infer<typeof ChartDisplayPropsSchema>;
export type ChartOverviewCardsProps = z.infer<typeof ChartOverviewCardsPropsSchema>;
export type ChartDataExportProps = z.infer<typeof ChartDataExportPropsSchema>;
export type ViewToggleControlsProps = z.infer<typeof ViewToggleControlsPropsSchema>;
export type AstrologySettingsPanelProps = z.infer<typeof AstrologySettingsPanelPropsSchema>;
export type ChartDisplayError = z.infer<typeof ChartDisplayErrorSchema>;
export type ChartDisplayAnalytics = z.infer<typeof ChartDisplayAnalyticsSchema>;
