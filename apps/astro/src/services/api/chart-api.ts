/**
 * Chart API Module
 * Handles chart calculations and chart data fetching
 */
import axios from 'axios';
import { ok, toFailure, type ApiResult } from '@cosmichub/config';
import { devConsole } from '../../config/environment';
import type { ChartBirthData, BackendChartResponse, BackendNumerologyData, BackendHumanDesignData, BackendGeneKeysData } from '@cosmichub/types';
import type {
  ChartId,
  ChartData,
  SavedChart,
  SavedChartsResponse,
  SaveChartRequest,
  SaveChartResponse,
} from '../api.types';
import { csrfAxios, BACKEND_URL, apiClient } from './api-client';
import { getAuthHeaders } from './auth-api';
import { transformBackendResponse } from '../data-transformers';
import { getCachedChartData, setCachedChartData } from '../api-cache';

// Multi-system response interface for enhanced chart data
interface MultiSystemResponse {
  chart_data?: BackendChartResponse;
  numerology?: BackendNumerologyData;
  human_design?: BackendHumanDesignData;
  gene_keys?: BackendGeneKeysData;
}

/**
 * Fetch saved charts for current user
 */
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

/**
 * Save chart data for current user
 */
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

/**
 * Delete saved chart by ID
 */
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

/**
 * Fetch saved chart by ID
 */
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

/**
 * Fetch multi-system chart data (astrology + other systems)
 */
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

/**
 * Enhanced chart fetching with caching and transformation
 */
export const fetchChartDataUnified = async (
  birthData: ChartBirthData
): Promise<ApiResult<ChartData & { __raw_backend_response?: unknown }>> => {
  devConsole.log?.('🔮 Calculating birth chart from birth data...');
  devConsole.log?.('📊 Birth data input:', birthData);

  // Check cache first
  const cachedData = getCachedChartData(birthData);
  if (cachedData) {
    devConsole.log?.('✅ Using cached chart data');
    return ok(cachedData);
  }

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

    if (typeof response !== 'object' || response === null) {
      throw new Error('Invalid birth chart response format');
    }

    // Transform backend response to frontend format
    const transformedData = transformBackendResponse(response);

    // Add raw backend response for processing hooks
    const resultWithRawData = {
      ...transformedData,
      __raw_backend_response: response,
    };

    // Cache the transformed data (without the raw response)
    setCachedChartData(birthData, transformedData);

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

/**
 * Legacy chart data fetching (for backwards compatibility)
 */
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

/**
 * Fetch natal chart data
 */
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

/**
 * Fetch synastry analysis between two people
 */
export const fetchSynastryAnalysis = async (
  person1: ChartBirthData,
  person2: ChartBirthData
): Promise<ApiResult<unknown>> => {
  devConsole.log?.('💫 Fetching synastry analysis...');
  devConsole.log?.('📊 Person 1 data:', person1);
  devConsole.log?.('📊 Person 2 data:', person2);
  
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

/**
 * Calculate numerology data
 */
export const calculateNumerology = async (
  data: ChartBirthData
): Promise<ApiResult<unknown>> => {
  devConsole.log?.('🔮 Calculating numerology...');
  devConsole.log?.('📊 Numerology data input:', data);
  
  try {
    const headers = await getAuthHeaders();
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
