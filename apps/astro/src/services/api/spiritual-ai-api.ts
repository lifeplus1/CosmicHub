/**
 * Spiritual AI API Module
 * Handles spiritual AI synthesis and guidance functionality
 */
import axios from 'axios';
import { ok, toFailure, type ApiResult } from '@cosmichub/config';
import { devConsole } from '../../config/environment';
import type { UserId } from '../api.types';
import { BACKEND_URL } from './api-client';
import { getAuthHeaders } from './auth-api';

// Spiritual AI API Types
export interface SpiritualAISynthesisInput {
  astrology_data: {
    planets: Record<string, unknown>;
    houses: Record<string, unknown>;
    aspects?: unknown[];
    angles?: Record<string, unknown>;
    asteroids?: Record<string, unknown>;
    points?: Record<string, unknown>;
    birth_data?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
  human_design_data?: Record<string, unknown>;
  numerology_data?: Record<string, unknown>;
  tcm_data?: Record<string, unknown>;
  ayurveda_data?: Record<string, unknown>;
  user_context?: Record<string, unknown>;
}

export interface SpiritualAISynthesisOutput {
  unified_themes: string[];
  system_correlations: Record<string, unknown>;
  synthesis_confidence: number;
  integration_insights: string[];
  recommended_focus: string[];
}

export interface SpiritualAIGuidanceRequest {
  chart_data: Record<string, unknown>;
  focus_area?: string;
  depth_level?: string;
}

export interface SpiritualAIGuidanceResponse {
  guidance: string[];
  practices: string[];
  insights: string[];
  confidence: number;
}

/**
 * Fetch spiritual AI synthesis across multiple systems
 */
export const fetchSpiritualAISynthesis = async (
  input: SpiritualAISynthesisInput
): Promise<ApiResult<SpiritualAISynthesisOutput>> => {
  devConsole.log?.('🌟 Fetching spiritual AI synthesis...');

  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<SpiritualAISynthesisOutput>(
      `${BACKEND_URL}/api/spiritual-ai/synthesize`,
      input,
      { headers }
    );

    devConsole.log?.('✅ Spiritual AI synthesis received:', response.data);
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error fetching spiritual AI synthesis:', err);
    return toFailure(err, {
      auth: 'Authentication required for spiritual AI synthesis',
      defaultMsg: 'Failed to fetch spiritual AI synthesis',
    });
  }
};

/**
 * Fetch spiritual AI guidance for specific focus area
 */
export const fetchSpiritualAIGuidance = async (
  request: SpiritualAIGuidanceRequest
): Promise<ApiResult<SpiritualAIGuidanceResponse>> => {
  devConsole.log?.('🧘 Fetching spiritual AI guidance...');

  try {
    const headers = await getAuthHeaders();
    const response = await axios.post<SpiritualAIGuidanceResponse>(
      `${BACKEND_URL}/api/spiritual-ai/guidance`,
      request,
      { headers }
    );

    devConsole.log?.('✅ Spiritual AI guidance received:', response.data);
    return ok(response.data);
  } catch (err) {
    devConsole.error('❌ Error fetching spiritual AI guidance:', err);
    return toFailure(err, {
      auth: 'Authentication required for spiritual AI guidance',
      defaultMsg: 'Failed to fetch spiritual AI guidance',
    });
  }
};

/**
 * Fetch personality analysis for user
 */
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
