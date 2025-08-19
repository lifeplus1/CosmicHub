import { auth } from '@cosmichub/auth';
import axios from 'axios';
import { mobileConfig } from '../config';

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
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      const mod: typeof import('../../../astro/src/config/environment') = await import('../../../astro/src/config/environment');
      sharedDevConsole = mod.devConsole;
    } catch {
      /* eslint-disable no-console */ sharedDevConsole = { error: console.error.bind(console) }; /* eslint-enable no-console */
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
    axios.interceptors.request.use(async (config) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        void getDevConsole().then(dc => dc.error('API Error:', error.response?.data ?? error.message));
        return Promise.reject(error);
      }
    );
  }

  // Chart generation - same endpoints as your web app
  async generateChart(birthData: any) {
    try {
      const response = await axios.post(`${this.baseURL}/api/charts/generate`, birthData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Synastry analysis
  async calculateSynastry(person1: any, person2: any) {
    try {
      const response = await axios.post(`${this.baseURL}/api/synastry/calculate`, {
        person1,
        person2,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Transit calculations
  async getTransits(birthData: any, dateRange: any) {
    try {
      const response = await axios.post(`${this.baseURL}/api/transits/calculate`, {
        birthData,
        dateRange,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User data management
  async saveChart(chartData: any) {
    try {
      const response = await axios.post(`${this.baseURL}/api/charts/save`, chartData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserCharts() {
    try {
      const response = await axios.get(`${this.baseURL}/api/charts/user`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // HealWave frequency data (if you have backend endpoints for this)
  async getFrequencyPresets() {
    try {
      const response = await axios.get(`${this.baseURL}/api/frequencies/presets`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      // Server responded with error status
      return new Error(`Server Error: ${error.response.status} - ${error.response.data.message}`);
    } else if (error.request) {
      // Request made but no response received
      return new Error('Network Error: Unable to reach server');
    } else {
      // Something else happened
      return new Error(`Request Error: ${error.message}`);
    }
  }
}

export const apiService = new MobileApiService();
