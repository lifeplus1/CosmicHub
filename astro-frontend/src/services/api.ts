import axios from 'axios';
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://astrology-app-0emh.onrender.com';

// Helper function to get current auth token
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    console.error('No authenticated user found');
    return null;
  }
  
  try {
    // Force refresh token to ensure it's valid
    const token = await user.getIdToken(true);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to create authorized headers
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const fetchChart = async (data: any) => {
  try {
    const headers = await getAuthHeaders();
    return axios.post(`${API_URL}/calculate-multi-system`, data, { headers });
  } catch (error) {
    console.error('Error fetching chart:', error);
    throw error;
  }
};

export const fetchPersonalityAnalysis = async (userId: string) => {
  try {
    const headers = await getAuthHeaders();
    return axios.get(`${API_URL}/api/analyze/personality/${userId}`, { headers });
  } catch (error) {
    console.error('Error fetching personality analysis:', error);
    throw error;
  }
};

export const fetchNumerology = async (data: any) => {
  try {
    const headers = await getAuthHeaders();
    return axios.post(`${API_URL}/calculate-numerology`, data, { headers });
  } catch (error) {
    console.error('Error fetching numerology:', error);
    throw error;
  }
};

export const calculateHumanDesign = async (data: any) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/calculate-human-design`, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error calculating Human Design:', error);
    throw error;
  }
};

export const calculateGeneKeys = async (data: any) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/calculate-gene-keys`, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error calculating Gene Keys:', error);
    throw error;
  }
};

export const getHumanDesignProfile = async (userId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/human-design/profile/${userId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching Human Design profile:', error);
    throw error;
  }
};

export const getGeneKeysProfile = async (userId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/gene-keys/profile/${userId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching Gene Keys profile:', error);
    throw error;
  }
};

export const getContemplationProgress = async (userId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/gene-keys/contemplation/${userId}`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching contemplation progress:', error);
    throw error;
  }
};