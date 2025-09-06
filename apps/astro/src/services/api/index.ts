/**
 * API Module Index
 * Re-exports all API functions for easy consumption
 */

// Base client and utilities
export { apiClient, csrfAxios, BACKEND_URL } from './api-client';
export { getAuthToken, getAuthHeaders } from './auth-api';

// Chart-related APIs
export {
  fetchSavedCharts,
  saveChart,
  deleteChart,
  fetchSavedChartById,
  fetchChart,
  fetchChartDataUnified,
  fetchChartData,
  fetchNatalChart,
  fetchSynastryAnalysis,
  calculateNumerology,
} from './chart-api';

// Interpretation APIs
export {
  fetchAIInterpretations,
  generateAIInterpretation,
  fetchInterpretationById,
  updateInterpretation,
  deleteInterpretation,
} from './interpretation-api';

// Human Design & Gene Keys APIs
export {
  calculateHumanDesign,
  fetchHumanDesignProfile,
  calculateGeneKeys,
  fetchGeneKeysProfile,
  fetchContemplationProgress,
} from './human-design-api';

// Spiritual AI APIs
export {
  fetchSpiritualAISynthesis,
  fetchSpiritualAIGuidance,
  fetchPersonalityAnalysis,
  type SpiritualAISynthesisInput,
  type SpiritualAISynthesisOutput,
  type SpiritualAIGuidanceRequest,
  type SpiritualAIGuidanceResponse,
} from './spiritual-ai-api';

// Data transformation utilities
export { transformBackendResponse } from '../data-transformers';

// Caching utilities
export { getCachedChartData, setCachedChartData, cleanupCache } from '../api-cache';

// Re-export all types from api.types for convenience
export * from '../api.types';

// Re-export ApiResult for consumers
export type { ApiResult } from '@cosmichub/config';
