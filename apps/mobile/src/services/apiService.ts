import { auth } from '@cosmichub/auth';
import axios from 'axios';
import { mobileConfig } from '../config';

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
      const mod: typeof import('../../../astro/src/config/environment') = await import('../../../astro/src/config/environment');
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

  // Chart generation - same endpoints as your web app
  async generateChart(birthData: BirthData): Promise<ChartResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/charts/generate`, birthData);
      return response.data as ChartResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Synastry analysis
  async calculateSynastry(person1: BirthData, person2: BirthData): Promise<SynastryResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/synastry/calculate`, {
        person1,
        person2,
      });
      return response.data as SynastryResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Transit calculations
  async getTransits(birthData: BirthData, dateRange: DateRange): Promise<TransitResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/transits/calculate`, {
        birthData,
        dateRange,
      });
      return response.data as TransitResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // User data management
  async saveChart(chartData: ChartResponse): Promise<ChartResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/charts/save`, chartData);
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
      const response = await axios.get(`${this.baseURL}/api/frequencies/presets`);
      return response.data as FrequencyResponse;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorData = error.response.data as { message?: string } | undefined;
        const message = errorData?.message ?? `Server Error: ${error.response.status}`;
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
