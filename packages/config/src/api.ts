/**
 * API configuration and client setup
 */

import { config } from './config';
import { buildSuccess, parseErrorLike, type StandardApiError } from './utils/api/error';
// Local fallback to avoid cross-package rootDir limitations; kept in sync with shared utility type
type UnknownRecord = Record<string, unknown>;

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export type ApiError = StandardApiError;

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    verify: '/auth/verify',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password'
  },
  
  // Charts
  charts: {
    list: '/charts',
    create: '/charts',
    get: (id: string) => `/charts/${id}`,
    update: (id: string) => `/charts/${id}`,
    delete: (id: string) => `/charts/${id}`,
    calculate: '/charts/calculate',
    export: (id: string) => `/charts/${id}/export`,
    interpretation: (id: string) => `/charts/${id}/interpretation`
  },
  
  // AI Services
  ai: {
    generateInterpretation: '/ai/generate-interpretation',
    analyzeChart: '/ai/analyze-chart',
    askQuestion: '/ai/ask-question',
    history: (chartId: string) => `/ai/interpretation-history/${chartId}`,
    regenerateSection: (chartId: string, section: string) => `/ai/regenerate-section/${chartId}/${section}`,
    availableSections: '/ai/available-sections',
    health: '/ai/health'
  },
  
  // User Management
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    preferences: '/users/preferences',
    subscription: '/users/subscription',
    usage: '/users/usage',
    delete: '/users/delete'
  },
  
  // Subscriptions
  subscriptions: {
    plans: '/subscriptions/plans',
    subscribe: '/subscriptions/subscribe',
    cancel: '/subscriptions/cancel',
    modify: '/subscriptions/modify',
    invoices: '/subscriptions/invoices',
    usage: '/subscriptions/usage'
  },
  
  // Astrology Services
  astro: {
    calculate: '/astro/calculate',
    transits: '/astro/transits',
    progressions: '/astro/progressions',
    composites: '/astro/composites',
    synastry: '/astro/synastry',
    relocation: '/astro/relocation',
    rectification: '/astro/rectification'
  },
  
  // Human Design
  humanDesign: {
    calculate: '/human-design/calculate',
    analysis: '/human-design/analysis',
    centers: '/human-design/centers',
    channels: '/human-design/channels',
    gates: '/human-design/gates'
  },
  
  // Gene Keys
  geneKeys: {
    calculate: '/gene-keys/calculate',
    profile: '/gene-keys/profile',
    activation: '/gene-keys/activation',
    contemplation: '/gene-keys/contemplation'
  },
  
  // Numerology
  numerology: {
    calculate: '/numerology/calculate',
    lifePath: '/numerology/life-path',
    expression: '/numerology/expression',
    soulUrge: '/numerology/soul-urge',
    personalYear: '/numerology/personal-year'
  },
  
  // Integrations
  integrations: {
    healwave: {
      connect: '/integrations/healwave/connect',
      sync: '/integrations/healwave/sync',
      status: '/integrations/healwave/status'
    }
  }
} as const;

// Create API client class
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.api.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Set authentication token
  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Get authentication token from localStorage
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  // Build full URL
  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  // Build request headers
  private buildHeaders(options?: RequestOptions): Record<string, string> {
    const token = this.authToken || this.getStoredToken();
    const headers = { ...this.defaultHeaders };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }
    
    return headers;
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let raw: unknown;
    try {
      raw = await response.json();
    } catch {
      // Non-JSON or empty body
      if (!response.ok) {
        const err: ApiError = { code: response.status.toString(), message: 'API request failed', details: undefined };
        throw new Error(JSON.stringify(err));
      }
      return { data: undefined as unknown as T, success: true };
    }

    const dataObj = (typeof raw === 'object' && raw !== null) ? raw as Record<string, unknown> : {};
    const messageVal = typeof dataObj.message === 'string' ? dataObj.message : undefined;
    const errorVal = typeof dataObj.error === 'string' ? dataObj.error : undefined;
  const payload = dataObj.data !== undefined ? dataObj.data : raw;

    if (!response.ok) {
      const errMsg = messageVal ?? errorVal ?? 'API request failed';
      const err: ApiError = { code: response.status.toString(), message: errMsg, details: payload };
      throw new Error(JSON.stringify(err));
    }

    return buildSuccess(payload as T, messageVal);
  }

  private parseApiError(e: unknown, status: number): ApiError {
    if (e instanceof Error) {
      try {
        const parsed = JSON.parse(e.message) as unknown;
        return parseErrorLike(parsed, status.toString());
      } catch {
        return parseErrorLike(e, status.toString());
      }
    }
    return parseErrorLike(e, status.toString());
  }

  // Retry logic
  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = config.api.retries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(1000 * (config.api.retries - retries + 1));
        return this.withRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  // Check if error is retryable
  private isRetryableError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = String((error as { code: unknown }).code);
      const retryableCodes = ['500', '502', '503', '504', 'TIMEOUT'];
      return retryableCodes.includes(code);
    }
    return false;
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options?.timeout || config.api.timeout);
      
      try {
        const response = await fetch(this.buildUrl(endpoint), {
          method: 'GET',
          headers: this.buildHeaders(options),
          signal: options?.signal || controller.signal
        });
        
        return this.handleResponse<T>(response);
      } finally {
        clearTimeout(timeoutId);
      }
    }, options?.retries);
  }

  async post<T, B = UnknownRecord>(endpoint: string, data?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options?.timeout || config.api.timeout);
      
      try {
        const response = await fetch(this.buildUrl(endpoint), {
          method: 'POST',
          headers: this.buildHeaders(options),
          body: data ? JSON.stringify(data) : null,
          signal: options?.signal || controller.signal
        });
        
        return this.handleResponse<T>(response);
      } finally {
        clearTimeout(timeoutId);
      }
    }, options?.retries);
  }

  async put<T, B = UnknownRecord>(endpoint: string, data?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options?.timeout || config.api.timeout);
      
      try {
        const response = await fetch(this.buildUrl(endpoint), {
          method: 'PUT',
          headers: this.buildHeaders(options),
          body: data ? JSON.stringify(data) : null,
          signal: options?.signal || controller.signal
        });
        
        return this.handleResponse<T>(response);
      } finally {
        clearTimeout(timeoutId);
      }
    }, options?.retries);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.withRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options?.timeout || config.api.timeout);
      
      try {
        const response = await fetch(this.buildUrl(endpoint), {
          method: 'DELETE',
          headers: this.buildHeaders(options),
          signal: options?.signal || controller.signal
        });
        
        return this.handleResponse<T>(response);
      } finally {
        clearTimeout(timeoutId);
      }
    }, options?.retries);
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, options?: RequestOptions): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = this.buildHeaders(options);
    delete headers['Content-Type']; // Let browser set multipart boundary
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout || config.api.timeout);
    
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'POST',
        headers,
        body: formData,
        signal: options?.signal || controller.signal
      });
      
      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Helper functions for common API operations
export const api = {
  // Authentication helpers
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post(API_ENDPOINTS.auth.login, credentials),
    
    register: (userData: { email: string; password: string; name: string }) =>
      apiClient.post(API_ENDPOINTS.auth.register, userData),
    
    logout: () => apiClient.post(API_ENDPOINTS.auth.logout),
    
    refresh: () => apiClient.post(API_ENDPOINTS.auth.refresh),
    
    verify: (token: string) =>
      apiClient.post(API_ENDPOINTS.auth.verify, { token })
  },
  
  // Chart helpers
  charts: {
    list: () => apiClient.get(API_ENDPOINTS.charts.list),
    
  create: <TBody = UnknownRecord>(chartData: TBody) =>
      apiClient.post(API_ENDPOINTS.charts.create, chartData),
    
    get: (id: string) =>
      apiClient.get(API_ENDPOINTS.charts.get(id)),
    
  update: <TBody = UnknownRecord>(id: string, data: TBody) =>
      apiClient.put(API_ENDPOINTS.charts.update(id), data),
    
    delete: (id: string) =>
      apiClient.delete(API_ENDPOINTS.charts.delete(id)),
    
  calculate: <TBody = UnknownRecord>(params: TBody) =>
      apiClient.post(API_ENDPOINTS.charts.calculate, params)
  },
  
  // AI helpers
  ai: {
  generateInterpretation: <TBody = UnknownRecord>(request: TBody) =>
      apiClient.post(API_ENDPOINTS.ai.generateInterpretation, request),
    
  analyzeChart: <TBody = UnknownRecord>(request: TBody) =>
      apiClient.post(API_ENDPOINTS.ai.analyzeChart, request),
    
  askQuestion: <TChart = UnknownRecord>(question: string, chartData: TChart) =>
      apiClient.post(API_ENDPOINTS.ai.askQuestion, { question, chartData }),
    
    getHistory: (chartId: string) =>
      apiClient.get(API_ENDPOINTS.ai.history(chartId)),
    
    regenerateSection: (chartId: string, section: string) =>
      apiClient.post(API_ENDPOINTS.ai.regenerateSection(chartId, section)),
    
    getAvailableSections: () =>
      apiClient.get(API_ENDPOINTS.ai.availableSections)
  }
};

export default apiClient;
