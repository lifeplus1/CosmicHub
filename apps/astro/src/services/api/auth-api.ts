/**
 * Authentication API Module
 * Handles authentication tokens and headers
 */
import { auth } from '../../firebase';
import { devConsole } from '../../config/environment';
import { AuthenticationError } from '../api.types';

// Type for auth headers
type AuthHeaders = Record<string, string>;

/**
 * Get current authentication token
 */
export const getAuthToken = async (): Promise<string | null> => {
  devConsole.log?.('🔑 Getting auth token...');
  const user = auth.currentUser;

  // In development, allow mock authentication
  if (import.meta.env.DEV === true && user === null) {
    devConsole.log?.('🧪 Using development mock token');
    return 'mock-dev-token';
  }

  if (user === null) {
    devConsole.warn?.('⚠️ No authenticated user found');
    return null;
  }

  try {
    devConsole.log?.('🔄 Refreshing auth token...');
    // Force refresh token to ensure it's valid
    const token = await user.getIdToken(true);
    devConsole.log?.('✅ Auth token obtained successfully');
    return token;
  } catch (error) {
    devConsole.error('❌ Error getting auth token:', error);
    return null;
  }
};

/**
 * Create authorized headers for API requests
 */
export const getAuthHeaders = async (): Promise<AuthHeaders> => {
  devConsole.log?.('📝 Creating auth headers...');
  const token = await getAuthToken();
  if (token === null) {
    devConsole.error('❌ Authentication required but no token available');
    throw new AuthenticationError('Authentication required');
  }
  devConsole.log?.('✅ Auth headers created');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};
