import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from './notificationService';
import { locationService } from './locationService';
import { biometricAuthService } from './biometricAuthService';
import { widgetService } from './widgetService';

export interface CosmicData {
  chart: Record<string, unknown>;
  transits: Record<string, unknown>;
  aspects: Record<string, unknown>;
}

export interface IntegrationPreferences {
  autoSync: boolean;
  backgroundUpdates: boolean;
  pushNotifications: boolean;
  locationTracking: boolean;
  biometricAuth: boolean;
  widgetUpdates: boolean;
}

export interface MobileFeatureStatus {
  notifications: boolean;
  location: boolean;
  biometrics: boolean;
  widgets: boolean;
  camera: boolean;
}

export class MobileIntegrationService {
  private preferences: IntegrationPreferences = {
    autoSync: true,
    backgroundUpdates: true,
    pushNotifications: true,
    locationTracking: false,
    biometricAuth: false,
    widgetUpdates: true,
  };

  private isInitialized = false;

  /**
   * Initialize the mobile integration service
   */
  async initialize(): Promise<MobileFeatureStatus> {
    if (this.isInitialized) {
      return this.getFeatureStatus();
    }

    try {
      await this.loadPreferences();
      await this.initializeServices();
      this.isInitialized = true;
      return this.getFeatureStatus();
    } catch (error) {
      console.error('Failed to initialize mobile integration service:', error);
      throw error;
    }
  }

  /**
   * Initialize individual services based on preferences
   */
  private async initializeServices(): Promise<void> {
    // Initialize services that don't return void promises individually
    if (this.preferences.locationTracking) {
      await locationService.initialize();
    }

    if (this.preferences.biometricAuth) {
      await biometricAuthService.initialize();
    }

    await widgetService.initialize();

    // Note: notificationService and cameraService don't have initialize methods
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('integration_preferences');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<IntegrationPreferences>;
        this.preferences = { ...this.preferences, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load integration preferences:', error);
    }
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'integration_preferences',
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Failed to save integration preferences:', error);
      throw error;
    }
  }

  /**
   * Update integration preferences
   */
  async updatePreferences(
    newPreferences: Partial<IntegrationPreferences>
  ): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    await this.savePreferences();
    await this.initializeServices();
  }

  /**
   * Get current preferences
   */
  getPreferences(): IntegrationPreferences {
    return { ...this.preferences };
  }

  /**
   * Get current feature status
   */
  getFeatureStatus(): MobileFeatureStatus {
    return {
      notifications: this.preferences.pushNotifications,
      location: this.preferences.locationTracking,
      biometrics: this.preferences.biometricAuth,
      widgets: this.preferences.widgetUpdates,
      camera: true, // Camera is always available
    };
  }

  /**
   * Sync cosmic data across all services
   */
  async syncCosmicData(data: CosmicData): Promise<void> {
    const syncPromises: Promise<void>[] = [];

    // Update widgets with new data
    if (this.preferences.widgetUpdates) {
      widgetService.scheduleWidgetUpdates();
    }

    // Schedule notifications based on transits
    if (this.preferences.pushNotifications) {
      syncPromises.push(this.scheduleTransitNotifications(data.transits));
    }

    // Update location-based calculations if location tracking is enabled
    if (this.preferences.locationTracking) {
      syncPromises.push(this.updateLocationBasedData(data));
    }

    await Promise.all(syncPromises);
  }

  /**
   * Schedule notifications for transits
   */
  private async scheduleTransitNotifications(
    transits: Record<string, unknown>
  ): Promise<void> {
    try {
      await notificationService.scheduleDailyTransit(
        'Daily Cosmic Forecast',
        'Check your personalized insights for today',
        9,
        0,
        { transits }
      );
    } catch (error) {
      console.error('Failed to schedule transit notifications:', error);
    }
  }

  /**
   * Update location-based cosmic data
   */
  private async updateLocationBasedData(data: CosmicData): Promise<void> {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        // Update chart calculations with current location
        const updatedChart = {
          ...data.chart,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        };

        // Store updated chart data
        await AsyncStorage.setItem(
          'location_based_chart',
          JSON.stringify(updatedChart)
        );
      }
    } catch (error) {
      console.error('Failed to update location-based data:', error);
    }
  }

  /**
   * Get daily horoscope data
   */
  getDailyHoroscopeData(): Promise<Record<string, unknown>> {
    return Promise.resolve({
      date: new Date().toISOString(),
      forecast:
        'Your cosmic energies are aligned for growth and transformation.',
      majorTransits: [],
      recommendations: ['Focus on communication', 'Practice mindfulness'],
    });
  }

  /**
   * Get weekly forecast data
   */
  getWeeklyForecastData(): Promise<Record<string, unknown>> {
    return Promise.resolve({
      week: `Week of ${new Date().toISOString().split('T')[0]}`,
      themes: ['Transformation', 'Communication', 'Relationships'],
      keyDates: [],
      overview:
        'This week brings opportunities for personal growth and deeper connections.',
    });
  }

  /**
   * Authenticate with biometrics if enabled
   */
  async authenticateIfRequired(): Promise<boolean> {
    if (this.preferences.biometricAuth) {
      const result = await biometricAuthService.authenticate();
      return result.success;
    }
    return true;
  }

  /**
   * Capture and share chart image
   */
  async captureAndShareChart(): Promise<string | null> {
    try {
      const authenticated = await this.authenticateIfRequired();
      if (!authenticated) {
        throw new Error('Authentication required');
      }

      // Note: This would need a camera reference in a real implementation
      // For now, return null as the camera service requires a camera ref
      return null;
    } catch (error) {
      console.error('Failed to capture and share chart:', error);
      return null;
    }
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Handle app launch initialization
   */
  async handleAppLaunch(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      console.error('App launch initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if user has completed mobile onboarding
   */
  async hasCompletedMobileOnboarding(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(
        'mobile_onboarding_completed'
      );
      return completed === 'true';
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark mobile onboarding as completed
   */
  async completeMobileOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem('mobile_onboarding_completed', 'true');
    } catch (error) {
      console.error('Failed to mark onboarding as completed:', error);
      throw error;
    }
  }
}

export const mobileIntegrationService = new MobileIntegrationService();
