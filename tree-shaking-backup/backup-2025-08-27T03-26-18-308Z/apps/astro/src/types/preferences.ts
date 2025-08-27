export type ChartStyle = 'western' | 'vedic';
export type HouseSystem = 'placidus' | 'whole-sign' | 'equal-house';
export type ThemeOption = 'light' | 'dark' | 'auto';

export interface ChartPreferencesData {
  chartStyle: ChartStyle;
  houseSystem: HouseSystem;
  notifications: boolean;
  theme: ThemeOption;
}

// Type guard for ChartPreferencesData
export function isChartPreferencesData(
  value: unknown
): value is ChartPreferencesData {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }

  const data = value as Partial<ChartPreferencesData>;

  // Verify each required property exists and has the correct type/value
  const hasValidChartStyle =
    data.chartStyle !== undefined &&
    (data.chartStyle === 'western' || data.chartStyle === 'vedic');

  const hasValidHouseSystem =
    data.houseSystem !== undefined &&
    (data.houseSystem === 'placidus' ||
      data.houseSystem === 'whole-sign' ||
      data.houseSystem === 'equal-house');

  const hasValidNotifications =
    data.notifications !== undefined && typeof data.notifications === 'boolean';

  const hasValidTheme =
    data.theme !== undefined &&
    (data.theme === 'light' || data.theme === 'dark' || data.theme === 'auto');

  return (
    hasValidChartStyle &&
    hasValidHouseSystem &&
    hasValidNotifications &&
    hasValidTheme
  );
}

// Default preferences
export const DEFAULT_PREFERENCES: ChartPreferencesData = {
  chartStyle: 'western',
  houseSystem: 'placidus',
  notifications: true,
  theme: 'dark',
} as const;
