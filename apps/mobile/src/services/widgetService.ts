import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface WidgetData {
  id: string;
  title: string;
  content: string;
  updateTime: string;
  type: 'daily_horoscope' | 'current_transits' | 'moon_phase';
}

export interface WidgetPreferences {
  enableDailyHoroscope: boolean;
  enableTransitAlerts: boolean;
  enableMoonPhase: boolean;
  updateFrequency: 'hourly' | 'twice_daily' | 'daily';
  showPersonalizedContent: boolean;
}

class WidgetService {
  private preferences: WidgetPreferences = {
    enableDailyHoroscope: true,
    enableTransitAlerts: true,
    enableMoonPhase: true,
    updateFrequency: 'daily',
    showPersonalizedContent: true,
  };

  /**
   * Initialize widget service
   */
  async initialize(): Promise<boolean> {
    try {
      await this.loadPreferences();
      await this.setupWidgetData();

      console.log('Widget service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize widget service:', error);
      return false;
    }
  }

  /**
   * Check if widgets are supported on this platform
   */
  isWidgetSupported(): boolean {
    // Widgets are supported on both iOS and Android
    // iOS: Today Extensions / App Clips
    // Android: Home Screen Widgets
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Update daily horoscope widget data
   */
  async updateDailyHoroscopeWidget(horoscopeData: {
    sign: string;
    dailyMessage: string;
    luckyNumber?: number;
    luckyColor?: string;
    mood?: string;
  }): Promise<void> {
    if (!this.preferences.enableDailyHoroscope) return;

    const widgetData: WidgetData = {
      id: 'daily_horoscope',
      title: `${horoscopeData.sign} Daily`,
      content: horoscopeData.dailyMessage,
      updateTime: new Date().toISOString(),
      type: 'daily_horoscope',
    };

    await this.saveWidgetData(widgetData);

    // Update platform-specific widget
    if (Platform.OS === 'ios') {
      await this.updateiOSWidget(widgetData);
    } else if (Platform.OS === 'android') {
      await this.updateAndroidWidget(widgetData);
    }
  }

  /**
   * Update transit alerts widget
   */
  async updateTransitWidget(transitData: {
    currentTransits: Array<{
      name: string;
      description: string;
      exactTime?: string;
    }>;
  }): Promise<void> {
    if (!this.preferences.enableTransitAlerts) return;

    const content = transitData.currentTransits
      .slice(0, 3) // Show only top 3 transits in widget
      .map(t => `${t.name}: ${t.description}`)
      .join('\n');

    const widgetData: WidgetData = {
      id: 'current_transits',
      title: 'Active Transits',
      content,
      updateTime: new Date().toISOString(),
      type: 'current_transits',
    };

    await this.saveWidgetData(widgetData);

    if (Platform.OS === 'ios') {
      await this.updateiOSWidget(widgetData);
    } else if (Platform.OS === 'android') {
      await this.updateAndroidWidget(widgetData);
    }
  }

  /**
   * Update moon phase widget
   */
  async updateMoonPhaseWidget(moonData: {
    phase: string;
    percentage: number;
    nextPhase: string;
    nextPhaseDate: string;
  }): Promise<void> {
    if (!this.preferences.enableMoonPhase) return;

    const content = `${moonData.phase} (${moonData.percentage.toFixed(0)}%)\nNext: ${moonData.nextPhase} on ${moonData.nextPhaseDate}`;

    const widgetData: WidgetData = {
      id: 'moon_phase',
      title: 'Moon Phase',
      content,
      updateTime: new Date().toISOString(),
      type: 'moon_phase',
    };

    await this.saveWidgetData(widgetData);

    if (Platform.OS === 'ios') {
      await this.updateiOSWidget(widgetData);
    } else if (Platform.OS === 'android') {
      await this.updateAndroidWidget(widgetData);
    }
  }

  /**
   * Update iOS widget (Today Extension)
   */
  private async updateiOSWidget(data: WidgetData): Promise<void> {
    try {
      // For iOS, we would use WidgetKit or Today Extension
      // This requires native iOS code or specific libraries
      // For now, we'll store the data that can be accessed by the widget extension

      await AsyncStorage.setItem(`widget_${data.id}`, JSON.stringify(data));

      // In a full implementation, you would use:
      // - WidgetKit APIs to update the widget timeline
      // - SharedDefaults (App Groups) to share data between app and widget
      // - Background App Refresh to update widget data

      console.log(`iOS widget updated: ${data.id}`);
    } catch (error) {
      console.error('Error updating iOS widget:', error);
    }
  }

  /**
   * Update Android widget
   */
  private async updateAndroidWidget(data: WidgetData): Promise<void> {
    try {
      // For Android, we would use RemoteViews and AppWidgetManager
      // This requires native Android code
      // Store data that can be accessed by the Android widget provider

      await AsyncStorage.setItem(`widget_${data.id}`, JSON.stringify(data));

      // In a full implementation, you would use:
      // - AppWidgetProvider to handle widget updates
      // - RemoteViews to update widget layout
      // - AlarmManager or JobScheduler for periodic updates

      console.log(`Android widget updated: ${data.id}`);
    } catch (error) {
      console.error('Error updating Android widget:', error);
    }
  }

  /**
   * Schedule widget updates
   */
  scheduleWidgetUpdates(): void {
    // This would schedule periodic widget updates based on preferences
    // In a full implementation, this would use:
    // - iOS: BGTaskScheduler or silent push notifications
    // - Android: AlarmManager, JobScheduler, or WorkManager

    const updateInterval = this.getUpdateIntervalMs();

    // For now, just log the scheduling
    console.log(`Widget updates scheduled every ${updateInterval}ms`);
  }

  /**
   * Get update interval in milliseconds
   */
  private getUpdateIntervalMs(): number {
    switch (this.preferences.updateFrequency) {
      case 'hourly':
        return 60 * 60 * 1000; // 1 hour
      case 'twice_daily':
        return 12 * 60 * 60 * 1000; // 12 hours
      case 'daily':
      default:
        return 24 * 60 * 60 * 1000; // 24 hours
    }
  }

  /**
   * Save widget data to storage
   */
  private async saveWidgetData(data: WidgetData): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `widget_data_${data.id}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Error saving widget data:', error);
    }
  }

  /**
   * Get widget data from storage
   */
  async getWidgetData(widgetId: string): Promise<WidgetData | null> {
    try {
      const stored = await AsyncStorage.getItem(`widget_data_${widgetId}`);
      return stored ? (JSON.parse(stored) as WidgetData) : null;
    } catch (error) {
      console.error('Error getting widget data:', error);
      return null;
    }
  }

  /**
   * Setup initial widget data
   */
  private async setupWidgetData(): Promise<void> {
    // Initialize with default data if no widgets exist
    const existingHoroscope = await this.getWidgetData('daily_horoscope');
    if (!existingHoroscope) {
      await this.updateDailyHoroscopeWidget({
        sign: 'Your Sign',
        dailyMessage:
          'Welcome to CosmicHub! Open the app to get your personalized daily horoscope.',
      });
    }

    const existingTransits = await this.getWidgetData('current_transits');
    if (!existingTransits) {
      await this.updateTransitWidget({
        currentTransits: [
          {
            name: 'Welcome',
            description: 'Open CosmicHub to see your current transits',
          },
        ],
      });
    }

    const existingMoon = await this.getWidgetData('moon_phase');
    if (!existingMoon) {
      await this.updateMoonPhaseWidget({
        phase: 'New Moon',
        percentage: 0,
        nextPhase: 'Waxing Crescent',
        nextPhaseDate: 'Soon',
      });
    }
  }

  /**
   * Update widget preferences
   */
  async updatePreferences(
    newPreferences: Partial<WidgetPreferences>
  ): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    await this.savePreferences();

    // Reschedule updates if frequency changed
    if (newPreferences.updateFrequency) {
      this.scheduleWidgetUpdates();
    }
  }

  /**
   * Get current preferences
   */
  getPreferences(): WidgetPreferences {
    return { ...this.preferences };
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('widget_preferences');
      if (stored) {
        const parsedPreferences: unknown = JSON.parse(stored);
        if (this.isValidWidgetPreferences(parsedPreferences)) {
          this.preferences = { ...this.preferences, ...parsedPreferences };
        } else {
          console.warn(
            'Invalid widget preferences found in storage, using defaults'
          );
        }
      }
    } catch (error) {
      console.error('Failed to load widget preferences:', error);
    }
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'widget_preferences',
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Failed to save widget preferences:', error);
    }
  }

  /**
   * Enable all widgets
   */
  async enableAllWidgets(): Promise<void> {
    await this.updatePreferences({
      enableDailyHoroscope: true,
      enableTransitAlerts: true,
      enableMoonPhase: true,
    });
  }

  /**
   * Disable all widgets
   */
  async disableAllWidgets(): Promise<void> {
    await this.updatePreferences({
      enableDailyHoroscope: false,
      enableTransitAlerts: false,
      enableMoonPhase: false,
    });
  }

  /**
   * Get widget usage instructions for user
   */
  getWidgetInstructions(): {
    ios: string[];
    android: string[];
  } {
    return {
      ios: [
        '1. Long press on your home screen',
        '2. Tap the "+" button in the top left corner',
        '3. Search for "CosmicHub"',
        '4. Select your preferred widget size',
        '5. Tap "Add Widget"',
        '6. Position the widget where you want it',
      ],
      android: [
        '1. Long press on an empty area of your home screen',
        '2. Tap "Widgets" from the options menu',
        '3. Find "CosmicHub" in the widgets list',
        '4. Drag your preferred widget to your home screen',
        '5. Resize if needed by dragging the corners',
      ],
    };
  }

  /**
   * Get available widget types
   */
  getAvailableWidgets(): Array<{
    id: string;
    name: string;
    description: string;
    sizes: string[];
  }> {
    return [
      {
        id: 'daily_horoscope',
        name: 'Daily Horoscope',
        description: 'Your personalized daily astrological insights',
        sizes: ['Small (2x2)', 'Medium (4x2)', 'Large (4x4)'],
      },
      {
        id: 'current_transits',
        name: 'Active Transits',
        description: 'Current planetary transits affecting you',
        sizes: ['Medium (4x2)', 'Large (4x4)'],
      },
      {
        id: 'moon_phase',
        name: 'Moon Phase',
        description: 'Current moon phase and next phase information',
        sizes: ['Small (2x2)', 'Medium (4x2)'],
      },
    ];
  }

  /**
   * Validate widget preferences object
   */
  private isValidWidgetPreferences(
    value: unknown
  ): value is Partial<WidgetPreferences> {
    if (value === null || value === undefined || typeof value !== 'object') {
      return false;
    }

    const prefs = value as Record<string, unknown>;

    // Check optional boolean fields
    if (
      prefs.enableDailyHoroscope !== undefined &&
      typeof prefs.enableDailyHoroscope !== 'boolean'
    ) {
      return false;
    }

    if (
      prefs.enableTransitAlerts !== undefined &&
      typeof prefs.enableTransitAlerts !== 'boolean'
    ) {
      return false;
    }

    if (
      prefs.enableMoonPhase !== undefined &&
      typeof prefs.enableMoonPhase !== 'boolean'
    ) {
      return false;
    }

    if (
      prefs.showPersonalizedContent !== undefined &&
      typeof prefs.showPersonalizedContent !== 'boolean'
    ) {
      return false;
    }

    // Check optional updateFrequency field
    if (prefs.updateFrequency !== undefined) {
      const validFrequencies = ['hourly', 'twice_daily', 'daily'];
      if (!validFrequencies.includes(prefs.updateFrequency as string)) {
        return false;
      }
    }

    return true;
  }
}

export const widgetService = new WidgetService();
