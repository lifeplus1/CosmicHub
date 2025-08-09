import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth, User } from 'firebase/auth';

interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
}

// Support Vite (browser / vitest) via import.meta.env, fallback to process.env for other Node contexts
const envAny: any = (typeof import.meta !== 'undefined' && (import.meta as any)?.env)
  ? (import.meta as any).env
  : (process?.env || {});
const firebaseConfig: FirebaseConfig = {
  apiKey: envAny.VITE_FIREBASE_API_KEY,
  authDomain: envAny.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envAny.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envAny.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envAny.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envAny.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
try {
  // Only require apiKey + appId + projectId (minimal) to attempt init; warn instead of throw
  if (!firebaseConfig.apiKey || !firebaseConfig.appId || !firebaseConfig.projectId) {
    console.warn('[auth] Firebase config incomplete; authentication features disabled until env vars provided.');
    // Skip initialization; app will remain undefined
    app = undefined;
  } else {
    app = initializeApp(firebaseConfig as any);
  }
} catch (error) {
  console.error('[auth] Firebase initialization failed:', error);
  app = undefined;
}

// Export auth if initialized; otherwise create a lazy getter that throws on use
export const auth: Auth = app ? getAuth(app) : (new Proxy({} as Auth, {
  get() {
    throw new Error('Firebase auth not initialized due to incomplete configuration');
  }
}) as Auth);

// Connect to emulator in development
if (envAny.DEV || (envAny.NODE_ENV || envAny.MODE) === 'development') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (error) {
    console.warn('Auth emulator connection failed:', error);
  }
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw new Error('Failed to sign out');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
export const logIn = async (email: string, password: string): Promise<User> => {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signUp = async (email: string, password: string): Promise<User> => {
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logOut = async (): Promise<void> => { 
  await auth.signOut(); 
};

// Export consolidated subscription provider
export { SubscriptionProvider, useSubscription, type SubscriptionState } from './SubscriptionProvider';

export * from 'firebase/auth';