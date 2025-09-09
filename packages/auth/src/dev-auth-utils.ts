import { User } from 'firebase/auth';

/**
 * Development-only authentication utilities for testing
 */

// Mock user presets for different subscription tiers
export const MOCK_USERS = {
  free: {
    uid: 'mock-free-user',
    email: 'free@cosmichub.test',
    emailVerified: true,
    displayName: 'Free User',
    photoURL: null,
    phoneNumber: null,
    providerId: 'mock',
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
  },
  premium: {
    uid: 'mock-premium-user',
    email: 'premium@cosmichub.test',
    emailVerified: true,
    displayName: 'Premium User',
    photoURL: null,
    phoneNumber: null,
    providerId: 'mock',
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
  },
  clinical: {
    uid: 'mock-clinical-user',
    email: 'clinical@cosmichub.test',
    emailVerified: true,
    displayName: 'Clinical User',
    photoURL: null,
    phoneNumber: null,
    providerId: 'mock',
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
  },
  test: {
    uid: 'mock-test-user',
    email: 'test@test.com',
    emailVerified: true,
    displayName: 'Test User',
    photoURL: null,
    phoneNumber: null,
    providerId: 'mock',
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
  },
} as const;

/**
 * Initialize mock authentication for development
 */
export function initializeMockAuth(userType: keyof typeof MOCK_USERS = 'test'): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Mock auth should only be used in development!');
    return;
  }

  const mockUser = MOCK_USERS[userType] as unknown as User;
  
  try {
    sessionStorage.setItem('cosmichub_mock_user', JSON.stringify(mockUser));
    console.log(`🧪 Mock auth initialized for ${userType} user:`, mockUser.email);
    
    // Trigger a page reload to apply the authentication
    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch (error) {
    console.error('Failed to initialize mock auth:', error);
  }
}

/**
 * Clear all authentication state
 */
export function clearMockAuth(): void {
  try {
    sessionStorage.removeItem('cosmichub_mock_user');
    localStorage.removeItem('cosmichub_mock_user');
    console.log('🧹 Mock auth cleared');
    
    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch (error) {
    console.error('Failed to clear mock auth:', error);
  }
}

/**
 * Check current mock authentication status
 */
export function getMockAuthStatus(): { isAuthenticated: boolean; user: User | null } {
  try {
    const stored = sessionStorage.getItem('cosmichub_mock_user');
    if (stored) {
      const user = JSON.parse(stored) as User;
      return { isAuthenticated: true, user };
    }
  } catch (error) {
    console.error('Failed to get mock auth status:', error);
  }
  
  return { isAuthenticated: false, user: null };
}

/**
 * Development helper: Add authentication controls to window object
 */
export function addAuthDevTools(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  interface AuthDevTools {
    loginAsFree: () => void;
    loginAsPremium: () => void;
    loginAsClinical: () => void;
    loginAsTest: () => void;
    logout: () => void;
    status: () => { isAuthenticated: boolean; user: User | null };
  }
  
  // Add to window for console access
  (window as unknown as { authDevTools: AuthDevTools }).authDevTools = {
    loginAsFree: () => initializeMockAuth('free'),
    loginAsPremium: () => initializeMockAuth('premium'),
    loginAsClinical: () => initializeMockAuth('clinical'),
    loginAsTest: () => initializeMockAuth('test'),
    logout: clearMockAuth,
    status: getMockAuthStatus,
  };
  
  console.log('🛠️ Auth Dev Tools loaded! Use window.authDevTools');
  console.log('Available commands:');
  console.log('- window.authDevTools.loginAsFree()');
  console.log('- window.authDevTools.loginAsPremium()');
  console.log('- window.authDevTools.loginAsClinical()');
  console.log('- window.authDevTools.loginAsTest()');
  console.log('- window.authDevTools.logout()');
  console.log('- window.authDevTools.status()');
}
