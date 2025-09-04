// Central metrics type used across personalization module to eliminate `any`.
export interface EngagementMetrics {
  totalActions: number;
  uniqueFeatures: number;
  averageSessionDuration: number;
  peakHours: number[];
  favoriteFeatures: string[];
}
