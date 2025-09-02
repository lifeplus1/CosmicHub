import axios, { type AxiosRequestConfig } from 'axios';
import { ok, toFailure, type ApiResult } from '@cosmichub/config';
import { devConsole } from '../config/environment';
import {
  toUnifiedBirthData,
  type AnyBirthInput,
  type ChartBirthData,
} from '@cosmichub/types';
import { auth } from '../firebase';
import { csrfService } from './csrfService';
import type { GeneKeysData } from '../components/GeneKeysChart/types';
import type { HumanDesignData } from '../components/HumanDesignChart/types';
import { isPlanetForDisplay } from '../utils/celestialBodyCategorization';
import {
  type Planet,
  type House,
  type PlanetName,
  type ZodiacSign,
  type ChartData,
  type UserId,
  type ChartId,
  type InterpretationId,
  type SavedChart,
  type SavedChartsResponse,
  type SaveChartRequest,
  type SaveChartResponse,
  type Interpretation,
  type InterpretationRequest,
  type InterpretationResponse,
  type Aspect,
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from './api.types';
import {
  getSignFromDegrees,
  calculateHousePosition,
  isZodiacSign,
} from '../utils/astrologyUtils';
import { isAspectType } from './validation';

// Backend response transformation types and helpers
interface BackendChartPlanet {
  position?: number;
  longitude?: number;
  retrograde?: boolean;
  speed?: number;
  sign?: ZodiacSign;
  house?: number;
  dignity?: 'domicile' | 'exaltation' | 'fall' | 'detriment';
  essential_dignity?: number;
}

interface BackendChartAsteroid {
  position?: number;
  longitude?: number;
  retrograde?: boolean;
  speed?: number;
  sign?: ZodiacSign;
  house?: number;
}

interface BackendChartPoint {
  position?: number;
  longitude?: number;
  retrograde?: boolean;
  speed?: number;
  sign?: ZodiacSign;
  house?: number;
}

interface BackendChartAspect {
  // New backend format
  point1?: string;
  point2?: string;
  aspect?: string;
  orb?: number;
  applying?: boolean;
  exact?: boolean;
  power?: number;

  // Legacy format
  planet1?: string;
  planet2?: string;
  type?: string;
}

interface BackendHouseData {
  cusp?: number;
  sign?: ZodiacSign;
}

interface BackendChartResponse {
  planets?: Record<string, BackendChartPlanet>;
  houses?: Record<string, BackendHouseData> | number[];
  aspects?: BackendChartAspect[];
  asteroids?: Record<string, BackendChartAsteroid>;
  points?: Record<string, BackendChartPoint>;
  angles?: Record<string, BackendHouseData>;
}

type BackendChartPlanets = Record<PlanetName, BackendChartPlanet>;

const isChartObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const coerceChartNumber = (v: unknown, fallback = 0): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

const PLANET_NAMES: readonly PlanetName[] = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'chiron',
  'north_node',
  'south_node',
];

const isPlanetName = (v: unknown): v is PlanetName =>
  typeof v === 'string' && PLANET_NAMES.includes(v as PlanetName);

// Re-export types from api.types
export * from './api.types';
// Re-export local ApiResult for consumers
export type { ApiResult } from '@cosmichub/config';

const getDefaultPlanets = (): Partial<Record<PlanetName, Planet>> => ({
  sun: {
    name: 'sun',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  moon: {
    name: 'moon',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  mercury: {
    name: 'mercury',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  venus: {
    name: 'venus',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  mars: {
    name: 'mars',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  jupiter: {
    name: 'jupiter',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  saturn: {
    name: 'saturn',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  uranus: {
    name: 'uranus',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  neptune: {
    name: 'neptune',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  pluto: {
    name: 'pluto',
    position: 0,
    retrograde: false,
    speed: 0,
    sign: 'aries',
    house: 1,
  },
  // Remove Chiron - it will be handled as a major asteroid
  // Remove nodes - they will be handled as points
});

// Narrow import.meta.env access to avoid implicit any
// Safe env access with bracket notation for strict index signature rules
const rawApiUrl: string | undefined =
  typeof import.meta.env?.['VITE_API_URL'] === 'string'
    ? import.meta.env['VITE_API_URL']
    : undefined;
let resolvedApi = '';
if (typeof rawApiUrl === 'string') {
  const trimmed = rawApiUrl.trim();
  if (trimmed.length > 0) {
    resolvedApi = trimmed;
  }
}
const BACKEND_URL: string =
  resolvedApi !== '' ? resolvedApi : 'http://localhost:8000';

devConsole.log?.('🔗 API Service initializing...');
devConsole.log?.('🌐 Backend URL:', BACKEND_URL);

// Helper function to get current auth token
// Lightweight auth shape to avoid relying on any typed firebase re-export
// Firebase user surface we rely on (declared for documentation; value via import)
// interface AuthLikeUser { getIdToken(forceRefresh?: boolean): Promise<string>; }

export const getAuthToken = async (): Promise<string | null> => {
  devConsole.log?.('🔑 Getting auth token...');
  const user = auth.currentUser;

  // In development, allow mock authentication - check for both null and undefined auth states
  if (import.meta.env.DEV === true && (user === null || user === undefined)) {
    devConsole.log?.(
      '🧪 Using development mock token (user not authenticated)'
    );
    return 'mock-dev-token';
  }

  // Also check if auth is completely unavailable (testing environment)
  if (typeof auth === 'undefined' || auth === null) {
    devConsole.log?.('🧪 Using development mock token (auth unavailable)');
    return 'mock-dev-token';
  }

  if (user === null) {
    devConsole.warn?.('⚠️ No authenticated user found');
    return null;
  }

  try {
    devConsole.log?.('🔄 Refreshing auth token...');
    // Force refresh token to ensure it's valid
    const token = await user.getIdToken(true);
    devConsole.log?.('✅ Auth token obtained successfully');
    return token;
  } catch (error) {
    devConsole.error('❌ Error getting auth token:', error);
    // Fallback to mock token in development when auth fails
    if (import.meta.env.DEV === true) {
      devConsole.log?.('🧪 Falling back to development mock token');
      return 'mock-dev-token';
    }
    return null;
  }
};

// Helper function to create authorized headers
type AuthHeaders = Record<string, string>;
const getAuthHeaders = async (): Promise<AuthHeaders> => {
  devConsole.log?.('📝 Creating auth headers...');
  const token = await getAuthToken();
  if (token === null) {
    devConsole.error('❌ Authentication required but no token available');
    throw new AuthenticationError('Authentication required');
  }
  devConsole.log?.('✅ Auth headers created');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// CSRF-protected axios request helper
const createCsrfAxios = () => {
  const instance = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  // Request interceptor to add CSRF token
  instance.interceptors.request.use(async config => {
    try {
      const csrfHeaders = await csrfService.getHeaders();
      // Properly merge headers using axios Headers API
      Object.keys(csrfHeaders).forEach(key => {
        config.headers.set(key, csrfHeaders[key]);
      });
      return config;
    } catch (error) {
      devConsole.error('Failed to add CSRF token to request:', error);
      return Promise.reject(new Error('Failed to add CSRF token'));
    }
  });

  // Response interceptor to handle CSRF token refresh
  instance.interceptors.response.use(
    response => response,
    async (error: unknown) => {
      // Simple check for CSRF error
      const errorRecord = error as {
        response?: { status?: number; data?: { detail?: unknown } };
      };
      const isCSRFError =
        errorRecord?.response?.status === 403 &&
        typeof errorRecord?.response?.data?.detail === 'string' &&
        errorRecord.response.data.detail.includes('CSRF');

      if (isCSRFError) {
        devConsole.warn('CSRF token expired, clearing cache and retrying...');
        csrfService.clearToken();

        // Retry the request once with fresh token
        const originalRequest = (
          error as {
            config?: Record<string, unknown> & {
              _retry?: boolean;
              headers?: Record<string, unknown>;
            };
          }
        ).config;
        if (originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const csrfHeaders = await csrfService.getHeaders();
            // Update headers for retry request
            if (originalRequest.headers) {
              Object.keys(csrfHeaders).forEach(key => {
                if (originalRequest.headers) {
                  originalRequest.headers[key] = csrfHeaders[key];
                }
              });
            }
            return instance(originalRequest as AxiosRequestConfig);
          } catch {
            return Promise.reject(new Error('CSRF retry failed'));
          }
        }
      }
      return Promise.reject(
        new Error(error instanceof Error ? error.message : 'Request failed')
      );
    }
  );

  return instance;
};

// Global CSRF-protected axios instance
const csrfAxios = createCsrfAxios();

// Multi-system response interface for enhanced chart data
interface MultiSystemResponse {
  chart_data?: BackendChartResponse;
  numerology?: unknown;
  human_design?: HumanDesignData;
  gene_keys?: GeneKeysData;
}

// API Functions for Saved Charts
export const fetchSavedCharts = async (): Promise<ApiResult<SavedChart[]>> => {
  devConsole.log?.('📊 Fetching saved charts...');

  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.get<SavedChartsResponse>(
      `${BACKEND_URL}/api/charts/`,
      { headers }
    );
    devConsole.log?.('✅ Saved charts fetched successfully:', data);
    return ok(Array.isArray(data.charts) ? data.charts : []);
  } catch (err) {
    devConsole.error('❌ Error fetching saved charts:', err);
    return toFailure(err, {
      auth: 'Authentication required to view saved charts',
      defaultMsg: 'Failed to fetch saved charts',
    });
  }
};

export const saveChart = async (
  chartData: SaveChartRequest
): Promise<ApiResult<SaveChartResponse>> => {
  devConsole.log?.('💾 Saving chart...', chartData);

  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post<SaveChartResponse>(
      `${BACKEND_URL}/api/charts/save-chart`,
      chartData,
      { headers }
    );
    devConsole.log?.('✅ Chart saved successfully:', data);
    return ok(data);
  } catch (err) {
    devConsole.error('❌ Error saving chart:', err);
    return toFailure(err, {
      auth: 'Authentication required to save charts',
      defaultMsg: 'Failed to save chart',
    });
  }
};

export const deleteChart = async (
  chartId: ChartId
): Promise<ApiResult<null>> => {
  devConsole.log?.(`🗑️ Deleting chart: ${chartId}`);

  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${BACKEND_URL}/api/charts/${chartId}`, { headers });
    devConsole.log?.('✅ Chart deleted successfully');
    return ok(null);
  } catch (err) {
    devConsole.error('❌ Error deleting chart:', err);
    return toFailure(err, {
      auth: 'Authentication required to delete charts',
      defaultMsg: 'Failed to delete chart',
    });
  }
};

export const fetchSavedChartById = async (
  chartId: string
): Promise<
  ApiResult<{ chart_data: ChartData; birth_data?: Record<string, unknown> }>
> => {
  devConsole.log?.(`📊 Fetching saved chart by ID: ${chartId}`);

  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.get<SavedChart>(
      `${BACKEND_URL}/api/charts/${chartId}`,
      { headers }
    );
    devConsole.log?.('✅ Saved chart fetched successfully:', data);
    return ok({
      chart_data: data.chart_data,
      birth_data: data.birth_data,
    });
  } catch (err) {
    devConsole.error('❌ Error fetching saved chart by ID:', err);
    return toFailure(err, {
      auth: 'Authentication required to view saved charts',
      notFound: 'Chart not found',
      defaultMsg: 'Failed to fetch saved chart',
    });
  }
};

export const apiClient = {
  get: async <T = unknown>(endpoint: string): Promise<T> => {
    devConsole.log?.('📡 API GET request:', endpoint);
    const url = `${BACKEND_URL}${endpoint}`;
    devConsole.log?.('🌐 Full URL:', url);

    try {
      const response = await fetch(url);
      devConsole.log?.('📥 Response status:', response.status);

      if (response.ok === false) {
        devConsole.error(
          '❌ HTTP error:',
          response.status,
          response.statusText
        );

        // Map HTTP status code to appropriate error
        if (response.status === 401) {
          throw new AuthenticationError();
        } else if (response.status === 404) {
          throw new NotFoundError('Resource', endpoint);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: unknown = await response.json();
      devConsole.log?.('✅ GET response data:', data);
      return data as T;
    } catch (err) {
      devConsole.error('❌ GET request failed:', err);
      throw err;
    }
  },

  post: async <T = unknown>(endpoint: string, body: unknown): Promise<T> => {
    devConsole.log?.('📡 API POST request:', endpoint);
    devConsole.log?.('📤 Request data:', body);
    const url = `${BACKEND_URL}${endpoint}`;
    devConsole.log?.('🌐 Full URL:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      devConsole.log?.('📥 Response status:', response.status);

      if (response.ok !== true) {
        devConsole.error(
          '❌ HTTP error:',
          response.status,
          response.statusText
        );

        // Map HTTP status code to appropriate error
        if (response.status === 401) {
          throw new AuthenticationError();
        } else if (response.status === 404) {
          throw new NotFoundError('Resource', endpoint);
        } else if (response.status === 400) {
          throw new ValidationError('Invalid request data', {});
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const responseData: unknown = await response.json();
      devConsole.log?.('✅ POST response data:', responseData);
      return responseData as T;
    } catch (err) {
      devConsole.error('❌ POST request failed:', err);
      throw err;
    }
  },
};

// Uses shared toFailure from @cosmichub/config

export const fetchChart = async (
  data: ChartBirthData
): Promise<ApiResult<MultiSystemResponse>> => {
  devConsole.log?.('🔮 Fetching chart data...');
  devConsole.log?.('📊 Chart data input:', data);
  try {
    const headers = await getAuthHeaders();
    devConsole.log?.(
      '📡 Making chart request to /api/calculations/multi-system-chart'
    );
    const response = await csrfAxios.post<MultiSystemResponse>(
      '/api/calculations/multi-system-chart',
      data,
      { headers }
    );
    const responseData = response.data;
    devConsole.log?.('✅ Chart response received:', responseData);
    return ok(responseData);
  } catch (err) {
    devConsole.error('❌ Error fetching chart:', err);
    return toFailure(err, {
      auth: 'Authentication required to fetch chart',
      defaultMsg: 'Failed to fetch chart data',
    });
  }
};

export const fetchPersonalityAnalysis = async (
  userId: UserId
): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🔮 Fetching personality analysis...');
  try {
    const headers = await getAuthHeaders();
    devConsole.log?.(
      '📡 Making personality analysis request to /api/analyze/personality/'
    );
    const response = await axios.get(
      `${BACKEND_URL}/api/analyze/personality/${userId}`,
      { headers }
    );
    devConsole.log?.(
      '✅ Personality analysis response received:',
      response.data
    );
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error fetching personality analysis:', err);
    return toFailure(err, {
      auth: 'Authentication required to access personality analysis',
      notFound: 'Personality analysis not found',
      defaultMsg: 'Failed to fetch personality analysis',
    });
  }
};

export const calculateNumerology = async (
  data: ChartBirthData
): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🔮 Calculating numerology...');
  devConsole.log?.('📊 Numerology data input:', data);
  try {
    const headers = await getAuthHeaders();
    devConsole.log?.('📡 Making numerology request to /calculate-numerology');
    const response = await axios.post(
      `${BACKEND_URL}/calculate-numerology`,
      data,
      { headers }
    );
    devConsole.log?.('✅ Numerology response received:', response.data);
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error fetching numerology:', err);
    return toFailure(err, {
      auth: 'Authentication required to fetch numerology data',
      defaultMsg: 'Failed to fetch numerology data',
    });
  }
};

export const calculateHumanDesign = async (
  data: AnyBirthInput
): Promise<ApiResult<{ human_design: HumanDesignData }>> => {
  devConsole.log?.('🧬 Calculating Human Design chart...');
  devConsole.log?.('📊 Human Design input:', data);

  try {
    const unifiedData = toUnifiedBirthData(data);
    const headers = await getAuthHeaders();
    const response = await axios.post<{ human_design: HumanDesignData }>(
      `${BACKEND_URL}/api/human-design/calculate`,
      unifiedData,
      { headers }
    );

    devConsole.log?.('✅ Human Design calculation successful:', response.data);
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error calculating Human Design chart:', err);
    return toFailure(err, {
      auth: 'Authentication required to calculate Human Design chart',
      validation: 'Invalid birth data for Human Design calculation',
      defaultMsg: 'Failed to calculate Human Design chart',
    });
  }
};

export const fetchHumanDesignProfile = async (
  userId: UserId
): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🧬 Fetching Human Design profile...');
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${BACKEND_URL}/api/human-design/profile/${userId}`,
      { headers }
    );

    devConsole.log?.('✅ Human Design profile retrieved:', response.data);
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error fetching Human Design profile:', err);
    return toFailure(err, {
      auth: 'Authentication required to access Human Design profile',
      notFound: 'Human Design profile not found',
      defaultMsg: 'Failed to fetch Human Design profile',
    });
  }
};

export const calculateGeneKeys = async (
  data: AnyBirthInput
): Promise<ApiResult<GeneKeysData>> => {
  devConsole.log?.('🧬 Calculating Gene Keys...');
  try {
    const unifiedData = toUnifiedBirthData(data);
    devConsole.log?.('📊 Gene Keys input:', unifiedData);
    const headers = await getAuthHeaders();
    devConsole.log?.('📡 Making Gene Keys request to /gene-keys/calculate');
    const response = await axios.post<GeneKeysData>(
      `${BACKEND_URL}/api/gene-keys/calculate`,
      unifiedData,
      { headers }
    );
    devConsole.log?.('✅ Gene Keys response received:', response.data);
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error calculating Gene Keys:', err);
    return toFailure(err, {
      auth: 'Authentication required to calculate Gene Keys',
      validation: 'Invalid birth data for Gene Keys calculation',
      defaultMsg: 'Failed to calculate Gene Keys',
    });
  }
};

export const fetchGeneKeysProfile = async (
  userId: UserId
): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🧬 Fetching Gene Keys profile...');
  try {
    const headers = await getAuthHeaders();
    devConsole.log?.(
      '📡 Making Gene Keys profile request to /gene-keys/profile/'
    );
    const response = await axios.get(
      `${BACKEND_URL}/api/gene-keys/profile/${userId}`,
      { headers }
    );
    devConsole.log?.('✅ Gene Keys profile response received:', response.data);
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error fetching Gene Keys profile:', err);
    return toFailure(err, {
      auth: 'Authentication required to access Gene Keys profile',
      notFound: 'Gene Keys profile not found',
      defaultMsg: 'Failed to fetch Gene Keys profile',
    });
  }
};

export const fetchContemplationProgress = async (
  userId: UserId
): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🔮 Fetching contemplation progress...');
  try {
    const headers = await getAuthHeaders();
    devConsole.log?.(
      '📡 Making contemplation progress request to /gene-keys/contemplation/'
    );
    const response = await axios.get(
      `${BACKEND_URL}/api/gene-keys/contemplation/${userId}`,
      { headers }
    );
    devConsole.log?.(
      '✅ Contemplation progress response received:',
      response.data
    );
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error fetching contemplation progress:', err);
    return toFailure(err, {
      auth: 'Authentication required to access contemplation progress',
      notFound: 'Contemplation progress not found',
      defaultMsg: 'Failed to fetch contemplation progress',
    });
  }
};

// Chart data interfaces for type safety
// ChartBirthData now sourced from shared UnifiedBirthData (re-exported as ChartBirthData)

// Types moved to api.types.ts
export type { Planet, House } from './api.types';

// Re-export ChartData from api.types

// Enhanced chart fetching function for calculating birth charts
export const fetchChartDataUnified = async (
  birthData: ChartBirthData
): Promise<ApiResult<ChartData & { __raw_backend_response?: unknown }>> => {
  devConsole.log?.('🔮 Calculating birth chart from birth data...');
  devConsole.log?.('📊 Birth data input:', birthData);

  try {
    const response = await apiClient.post('/charts/chart', {
      year: birthData.year,
      month: birthData.month,
      day: birthData.day,
      hour: birthData.hour,
      minute: birthData.minute,
      lat: birthData.lat,
      lon: birthData.lon,
      city: birthData.city,
      timezone: birthData.timezone,
    });

    devConsole.log?.('✅ Birth chart response received:', response);

    // The new /birth-chart endpoint returns data directly (not nested under chart_data)
    if (typeof response !== 'object' || response === null) {
      throw new Error('Invalid birth chart response format');
    }

    // Transform backend response to frontend format and include raw data
    const transformedData = transformBackendResponse(response);

    // Add raw backend response for useChartProcessing hook
    const resultWithRawData = {
      ...transformedData,
      __raw_backend_response: response, // The response IS the raw backend data
    };

    devConsole.log?.('🔄 Transformed birth chart data:', resultWithRawData);

    return ok(resultWithRawData);
  } catch (err) {
    devConsole.error('❌ Error fetching unified chart data:', err);
    return toFailure(err, {
      auth: 'Authentication required to fetch chart data',
      notFound: 'Chart data not found',
      defaultMsg: 'Failed to fetch chart data',
    });
  }
};

// Enhanced chart fetching function that hits the /calculate endpoint (legacy)
export const fetchChartData = async (
  birthData: ChartBirthData
): Promise<ApiResult<ChartData>> => {
  devConsole.log?.('🔮 Fetching chart data from /calculate endpoint...');
  devConsole.log?.('📊 Chart data input:', birthData);

  try {
    const response = await apiClient.post('/calculate', birthData);
    devConsole.log?.('✅ Chart response received:', response);

    // Transform backend response to frontend format
    const transformedData = transformBackendResponse(response);
    devConsole.log?.('🔄 Transformed chart data:', transformedData);

    return ok(transformedData);
  } catch (err) {
    devConsole.error('❌ Error fetching chart data:', err);
    return toFailure(err, {
      auth: 'Authentication required to fetch chart data',
      notFound: 'Chart data not found',
      defaultMsg: 'Failed to fetch chart data',
    });
  }
};

// Re-export core types for backward compatibility
export type { ChartBirthData };

// Transform backend response to match ChartData interface safely
export const transformBackendResponse = (
  backendResponse: unknown
): ChartData => {
  if (!isChartObject(backendResponse)) {
    // Return a default chart with all required planets
    return {
      planets: getDefaultPlanets() as Record<PlanetName, Planet>,
      houses: [],
      aspects: [],
      angles: { ascendant: 0, midheaven: 0, descendant: 180, imumcoeli: 180 },
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
      julian_day: 0,
      house_system: 'placidus',
    };
  }

  const raw = backendResponse;

  // Import categorization system to prevent misclassification
  // (Already imported at top of file)

  // Planets (ONLY traditional + modern planets, NO asteroids like Chiron)
  const planets: Partial<Record<PlanetName, Planet>> = getDefaultPlanets();

  // Remove asteroids that may have been included in default planets
  Object.keys(planets).forEach(name => {
    if (!isPlanetForDisplay(name)) {
      delete planets[name as PlanetName];
    }
  });

  // First extract house cusps for planet house calculations
  let houseCusps: number[] = [];
  console.log('🏠 Extracting house cusps from raw data...');
  const rawHousesForCusps = (raw as BackendChartResponse)['houses'];
  if (Array.isArray(rawHousesForCusps)) {
    houseCusps = rawHousesForCusps.map((h, idx) => {
      if (typeof h === 'object' && h !== null && 'cusp' in h) {
        const houseData = h as BackendHouseData;
        return coerceChartNumber(houseData.cusp, idx * 30);
      }
      return coerceChartNumber(h, idx * 30);
    });
  } else if (isChartObject(rawHousesForCusps)) {
    const tempHouses: Array<{ number: number; cusp: number }> = [];
    for (const [houseKey, houseValue] of Object.entries(rawHousesForCusps)) {
      const houseNumber = houseKey.includes('house_')
        ? parseInt(houseKey.replace('house_', ''))
        : parseInt(houseKey, 10);
      if (Number.isNaN(houseNumber) || houseNumber < 1 || houseNumber > 12)
        continue;

      let cusp = 0;
      if (typeof houseValue === 'number') {
        cusp = houseValue;
      } else if (isChartObject(houseValue)) {
        cusp = coerceChartNumber((houseValue as BackendHouseData).cusp, 0);
      }
      tempHouses.push({ number: houseNumber, cusp });
    }
    tempHouses.sort((a, b) => a.number - b.number);
    houseCusps = tempHouses.map(h => h.cusp);
  }

  // Use bracket property access (strict index signature compliance)
  const rawPlanetsCandidate = raw['planets'];
  // Case 1: Object map (expected from /calculate endpoint)
  if (
    isChartObject(rawPlanetsCandidate) &&
    !Array.isArray(rawPlanetsCandidate)
  ) {
    const rawPlanets: BackendChartPlanets =
      rawPlanetsCandidate as BackendChartPlanets;
    for (const [name, value] of Object.entries(rawPlanets)) {
      if (isChartObject(value) && isPlanetName(name)) {
        if (!isPlanetForDisplay(name)) continue; // Skip asteroids/points in planet map
        const p = value as BackendChartPlanet;
        const position =
          typeof p.position === 'number'
            ? p.position
            : typeof p.longitude === 'number'
              ? p.longitude
              : 0;
        const sign = p.sign ?? getSignFromDegrees(position);
        const house =
          typeof p.house === 'number'
            ? p.house
            : calculateHousePosition(position, houseCusps);
        planets[name] = {
          name,
          position,
          retrograde: Boolean(p.retrograde),
          speed: typeof p.speed === 'number' ? p.speed : 0,
          sign,
          house,
          dignity: p.dignity,
          essential_dignity: p.essential_dignity,
        };
      }
    }
  }
  // Case 2: Array list (returned by legacy /api/charts endpoints)
  else if (Array.isArray(rawPlanetsCandidate)) {
    for (const item of rawPlanetsCandidate) {
      if (!isChartObject(item)) continue;
      const itemData = item as BackendChartPlanet & {
        name?: string;
        degree?: number;
      };
      const nameRaw = itemData.name;
      if (!isPlanetName(nameRaw)) continue;
      if (!isPlanetForDisplay(nameRaw)) continue;
      const degree = typeof itemData.degree === 'number' ? itemData.degree : 0;
      const position =
        typeof itemData.position === 'number' ? itemData.position : degree;
      const sign =
        typeof itemData.sign === 'string' && isZodiacSign(itemData.sign)
          ? itemData.sign
          : getSignFromDegrees(position);
      const house =
        typeof itemData.house === 'number'
          ? itemData.house
          : calculateHousePosition(position, houseCusps);
      planets[nameRaw] = {
        name: nameRaw,
        position,
        retrograde: Boolean(itemData.retrograde),
        speed: typeof itemData.speed === 'number' ? itemData.speed : 0,
        sign,
        house,
      };
    }
  }

  // Houses
  const houses: House[] = [];
  const rawHouses = (raw as BackendChartResponse)['houses'];
  if (isChartObject(rawHouses)) {
    for (const [houseKey, houseValue] of Object.entries(rawHouses)) {
      const houseNumber = houseKey.includes('house_')
        ? parseInt(houseKey.replace('house_', ''))
        : parseInt(houseKey, 10);
      if (Number.isNaN(houseNumber) || houseNumber < 1 || houseNumber > 12)
        continue;
      let cusp = 0;
      let sign: ZodiacSign = 'aries'; // Default sign
      if (typeof houseValue === 'number') {
        cusp = houseValue;
      } else if (isChartObject(houseValue)) {
        const houseData = houseValue as BackendHouseData;
        cusp = coerceChartNumber(houseData.cusp, 0);
        const signVal = houseData.sign;
        if (typeof signVal === 'string' && isZodiacSign(signVal)) {
          sign = signVal;
        }
      }
      houses.push({
        number: houseNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
        cusp,
        sign,
      });
    }
  } else if (Array.isArray(rawHouses)) {
    // If backend returns array of numbers
    rawHouses.forEach((hv, idx) => {
      const houseNumber = idx + 1;
      if (houseNumber < 1 || houseNumber > 12) return;
      const cusp = coerceChartNumber(hv, 0);
      houses.push({
        number: houseNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
        cusp,
        sign: 'aries',
      });
    });
  }

  // Aspects
  console.log(
    '🔗 Processing aspects from backend...',
    (raw as BackendChartResponse)['aspects']
  );
  // Handle aspects with robust backend field mapping
  const aspects: Aspect[] = [];
  const rawAspects: unknown[] = Array.isArray(
    (raw as BackendChartResponse)['aspects']
  )
    ? ((raw as BackendChartResponse)['aspects'] as unknown[])
    : [];
  console.log(`📊 Found ${rawAspects.length} raw aspects`);

  for (const aspect of rawAspects) {
    if (!isChartObject(aspect)) continue;
    const a = aspect as BackendChartAspect;
    // Shape A: point1/point2 + aspect (new backend)
    if (
      a.point1 &&
      a.point2 &&
      a.aspect &&
      typeof a.orb === 'number' &&
      isPlanetName(a.point1) &&
      isPlanetName(a.point2) &&
      typeof a.aspect === 'string' &&
      isAspectType(a.aspect)
    ) {
      aspects.push({
        aspect_type: a.aspect,
        planet1: a.point1,
        planet2: a.point2,
        orb: a.orb,
        applying: Boolean(a.applying),
        exact: Boolean(a.exact),
        power: typeof a.power === 'number' ? a.power : undefined,
      });
      continue;
    }
    // Shape B: planet1/planet2 + type (legacy charts endpoint mock)
    if (
      a.planet1 &&
      a.planet2 &&
      a.type &&
      typeof a.orb === 'number' &&
      isPlanetName(a.planet1) &&
      isPlanetName(a.planet2) &&
      typeof a.type === 'string' &&
      isAspectType(a.type)
    ) {
      aspects.push({
        aspect_type: a.type,
        planet1: a.planet1,
        planet2: a.planet2,
        orb: a.orb,
        applying: Boolean(a.applying),
        exact: Boolean(a.exact),
        power: typeof a.power === 'number' ? a.power : undefined,
      });
      continue;
    }
  }
  console.log(`🎯 Final aspects count: ${aspects.length}`);

  // Process asteroids if they exist in the backend response
  console.log(
    '🌌 Processing asteroids from backend...',
    (raw as BackendChartResponse)['asteroids']
  );
  const major_asteroids: Record<string, Planet> = {};
  const minor_asteroids: Record<string, Planet> = {};
  const rawAsteroids = (raw as BackendChartResponse)['asteroids'];
  if (rawAsteroids && typeof rawAsteroids === 'object') {
    // Define major asteroids
    const majorAsteroidNames = ['chiron', 'ceres', 'pallas', 'juno', 'vesta'];

    Object.entries(rawAsteroids).forEach(([name, asteroidData]) => {
      if (asteroidData && typeof asteroidData === 'object') {
        const data = asteroidData;
        const position = typeof data.position === 'number' ? data.position : 0;
        const asteroid: Planet = {
          name: name as PlanetName, // Cast to PlanetName
          position,
          retrograde: Boolean(data.retrograde),
          speed: typeof data.speed === 'number' ? data.speed : 0,
          sign: data.sign ?? getSignFromDegrees(position),
          house:
            typeof data.house === 'number'
              ? data.house
              : calculateHousePosition(position, houseCusps),
        };

        // Split into major and minor asteroids
        if (majorAsteroidNames.includes(name.toLowerCase())) {
          major_asteroids[name] = asteroid;
          console.log(
            `⭐ Added MAJOR asteroid ${name}: ${position}° → ${asteroid.sign} (House ${asteroid.house})`
          );
        } else {
          minor_asteroids[name] = asteroid;
          console.log(
            `🌌 Added minor asteroid ${name}: ${position}° → ${asteroid.sign} (House ${asteroid.house})`
          );
        }
      }
    });
  }
  console.log(
    `🌟 Final major asteroids count: ${Object.keys(major_asteroids).length}`
  );
  console.log(
    `🌌 Final minor asteroids count: ${Object.keys(minor_asteroids).length}`
  );

  // Process points (lunar nodes, lilith, etc.) if they exist in the backend response
  console.log(
    '📍 Processing points from backend...',
    (raw as BackendChartResponse)['points']
  );
  const points: Record<string, Planet> = {};
  const rawPoints = (raw as BackendChartResponse)['points'];
  if (rawPoints && typeof rawPoints === 'object') {
    Object.entries(rawPoints).forEach(([name, pointData]) => {
      if (pointData && typeof pointData === 'object') {
        const data = pointData;
        const position = typeof data.position === 'number' ? data.position : 0;
        const point: Planet = {
          name: name as PlanetName, // Cast to PlanetName
          position,
          retrograde: Boolean(data.retrograde),
          speed: typeof data.speed === 'number' ? data.speed : 0,
          sign: data.sign ?? getSignFromDegrees(position),
          house:
            typeof data.house === 'number'
              ? data.house
              : calculateHousePosition(position, houseCusps),
        };

        points[name] = point;
        console.log(
          `📍 Added point ${name}: ${position}° → ${point.sign} (House ${point.house})`
        );
      }
    });
  }
  console.log(`📍 Final points count: ${Object.keys(points).length}`);

  const defaultAsc = houses[0]?.cusp ?? 0;
  const defaultMc = houses[9]?.cusp ?? 0;
  const anglesCandidate = raw['angles'];
  const anglesRaw: Record<string, unknown> | undefined = isChartObject(
    anglesCandidate
  )
    ? anglesCandidate
    : undefined;
  console.log('📐 Processing angles from backend...', anglesRaw);
  const angles =
    anglesRaw &&
    typeof anglesRaw['ascendant'] === 'number' &&
    typeof anglesRaw['mc'] === 'number' &&
    typeof anglesRaw['descendant'] === 'number' &&
    typeof anglesRaw['ic'] === 'number'
      ? {
          ascendant: anglesRaw['ascendant'],
          midheaven: anglesRaw['mc'], // Backend uses 'mc' for midheaven
          descendant: anglesRaw['descendant'],
          imumcoeli: anglesRaw['ic'], // Backend uses 'ic' for imum coeli
          // Add additional angles if available
          vertex:
            typeof anglesRaw['vertex'] === 'number'
              ? anglesRaw['vertex']
              : undefined,
          antivertex:
            typeof anglesRaw['antivertex'] === 'number'
              ? anglesRaw['antivertex']
              : undefined,
          part_of_fortune:
            typeof anglesRaw['part_of_fortune'] === 'number'
              ? anglesRaw['part_of_fortune']
              : undefined,
        }
      : {
          ascendant: defaultAsc,
          midheaven: defaultMc,
          descendant: defaultAsc + 180,
          imumcoeli: defaultMc + 180,
        };

  // Handle required fields with defaults
  const latitude = typeof raw['latitude'] === 'number' ? raw['latitude'] : 0;
  const longitude = typeof raw['longitude'] === 'number' ? raw['longitude'] : 0;
  const timezone =
    typeof raw['timezone'] === 'string' ? raw['timezone'] : 'UTC';
  const julian_day =
    typeof raw['julian_day'] === 'number' ? raw['julian_day'] : 0;
  const house_system =
    typeof raw['house_system'] === 'string'
      ? (raw['house_system'] as 'placidus')
      : 'placidus';

  return {
    planets: planets as Record<PlanetName, Planet>,
    houses: houses.sort((a, b) => (a.number || 0) - (b.number || 0)),
    aspects, // Now properly transformed aspects
    asteroids: { ...major_asteroids, ...minor_asteroids }, // Combine major and minor asteroids
    points, // Add points (nodes, lilith, etc.)
    angles,
    latitude,
    longitude,
    timezone,
    julian_day,
    house_system,
    // CRITICAL FIX: Preserve raw backend data for ChartDisplay normalizeChart
    ...({ __raw_backend_response: raw } as Record<string, unknown>), // Pass through original backend response
  } as ChartData;
};

export const fetchNatalChart = async (
  birthData: ChartBirthData
): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🔮 Fetching natal chart...');
  devConsole.log?.('📊 Natal chart data input:', birthData);
  try {
    const response = await apiClient.post('/natal-chart', birthData);
    devConsole.log?.('✅ Natal chart response received:', response);
    return ok(response);
  } catch (err) {
    devConsole.error('❌ Error fetching natal chart:', err);
    return toFailure(err, {
      auth: 'Authentication required to fetch natal chart',
      notFound: 'Natal chart not found',
      defaultMsg: 'Failed to fetch natal chart',
    });
  }
};

export const fetchSynastryAnalysis = async (
  person1: ChartBirthData,
  person2: ChartBirthData
): Promise<ApiResult<unknown>> => {
  devConsole.log?.('💫 Fetching synastry analysis...');
  devConsole.log?.('📊 Person 1 data:', person1);
  devConsole.log?.('📊 Person 2 data:', person2);
  // Unified backend route: /api/synastry/calculate-synastry (router mounted at /api)
  try {
    const response = await apiClient.post('/synastry/calculate-synastry', {
      person1,
      person2,
    });
    devConsole.log?.('✅ Synastry analysis response received:', response);
    return ok(response);
  } catch (err) {
    devConsole.error('❌ Error fetching synastry analysis:', err);
    return toFailure(err, {
      auth: 'Authentication required to fetch synastry analysis',
      validation: 'Invalid synastry request data',
      defaultMsg: 'Failed to fetch synastry analysis',
    });
  }
};

// AI Interpretation API Functions
export const fetchAIInterpretations = async (
  chartId: ChartId,
  userId: UserId
): Promise<ApiResult<InterpretationResponse>> => {
  devConsole.log?.('🤖 Fetching AI interpretations...');
  devConsole.log?.('📊 Chart ID:', chartId, 'User ID:', userId);

  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<InterpretationResponse>(
      `${BACKEND_URL}/api/interpretations`,
      {
        chartId,
        userId,
      },
      { headers }
    );

    devConsole.log?.('✅ AI interpretations response received:', response.data);
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error fetching AI interpretations:', err);
    return toFailure(err, {
      auth: 'Authentication required to view interpretations',
      defaultMsg: 'Failed to fetch AI interpretations',
    });
  }
};

export const generateAIInterpretation = async (
  request: InterpretationRequest
): Promise<ApiResult<InterpretationResponse>> => {
  devConsole.log?.('🔮 Generating AI interpretation...');
  devConsole.log?.('📊 Request data:', request);

  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<InterpretationResponse>(
      `${BACKEND_URL}/api/interpretations/generate`,
      request,
      { headers }
    );

    devConsole.log?.('✅ AI interpretation generated:', response.data);
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error generating AI interpretation:', err);
    return toFailure(err, {
      auth: 'Authentication required to generate interpretations',
      defaultMsg: 'Failed to generate AI interpretation',
    });
  }
};

export const fetchInterpretationById = async (
  interpretationId: InterpretationId
): Promise<ApiResult<Interpretation>> => {
  devConsole.log?.('🔮 Fetching interpretation by ID...');
  try {
    const headers = await getAuthHeaders();
    interface InterpretationByIdResponse {
      data: Interpretation;
      success?: boolean;
    }
    const response = await axios.get<InterpretationByIdResponse>(
      `${BACKEND_URL}/api/interpretations/${interpretationId}`,
      { headers }
    );

    devConsole.log?.('✅ Interpretation fetched:', response.data);
    return ok(response.data.data);
  } catch (err) {
    devConsole.error('❌ Error fetching interpretation:', err);
    return toFailure(err, {
      auth: 'Authentication required to view interpretation',
      notFound: 'Interpretation not found',
      defaultMsg: 'Failed to fetch interpretation',
    });
  }
};

export const deleteInterpretation = async (
  interpretationId: InterpretationId
): Promise<void> => {
  devConsole.log?.('🗑️ Deleting interpretation...');
  try {
    const headers = await getAuthHeaders();
    await axios.delete(
      `${BACKEND_URL}/api/interpretations/${interpretationId}`,
      { headers }
    );

    devConsole.log?.('✅ Interpretation deleted successfully');
  } catch (err) {
    devConsole.error('❌ Error deleting interpretation:', err);
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      throw new AuthenticationError(
        'Authentication required to delete interpretation'
      );
    } else if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new NotFoundError('Interpretation', String(interpretationId));
    }
    throw new Error('Failed to delete interpretation');
  }
};

export const updateInterpretation = async (
  interpretationId: InterpretationId,
  updates: Partial<Interpretation>
): Promise<ApiResult<Interpretation>> => {
  devConsole.log?.('✏️ Updating interpretation...');
  try {
    const headers = await getAuthHeaders();
    interface InterpretationByIdResponse {
      data: Interpretation;
      success?: boolean;
    }
    const response = await axios.patch<InterpretationByIdResponse>(
      `${BACKEND_URL}/api/interpretations/${interpretationId}`,
      updates,
      { headers }
    );

    devConsole.log?.('✅ Interpretation updated:', response.data);
    return ok(response.data.data);
  } catch (err) {
    devConsole.error('❌ Error updating interpretation:', err);
    return toFailure(err, {
      auth: 'Authentication required to update interpretation',
      notFound: 'Interpretation not found',
      validation: 'Invalid interpretation update data',
      defaultMsg: 'Failed to update interpretation',
    });
  }
};
