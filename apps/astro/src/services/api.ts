import axios from 'axios';
import { ok, toFailure, type ApiResult } from '@cosmichub/config';
import { devConsole } from '../config/environment';
import { toUnifiedBirthData, type AnyBirthInput, type ChartBirthData } from '@cosmichub/types';
import { auth } from '@cosmichub/config/firebase';
import type { GeneKeysData } from '../components/GeneKeysChart/types';
import type { HumanDesignData } from '../components/HumanDesignChart/types';
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
  ValidationError
} from './api.types';

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

type BackendChartPlanets = Record<PlanetName, BackendChartPlanet>;

type BackendChartHouses = Record<string, { cusp?: number; sign?: ZodiacSign }> | number[];

const isChartObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const coerceChartNumber = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const isZodiacSign = (v: unknown): v is ZodiacSign => 
  typeof v === 'string' && ZODIAC_SIGNS.includes(v as ZodiacSign);

const PLANET_NAMES: readonly PlanetName[] = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto', 'chiron', 'north_node', 'south_node'
];

const isPlanetName = (v: unknown): v is PlanetName =>
  typeof v === 'string' && PLANET_NAMES.includes(v as PlanetName);

// Re-export types from api.types
export * from './api.types';
// Re-export local ApiResult for consumers
export type { ApiResult } from '@cosmichub/config';

const getDefaultPlanets = (): Record<PlanetName, Planet> => ({
  sun: { name: 'sun', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  moon: { name: 'moon', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  mercury: { name: 'mercury', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  venus: { name: 'venus', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  mars: { name: 'mars', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  jupiter: { name: 'jupiter', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  saturn: { name: 'saturn', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  uranus: { name: 'uranus', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  neptune: { name: 'neptune', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  pluto: { name: 'pluto', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  chiron: { name: 'chiron', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  north_node: { name: 'north_node', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 },
  south_node: { name: 'south_node', position: 0, retrograde: false, speed: 0, sign: 'aries', house: 1 }
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
const BACKEND_URL: string = resolvedApi !== '' ? resolvedApi : 'http://localhost:8000';

devConsole.log?.('🔗 API Service initializing...');
devConsole.log?.('🌐 Backend URL:', BACKEND_URL);

// Helper function to get current auth token
// Lightweight auth shape to avoid relying on any typed firebase re-export
// Firebase user surface we rely on (declared for documentation; value via import)
// interface AuthLikeUser { getIdToken(forceRefresh?: boolean): Promise<string>; }

export const getAuthToken = async (): Promise<string | null> => {
  devConsole.log?.('🔑 Getting auth token...');
  const user = auth.currentUser;
  
  // In development, allow mock authentication
  if (import.meta.env.DEV === true && (user === null || user === undefined)) {
    devConsole.log?.('🧪 Using development mock token');
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
    return null;
  }
};

// Helper function to create authorized headers
type AuthHeaders = Record<string, string>;
const getAuthHeaders = async (): Promise<AuthHeaders> => {
  devConsole.log?.('📝 Creating auth headers...');
  const token = await getAuthToken();
  if (token === null || token === undefined) {
  devConsole.error('❌ Authentication required but no token available');
    throw new AuthenticationError('Authentication required');
  }
  devConsole.log?.('✅ Auth headers created');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// API Functions for Saved Charts
export const fetchSavedCharts = async (): Promise<ApiResult<SavedChart[]>> => {
  devConsole.log?.('📊 Fetching saved charts...');
  
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.get<SavedChartsResponse>(`${BACKEND_URL}/api/charts/`, { headers });
  devConsole.log?.('✅ Saved charts fetched successfully:', data);
    return ok(Array.isArray(data.charts) ? data.charts : []);
  } catch (error) {
  devConsole.error('❌ Error fetching saved charts:', error);
    return toFailure(error, {
      auth: 'Authentication required to view saved charts',
      defaultMsg: 'Failed to fetch saved charts'
    });
  }
};

export const saveChart = async (chartData: SaveChartRequest): Promise<ApiResult<SaveChartResponse>> => {
  devConsole.log?.('💾 Saving chart...', chartData);
  
  try {
    const headers = await getAuthHeaders();
    const { data } = await axios.post<SaveChartResponse>(`${BACKEND_URL}/api/charts/save-chart`, chartData, { headers });
  devConsole.log?.('✅ Chart saved successfully:', data);
    return ok(data);
  } catch (error) {
  devConsole.error('❌ Error saving chart:', error);
    return toFailure(error, {
      auth: 'Authentication required to save charts',
      defaultMsg: 'Failed to save chart'
    });
  }
};

export const deleteChart = async (chartId: ChartId): Promise<ApiResult<null>> => {
  devConsole.log?.(`🗑️ Deleting chart: ${chartId}`);
  
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${BACKEND_URL}/api/charts/${chartId}`, { headers });
  devConsole.log?.('✅ Chart deleted successfully');
    return ok(null);
  } catch (error) {
  devConsole.error('❌ Error deleting chart:', error);
    return toFailure(error, {
      auth: 'Authentication required to delete charts',
      defaultMsg: 'Failed to delete chart'
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
  devConsole.error('❌ HTTP error:', response.status, response.statusText);
        
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
    } catch (error) {
  devConsole.error('❌ GET request failed:', error);
      throw error;
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
  devConsole.error('❌ HTTP error:', response.status, response.statusText);
        
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
    } catch (error) {
  devConsole.error('❌ POST request failed:', error);
      throw error;
    }
  }
};

export interface MultiSystemResponse {
  astrology?: ChartData;
  numerology?: unknown;
  human_design?: HumanDesignData;
  gene_keys?: GeneKeysData;
}

// Uses shared toFailure from @cosmichub/config

export const fetchChart = async (data: ChartBirthData): Promise<ApiResult<MultiSystemResponse>> => {
  devConsole.log?.('🔮 Fetching chart data...');
  devConsole.log?.('📊 Chart data input:', data);
  try {
    const headers = await getAuthHeaders();
  devConsole.log?.('📡 Making chart request to /calculate-multi-system');
    const { data: responseData } = await axios.post<MultiSystemResponse>(
      `${BACKEND_URL}/calculate-multi-system`, 
      data, 
      { headers }
    );
  devConsole.log?.('✅ Chart response received:', responseData);
    return ok(responseData);
  } catch (error) {
  devConsole.error('❌ Error fetching chart:', error);
    return toFailure(error, { auth: 'Authentication required to fetch chart', defaultMsg: 'Failed to fetch chart data' });
  }
};

export const fetchPersonalityAnalysis = async (userId: UserId): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🧠 Fetching personality analysis for user:', userId);
  try {
    const headers = await getAuthHeaders();
  devConsole.log?.('📡 Making personality analysis request to /api/analyze/personality/');
    const response = await axios.get(`${BACKEND_URL}/api/analyze/personality/${userId}`, { headers });
  devConsole.log?.('✅ Personality analysis response received:', response.data);
    return ok(response.data);
  } catch (error) {
  devConsole.error('❌ Error fetching personality analysis:', error);
    return toFailure(error, {
      auth: 'Authentication required to access personality analysis',
      notFound: 'Personality analysis not found',
      defaultMsg: 'Failed to fetch personality analysis'
    });
  }
};

export const fetchNumerology = async (data: Record<string, unknown>): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🔢 Fetching numerology data...');
  devConsole.log?.('📊 Numerology data input:', data);
  try {
    const headers = await getAuthHeaders();
  devConsole.log?.('📡 Making numerology request to /calculate-numerology');
    const response = await axios.post(`${BACKEND_URL}/calculate-numerology`, data, { headers });
  devConsole.log?.('✅ Numerology response received:', response.data);
    return ok(response.data);
  } catch (error) {
  devConsole.error('❌ Error fetching numerology:', error);
    return toFailure(error, { auth: 'Authentication required to fetch numerology data', defaultMsg: 'Failed to fetch numerology data' });
  }
};

export const calculateHumanDesign = async (data: AnyBirthInput): Promise<ApiResult<{ human_design: HumanDesignData }>> => {
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
  } catch (error) {
  devConsole.error('❌ Error calculating Human Design chart:', error);
    return toFailure(error, {
      auth: 'Authentication required to calculate Human Design chart',
      validation: 'Invalid birth data for Human Design calculation',
      defaultMsg: 'Failed to calculate Human Design chart'
    });
  }
};

export const getHumanDesignProfile = async (userId: UserId): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🧬 Fetching Human Design profile for user:', userId);

  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BACKEND_URL}/api/human-design/profile/${userId}`, { headers });
    
  devConsole.log?.('✅ Human Design profile retrieved:', response.data);
    return ok(response.data);
  } catch (error) {
  devConsole.error('❌ Error fetching Human Design profile:', error);
    return toFailure(error, {
      auth: 'Authentication required to access Human Design profile',
      notFound: 'Human Design profile not found',
      defaultMsg: 'Failed to fetch Human Design profile'
    });
  }
};

export const calculateGeneKeys = async (data: AnyBirthInput): Promise<ApiResult<GeneKeysData>> => {
  devConsole.log?.('🧬 Calculating Gene Keys...');
  try {
    const unifiedData = toUnifiedBirthData(data);
  devConsole.log?.('📊 Gene Keys input:', unifiedData);
    const headers = await getAuthHeaders();
  devConsole.log?.('📡 Making Gene Keys request to /gene-keys/calculate');
    const response = await axios.post<GeneKeysData>(`${BACKEND_URL}/api/gene-keys/calculate`, unifiedData, { headers });
  devConsole.log?.('✅ Gene Keys response received:', response.data);
    return ok(response.data);
  } catch (error) {
  devConsole.error('❌ Error calculating Gene Keys:', error);
    return toFailure(error, {
      auth: 'Authentication required to calculate Gene Keys',
      validation: 'Invalid birth data for Gene Keys calculation',
      defaultMsg: 'Failed to calculate Gene Keys'
    });
  }
};

export const getGeneKeysProfile = async (userId: UserId): Promise<ApiResult<unknown>> => {
  devConsole.log?.('�️ Getting Gene Keys profile for user:', userId);
  try {
    const headers = await getAuthHeaders();
  devConsole.log?.('📡 Making Gene Keys profile request to /gene-keys/profile/');
    const response = await axios.get(`${BACKEND_URL}/api/gene-keys/profile/${userId}`, { headers });
  devConsole.log?.('✅ Gene Keys profile response received:', response.data);
    return ok(response.data);
  } catch (error) {
  devConsole.error('❌ Error fetching Gene Keys profile:', error);
    return toFailure(error, {
      auth: 'Authentication required to access Gene Keys profile',
      notFound: 'Gene Keys profile not found',
      defaultMsg: 'Failed to fetch Gene Keys profile'
    });
  }
};

export const getContemplationProgress = async (userId: UserId): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🧘 Getting contemplation progress for user:', userId);
  try {
    const headers = await getAuthHeaders();
  devConsole.log?.('📡 Making contemplation progress request to /gene-keys/contemplation/');
    const response = await axios.get(`${BACKEND_URL}/api/gene-keys/contemplation/${userId}`, { headers });
  devConsole.log?.('✅ Contemplation progress response received:', response.data);
    return ok(response.data);
  } catch (error) {
  devConsole.error('❌ Error fetching contemplation progress:', error);
    return toFailure(error, {
      auth: 'Authentication required to access contemplation progress',
      notFound: 'Contemplation progress not found',
      defaultMsg: 'Failed to fetch contemplation progress'
    });
  }
};

// Chart data interfaces for type safety
// ChartBirthData now sourced from shared UnifiedBirthData (re-exported as ChartBirthData)

// Types moved to api.types.ts
export type { Planet, House } from './api.types';

// Re-export ChartData from api.types

// Enhanced chart fetching function that hits the /calculate endpoint
export const fetchChartData = async (birthData: ChartBirthData): Promise<ApiResult<ChartData>> => {
  devConsole.log?.('🔮 Fetching chart data from /calculate endpoint...');
  devConsole.log?.('📊 Chart data input:', birthData);
  
  try {
    const response = await apiClient.post('/calculate', birthData);
  devConsole.log?.('✅ Chart response received:', response);
    
    // Transform backend response to frontend format
    const transformedData = transformBackendResponse(response);
  devConsole.log?.('🔄 Transformed chart data:', transformedData);
    
  return ok(transformedData);
  } catch (error) {
  devConsole.error('❌ Error fetching chart data:', error);
  return toFailure(error, {
    auth: 'Authentication required to fetch chart data',
    notFound: 'Chart data not found',
    defaultMsg: 'Failed to fetch chart data'
  });
  }
};

// Re-export core types for backward compatibility
export type { ChartBirthData };

// Transform backend response to match ChartData interface safely
const transformBackendResponse = (backendResponse: unknown): ChartData => {
  if (!isChartObject(backendResponse)) {
    // Return a default chart with all required planets
    return {
      planets: getDefaultPlanets(),
      houses: [],
      aspects: [],
      angles: { ascendant: 0, midheaven: 0, descendant: 180, imumcoeli: 180 },
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
      julian_day: 0,
      house_system: 'placidus'
    };
  }

  const raw = backendResponse;

  // Planets
  const planets: Record<PlanetName, Planet> = getDefaultPlanets();
  // Use bracket property access (strict index signature compliance)
  const rawPlanets: BackendChartPlanets | undefined = isChartObject((raw)['planets'])
    ? (raw)['planets'] as BackendChartPlanets
    : undefined;
  if (rawPlanets) {
    for (const [name, value] of Object.entries(rawPlanets)) {
      if (isChartObject(value) && isPlanetName(name)) {
        const p = value as BackendChartPlanet;
        const position = typeof p.position === 'number'
          ? p.position
          : (typeof p.longitude === 'number' ? p.longitude : 0);
        const planetName = name;
        planets[planetName] = {
          name: planetName,
          position,
          retrograde: Boolean(p.retrograde),
          speed: typeof p.speed === 'number' ? p.speed : 0,
          sign: p.sign ?? 'aries',
          house: typeof p.house === 'number' ? p.house : 1,
          dignity: p.dignity,
          essential_dignity: p.essential_dignity
        };
      }
    }
  }

  // Houses
  const houses: House[] = [];
  const rawHouses: BackendChartHouses = (raw)['houses'] as BackendChartHouses;
  if (isChartObject(rawHouses)) {
    for (const [houseKey, houseValue] of Object.entries(rawHouses)) {
      const houseNumber = houseKey.includes('house_') ? parseInt(houseKey.replace('house_', '')) : parseInt(houseKey, 10);
      if (Number.isNaN(houseNumber) || houseNumber < 1 || houseNumber > 12) continue;
      let cusp = 0;
      let sign: ZodiacSign = 'aries'; // Default sign
      if (typeof houseValue === 'number') {
        cusp = houseValue;
      } else if (isChartObject(houseValue)) {
        cusp = coerceChartNumber((houseValue).cusp, 0);
        const signVal = (houseValue).sign;
        if (typeof signVal === 'string' && isZodiacSign(signVal)) {
          sign = signVal;
        }
      }
      houses.push({ number: houseNumber as 1|2|3|4|5|6|7|8|9|10|11|12, cusp, sign });
    }
  } else if (Array.isArray(rawHouses)) {
    // If backend returns array of numbers
    rawHouses.forEach((hv, idx) => {
      const houseNumber = idx + 1;
      if (houseNumber < 1 || houseNumber > 12) return;
      const cusp = coerceChartNumber(hv, 0);
      houses.push({ number: houseNumber as 1|2|3|4|5|6|7|8|9|10|11|12, cusp, sign: 'aries' });
    });
  }

  // Aspects
  const aspects: Aspect[] = [];
  const rawAspects: unknown[] = Array.isArray((raw)['aspects'])
    ? (raw)['aspects'] as unknown[]
    : [];
  for (const aspect of rawAspects) {
    if (isChartObject(aspect)) {
      const {
        aspect_type,
        planet1,
        planet2,
        orb,
        applying,
        exact,
        power
      } = aspect as unknown as Aspect;

      if (
        isZodiacSign(planet1) &&
        isZodiacSign(planet2) &&
        typeof orb === 'number' &&
        typeof applying === 'boolean'
      ) {
        aspects.push({
          aspect_type,
          planet1,
          planet2,
          orb,
          applying,
          exact: exact ?? false,
          power: typeof power === 'number' ? power : undefined
        });
      }
    }
  }

  const defaultAsc = houses[0]?.cusp ?? 0;
  const defaultMc = houses[9]?.cusp ?? 0;
  const anglesCandidate = (raw)['angles'];
  const anglesRaw: Record<string, unknown> | undefined = isChartObject(anglesCandidate)
    ? anglesCandidate
    : undefined;
  const angles = anglesRaw &&
    typeof anglesRaw['ascendant'] === 'number' &&
    typeof anglesRaw['midheaven'] === 'number' &&
    typeof anglesRaw['descendant'] === 'number' &&
    typeof anglesRaw['imumcoeli'] === 'number'
    ? {
        ascendant: anglesRaw['ascendant'],
        midheaven: anglesRaw['midheaven'],
        descendant: anglesRaw['descendant'],
        imumcoeli: anglesRaw['imumcoeli']
      }
    : {
        ascendant: defaultAsc,
        midheaven: defaultMc,
        descendant: defaultAsc + 180,
        imumcoeli: defaultMc + 180
      };

  // Handle required fields with defaults
  const latitude = typeof (raw)['latitude'] === 'number' ? (raw)['latitude'] : 0;
  const longitude = typeof (raw)['longitude'] === 'number' ? (raw)['longitude'] : 0;
  const timezone = typeof (raw)['timezone'] === 'string' ? (raw)['timezone'] : 'UTC';
  const julian_day = typeof (raw)['julian_day'] === 'number' ? (raw)['julian_day'] : 0;
  const house_system = typeof (raw)['house_system'] === 'string' ? (raw)['house_system'] as 'placidus' : 'placidus';

  return {
    planets,
    houses: houses.sort((a, b) => a.number - b.number),
    aspects,
    angles,
    latitude,
    longitude,
    timezone,
    julian_day,
    house_system
  };
};

export const fetchNatalChart = async (birthData: Record<string, unknown>): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🌟 Fetching natal chart...');
  devConsole.log?.('📊 Natal chart data input:', birthData);
  try {
    const response = await apiClient.post('/natal-chart', birthData);
    devConsole.log?.('✅ Natal chart response received:', response);
    return ok(response);
  } catch (error) {
    devConsole.error('❌ Error fetching natal chart:', error);
    return toFailure(error, {
      auth: 'Authentication required to fetch natal chart',
      notFound: 'Natal chart not found',
      defaultMsg: 'Failed to fetch natal chart'
    });
  }
};

export const fetchSynastryAnalysis = async (person1: Record<string, unknown>, person2: Record<string, unknown>): Promise<ApiResult<unknown>> => {
  devConsole.log?.('💑 Fetching synastry analysis...');
  devConsole.log?.('📊 Person 1 data:', person1);
  devConsole.log?.('📊 Person 2 data:', person2);
  // Unified backend route: /api/synastry/calculate-synastry (router mounted at /api)
  try {
    const response = await apiClient.post('/synastry/calculate-synastry', { person1, person2 });
    devConsole.log?.('✅ Synastry analysis response received:', response);
    return ok(response);
  } catch (error) {
    devConsole.error('❌ Error fetching synastry analysis:', error);
    return toFailure(error, {
      auth: 'Authentication required to fetch synastry analysis',
      validation: 'Invalid synastry request data',
      defaultMsg: 'Failed to fetch synastry analysis'
    });
  }
};

// AI Interpretation API Functions
export const fetchAIInterpretations = async (chartId: ChartId, userId: UserId): Promise<ApiResult<InterpretationResponse>> => {
  devConsole.log?.('🤖 Fetching AI interpretations...');
  devConsole.log?.('📊 Chart ID:', chartId, 'User ID:', userId);
  
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<InterpretationResponse>(`${BACKEND_URL}/api/interpretations`, {
      chartId,
      userId
    }, { headers });
    
  devConsole.log?.('✅ AI interpretations response received:', response.data);
    return ok(response.data);
  } catch (error) {
  devConsole.error('❌ Error fetching AI interpretations:', error);
    return toFailure(error, {
      auth: 'Authentication required to view interpretations',
      defaultMsg: 'Failed to fetch AI interpretations'
    });
  }
};

export const generateAIInterpretation = async (request: InterpretationRequest): Promise<ApiResult<InterpretationResponse>> => {
  devConsole.log?.('🔮 Generating AI interpretation...');
  devConsole.log?.('📊 Request data:', request);
  
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<InterpretationResponse>(`${BACKEND_URL}/api/interpretations/generate`, request, { headers });
    
  devConsole.log?.('✅ AI interpretation generated:', response.data);
    return ok(response.data);
  } catch (error) {
  devConsole.error('❌ Error generating AI interpretation:', error);
    return toFailure(error, {
      auth: 'Authentication required to generate interpretations',
      defaultMsg: 'Failed to generate AI interpretation'
    });
  }
};

export const fetchInterpretationById = async (interpretationId: InterpretationId): Promise<ApiResult<Interpretation>> => {
  devConsole.log?.('🔍 Fetching interpretation by ID:', interpretationId);
  
  try {
    const headers = await getAuthHeaders();
    interface InterpretationByIdResponse { data: Interpretation; success?: boolean }
    const response = await axios.get<InterpretationByIdResponse>(`${BACKEND_URL}/api/interpretations/${interpretationId}`, { headers });
    
  devConsole.log?.('✅ Interpretation fetched:', response.data);
    return ok(response.data.data);
  } catch (error) {
  devConsole.error('❌ Error fetching interpretation:', error);
    return toFailure(error, {
      auth: 'Authentication required to view interpretation',
      notFound: 'Interpretation not found',
      defaultMsg: 'Failed to fetch interpretation'
    });
  }
};

export const deleteInterpretation = async (interpretationId: InterpretationId): Promise<void> => {
  devConsole.log?.('🗑️ Deleting interpretation:', interpretationId);
  
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${BACKEND_URL}/api/interpretations/${interpretationId}`, { headers });
    
  devConsole.log?.('✅ Interpretation deleted successfully');
  } catch (error) {
  devConsole.error('❌ Error deleting interpretation:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new AuthenticationError('Authentication required to delete interpretation');
    } else if (axios.isAxiosError(error) && error.response?.status === 404) {
  throw new NotFoundError('Interpretation', String(interpretationId));
    }
    throw new Error('Failed to delete interpretation');
  }
};

export const updateInterpretation = async (
  interpretationId: InterpretationId, 
  updates: Partial<Interpretation>
): Promise<ApiResult<Interpretation>> => {
  devConsole.log?.('📝 Updating interpretation:', interpretationId, updates);
  
  try {
    const headers = await getAuthHeaders();
    interface InterpretationByIdResponse { data: Interpretation; success?: boolean }
    const response = await axios.patch<InterpretationByIdResponse>(
      `${BACKEND_URL}/api/interpretations/${interpretationId}`, 
      updates, 
      { headers }
    );
    
  devConsole.log?.('✅ Interpretation updated:', response.data);
    return ok(response.data.data);
  } catch (error) {
  devConsole.error('❌ Error updating interpretation:', error);
    return toFailure(error, {
      auth: 'Authentication required to update interpretation',
      notFound: 'Interpretation not found',
      validation: 'Invalid interpretation update data',
      defaultMsg: 'Failed to update interpretation'
    });
  }
};