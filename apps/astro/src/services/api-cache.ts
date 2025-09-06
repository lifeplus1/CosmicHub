/**
 * API Caching Layer using React Query patterns
 */
import type { ChartBirthData } from '@cosmichub/types';
import type { ChartData } from './api.types';

// Simple in-memory cache for expensive calculations
const chartCache = new Map<string, { data: ChartData; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Generate cache key from birth data
 */
function getCacheKey(birthData: ChartBirthData): string {
  const { year, month, day, hour, minute, lat, lon } = birthData;
  return `chart:${String(year)}-${String(month)}-${String(day)}:${String(hour)}:${String(minute)}:${String(lat)}:${String(lon)}`;
}

/**
 * Cached chart data fetcher with TTL
 */
export function getCachedChartData(birthData: ChartBirthData): ChartData | null {
  const key = getCacheKey(birthData);
  const cached = chartCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  // Clean expired entry
  if (cached) {
    chartCache.delete(key);
  }
  
  return null;
}

/**
 * Cache chart data with timestamp
 */
export function setCachedChartData(birthData: ChartBirthData, data: ChartData): void {
  const key = getCacheKey(birthData);
  chartCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Clear expired cache entries
 */
export function cleanupCache(): void {
  const now = Date.now();
  for (const [key, value] of chartCache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      chartCache.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000);
