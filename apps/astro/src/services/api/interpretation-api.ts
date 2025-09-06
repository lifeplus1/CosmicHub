/**
 * AI Interpretation API Module
 * Handles AI-powered chart interpretations and analysis
 */
import axios from 'axios';
import { ok, toFailure, type ApiResult } from '@cosmichub/config';
import { devConsole } from '../../config/environment';
import {
  type ChartId,
  type UserId,
  type InterpretationId,
  type Interpretation,
  type InterpretationRequest,
  type InterpretationResponse,
  AuthenticationError,
  NotFoundError,
} from '../api.types';
import { BACKEND_URL } from './api-client';
import { getAuthHeaders } from './auth-api';

/**
 * Fetch AI interpretations for a chart
 */
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

/**
 * Generate new AI interpretation
 */
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

/**
 * Fetch interpretation by ID
 */
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

/**
 * Update interpretation
 */
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

/**
 * Delete interpretation
 */
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
