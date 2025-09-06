/**
 * Base API Client with CSRF Protection
 * Handles common request/response patterns and CSRF token management
 */
import axios, { type AxiosRequestConfig, type AxiosInstance } from 'axios';
import { csrfService } from '../csrfService';
import { devConsole } from '../../config/environment';
import { AuthenticationError, NotFoundError, ValidationError } from '../api.types';

// Backend URL configuration
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

export const BACKEND_URL: string =
  resolvedApi !== '' ? resolvedApi : 'http://localhost:8000';

devConsole.log?.('🔗 API Client initializing...');
devConsole.log?.('🌐 Backend URL:', BACKEND_URL);

/**
 * Create CSRF-protected axios instance
 */
function createCsrfAxios(): AxiosInstance {
  const instance = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  // Request interceptor to add CSRF token
  instance.interceptors.request.use(async config => {
    try {
      const csrfHeaders = await csrfService.getHeaders();
      Object.keys(csrfHeaders).forEach(key => {
        config.headers.set(key, csrfHeaders[key]);
      });
      return config;
    } catch (error) {
      devConsole.error('Failed to add CSRF token to request:', error);
      return Promise.reject(new Error('Failed to add CSRF token'));
    }
  });

  // Response interceptor to handle CSRF token refresh
  instance.interceptors.response.use(
    response => response,
    async (error: unknown) => {
      const errorRecord = error as {
        response?: { status?: number; data?: { detail?: unknown } };
        config?: Record<string, unknown> & {
          _retry?: boolean;
          headers?: Record<string, unknown>;
        };
      };

      const isCSRFError =
        errorRecord?.response?.status === 403 &&
        typeof errorRecord?.response?.data?.detail === 'string' &&
        errorRecord.response.data.detail.includes('CSRF');

      if (isCSRFError) {
        devConsole.warn('CSRF token expired, clearing cache and retrying...');
        csrfService.clearToken();

        const originalRequest = errorRecord.config;
        if (originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const csrfHeaders = await csrfService.getHeaders();
            if (originalRequest.headers) {
              Object.keys(csrfHeaders).forEach(key => {
                if (originalRequest.headers) {
                  originalRequest.headers[key] = csrfHeaders[key];
                }
              });
            }
            return instance(originalRequest as AxiosRequestConfig);
          } catch {
            return Promise.reject(new Error('CSRF retry failed'));
          }
        }
      }
      return Promise.reject(
        new Error(error instanceof Error ? error.message : 'Request failed')
      );
    }
  );

  return instance;
}

// Global CSRF-protected axios instance
export const csrfAxios = createCsrfAxios();

/**
 * Simple API client for basic GET/POST operations
 */
export const apiClient = {
  get: async <T = unknown>(endpoint: string): Promise<T> => {
    devConsole.log?.('📡 API GET request:', endpoint);
    const url = `${BACKEND_URL}${endpoint}`;
    devConsole.log?.('🌐 Full URL:', url);

    try {
      const response = await fetch(url);
      devConsole.log?.('📥 Response status:', response.status);

      if (response.ok === false) {
        devConsole.error(
          '❌ HTTP error:',
          response.status,
          response.statusText
        );

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
    } catch (err) {
      devConsole.error('❌ GET request failed:', err);
      throw err;
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
        devConsole.error(
          '❌ HTTP error:',
          response.status,
          response.statusText
        );

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
    } catch (err) {
      devConsole.error('❌ POST request failed:', err);
      throw err;
    }
  },
};
