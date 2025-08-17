/* eslint-disable no-console */
import axios from 'axios';
import { toUnifiedBirthData, type AnyBirthInput, type ChartBirthData } from '@cosmichub/types';
import { auth } from '@cosmichub/config/firebase';
import type { GeneKeysData } from '../components/GeneKeysChart/types';
import type { HumanDesignData } from '../components/HumanDesignChart/types';
import {
  type ApiResponse,
  type ApiSuccessResponse,
  type ApiErrorResponse,
  type ChartId,
  type UserId,
  type InterpretationId,
  type SavedChart,
  type SavedChartsResponse,
  type SaveChartRequest,
  type SaveChartResponse,
  type Interpretation,
  type InterpretationRequest,
  type InterpretationResponse,
  // Import ChartData as ChartDataType to avoid conflict
  type ChartData as ChartDataType,
  AuthenticationError,
  NotFoundError,
  ValidationError
} from './api.types';

// Re-export types from api.types
export * from './api.types';

// Narrow import.meta.env access to avoid implicit any
const rawApiUrl: string | undefined =
  typeof import.meta.env?.VITE_API_URL === 'string'
    ? import.meta.env.VITE_API_URL
    : undefined;
let resolvedApi = '';
if (typeof rawApiUrl === 'string') {
  const trimmed = rawApiUrl.trim();
  if (trimmed.length > 0) {
    resolvedApi = trimmed;
  }
}
const BACKEND_URL: string = resolvedApi !== '' ? resolvedApi : 'http://localhost:8000';

console.log('🔗 API Service initializing...');
console.log('🌐 Backend URL:', BACKEND_URL);

// Helper function to get current auth token
// Lightweight auth shape to avoid relying on any typed firebase re-export
// Firebase user surface we rely on (declared for documentation; value via import)
// interface AuthLikeUser { getIdToken(forceRefresh?: boolean): Promise<string>; }

export const getAuthToken = async (): Promise<string | null> => {
  console.log('🔑 Getting auth token...');
  const user = auth.currentUser;
  
  // In development, allow mock authentication
  if (import.meta.env.DEV && !user) {
    console.log('🧪 Using development mock token');
    return 'mock-dev-token';
  }
  
  if (!user) {
    console.warn('⚠️ No authenticated user found');
    return null;
  }
  
  try {
    console.log('🔄 Refreshing auth token...');
    // Force refresh token to ensure it's valid
    const token = await user.getIdToken(true);
    console.log('✅ Auth token obtained successfully');
    return token;
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
    return null;
  }
};

// Helper function to create authorized headers
type AuthHeaders = Record<string, string>;
const getAuthHeaders = async (): Promise<AuthHeaders> => {
  console.log('📝 Creating auth headers...');
  const token = await getAuthToken();
  if (token === null) {
    console.error('❌ Authentication required but no token available');
    throw new AuthenticationError('Authentication required');
  }
  console.log('✅ Auth headers created');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// API Functions for Saved Charts
export const fetchSavedCharts = async (): Promise<SavedChart[]> => {
  console.log('📊 Fetching saved charts...');
  
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.get<SavedChartsResponse>(`${BACKEND_URL}/api/charts/`, { headers });
    console.log('✅ Saved charts fetched successfully:', data);
    return Array.isArray(data.charts) ? data.charts : [];
  } catch (error) {
    console.error('❌ Error fetching saved charts:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to view saved charts');
    }
    throw new Error('Failed to fetch saved charts');
  }
};

export const saveChart = async (chartData: SaveChartRequest): Promise<SaveChartResponse> => {
  console.log('💾 Saving chart...', chartData);
  
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post<SaveChartResponse>(`${BACKEND_URL}/api/charts/save-chart`, chartData, { headers });
    console.log('✅ Chart saved successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error saving chart:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to save charts');
    }
    throw new Error('Failed to save chart');
  }
};

export const deleteChart = async (chartId: ChartId): Promise<void> => {
  console.log(`🗑️ Deleting chart: ${chartId}`);
  
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${BACKEND_URL}/api/charts/${chartId}`, {
      headers
    });
    
    console.log('✅ Chart deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting chart:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to delete charts');
    }
    throw new Error('Failed to delete chart');
  }
};

export const apiClient = {
  get: async <T = unknown>(endpoint: string): Promise<T> => {
    console.log('📡 API GET request:', endpoint);
    const url = `${BACKEND_URL}${endpoint}`;
    console.log('🌐 Full URL:', url);
    
    try {
      const response = await fetch(url);
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ HTTP error:', response.status, response.statusText);
        
        // Map HTTP status code to appropriate error
        if (response.status === 401) {
          throw new AuthenticationError();
        } else if (response.status === 404) {
          throw new NotFoundError(endpoint);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data: unknown = await response.json();
      console.log('✅ GET response data:', data);
      return data as T;
    } catch (error) {
      console.error('❌ GET request failed:', error);
      throw error;
    }
  },
  
  post: async <T = unknown>(endpoint: string, body: unknown): Promise<T> => {
    console.log('📡 API POST request:', endpoint);
    console.log('📤 Request data:', body);
    const url = `${BACKEND_URL}${endpoint}`;
    console.log('🌐 Full URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ HTTP error:', response.status, response.statusText);
        
        // Map HTTP status code to appropriate error
        if (response.status === 401) {
          throw new AuthenticationError();
        } else if (response.status === 404) {
          throw new NotFoundError(endpoint);
        } else if (response.status === 400) {
          throw new ValidationError('Invalid request data');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const responseData: unknown = await response.json();
      console.log('✅ POST response data:', responseData);
      return responseData as T;
    } catch (error) {
      console.error('❌ POST request failed:', error);
      throw error;
    }
  }
};

export const fetchChart = async (data: Record<string, unknown>): Promise<unknown> => {
  console.log('🔮 Fetching chart data...');
  console.log('📊 Chart data input:', data);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making chart request to /calculate-multi-system');
    const response = await axios.post(`${BACKEND_URL}/calculate-multi-system`, data, { headers });
    console.log('✅ Chart response received:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error fetching chart:', error);
    throw error;
  }
};

export const fetchPersonalityAnalysis = async (userId: UserId): Promise<unknown> => {
  console.log('🧠 Fetching personality analysis for user:', userId);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making personality analysis request to /api/analyze/personality/');
    const response = await axios.get(`${BACKEND_URL}/api/analyze/personality/${userId}`, { headers });
    console.log('✅ Personality analysis response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching personality analysis:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to access personality analysis');
    } else if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new NotFoundError(`Personality analysis for user ${userId}`);
    }
    throw new Error('Failed to fetch personality analysis');
  }
};

export const fetchNumerology = async (data: Record<string, unknown>): Promise<unknown> => {
  console.log('🔢 Fetching numerology data...');
  console.log('📊 Numerology data input:', data);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making numerology request to /calculate-numerology');
    const response = await axios.post(`${BACKEND_URL}/calculate-numerology`, data, { headers });
    console.log('✅ Numerology response received:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error fetching numerology:', error);
    throw error;
  }
};

export const calculateHumanDesign = async (data: AnyBirthInput): Promise<{ human_design: HumanDesignData }> => {
  console.log('🧬 Calculating Human Design chart...');
  console.log('📊 Human Design input:', data);

  try {
    const unifiedData = toUnifiedBirthData(data);
    const headers = await getAuthHeaders();
    const response = await axios.post<{ human_design: HumanDesignData }>(
      `${BACKEND_URL}/api/human-design/calculate`, 
      unifiedData, 
      { headers }
    );
    
    console.log('✅ Human Design calculation successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calculating Human Design chart:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to calculate Human Design chart');
    } else if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new ValidationError('Invalid birth data for Human Design calculation');
    }
    throw new Error('Failed to calculate Human Design chart');
  }
};

export const getHumanDesignProfile = async (userId: UserId): Promise<unknown> => {
  console.log('🧬 Fetching Human Design profile for user:', userId);

  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BACKEND_URL}/api/human-design/profile/${userId}`, { headers });
    
    console.log('✅ Human Design profile retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching Human Design profile:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to access Human Design profile');
    } else if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new NotFoundError(`Human Design profile for user ${userId}`);
    }
    throw new Error('Failed to fetch Human Design profile');
  }
};

export const calculateGeneKeys = async (data: AnyBirthInput): Promise<GeneKeysData> => {
  console.log('🧬 Calculating Gene Keys...');
  try {
    const unifiedData = toUnifiedBirthData(data);
    console.log('📊 Gene Keys input:', unifiedData);
    const headers = await getAuthHeaders();
    console.log('📡 Making Gene Keys request to /gene-keys/calculate');
    const response = await axios.post<GeneKeysData>(`${BACKEND_URL}/api/gene-keys/calculate`, unifiedData, { headers });
    console.log('✅ Gene Keys response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calculating Gene Keys:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to calculate Gene Keys');
    } else if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new ValidationError('Invalid birth data for Gene Keys calculation');
    }
    throw new Error('Failed to calculate Gene Keys');
  }
};

export const getGeneKeysProfile = async (userId: UserId): Promise<unknown> => {
  console.log('�️ Getting Gene Keys profile for user:', userId);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making Gene Keys profile request to /gene-keys/profile/');
    const response = await axios.get(`${BACKEND_URL}/api/gene-keys/profile/${userId}`, { headers });
    console.log('✅ Gene Keys profile response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching Gene Keys profile:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to access Gene Keys profile');
    } else if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new NotFoundError(`Gene Keys profile for user ${userId}`);
    }
    throw new Error('Failed to fetch Gene Keys profile');
  }
};

export const getContemplationProgress = async (userId: UserId): Promise<unknown> => {
  console.log('🧘 Getting contemplation progress for user:', userId);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making contemplation progress request to /gene-keys/contemplation/');
    const response = await axios.get(`${BACKEND_URL}/api/gene-keys/contemplation/${userId}`, { headers });
    console.log('✅ Contemplation progress response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching contemplation progress:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to access contemplation progress');
    } else if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new NotFoundError(`Contemplation progress for user ${userId}`);
    }
    throw new Error('Failed to fetch contemplation progress');
  }
};

// Chart data interfaces for type safety
// ChartBirthData now sourced from shared UnifiedBirthData (re-exported as ChartBirthData)

export interface Planet {
  name: string;
  position: number; // Degree in zodiac (0-360)
  retrograde?: boolean;
  speed?: number;
}

export interface House {
  number: number;
  cusp: number; // Degree position
  sign: string;
}

// Use the imported ChartDataType as ChartData to avoid conflicts
export type ChartData = ChartDataType;

// Enhanced chart fetching function that hits the /calculate endpoint
export const fetchChartData = async (birthData: ChartBirthData): Promise<ChartData> => {
  console.log('🔮 Fetching chart data from /calculate endpoint...');
  console.log('📊 Chart data input:', birthData);
  
  try {
    const response = await apiClient.post('/calculate', birthData);
    console.log('✅ Chart response received:', response);
    
    // Transform backend response to frontend format
    const transformedData = transformBackendResponse(response);
    console.log('🔄 Transformed chart data:', transformedData);
    
    return transformedData;
  } catch (error) {
    console.error('❌ Error fetching chart data:', error);
    throw error;
  }
};

// Re-export core types for backward compatibility
export type { ChartBirthData };

// Transform backend response to match ChartData interface safely
interface BackendPlanetLike {
  position?: unknown;
  longitude?: unknown;
  retrograde?: unknown;
  speed?: unknown;
}

type BackendPlanets = Record<string, unknown> | undefined;

type BackendHouses = Record<string, unknown> | unknown[] | undefined; // backend may return array or keyed object

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const coerceNumber = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

const transformBackendResponse = (backendResponse: unknown): ChartData => {
  if (!isObject(backendResponse)) {
    return {
      planets: {},
      houses: [],
      aspects: [],
      angles: { ascendant: 0, midheaven: 0, descendant: 180, imumcoeli: 180 }
    };
  }

  const raw = backendResponse;

  // Planets
  const planets: Record<string, Planet> = {};
  const rawPlanets: BackendPlanets = isObject(raw.planets) ? (raw.planets) : undefined;
  if (rawPlanets) {
    for (const [name, value] of Object.entries(rawPlanets)) {
      const p = isObject(value) ? (value as BackendPlanetLike) : {};
      const position = typeof p.position === 'number'
        ? p.position
        : (typeof p.longitude === 'number' ? p.longitude : 0);
      planets[name] = {
        name,
        position,
        retrograde: Boolean(p.retrograde),
        speed: typeof p.speed === 'number' ? p.speed : 0
      };
    }
  }

  // Houses
  const houses: House[] = [];
  const rawHouses: BackendHouses = raw.houses as BackendHouses;
  if (isObject(rawHouses)) {
    for (const [houseKey, houseValue] of Object.entries(rawHouses)) {
      const houseNumber = houseKey.includes('house_') ? parseInt(houseKey.replace('house_', '')) : parseInt(houseKey, 10);
      if (Number.isNaN(houseNumber)) continue;
      let cusp = 0;
      let sign = '';
      if (typeof houseValue === 'number') {
        cusp = houseValue;
      } else if (isObject(houseValue)) {
        cusp = coerceNumber((houseValue).cusp, 0);
        const signVal = (houseValue).sign;
        if (typeof signVal === 'string') sign = signVal;
      }
      houses.push({ number: houseNumber, cusp, sign });
    }
  } else if (Array.isArray(rawHouses)) {
    // If backend returns array of numbers
    rawHouses.forEach((hv, idx) => {
      const cusp = coerceNumber(hv, 0);
      houses.push({ number: idx + 1, cusp, sign: '' });
    });
  }

  const aspects: unknown[] = Array.isArray(raw.aspects) ? (raw.aspects as unknown[]) : [];

  const defaultAsc = houses[0]?.cusp ?? 0;
  const defaultMc = houses[9]?.cusp ?? 0;
  const anglesRaw = isObject(raw.angles) ? raw.angles : undefined;
  const angles = anglesRaw &&
    typeof anglesRaw.ascendant === 'number' &&
    typeof anglesRaw.midheaven === 'number' &&
    typeof anglesRaw.descendant === 'number' &&
    typeof anglesRaw.imumcoeli === 'number'
    ? anglesRaw as { ascendant: number; midheaven: number; descendant: number; imumcoeli: number }
    : {
        ascendant: defaultAsc,
        midheaven: defaultMc,
        descendant: defaultAsc + 180,
        imumcoeli: defaultMc + 180
      };

  return {
    planets,
    houses: houses.sort((a, b) => a.number - b.number),
    aspects,
    angles,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : undefined,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : undefined,
    timezone: typeof raw.timezone === 'string' ? raw.timezone : undefined,
    julian_day: typeof raw.julian_day === 'number' ? raw.julian_day : undefined
  };
};

export const fetchNatalChart = async (birthData: Record<string, unknown>): Promise<unknown> => {
  console.log('🌟 Fetching natal chart...');
  console.log('📊 Natal chart data input:', birthData);
  const response = await apiClient.post('/natal-chart', birthData);
  console.log('✅ Natal chart response received:', response);
  return response;
};

export const fetchSynastryAnalysis = async (person1: Record<string, unknown>, person2: Record<string, unknown>): Promise<unknown> => {
  console.log('💑 Fetching synastry analysis...');
  console.log('📊 Person 1 data:', person1);
  console.log('📊 Person 2 data:', person2);
  // Unified backend route: /api/synastry/calculate-synastry (router mounted at /api)
  const response = await apiClient.post('/synastry/calculate-synastry', { person1, person2 });
  console.log('✅ Synastry analysis response received:', response);
  return response;
};

// AI Interpretation API Functions
export const fetchAIInterpretations = async (chartId: ChartId, userId: UserId): Promise<InterpretationResponse> => {
  console.log('🤖 Fetching AI interpretations...');
  console.log('📊 Chart ID:', chartId, 'User ID:', userId);
  
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<InterpretationResponse>(`${BACKEND_URL}/api/interpretations`, {
      chartId,
      userId
    }, { headers });
    
    console.log('✅ AI interpretations response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching AI interpretations:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to view interpretations');
    }
    throw new Error('Failed to fetch AI interpretations');
  }
};

export const generateAIInterpretation = async (request: InterpretationRequest): Promise<InterpretationResponse> => {
  console.log('🔮 Generating AI interpretation...');
  console.log('📊 Request data:', request);
  
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<InterpretationResponse>(`${BACKEND_URL}/api/interpretations/generate`, request, { headers });
    
    console.log('✅ AI interpretation generated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error generating AI interpretation:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to generate interpretations');
    }
    throw new Error('Failed to generate AI interpretation');
  }
};

export const fetchInterpretationById = async (interpretationId: InterpretationId): Promise<Interpretation> => {
  console.log('🔍 Fetching interpretation by ID:', interpretationId);
  
  try {
    const headers = await getAuthHeaders();
    interface InterpretationByIdResponse { data: Interpretation; success?: boolean }
    const response = await axios.get<InterpretationByIdResponse>(`${BACKEND_URL}/api/interpretations/${interpretationId}`, { headers });
    
    console.log('✅ Interpretation fetched:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error fetching interpretation:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to view interpretation');
    } else if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new NotFoundError(`Interpretation ${interpretationId}`);
    }
    throw new Error('Failed to fetch interpretation');
  }
};

export const deleteInterpretation = async (interpretationId: InterpretationId): Promise<void> => {
  console.log('🗑️ Deleting interpretation:', interpretationId);
  
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${BACKEND_URL}/api/interpretations/${interpretationId}`, { headers });
    
    console.log('✅ Interpretation deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting interpretation:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to delete interpretation');
    } else if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new NotFoundError(`Interpretation ${interpretationId}`);
    }
    throw new Error('Failed to delete interpretation');
  }
};

export const updateInterpretation = async (
  interpretationId: InterpretationId, 
  updates: Partial<Interpretation>
): Promise<Interpretation> => {
  console.log('📝 Updating interpretation:', interpretationId, updates);
  
  try {
    const headers = await getAuthHeaders();
    interface InterpretationByIdResponse { data: Interpretation; success?: boolean }
    const response = await axios.patch<InterpretationByIdResponse>(
      `${BACKEND_URL}/api/interpretations/${interpretationId}`, 
      updates, 
      { headers }
    );
    
    console.log('✅ Interpretation updated:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error updating interpretation:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to update interpretation');
    } else if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new NotFoundError(`Interpretation ${interpretationId}`);
    } else if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new ValidationError('Invalid interpretation update data');
    }
    throw new Error('Failed to update interpretation');
  }
};