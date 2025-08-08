import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth, User } from 'firebase/auth';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.VITE_FIREBASE_APP_ID ?? ''
};

// Validate Firebase config
const isValidFirebaseConfig = (config: FirebaseConfig): boolean => {
  return Object.values(config).every(value => value !== '');
};

let app: FirebaseApp;
try {
  if (!isValidFirebaseConfig(firebaseConfig)) {
    throw new Error('Invalid Firebase configuration');
  }
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

export const auth: Auth = getAuth(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
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

export * from 'firebase/auth';