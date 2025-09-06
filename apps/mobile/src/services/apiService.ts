import axios from 'axios';
import { mobileConfig } from '../config';

import type { UnifiedBirthData } from '@cosmichub/types';

// API types
interface BirthData {
  date: string;
  time: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

interface ChartResponse {
  id: string;
  data: Record<string, unknown>;
}

interface SynastryResponse {
  compatibility: number;
  aspects: Array<Record<string, unknown>>;
}

interface TransitResponse {
  transits: Array<Record<string, unknown>>;
}

interface FrequencyResponse {
  recommendations: Array<{
    id: string;
    name: string;
    frequency: number;
    description: string;
  }>;
}

interface DateRange {
  start: string;
  end: string;
}

interface UpcomingTransit {
  id: string;
  title: string;
  description: string;
  exactTime: string;
  type: 'major' | 'daily' | 'weekly' | 'monthly';
  aspect: string;
  planetaryBodies: string[];
}

interface NotificationPreferences {
  majorTransits: boolean;
  dailyInsights: boolean;
  weeklyForecasts: boolean;
  monthlyOverview: boolean;
  locationBased: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// Lightweight devConsole (mirrors web pattern) to avoid raw console usage in production bundles
// Reuse web devConsole via lazy dynamic import to avoid duplication
interface DevConsole {
  log?: (...a: unknown[]) => void;
  warn?: (...a: unknown[]) => void;
  error: (...a: unknown[]) => void;
}

let sharedDevConsole: DevConsole | undefined;
async function getDevConsole(): Promise<DevConsole> {
  if (sharedDevConsole === undefined) {
    try {
      const mod: typeof import('../../../astro/src/config/environment') =
        await import('../../../astro/src/config/environment');
      sharedDevConsole = mod.devConsole;
    } catch {
      sharedDevConsole = { error: console.error.bind(console) };
    }
  }
  return sharedDevConsole;
}

class MobileApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = mobileConfig.api.baseUrl;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(async config => {
      try {
        // Try to get auth token from Firebase auth
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // Auth not available - continue without token
        const dc = await getDevConsole();
        dc.warn?.('Auth not available, continuing without token:', error);
      }
      return config;
    });

    // Response interceptor for error handling
    axios.interceptors.response.use(
      response => response,
      (error: unknown) => {
        if (axios.isAxiosError(error)) {
          void getDevConsole().then(dc =>
            dc.error('API Error:', error.response?.data ?? error.message)
          );
          return Promise.reject(new Error(error.message));
        }
        return Promise.reject(new Error('Unknown error occurred'));
      }
    );
  }

  /**
   * Safely get auth token from Firebase
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      // Import Firebase auth directly to avoid proxy issues
      const { getAuth, onAuthStateChanged } = await import('firebase/auth');
      const auth = getAuth();

      return new Promise(resolve => {
        const unsubscribe = onAuthStateChanged(auth, user => {
          unsubscribe();
          if (user) {
            user
              .getIdToken()
              .then(token => {
                resolve(token);
              })
              .catch(async error => {
                const dc = await getDevConsole();
                dc.warn?.('Failed to get ID token:', error);
                resolve(null);
              });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      const dc = await getDevConsole();
      dc.warn?.('Firebase auth not available:', error);
      return null;
    }
  }

  // Chart generation - same endpoints as your web app
  async generateChart(birthData: BirthData): Promise<ChartResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/charts/generate`,
        birthData
      );
      return response.data as ChartResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Synastry analysis
  async calculateSynastry(
    person1: BirthData,
    person2: BirthData
  ): Promise<SynastryResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/synastry/calculate`,
        {
          person1,
          person2,
        }
      );
      return response.data as SynastryResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Transit calculations
  async getTransits(
    birthData: BirthData,
    dateRange: DateRange
  ): Promise<TransitResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/transits/calculate`,
        {
          birthData,
          dateRange,
        }
      );
      return response.data as TransitResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User data management
  async saveChart(chartData: ChartResponse): Promise<ChartResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/charts/save`,
        chartData
      );
      return response.data as ChartResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserCharts(): Promise<ChartResponse[]> {
    try {
      const response = await axios.get(`${this.baseURL}/api/charts/user`);
      return response.data as ChartResponse[];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // HealWave frequency data (if you have backend endpoints for this)
  async getFrequencyPresets(): Promise<FrequencyResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/frequencies/presets`
      );
      return response.data as FrequencyResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notification-related API methods
  async getUpcomingTransits(
    userId: string,
    birthData: BirthData,
    location?: { latitude: number; longitude: number }
  ): Promise<UpcomingTransit[]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/transits/upcoming`,
        {
          userId,
          birthData,
          location,
          lookAheadDays: 30, // Get transits for next 30 days
        }
      );
      return (response.data as { transits: UpcomingTransit[] }).transits;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateNotificationPreferences(
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/api/user/notification-preferences`,
        preferences
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await axios.get(
        `${this.baseURL}/api/user/notification-preferences`
      );
      return response.data as NotificationPreferences;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async registerPushToken(
    token: string,
    deviceInfo: {
      platform: 'ios' | 'android';
      deviceId: string;
      appVersion: string;
    }
  ): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/api/user/push-token`, {
        token,
        ...deviceInfo,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as
          | { message?: string }
          | undefined;
        const message =
          errorData?.message ?? `Server Error: ${error.response.status}`;
        return new Error(String(message));
      } else if (error.request) {
        return new Error('Network Error: Unable to reach server');
      }
    }

    if (error instanceof Error) {
      return new Error(`Request Error: ${error.message}`);
    }

    return new Error('Unknown error occurred');
  }
}

export const apiService = new MobileApiService();
