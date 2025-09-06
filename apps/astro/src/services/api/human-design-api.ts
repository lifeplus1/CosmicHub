/**
 * Human Design & Gene Keys API Module
 * Handles Human Design and Gene Keys calculations and profiles
 */
import axios from 'axios';
import { ok, toFailure, type ApiResult } from '@cosmichub/config';
import { devConsole } from '../../config/environment';
import { type AnyBirthInput, toUnifiedBirthData } from '@cosmichub/types';
import type { UserId } from '../api.types';
import type { HumanDesignData } from '../../components/HumanDesignChart/types';
import type { GeneKeysData } from '../../components/GeneKeysChart/types';
import { BACKEND_URL } from './api-client';
import { getAuthHeaders } from './auth-api';

/**
 * Calculate Human Design chart
 */
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

/**
 * Fetch Human Design profile for user
 */
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

/**
 * Calculate Gene Keys
 */
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

/**
 * Fetch Gene Keys profile for user
 */
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

/**
 * Fetch contemplation progress for user
 */
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
