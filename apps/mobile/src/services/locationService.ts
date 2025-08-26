import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { notificationService } from './notificationService';

// Background task for location monitoring
const LOCATION_TASK_NAME = 'background-location-task';

export interface LocationPreferences {
  enableLocationServices: boolean;
  allowBackgroundLocation: boolean;
  locationAccuracy: 'low' | 'balanced' | 'high' | 'highest';
  significantLocationChangesOnly: boolean;
  geofenceRadius: number; // meters
  enableLocationBasedNotifications: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  timestamp: number;
  address?: string;
}

export class LocationService {
  private preferences: LocationPreferences = {
    enableLocationServices: false,
    allowBackgroundLocation: false,
    locationAccuracy: 'balanced',
    significantLocationChangesOnly: true,
    geofenceRadius: 1000,
    enableLocationBasedNotifications: false,
  };

  private currentLocation: LocationData | null = null;
  private isTracking = false;

  constructor() {
    this.initializeTaskManager();
  }

  private initializeTaskManager(): void {
    TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
      if (error) {
        console.error('Background location task error:', error);
        return;
      }
      
      if (data && typeof data === 'object' && 'locations' in data) {
        const locations = data.locations as Location.LocationObject[];
        if (locations && locations.length > 0) {
          await this.processLocationUpdate(locations[0]);
        }
      }
    });
  }

  /**
   * Initialize location services
   */
  async initialize(): Promise<boolean> {
    if (!this.preferences.enableLocationServices) return false;

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        console.warn('Location permission not granted');
        return false;
      }

      // Get current location
      const location = await this.getCurrentLocation();
      if (location) {
        this.currentLocation = location;
        console.log('Location services initialized');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to initialize location services:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: this.getLocationAccuracy(),
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      this.currentLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  /**
   * Start location tracking
   */
  async startLocationTracking(): Promise<boolean> {
    if (this.isTracking) return true;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) return false;

      if (this.preferences.allowBackgroundLocation) {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus.status !== Location.PermissionStatus.GRANTED) {
          console.warn('Background location permission not granted');
        }
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: this.getLocationAccuracy(),
        distanceInterval: this.preferences.significantLocationChangesOnly ? 100 : 10,
        deferredUpdatesInterval: 60000, // 1 minute
        foregroundService: {
          notificationTitle: 'CosmicHub Location Service',
          notificationBody: 'Tracking location for astrological insights',
        },
      });

      this.isTracking = true;
      console.log('Location tracking started');
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  async stopLocationTracking(): Promise<void> {
    if (!this.isTracking) return;

    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      this.isTracking = false;
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
    }
  }

  /**
   * Get cached location
   */
  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  /**
   * Update preferences
   */
  async updatePreferences(newPreferences: Partial<LocationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    
    // Restart tracking if needed
    if (this.isTracking && this.preferences.enableLocationServices) {
      await this.stopLocationTracking();
      await this.startLocationTracking();
    } else if (!this.preferences.enableLocationServices) {
      await this.stopLocationTracking();
    }
  }

  /**
   * Get current preferences
   */
  getPreferences(): LocationPreferences {
    return { ...this.preferences };
  }

  /**
   * Process location update from background task
   */
  private async processLocationUpdate(location: Location.LocationObject): Promise<void> {
    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };

    this.currentLocation = locationData;

    // Check for significant location changes that might trigger notifications
    if (this.preferences.enableLocationBasedNotifications) {
      await this.checkLocationBasedEvents(locationData);
    }
  }

  /**
   * Check for location-based astrological events
   */
  private async checkLocationBasedEvents(location: LocationData): Promise<void> {
    try {
      // This would normally query the API for location-specific events
      // For now, we'll just log the location update
      console.log('Checking location-based events for:', location);
      
      // Example: Send notification for significant location change
      if (this.shouldNotifyForLocation(location)) {
        await notificationService.scheduleNotification(
          '📍 New Location Detected',
          'Your astrological insights have been updated for your new location',
          undefined,
          { type: 'location_update', location }
        );
      }
    } catch (error) {
      console.error('Failed to check location-based events:', error);
    }
  }

  /**
   * Determine if we should notify for this location
   */
  private shouldNotifyForLocation(location: LocationData): boolean {
    if (!this.currentLocation) return true;
    
    // Calculate distance from previous location
    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      location.latitude,
      location.longitude
    );

    return distance > this.preferences.geofenceRadius;
  }

  /**
   * Calculate distance between two coordinates in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Convert preference to Location accuracy constant
   */
  private getLocationAccuracy(): Location.LocationAccuracy {
    switch (this.preferences.locationAccuracy) {
      case 'low':
        return Location.Accuracy.Low;
      case 'balanced':
        return Location.Accuracy.Balanced;
      case 'high':
        return Location.Accuracy.High;
      case 'highest':
        return Location.Accuracy.Highest;
      default:
        return Location.Accuracy.Balanced;
    }
  }

  /**
   * Get location permission status
   */
  async getPermissionStatus(): Promise<{
    foreground: string;
    background: string;
  }> {
    try {
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();

      return {
        foreground: foregroundStatus.status,
        background: backgroundStatus.status,
      };
    } catch (error) {
      console.error('Failed to get location permissions:', error);
      return {
        foreground: 'denied',
        background: 'denied',
      };
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();
