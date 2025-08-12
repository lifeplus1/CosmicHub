import axios from 'axios';
import { auth } from '@cosmichub/config/firebase';

// API Configuration
import { env } from '../config/environment';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log('🔗 API Service initializing...');
console.log('🌐 Backend URL:', BACKEND_URL);

// Helper function to get current auth token
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
const getAuthHeaders = async () => {
  console.log('📝 Creating auth headers...');
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ Authentication required but no token available');
    throw new Error('Authentication required');
  }
  console.log('✅ Auth headers created');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const apiClient = {
  get: async (endpoint: string) => {
    console.log('📡 API GET request:', endpoint);
    const url = `${BACKEND_URL}${endpoint}`;
    console.log('🌐 Full URL:', url);
    
    try {
      const response = await fetch(url);
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ GET response data:', data);
      return data;
    } catch (error) {
      console.error('❌ GET request failed:', error);
      throw error;
    }
  },
  
  post: async (endpoint: string, data: any) => {
    console.log('📡 API POST request:', endpoint);
    console.log('📤 Request data:', data);
    const url = `${BACKEND_URL}${endpoint}`;
    console.log('🌐 Full URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('✅ POST response data:', responseData);
      return responseData;
    } catch (error) {
      console.error('❌ POST request failed:', error);
      throw error;
    }
  }
};

export const fetchChart = async (data: any) => {
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

export const fetchPersonalityAnalysis = async (userId: string) => {
  console.log('🧠 Fetching personality analysis for user:', userId);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making personality analysis request to /api/analyze/personality/');
    const response = await axios.get(`${BACKEND_URL}/api/analyze/personality/${userId}`, { headers });
    console.log('✅ Personality analysis response received:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Error fetching personality analysis:', error);
    throw error;
  }
};

export const fetchNumerology = async (data: any) => {
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

export const calculateHumanDesign = async (data: any) => {
  console.log('🧬 Calculating Human Design...');
  console.log('📊 Human Design data input:', data);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making Human Design request to /calculate-human-design');
    const response = await axios.post(`${BACKEND_URL}/calculate-human-design`, data, { headers });
    console.log('✅ Human Design response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calculating Human Design:', error);
    throw error;
  }
};

export const calculateGeneKeys = async (data: any) => {
  console.log('🗝️ Calculating Gene Keys...');
  console.log('📊 Gene Keys data input:', data);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making Gene Keys request to /calculate-gene-keys');
    const response = await axios.post(`${BACKEND_URL}/calculate-gene-keys`, data, { headers });
    console.log('✅ Gene Keys response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error calculating Gene Keys:', error);
    throw error;
  }
};

export const getHumanDesignProfile = async (userId: string) => {
  console.log('👤 Getting Human Design profile for user:', userId);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making Human Design profile request to /human-design/profile/');
    const response = await axios.get(`${BACKEND_URL}/human-design/profile/${userId}`, { headers });
    console.log('✅ Human Design profile response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching Human Design profile:', error);
    throw error;
  }
};

export const getGeneKeysProfile = async (userId: string) => {
  console.log('🗝️ Getting Gene Keys profile for user:', userId);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making Gene Keys profile request to /gene-keys/profile/');
    const response = await axios.get(`${BACKEND_URL}/gene-keys/profile/${userId}`, { headers });
    console.log('✅ Gene Keys profile response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching Gene Keys profile:', error);
    throw error;
  }
};

export const getContemplationProgress = async (userId: string) => {
  console.log('🧘 Getting contemplation progress for user:', userId);
  try {
    const headers = await getAuthHeaders();
    console.log('📡 Making contemplation progress request to /gene-keys/contemplation/');
    const response = await axios.get(`${BACKEND_URL}/gene-keys/contemplation/${userId}`, { headers });
    console.log('✅ Contemplation progress response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching contemplation progress:', error);
    throw error;
  }
};

// Chart data interfaces for type safety
export interface ChartBirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

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

export interface ChartData {
  planets: Record<string, Planet>;
  houses: House[];
  aspects?: any[];
  angles?: {
    ascendant: number;
    midheaven: number;
    descendant: number;
    imumcoeli: number;
  };
  latitude?: number;
  longitude?: number;
  timezone?: string;
  julian_day?: number;
}

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

// Transform backend response to match ChartData interface
const transformBackendResponse = (backendResponse: any): ChartData => {
  const planets: Record<string, Planet> = {};
  
  // Transform planets from backend format
  if (backendResponse.planets) {
    Object.entries(backendResponse.planets).forEach(([name, planetData]: [string, any]) => {
      planets[name] = {
        name,
        position: planetData.position || planetData.longitude || 0,
        retrograde: planetData.retrograde || false,
        speed: planetData.speed || 0,
      };
    });
  }

  // Transform houses from backend format
  const houses: House[] = [];
  if (backendResponse.houses) {
    Object.entries(backendResponse.houses).forEach(([houseKey, houseData]: [string, any]) => {
      // Handle both "house_1" format and direct number keys
      const houseNumber = houseKey.includes('house_') 
        ? parseInt(houseKey.replace('house_', ''))
        : parseInt(houseKey);
      
      if (!isNaN(houseNumber)) {
        houses.push({
          number: houseNumber,
          cusp: typeof houseData === 'number' ? houseData : houseData.cusp || 0,
          sign: houseData.sign || '',
        });
      }
    });
  }

  return {
    planets,
    houses: houses.sort((a, b) => a.number - b.number),
    aspects: backendResponse.aspects || [],
    angles: backendResponse.angles || {
      ascendant: houses[0]?.cusp || 0,
      midheaven: houses[9]?.cusp || 0,
      descendant: (houses[0]?.cusp || 0) + 180,
      imumcoeli: (houses[9]?.cusp || 0) + 180,
    },
    latitude: backendResponse.latitude,
    longitude: backendResponse.longitude,
    timezone: backendResponse.timezone,
    julian_day: backendResponse.julian_day
  };
};

export const fetchNatalChart = async (birthData: any) => {
  console.log('🌟 Fetching natal chart...');
  console.log('📊 Natal chart data input:', birthData);
  const response = await apiClient.post('/natal-chart', birthData);
  console.log('✅ Natal chart response received:', response);
  return response;
};

export const fetchSynastryAnalysis = async (person1: any, person2: any) => {
  console.log('💑 Fetching synastry analysis...');
  console.log('📊 Person 1 data:', person1);
  console.log('📊 Person 2 data:', person2);
  const response = await apiClient.post('/synastry', { person1, person2 });
  console.log('✅ Synastry analysis response received:', response);
  return response;
};