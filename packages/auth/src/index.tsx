import React, { useState, useEffect, useCallback } from 'react';
import { Auth, User, onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
// Use the single, centralized Firebase app/auth to avoid duplicate registrations
import { app as sharedApp, auth as sharedAuth, hasAuthAvailable } from '@cosmichub/config/firebase';

// Delegate to centralized Firebase config package
const app = sharedApp;
const authInstance: Auth | undefined = sharedAuth as Auth | undefined;

// Export auth if initialized; otherwise create a safe mock that doesn't throw
export const auth: Auth = authInstance || (new Proxy({} as Auth, {
  get(target, prop) {
    if (prop === 'currentUser') {
      return null;
    }
    if (prop === 'onAuthStateChanged') {
      return (callback: any) => {
        // Call immediately with null to indicate no user
        callback(null);
        return () => {}; // Return unsubscribe function
      };
    }
    console.warn('Firebase auth not available - using mock auth instead');
    return undefined;
  }
}) as Auth);

console.log('🔥 Firebase Auth initialized:', {
  hasApp: !!app,
});

export interface AuthState {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Local state management for mock authentication
let mockUser: User | null = null;
const authStateListeners: ((user: User | null) => void)[] = [];

// Store mock user in sessionStorage to persist across page reloads
const MOCK_USER_KEY = 'cosmichub_mock_user';

const loadMockUserFromStorage = (): User | null => {
  try {
    const stored = sessionStorage.getItem(MOCK_USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load mock user from storage:', error);
  }
  return null;
};

const saveMockUserToStorage = (user: User | null) => {
  try {
    if (user) {
      sessionStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(MOCK_USER_KEY);
    }
  } catch (error) {
    console.warn('Failed to save mock user to storage:', error);
  }
};

// Initialize mock user from storage
mockUser = loadMockUserFromStorage();

const notifyAuthStateChange = (user: User | null) => {
  mockUser = user;
  saveMockUserToStorage(user);
  console.log('🔔 Auth state changed:', user ? `Mock user: ${user.email}` : 'No user');
  authStateListeners.forEach(listener => listener(user));
};

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState<boolean>(true);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      if (authInstance) {
        await fbSignOut(authInstance);
      }
      notifyAuthStateChange(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      // Even if Firebase sign out fails, clear local mock state
      notifyAuthStateChange(null);
    }
  }, []);

  useEffect(() => {
    console.log('🎯 Setting up auth state listener...');
    
    // Add to local listeners for mock auth
    authStateListeners.push(setUser);
    
  let unsubscribe: (() => void) | undefined;
    
    // Only listen to Firebase auth changes if auth is properly initialized
  if (authInstance && hasAuthAvailable) {
      try {
        unsubscribe = onAuthStateChanged(
          authInstance,
          (currentUser) => {
            console.log('🔥 Firebase auth state changed:', currentUser ? 'User signed in' : 'No user');
            if (currentUser) {
              setUser(currentUser);
              setLoading(false);
            } else if (!mockUser) {
              // Only clear if we don't have a mock user
              setUser(null);
              setLoading(false);
            }
          },
          (error) => {
            console.error('Auth state change error:', error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.warn('Failed to set up auth state listener:', error);
        setLoading(false);
      }
    } else {
      console.log('🧪 Firebase auth not initialized, using mock auth only');
      setLoading(false);
    }

    // Set initial state
    if (mockUser) {
      console.log('🧪 Using existing mock user state');
      setUser(mockUser);
    }
    setLoading(false);

    return () => {
      // Remove from local listeners
      const index = authStateListeners.indexOf(setUser);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { user, loading, signOut };
};

interface AuthProviderProps {
  children: React.ReactNode;
  appName?: string; // allow passing for context / logging though unused now
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Placeholder: could add appName-based logic later
  return <>{children}</>;
};

// Auth action functions expected by apps
export async function logIn(email: string, password: string): Promise<User> {
  // Development bypass for testing - remove in production
  if (email === 'test@test.com' && password === 'test123') {
    console.log('🧪 Using development mock user');
    const mockUserData = {
      uid: 'mock-user-123',
      email: 'test@test.com',
      emailVerified: true,
      displayName: 'Test User',
      photoURL: null,
      phoneNumber: null,
      providerId: 'mock',
      isAnonymous: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      providerData: [],
      refreshToken: 'mock-refresh-token',
      tenantId: null
    } as unknown as User;
    
    // Notify all auth state listeners
    notifyAuthStateChange(mockUserData);
    return mockUserData;
  }
  
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase auth failed, trying mock login:', error);
    // Fallback to mock for development
    if (email && password) {
      console.log('🧪 Using fallback mock user for development');
      const fallbackMockUser = {
        uid: `mock-${Date.now()}`,
        email: email,
        emailVerified: true,
        displayName: email.split('@')[0],
        photoURL: null,
        phoneNumber: null,
        providerId: 'mock',
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        },
        providerData: [],
        refreshToken: 'mock-refresh-token',
        tenantId: null
      } as unknown as User;
      
      // Notify all auth state listeners
      notifyAuthStateChange(fallbackMockUser);
      return fallbackMockUser;
    }
    throw error;
  }
}

export async function signUp(email: string, password: string): Promise<User> {
  try {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase sign up failed, using mock:', error);
    // Fallback to mock for development
    if (email && password) {
      console.log('🧪 Using mock sign up for development');
      const mockNewUser = {
        uid: `mock-new-${Date.now()}`,
        email: email,
        emailVerified: false,
        displayName: email.split('@')[0],
        photoURL: null,
        phoneNumber: null,
        providerId: 'mock',
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        },
        providerData: [],
        refreshToken: 'mock-refresh-token',
        tenantId: null
      } as unknown as User;
      
      // Notify all auth state listeners
      notifyAuthStateChange(mockNewUser);
      return mockNewUser;
    }
    throw error;
  }
}

export async function logOut(): Promise<void> { 
  await auth.signOut(); 
}

// Export consolidated subscription provider
export { SubscriptionProvider, useSubscription, type SubscriptionState } from './SubscriptionProvider';

export * from 'firebase/auth';