/**
 * Real-Time Chart Synchronization Service
 * Manages live updates, transit tracking, and cross-app chart sharing
 */
import { Logger } from '../utils/logger';
import { 
  type ChartData, 
  type Planet, 
  type House,
  type PlanetName,
  type Aspect,
  type ChartId,
  type AspectType
} from './api.types';
import { isValidChartData, hasRequiredPlanets } from './validation';
import { fetchChartData, type ChartBirthData } from './api';
import type { ApiResult } from '@cosmichub/config';

// Utility function to convert string to ChartId with validation
function toChartId(id: string): ChartId {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new Error('ChartId must be a non-empty string');
  }
  return id as unknown as ChartId;
}

// Event payload types for strong typing
export interface ChartUpdateEvent {
  chartId: ChartId;
  timestamp: string;
  changes: {
    planets?: Partial<Record<PlanetName, Planet>>;
    houses?: House[];
    aspects?: Aspect[];
    angles?: Partial<ChartData['angles']>;
  };
}

export interface ChartSyncError {
  chartId: ChartId;
  errorCode: string;
  message: string;
  timestamp: string;
  retryCount: number;
}

export interface AspectEvent {
  type: 'aspect-forming' | 'aspect-separating';
  transitPlanet: PlanetName;
  natalPlanet: PlanetName;
  aspectType: AspectType;
  orb: number;
  exactDate: Date;
  strength: 'strong' | 'medium' | 'weak';
}

export interface ChartDataSync {
  birthData: ChartBirthData;
  currentData: ChartData;
  lastUpdate: Date;
  pendingUpdates: ChartUpdateEvent[];
  transitData: Record<PlanetName, Planet>;
  settings: {
    updateInterval: number;
    transitTracking: boolean;
    aspectAlerts: boolean;
    progressionTracking: boolean;
  };
  progressionData?: Record<PlanetName, Planet>;
}

// Typed event emitter
export interface ChartSyncOptions {
  enableTransitUpdates?: boolean;
  enableProgressions?: boolean;
  aspectAlerts?: boolean;
  updateInterval?: number; // minutes
}

// Public event map (exported for external subscription typing)
export interface EventMap {
  'chart-update': ChartUpdateEvent;
  'sync-error': ChartSyncError;
  'aspect-alert': AspectEvent;
  'connection-lost': undefined;
  'connection-restored': undefined;
  'chart-registered': { chartId: ChartId; chartSync: ChartDataSync };
  'chart-synced': { chartId: ChartId; chartData: ChartDataSync };
  'chart-unregistered': { chartId: ChartId };
  'all-charts-refreshed': undefined;
  'transit-update': { chartId: ChartId; transits: Record<PlanetName, Planet> };
  'aspect-event': { chartId: ChartId; event: AspectEvent };
}

type EventCallback<T> = (payload: T) => void;

class TypedEventEmitter {
  private listeners: Partial<Record<keyof EventMap, EventCallback<EventMap[keyof EventMap]>[]>> = {};

  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    this.listeners[event] ??= [];
    this.listeners[event]?.push(callback as EventCallback<EventMap[keyof EventMap]>);
  }

  off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    this.listeners[event] = this.listeners[event]?.filter(cb => cb !== callback);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners[event]?.forEach(callback => callback(payload));
  }

  removeAllListeners(): void {
    this.listeners = {};
  }
}

// Using imported types from api.types.ts

class ChartSyncService extends TypedEventEmitter {
  private charts: Map<ChartId, ChartDataSync> = new Map();
  private syncIntervals: Map<ChartId, ReturnType<typeof setInterval>> = new Map();
  private transitUpdateInterval: ReturnType<typeof setInterval> | null = null;
  private isOnline = navigator.onLine;
  private pendingUpdates: Map<ChartId, Date> = new Map();

  constructor() {
    super();
    this.setupNetworkHandlers();
    this.startGlobalTransitUpdates();
  }

  private setupNetworkHandlers(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('connection-restored', undefined);
      this.processPendingUpdates().catch(error => {
        Logger.error('Failed to process pending updates', error instanceof Error ? error : new Error(String(error)));
      });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('connection-lost', undefined);
    });
  }

  private startGlobalTransitUpdates(): void {
    // Update transits every minute
    this.transitUpdateInterval = setInterval(() => {
      if (this.isOnline === false) return;
      
      this.fetchCurrentTransits().then(currentTransits => {
        for (const [chartId] of this.charts.entries()) {
          this.updateTransits(chartId, currentTransits);
        }
      }).catch(error => {
        Logger.error('Failed to update global transits', error instanceof Error ? error : new Error(String(error)));
      });
    }, 60000); // 1 minute
  }

  /**
   * Register a chart for real-time synchronization
   */
  async registerChart(rawChartId: string, birthData: ChartBirthData, options: ChartSyncOptions = {}): Promise<ChartDataSync> {
    try {
      const chartId = toChartId(rawChartId);
      const {
        enableTransitUpdates = true,
        enableProgressions = false,
        aspectAlerts = true,
        updateInterval = 5
      } = options;

      // Fetch initial chart data
  const chartResult: ApiResult<ChartData> = await fetchChartData(birthData);
  if (!chartResult.success) throw new Error(chartResult.error);
  const chartData = chartResult.data;
      
      if (!isValidChartData(chartData)) {
        throw new Error('Invalid chart data received');
      }

      if (!hasRequiredPlanets(chartData.planets)) {
        throw new Error('Missing required planets in chart data');
      }

      const transitData = enableTransitUpdates ? await this.fetchCurrentTransits() : this.createEmptyTransitData();
      const progressionData = enableProgressions ? await this.fetchProgressions(birthData) : undefined;

      const chartSync: ChartDataSync = {
        birthData,
        currentData: chartData,
        lastUpdate: new Date(),
        pendingUpdates: [],
        transitData,
        settings: {
          updateInterval,
          transitTracking: enableTransitUpdates,
          aspectAlerts,
          progressionTracking: enableProgressions
        },
        progressionData
      };

      this.charts.set(chartId, chartSync);

      // Set up periodic updates
      if (enableTransitUpdates || enableProgressions) {
        const interval = setInterval(() => {
          this.updateChart(chartId, { 
            enableTransitUpdates, 
            enableProgressions, 
            aspectAlerts 
          }).catch(err => {
            Logger.error(`Error updating chart ${chartId}`, err instanceof Error ? err : new Error(String(err)));
          });
        }, updateInterval * 60000);
        
        this.syncIntervals.set(chartId, interval);
      }

      this.emit('chart-registered', { chartId, chartSync });
      return chartSync;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  Logger.error('Failed to register chart', error instanceof Error ? error : undefined);
      throw new Error(`Failed to register chart: ${errorMessage}`);
    }
  }

  /**
   * Update a specific chart
   */
  private async updateChart(rawChartId: string, options: Pick<ChartSyncOptions, 'enableTransitUpdates' | 'enableProgressions' | 'aspectAlerts'>): Promise<void> {
    const chartId = toChartId(rawChartId);
    
    if (this.isOnline === false) {
      this.pendingUpdates.set(chartId, new Date());
      return;
    }

    const chartData = this.charts.get(chartId);
    if (chartData === null || chartData === undefined) return;

    try {
      const updates: Partial<ChartDataSync> = {
        lastUpdate: new Date(),
        pendingUpdates: []
      };

      if (options.enableTransitUpdates === true) {
        const newTransits = await this.fetchCurrentTransits();
        const aspectEvents = this.detectAspectChanges(
          chartData.currentData,
          chartData.transitData,
          newTransits
        );
        
        updates.transitData = newTransits;
        
        if (options.aspectAlerts === true && aspectEvents.length > 0) {
          aspectEvents.forEach(event => {
            this.emit('aspect-alert', event);
            this.emit('aspect-event', { chartId, event });
          });
        }
      }

      if (options.enableProgressions === true) {
        // Update progressions (slower moving, update less frequently)
        const now = new Date();
        const hoursSinceLastUpdate = (now.getTime() - chartData.lastUpdate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastUpdate >= 24) { // Update progressions daily
          updates.progressionData = await this.fetchProgressions(chartData.birthData);
        }
      }

      // Create new chart data with updates
      const updatedChartData: ChartDataSync = {
        ...chartData,
        ...updates
      };

      this.charts.set(chartId, updatedChartData);

      this.emit('chart-update', {
        chartId,
        timestamp: new Date().toISOString(),
        changes: {
          planets: updates.transitData,
          aspects: []  // Add aspects if needed
        }
      });

    } catch (error) {
      const syncError: ChartSyncError = {
        chartId,
        errorCode: 'UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        retryCount: 0
      };
      this.emit('sync-error', syncError);
  Logger.error(`Failed to update chart ${rawChartId}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Update transits for a specific chart
   */
  private updateTransits(rawChartId: string, newTransits: Record<PlanetName, Planet>): void {
    const chartId = toChartId(rawChartId);
    const chartData = this.charts.get(chartId);
    if (chartData === null || chartData === undefined) return;

    const aspectEvents = this.detectAspectChanges(
      chartData.currentData,
      chartData.transitData,
      newTransits
    );
    
    // Create updated chart data
    const updatedChartData: ChartDataSync = {
      ...chartData,
      transitData: newTransits,
      lastUpdate: new Date()
    };
    
    this.charts.set(chartId, updatedChartData);
    
    this.emit('transit-update', { chartId, transits: newTransits });
    
    if (aspectEvents.length > 0) {
      aspectEvents.forEach(event => {
        this.emit('aspect-alert', event);
      });
    }
  }

  /**
   * Fetch current planetary positions for transits
   */
  private async fetchCurrentTransits(): Promise<Record<PlanetName, Planet>> {
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

    const result: ApiResult<ChartData> = await fetchChartData(transitBirthData);
  if (!result.success) return this.createEmptyTransitData();
  const planets = result.data.planets ?? {};
  // Narrow keys to PlanetName when possible
  const narrowed: Record<PlanetName, Planet> = {} as Record<PlanetName, Planet>;
  (Object.keys(planets) as PlanetName[]).forEach(k => { narrowed[k] = planets[k]; });
  return narrowed;
  }

  /**
   * Fetch progressed chart positions
   */
  private async fetchProgressions(birthData: ChartBirthData): Promise<Record<PlanetName, Planet>> {
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

    const result: ApiResult<ChartData> = await fetchChartData(progressedBirthData);
  if (!result.success) return this.createEmptyTransitData();
  const planets = result.data.planets ?? {};
  const narrowed: Record<PlanetName, Planet> = {} as Record<PlanetName, Planet>;
  (Object.keys(planets) as PlanetName[]).forEach(k => { narrowed[k] = planets[k]; });
  return narrowed;
  }

  /**
   * Detect forming and separating aspects
   */
  private detectAspectChanges(
    natal: ChartData,
    oldTransits: Record<PlanetName, Planet>,
    newTransits: Record<PlanetName, Planet>
  ): AspectEvent[] {
    const events: AspectEvent[] = [];
    const aspectAngles = [0, 60, 90, 120, 150, 180]; // Major aspects
    const maxOrb = 8; // Maximum orb to consider

    const transitPlanetNames = Object.keys(newTransits) as PlanetName[];
    const natalPlanetNames = Object.keys(natal.planets) as PlanetName[];

    transitPlanetNames.forEach(transitPlanet => {
      const transitData = newTransits[transitPlanet];
      natalPlanetNames.forEach(natalPlanet => {
        const natalData = natal.planets[natalPlanet];
        aspectAngles.forEach(aspectAngle => {
          const currentAngle = Math.abs(transitData.position - natalData.position) % 360;
          const currentOrb = Math.min(
            Math.abs(currentAngle - aspectAngle),
            Math.abs(currentAngle - (aspectAngle + 360)),
            Math.abs((currentAngle + 360) - aspectAngle)
          );

          if (currentOrb <= maxOrb) {
            const oldTransitData = oldTransits[transitPlanet];
            if (oldTransitData !== null && oldTransitData !== undefined) {
              const oldAngle = Math.abs(oldTransitData.position - natalData.position) % 360;
              const oldOrb = Math.min(
                Math.abs(oldAngle - aspectAngle),
                Math.abs(oldAngle - (aspectAngle + 360)),
                Math.abs((oldAngle + 360) - aspectAngle)
              );

              try {
                // Detect if aspect is forming (orb decreasing) or separating (orb increasing)
                if ((currentOrb < oldOrb) && (currentOrb <= 1)) {
                  events.push({
                    type: 'aspect-forming',
                    transitPlanet,
                    natalPlanet,
                    aspectType: this.getAspectType(aspectAngle),
                    orb: currentOrb,
                    exactDate: this.calculateExactAspectDate(transitData, natalData, aspectAngle),
                    strength: this.getAspectStrengthFromOrb(currentOrb)
                  });
                } else if ((currentOrb > oldOrb) && (oldOrb <= 1)) {
                  events.push({
                    type: 'aspect-separating',
                    transitPlanet,
                    natalPlanet,
                    aspectType: this.getAspectType(aspectAngle),
                    orb: currentOrb,
                    exactDate: new Date(), // Just passed
                    strength: this.getAspectStrengthFromOrb(currentOrb)
                  });
                }
              } catch (error) {
                Logger.error(`Failed to process aspect: ${transitPlanet} to ${natalPlanet} at ${aspectAngle}°`, error instanceof Error ? error : undefined);
                return; // Skip this aspect calculation 
              }
            }
          }
        });
      });
    });
    return events;
  }

  private getAspectStrength(
    transitPlanet: PlanetName,
    natalPlanet: PlanetName,
    aspectAngle: number
  ): 'major' | 'minor' {
    // Major aspects involving luminaries or personal planets are considered major
    const majorPlanets: PlanetName[] = ['sun', 'moon', 'mercury', 'venus', 'mars'];
    const majorAspects = [0, 90, 120, 180]; // conjunction, square, trine, opposition

    if (
      majorAspects.includes(aspectAngle) &&
      (majorPlanets.includes(transitPlanet) || majorPlanets.includes(natalPlanet))
    ) {
      return 'major';
    }
    return 'minor';
  }

  /**
   * Calculate when an aspect will be exact
   */
  private calculateExactAspectDate(transit: Planet, natal: Planet, aspectAngle: number): Date {
    // Simplified calculation - in production, use more accurate ephemeris math
    const speed = typeof transit.speed === 'number' ? transit.speed : 1; // degrees per day
    const currentAngle = Math.abs(transit.position - natal.position) % 360;
    const targetAngle = aspectAngle;
    const angleDifference = Math.abs(currentAngle - targetAngle);
    
    const daysToExact = angleDifference / Math.abs(speed);
    const exactDate = new Date();
    exactDate.setDate(exactDate.getDate() + daysToExact);
    
    return exactDate;
  }

  /**
   * Get aspect type from angle
   */
  private getAspectType(angle: number): AspectType {
    const aspectMap: Record<number, AspectType> = {
      0: 'conjunction',
      60: 'sextile',
      90: 'square',
      120: 'trine',
      150: 'quincunx',
      180: 'opposition'
    };
    
    const aspectType = aspectMap[angle];
    if (aspectType === null || aspectType === undefined) {
      throw new Error(`Invalid aspect angle: ${angle}`);
    }
    return aspectType;
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
   * Transform unknown data to ChartData format with validation
   */
  private transformChartData(data: unknown): ChartData {
    if (isValidChartData(data)) {
      return data;
    }
    
    throw new Error('Invalid chart data format');
  }

  /**
   * Create empty transit data
   */
  private createEmptyTransitData(): Record<PlanetName, Planet> {
    const planetNames: PlanetName[] = [
      'sun', 'moon', 'mercury', 'venus', 'mars',
      'jupiter', 'saturn', 'uranus', 'neptune',
      'pluto', 'chiron', 'north_node', 'south_node'
    ];

    return planetNames.reduce((acc, name) => {
      acc[name] = {
        name,
        position: 0,
        sign: 'aries', // Default
        house: 1,
        retrograde: false,
        speed: 0
      };
      return acc;
    }, {} as Record<PlanetName, Planet>);
  }

  /**
   * Extract birth data from chart (reverse transformation)
   * @param _chartData Chart data to extract birth data from (currently unused)
   */
  private getBirthDataFromChart(_chartData: ChartData): ChartBirthData { // TODO: derive from metadata when available
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
  private async processPendingUpdates(): Promise<void> {
    if (this.isOnline === false) return;

  for (const [chartId] of this.pendingUpdates.entries()) {
      // _pendingDate is currently unused but may be used in the future for prioritization
      try {
        await this.updateChart(chartId, {
          enableTransitUpdates: true,
          enableProgressions: true,
          aspectAlerts: true
        });
        this.pendingUpdates.delete(chartId);
      } catch (error) {
  Logger.error(`Failed to process pending update for chart ${chartId}`, error instanceof Error ? error : undefined);
      }
    }
  }

  /**
   * Get chart data
   */
  getChart(rawChartId: string): ChartDataSync | undefined {
    const chartId = toChartId(rawChartId);
    return this.charts.get(chartId);
  }

  /**
   * Sync chart data to Firestore (for one-off saves)
   */
  async syncChart(chartData: ChartData): Promise<ChartId> {
    try {
      // Generate a unique chart ID
      const chartId = toChartId(
        `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      );
      
      if (!isValidChartData(chartData)) {
        throw new Error('Invalid chart data');
      }
      
      // Create a ChartDataSync object
      const chartSync: ChartDataSync = {
        birthData: {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          day: new Date().getDate(),
          hour: new Date().getHours(),
          minute: new Date().getMinutes(),
          lat: chartData.latitude || 0,
          lon: chartData.longitude || 0,
          timezone: chartData.timezone || 'UTC',
          city: 'Unknown'
        },
        currentData: chartData,
        lastUpdate: new Date(),
        pendingUpdates: [],
        transitData: await this.fetchCurrentTransits(),
        settings: {
          updateInterval: 5,
          transitTracking: false,
          aspectAlerts: false,
          progressionTracking: false
        }
      };

      // Store in memory
      this.charts.set(chartId, chartSync);
      
      this.emit('chart-synced', { chartId, chartData: chartSync });
      
      Logger.info(`Chart synced successfully with ID: ${chartId}`);
      return chartId;
      
    } catch (error) {
  Logger.error('Failed to sync chart', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  /**
   * Get all registered charts
   */
  getAllCharts(): Map<ChartId, ChartDataSync> {
    return new Map(this.charts);
  }

  /**
   * Unregister a chart
   */
  unregisterChart(rawChartId: string): void {
    const chartId = toChartId(rawChartId);
    const interval = this.syncIntervals.get(chartId);
    if (interval !== null && interval !== undefined) {
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
  async refreshAllCharts(): Promise<void> {
    const promises = Array.from(this.charts.keys()).map(chartId =>
      this.updateChart(chartId, {
        enableTransitUpdates: true,
        enableProgressions: true,
        aspectAlerts: true
      })
    );
    
    await Promise.allSettled(promises);
    this.emit('all-charts-refreshed', undefined);
  }

  /**
   * Get upcoming aspects for a chart
   * @param rawChartId The chart ID
   * @param _daysAhead Number of days to look ahead (currently unused in implementation)
   */
  getUpcomingAspects(rawChartId: string, _daysAhead = 7): AspectEvent[] {
    const chartId = toChartId(rawChartId);
    const chartData = this.charts.get(chartId);
    if (chartData === null || chartData === undefined) return [];

    // This would calculate upcoming aspects within the specified timeframe
    // For now, return empty array - would implement full calculation in production
    return [];
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.transitUpdateInterval !== null && this.transitUpdateInterval !== undefined) {
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
  chartSyncService ??= new ChartSyncService();
  return chartSyncService;
};

export default ChartSyncService;
