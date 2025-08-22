/**
 * Optimized Firebase Configuration
 * Centralized configuration with performance optimizations and emulator support
 */

/// <reference types="vite/client" />

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// Firebase config with environment validation
const firebaseConfig = {
  apiKey: import.meta.env['VITE_FIREBASE_API_KEY'],
  authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'],
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'],
  storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'],
  appId: import.meta.env['VITE_FIREBASE_APP_ID'],
};

// Local devConsole (kept internal to avoid cross-package dependency)
const devConsole = {
  log: import.meta.env.DEV ? console.log.bind(console) : undefined,
  warn: import.meta.env.DEV ? console.warn.bind(console) : undefined,
  error: console.error.bind(console)
};

// Validate required config
interface MinimalViteEnv {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  [k: string]: string | undefined;
}
const requiredEnvVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'] as const;
const envRef: MinimalViteEnv = import.meta.env as unknown as MinimalViteEnv;
const missingVars = requiredEnvVars.filter((varName) => {
  const value = envRef[varName];
  return value === undefined || value === null || value === '';
});

if (missingVars.length > 0) {
  devConsole.warn?.(`Missing required Firebase environment variables: ${missingVars.join(', ')}. Using mock auth.`);
}

//Initialize Firebase app (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let hasAuthAvailable = false;

// Type guard for Firestore instance presence
const hasFirestoreApp = (instance: unknown): instance is Firestore => {
  return typeof instance === 'object' && instance !== null && 'app' in (instance as Record<string, unknown>);
};

try {
  // Check if Firebase app already exists
  const existingApps = getApps();
  if (existingApps.length > 0 && existingApps[0]) {
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig as Record<string, string>);
  }
  
  // Initialize services with error handling
  try {
    auth = getAuth(app);
    hasAuthAvailable = true;
  } catch (authError) {
    devConsole.warn?.('Firebase Auth initialization failed, using fallback:', authError);
    // Create a proxy that warns instead of throwing
    /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
    auth = new Proxy({} as unknown as Auth, {
      get() {
        devConsole.warn?.('Firebase Auth not available - using mock auth instead');
        return undefined as unknown as never;
      }
    }) as Auth;
    /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
    hasAuthAvailable = false;
  }
  
  try {
    db = getFirestore(app);
  } catch (dbError) {
    devConsole.warn?.('Firestore initialization failed:', dbError);
    // Create a proxy for Firestore as well
    /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
    db = new Proxy({} as unknown as Firestore, {
      get() {
        devConsole.warn?.('Firestore not available');
        return undefined as unknown as never;
      }
    }) as Firestore;
    /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
  }

  // Connect to emulators in development
  if (import.meta.env.DEV && import.meta.env['VITE_USE_EMULATOR'] === 'true') {
    let authEmulatorConnected = false;
    let firestoreEmulatorConnected = false;

    try {
      if (!authEmulatorConnected && hasAuthAvailable) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        authEmulatorConnected = true;
  devConsole.log?.('🔥 Firebase Auth emulator connected - development mode');
      }
    } catch {
      devConsole.log?.('Auth emulator already connected or unavailable');
    }

    try {
  if (!firestoreEmulatorConnected && hasFirestoreApp(db)) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        firestoreEmulatorConnected = true;
  devConsole.log?.('🔥 Firestore emulator connected - development mode');
      }
    } catch {
      devConsole.log?.('Firestore emulator already connected or unavailable');
    }
  }

  devConsole.log?.(`🔥 Firebase initialized for project: ${firebaseConfig.projectId}`);
} catch (error) {
  devConsole.error('Firebase initialization failed:', error);
  throw error;
}

/**
 * Performance optimization: Network management
 */
export const enableFirestoreNetwork = async (): Promise<void> => {
  try {
  if (hasFirestoreApp(db)) {
      await enableNetwork(db);
      devConsole.log?.('📡 Firestore network enabled');
    } else {
      devConsole.log?.('📡 Firestore not available, skipping network enable');
    }
  } catch (error) {
    devConsole.warn?.('Failed to enable Firestore network:', error);
  }
};

export const disableFirestoreNetwork = async (): Promise<void> => {
  try {
  if (hasFirestoreApp(db)) {
      await disableNetwork(db);
      devConsole.log?.('📡 Firestore network disabled');
    } else {
      devConsole.log?.('📡 Firestore not available, skipping network disable');
    }
  } catch (error) {
    devConsole.warn?.('Failed to disable Firestore network:', error);
  }
};

/**
 * Firebase service instances
 */
export { app, auth, db };
export { hasAuthAvailable };

/**
 * Environment utilities
 */
export const isEmulator = import.meta.env.DEV && import.meta.env['VITE_USE_EMULATOR'] === 'true';
export const isDevelopment = import.meta.env.DEV;
export const projectId = firebaseConfig.projectId;

/**
 * Performance monitoring
 */
export const getFirebasePerformanceInfo = () => ({
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  isEmulator,
  isDevelopment,
  timestamp: Date.now()
});
