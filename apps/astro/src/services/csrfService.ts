/**
 * CSRF Token Service for CosmicHub
 * Handles CSRF token acquisition and inclusion in API requests
 */

interface CSRFTokenResponse {
  csrf_token: string;
  expires_in: number;
}

class CSRFTokenService {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private readonly API_BASE = 'http://localhost:8000';

  /**
   * Get a valid CSRF token, fetching a new one if needed
   */
  async getToken(): Promise<string> {
    // Check if current token is still valid (with 5-minute buffer)
    const now = Date.now() / 1000;
    if (this.token && this.tokenExpiry > now + 300) {
      return this.token;
    }

    // Fetch new token
    try {
      const response = await fetch(`${this.API_BASE}/security/csrf-token`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data: CSRFTokenResponse = await response.json();
      this.token = data.csrf_token;
      this.tokenExpiry = now + data.expires_in;

      return this.token;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      throw new Error('Unable to obtain CSRF token');
    }
  }

  /**
   * Get headers with CSRF token for API requests
   */
  async getHeaders(additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
    const token = await this.getToken();
    
    return {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token,
      ...additionalHeaders,
    };
  }

  /**
   * Make an authenticated API request with CSRF token
   */
  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const headers = await this.getHeaders(options.headers as Record<string, string> || {});
    
    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    // Retry logic for expired tokens
    let response = await fetch(`${this.API_BASE}${endpoint}`, requestOptions);
    
    // If we get a 403, the token might be expired - try once more with fresh token
    if (response.status === 403) {
      console.warn('CSRF token may be expired, fetching new token and retrying...');
      this.token = null; // Force token refresh
      const freshHeaders = await this.getHeaders(options.headers as Record<string, string> || {});
      
      response = await fetch(`${this.API_BASE}${endpoint}`, {
        ...requestOptions,
        headers: freshHeaders,
      });
    }

    return response;
  }

  /**
   * Clear stored token (useful for logout or when switching environments)
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }
}

// Singleton instance
export const csrfService = new CSRFTokenService();

/**
 * Utility function for making CSRF-protected API calls
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  return csrfService.request(endpoint, options);
}

/**
 * Utility function for making CSRF-protected JSON API calls
 */
export async function apiJsonRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await apiRequest(endpoint, options);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}
