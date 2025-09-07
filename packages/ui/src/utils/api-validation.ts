// API Validation Framework
// Advanced API request/response validation and error handling utilities

import { TypeGuard, validateWithTypeGuard, ValidationResult } from './type-guards';

// API request configuration
export interface APIRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  validateRequest?: boolean;
  validateResponse?: boolean;
}

// API response wrapper
export interface APIResponseWrapper<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: number;
  requestId: string;
}

// API error types
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown,
    public expectedType: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Request validation schemas
export const requestSchemas = {
  chartData: {
    planets: (value: unknown) => Array.isArray(value) && value.every((p: unknown) =>
      typeof p === 'object' && p !== null &&
      typeof (p as Record<string, unknown>).name === 'string' &&
      typeof (p as Record<string, unknown>).longitude === 'number'
    ),
    houses: (value: unknown) => Array.isArray(value) && value.every((h: unknown) =>
      typeof h === 'object' && h !== null &&
      typeof (h as Record<string, unknown>).number === 'number' &&
      typeof (h as Record<string, unknown>).longitude === 'number'
    ),
  },
  userProfile: {
    id: (value: unknown) => typeof value === 'string' && value.length > 0,
    email: (value: unknown) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    preferences: (value: unknown) => typeof value === 'object' && value !== null,
  },
} as const;

// Response validation schemas
export const responseSchemas = {
  transitPrediction: {
    id: (value: unknown) => typeof value === 'string',
    transitType: (value: unknown) => typeof value === 'string',
    exactDate: (value: unknown) => typeof value === 'string',
    opportunities: (value: unknown) => Array.isArray(value) && value.every((item: unknown) => typeof item === 'string'),
    recommendations: (value: unknown) => Array.isArray(value) && value.every((item: unknown) => typeof item === 'string'),
  },
  growthInsights: {
    id: (value: unknown) => typeof value === 'string',
    title: (value: unknown) => typeof value === 'string',
    currentPhase: (value: unknown) => typeof value === 'string',
    nextSteps: (value: unknown) => Array.isArray(value),
  },
} as const;

// Request validator
export const validateAPIRequest = <T>(
  data: unknown,
  schema: Record<string, (value: unknown) => boolean>
): ValidationResult<T> => {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { isValid: false, value: null, errors: ['Request data must be an object'] };
  }

  const obj = data as Record<string, unknown>;

  for (const [field, validator] of Object.entries(schema)) {
    const value = obj[field];
    if (!validator(value)) {
      errors.push(`Invalid ${field}: validation failed`);
    }
  }

  return errors.length === 0
    ? { isValid: true, value: data as T, errors: [] }
    : { isValid: false, value: null, errors };
};

// Response validator
export const validateAPIResponse = <T>(
  response: unknown,
  dataGuard?: TypeGuard<T>
): ValidationResult<T> => {
  if (typeof response !== 'object' || response === null) {
    return { isValid: false, value: null, errors: ['Response must be an object'] };
  }

  const obj = response as Record<string, unknown>;

  // Check for error response
  if (obj.error) {
    const errorMessage = typeof obj.error === 'string' ? obj.error : 'Unknown error';
    return { isValid: false, value: null, errors: [errorMessage] };
  }

  // Validate data if guard provided
  if (dataGuard && obj.data !== undefined) {
    return validateWithTypeGuard(obj.data, dataGuard, 'response.data');
  }

  return { isValid: true, value: (obj.data ?? obj) as T, errors: [] };
};

// Enhanced fetch with validation
export const validatedFetch = async <T>(
  config: APIRequestConfig,
  responseGuard?: TypeGuard<T>
): Promise<APIResponseWrapper<T>> => {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    timeout = 10000,
    retries = 3,
    validateRequest = true,
    validateResponse = true,
  } = config;

  // Validate request body if provided
  if (validateRequest && body && typeof body === 'object') {
    const validation = validateAPIRequest(body, {});
    if (!validation.isValid) {
      throw new ValidationError(
        `Request validation failed: ${validation.errors.join(', ')}`,
        'request',
        body,
        'object'
      );
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const requestInit: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      };

      if (body && method !== 'GET') {
        requestInit.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestInit);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const responseData: unknown = await response.json();

      // Validate response if guard provided
      if (validateResponse && responseGuard) {
        const validation = validateWithTypeGuard(responseData, responseGuard, 'response');
        if (!validation.isValid) {
          throw new ValidationError(
            `Response validation failed: ${validation.errors.join(', ')}`,
            'response',
            responseData,
            responseGuard.typeName
          );
        }
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        data: responseData as T,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        timestamp: Date.now(),
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

    } catch (error) {
      lastError = error as Error;

      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        // Don't retry client errors
        break;
      }

      if (attempt === retries) {
        break;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  if (lastError instanceof APIError) {
    throw lastError;
  }

  throw new NetworkError(
    `Request failed after ${retries + 1} attempts: ${lastError?.message}`,
    lastError ?? undefined
  );
};

// API client with automatic validation
export class ValidatedAPIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retries: number;

  constructor(
    baseURL: string,
    options: {
      headers?: Record<string, string>;
      timeout?: number;
      retries?: number;
    } = {}
  ) {
    this.baseURL = baseURL;
    this.defaultHeaders = options.headers ?? {};
    this.timeout = options.timeout ?? 10000;
    this.retries = options.retries ?? 3;
  }

  async request<T>(
    endpoint: string,
    config: Partial<APIRequestConfig> & { responseGuard?: TypeGuard<T> }
  ): Promise<APIResponseWrapper<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    return validatedFetch<T>({
      url,
      method: 'GET',
      headers: this.defaultHeaders,
      timeout: this.timeout,
      retries: this.retries,
      ...config,
    }, config.responseGuard);
  }

  async get<T>(
    endpoint: string,
    responseGuard?: TypeGuard<T>
  ): Promise<APIResponseWrapper<T>> {
    return this.request(endpoint, { method: 'GET', responseGuard });
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    responseGuard?: TypeGuard<T>
  ): Promise<APIResponseWrapper<T>> {
    return this.request(endpoint, { method: 'POST', body, responseGuard });
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    responseGuard?: TypeGuard<T>
  ): Promise<APIResponseWrapper<T>> {
    return this.request(endpoint, { method: 'PUT', body, responseGuard });
  }

  async delete<T>(
    endpoint: string,
    responseGuard?: TypeGuard<T>
  ): Promise<APIResponseWrapper<T>> {
    return this.request(endpoint, { method: 'DELETE', responseGuard });
  }
}

// Error handling utilities
export const handleAPIError = (error: unknown): string => {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You don\'t have permission.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return error.message;
    }
  }

  if (error instanceof ValidationError) {
    return `Validation error in ${error.field}: ${error.message}`;
  }

  if (error instanceof NetworkError) {
    return 'Network error. Please check your connection.';
  }

  return 'An unexpected error occurred.';
};

// Retry utilities
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }

  throw lastError ?? new Error('Operation failed after retries');
};
