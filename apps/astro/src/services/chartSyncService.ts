/**
 * Real-Time Chart Synchronization Service
 * Manages live updates, transit tracking, and cross-app chart sharing
 */

import { EventEmitter } from 'events';
import { fetchChartData, type ChartBirthData } from './api';

export interface Planet {
  name: string;
  position: number;
  retrograde?: boolean;
  speed?: number;
  color?: string;
  house?: number;
}

export interface House {
  number: number;
  cusp: number;
  sign: string;
  planets?: string[];
}

export interface ChartData {
  planets: Record<string, Planet>;
  houses: House[];
  aspects?: any[];
  angles?: any;
}

export interface ChartDataSync {
  natal: ChartData;
  transits: Record<string, Planet>;
  progressions?: Record<string, Planet>;
  solarReturn?: ChartData;
  lunarReturn?: ChartData;
  lastUpdate: Date;
  nextUpdate: Date;
}

export interface SyncEvent {
  type: 'transit-update' | 'progression-update' | 'aspect-forming' | 'aspect-separating' | 'chart-refresh';
  data: any;
  timestamp: Date;
  chartId: string;
}

export interface AspectEvent {
  type: 'aspect-forming' | 'aspect-separating';
  transitPlanet: string;
  natalPlanet: string;
  aspectType: string;
  orb: number;
  exactDate: Date;
  strength: 'strong' | 'medium' | 'weak';
}

class ChartSyncService extends EventEmitter {
  private charts: Map<string, ChartDataSync> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private transitUpdateInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;
  private pendingUpdates: Map<string, Date> = new Map();

  constructor() {
    super();
    this.setupNetworkHandlers();
    this.startGlobalTransitUpdates();
  }

  private setupNetworkHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('connection-restored');
      this.processPendingUpdates();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('connection-lost');
    });
  }

  private startGlobalTransitUpdates() {
    // Update transits every minute
    this.transitUpdateInterval = setInterval(async () => {
      if (!this.isOnline) return;
      
      try {
        const currentTransits = await this.fetchCurrentTransits();
        this.charts.forEach((chartData, chartId) => {
          this.updateTransits(chartId, currentTransits);
        });
      } catch (error) {
        console.error('Failed to update global transits:', error);
      }
    }, 60000); // 1 minute
  }

  /**
   * Register a chart for real-time synchronization
   */
  async registerChart(chartId: string, birthData: ChartBirthData, options: {
    enableTransitUpdates?: boolean;
    enableProgressions?: boolean;
    aspectAlerts?: boolean;
    updateInterval?: number; // minutes
  } = {}) {
    try {
      const {
        enableTransitUpdates = true,
        enableProgressions = false,
        aspectAlerts = true,
        updateInterval = 5
      } = options;

      // Fetch initial chart data
      const natalData = await fetchChartData(birthData);
      const transits = enableTransitUpdates ? await this.fetchCurrentTransits() : {};
      const progressions = enableProgressions ? await this.fetchProgressions(birthData) : {};

      const chartSync: ChartDataSync = {
        natal: this.transformChartData(natalData),
        transits,
        progressions,
        lastUpdate: new Date(),
        nextUpdate: new Date(Date.now() + updateInterval * 60000)
      };

      this.charts.set(chartId, chartSync);

      // Set up periodic updates
      if (enableTransitUpdates || enableProgressions) {
        const interval = setInterval(async () => {
          await this.updateChart(chartId, { enableTransitUpdates, enableProgressions, aspectAlerts });
        }, updateInterval * 60000);
        
        this.syncIntervals.set(chartId, interval);
      }

      this.emit('chart-registered', { chartId, chartSync });
      return chartSync;

    } catch (error) {
      console.error('Failed to register chart:', error);
      throw error;
    }
  }

  /**
   * Update a specific chart
   */
  private async updateChart(chartId: string, options: {
    enableTransitUpdates?: boolean;
    enableProgressions?: boolean;
    aspectAlerts?: boolean;
  }) {
    if (!this.isOnline) {
      this.pendingUpdates.set(chartId, new Date());
      return;
    }

    const chartData = this.charts.get(chartId);
    if (!chartData) return;

    try {
      const updates: Partial<ChartDataSync> = {
        lastUpdate: new Date(),
        nextUpdate: new Date(Date.now() + 5 * 60000)
      };

      if (options.enableTransitUpdates) {
        const newTransits = await this.fetchCurrentTransits();
        const aspectEvents = this.detectAspectChanges(chartData.natal, chartData.transits, newTransits);
        
        updates.transits = newTransits;
        
        if (options.aspectAlerts && aspectEvents.length > 0) {
          aspectEvents.forEach(event => {
            this.emit('aspect-event', { chartId, event });
          });
        }
      }

      if (options.enableProgressions) {
        // Update progressions (slower moving, update less frequently)
        const now = new Date();
        const hoursSinceLastUpdate = (now.getTime() - chartData.lastUpdate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastUpdate >= 24) { // Update progressions daily
          updates.progressions = await this.fetchProgressions(this.getBirthDataFromChart(chartData.natal));
        }
      }

      // Update the stored chart data
      Object.assign(chartData, updates);
      this.charts.set(chartId, chartData);

      this.emit('chart-updated', { chartId, updates });

    } catch (error) {
      console.error(`Failed to update chart ${chartId}:`, error);
    }
  }

  /**
   * Update transits for a specific chart
   */
  private updateTransits(chartId: string, newTransits: Record<string, Planet>) {
    const chartData = this.charts.get(chartId);
    if (!chartData) return;

    const aspectEvents = this.detectAspectChanges(chartData.natal, chartData.transits, newTransits);
    
    chartData.transits = newTransits;
    chartData.lastUpdate = new Date();
    
    this.emit('transit-update', { chartId, transits: newTransits });
    
    if (aspectEvents.length > 0) {
      aspectEvents.forEach(event => {
        this.emit('aspect-event', { chartId, event });
      });
    }
  }

  /**
   * Fetch current planetary positions for transits
   */
  private async fetchCurrentTransits(): Promise<Record<string, Planet>> {
    const now = new Date();
    const transitBirthData: ChartBirthData = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      lat: 0, // Greenwich
      lon: 0,
      timezone: 'UTC',
      city: 'Greenwich'
    };

    const response = await fetchChartData(transitBirthData);
    return response.planets || {};
  }

  /**
   * Fetch progressed chart positions
   */
  private async fetchProgressions(birthData: ChartBirthData): Promise<Record<string, Planet>> {
    // Calculate progressed positions (1 day = 1 year progression)
    const birthDate = new Date(birthData.year, birthData.month - 1, birthData.day);
    const now = new Date();
    const ageInYears = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    const progressedDate = new Date(birthDate);
    progressedDate.setDate(progressedDate.getDate() + Math.floor(ageInYears));

    const progressedBirthData: ChartBirthData = {
      ...birthData,
      year: progressedDate.getFullYear(),
      month: progressedDate.getMonth() + 1,
      day: progressedDate.getDate()
    };

    const response = await fetchChartData(progressedBirthData);
    return response.planets || {};
  }

  /**
   * Detect forming and separating aspects
   */
  private detectAspectChanges(
    natal: ChartData, 
    oldTransits: Record<string, Planet>, 
    newTransits: Record<string, Planet>
  ): AspectEvent[] {
    const events: AspectEvent[] = [];
    const aspectAngles = [0, 60, 90, 120, 150, 180]; // Major aspects
    const maxOrb = 8; // Maximum orb to consider

    Object.entries(newTransits).forEach(([transitPlanet, transitData]) => {
      Object.entries(natal.planets).forEach(([natalPlanet, natalData]) => {
        aspectAngles.forEach(aspectAngle => {
          const currentAngle = Math.abs(transitData.position - natalData.position) % 360;
          const currentOrb = Math.min(
            Math.abs(currentAngle - aspectAngle),
            Math.abs(currentAngle - (aspectAngle + 360)),
            Math.abs((currentAngle + 360) - aspectAngle)
          );

          if (currentOrb <= maxOrb) {
            const oldTransitData = oldTransits[transitPlanet];
            if (oldTransitData) {
              const oldAngle = Math.abs(oldTransitData.position - natalData.position) % 360;
              const oldOrb = Math.min(
                Math.abs(oldAngle - aspectAngle),
                Math.abs(oldAngle - (aspectAngle + 360)),
                Math.abs((oldAngle + 360) - aspectAngle)
              );

              // Detect if aspect is forming (orb decreasing) or separating (orb increasing)
              if (currentOrb < oldOrb && currentOrb <= 1) {
                events.push({
                  type: 'aspect-forming',
                  transitPlanet,
                  natalPlanet,
                  aspectType: this.getAspectName(aspectAngle),
                  orb: currentOrb,
                  exactDate: this.calculateExactAspectDate(transitData, natalData, aspectAngle),
                  strength: this.getAspectStrengthFromOrb(currentOrb)
                });
              } else if (currentOrb > oldOrb && oldOrb <= 1) {
                events.push({
                  type: 'aspect-separating',
                  transitPlanet,
                  natalPlanet,
                  aspectType: this.getAspectName(aspectAngle),
                  orb: currentOrb,
                  exactDate: new Date(), // Just passed
                  strength: this.getAspectStrengthFromOrb(currentOrb)
                });
              }
            }
          }
        });
      });
    });

    return events;
  }

  /**
   * Calculate when an aspect will be exact
   */
  private calculateExactAspectDate(transit: Planet, natal: Planet, aspectAngle: number): Date {
    // Simplified calculation - in production, use more accurate ephemeris math
    const speed = transit.speed || 1; // degrees per day
    const currentAngle = Math.abs(transit.position - natal.position) % 360;
    const targetAngle = aspectAngle;
    const angleDifference = Math.abs(currentAngle - targetAngle);
    
    const daysToExact = angleDifference / Math.abs(speed);
    const exactDate = new Date();
    exactDate.setDate(exactDate.getDate() + daysToExact);
    
    return exactDate;
  }

  /**
   * Get aspect name from angle
   */
  private getAspectName(angle: number): string {
    const aspectNames: Record<number, string> = {
      0: 'conjunction',
      60: 'sextile',
      90: 'square',
      120: 'trine',
      150: 'quincunx',
      180: 'opposition'
    };
    return aspectNames[angle] || 'unknown';
  }

  /**
   * Get aspect strength from orb
   */
  private getAspectStrengthFromOrb(orb: number): 'strong' | 'medium' | 'weak' {
    if (orb <= 1) return 'strong';
    if (orb <= 3) return 'medium';
    return 'weak';
  }

  /**
   * Transform API chart data to internal format
   */
  private transformChartData(apiData: any): ChartData {
    // Implementation would transform the API response to ChartData format
    return apiData as ChartData;
  }

  /**
   * Extract birth data from chart (reverse transformation)
   */
  private getBirthDataFromChart(chartData: ChartData): ChartBirthData {
    // This would extract birth data from chart metadata
    // For now, return a placeholder
    return {
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      lat: 0,
      lon: 0,
      timezone: 'UTC',
      city: 'Unknown'
    };
  }

  /**
   * Process pending updates when connection is restored
   */
  private async processPendingUpdates() {
    if (!this.isOnline) return;

    for (const [chartId, pendingDate] of this.pendingUpdates.entries()) {
      try {
        await this.updateChart(chartId, {
          enableTransitUpdates: true,
          enableProgressions: true,
          aspectAlerts: true
        });
        this.pendingUpdates.delete(chartId);
      } catch (error) {
        console.error(`Failed to process pending update for chart ${chartId}:`, error);
      }
    }
  }

  /**
   * Get chart data
   */
  getChart(chartId: string): ChartDataSync | undefined {
    return this.charts.get(chartId);
  }

  /**
   * Get all registered charts
   */
  getAllCharts(): Map<string, ChartDataSync> {
    return new Map(this.charts);
  }

  /**
   * Unregister a chart
   */
  unregisterChart(chartId: string) {
    const interval = this.syncIntervals.get(chartId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(chartId);
    }
    
    this.charts.delete(chartId);
    this.pendingUpdates.delete(chartId);
    this.emit('chart-unregistered', { chartId });
  }

  /**
   * Force refresh all charts
   */
  async refreshAllCharts() {
    const promises = Array.from(this.charts.keys()).map(chartId =>
      this.updateChart(chartId, {
        enableTransitUpdates: true,
        enableProgressions: true,
        aspectAlerts: true
      })
    );
    
    await Promise.allSettled(promises);
    this.emit('all-charts-refreshed');
  }

  /**
   * Get upcoming aspects for a chart
   */
  getUpcomingAspects(chartId: string, daysAhead = 7): AspectEvent[] {
    const chartData = this.charts.get(chartId);
    if (!chartData) return [];

    // This would calculate upcoming aspects within the specified timeframe
    // For now, return empty array - would implement full calculation in production
    return [];
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.transitUpdateInterval) {
      clearInterval(this.transitUpdateInterval);
    }
    
    this.syncIntervals.forEach(interval => clearInterval(interval));
    this.syncIntervals.clear();
    this.charts.clear();
    this.pendingUpdates.clear();
    this.removeAllListeners();
  }
}

// Singleton instance
let chartSyncService: ChartSyncService | null = null;

export const getChartSyncService = (): ChartSyncService => {
  if (!chartSyncService) {
    chartSyncService = new ChartSyncService();
  }
  return chartSyncService;
};

export default ChartSyncService;
