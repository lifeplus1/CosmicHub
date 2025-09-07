/**
 * Optimized Firebase Configuration
 * Centralized configuration with performance optimizations and emulator support
 */

/// <reference types="vite/client" />

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  Firestore,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';

// Firebase config validation following CosmicHub type safety patterns
interface FirebaseEnvConfig {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_USE_EMULATOR?: string;
  VITE_USE_MOCK_AUTH?: string;
  DEV: boolean;
}

// Environment access - compatible with both Vite and Node environments
const getEnvValue = (key: string): string | undefined => {
  // Check Vite environment first (import.meta.env)
  if (import.meta?.env) {
    const viteValue = import.meta.env[key] as string | undefined;
    if (viteValue !== undefined && viteValue !== '') {
      return viteValue;
    }
  }
  
  // Fallback to process.env (Node environment) for better compatibility
  if (typeof process !== 'undefined' && process.env) {
    const processValue = process.env[key];
    if (processValue !== undefined && processValue !== '') {
      return processValue;
    }
  }
  return undefined;
};

const env: FirebaseEnvConfig = {
  VITE_FIREBASE_API_KEY: getEnvValue('VITE_FIREBASE_API_KEY'),
  VITE_FIREBASE_AUTH_DOMAIN: getEnvValue('VITE_FIREBASE_AUTH_DOMAIN'),
  VITE_FIREBASE_PROJECT_ID: getEnvValue('VITE_FIREBASE_PROJECT_ID'),
  VITE_FIREBASE_STORAGE_BUCKET: getEnvValue('VITE_FIREBASE_STORAGE_BUCKET'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: getEnvValue(
    'VITE_FIREBASE_MESSAGING_SENDER_ID'
  ),
  VITE_FIREBASE_APP_ID: getEnvValue('VITE_FIREBASE_APP_ID'),
  VITE_USE_EMULATOR: getEnvValue('VITE_USE_EMULATOR'),
  VITE_USE_MOCK_AUTH: getEnvValue('VITE_USE_MOCK_AUTH'),
  DEV: getEnvValue('NODE_ENV') !== 'production',
};

// Validate required Firebase configuration (following CosmicHub validation patterns)
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const hasValidFirebaseConfig = (): boolean => {
  return requiredEnvVars.every(varName => {
    const value = env[varName];
    return value !== undefined && value !== null && value !== '';
  });
};

// Development console (respects environment, no-op in production for performance)
const devConsole = {
  log: env.DEV ? console.log.bind(console) : (() => {}),
  warn: env.DEV ? console.warn.bind(console) : (() => {}),
  error: console.error.bind(console),
};

// Firebase configuration (only created if validation passes)
const createFirebaseConfig = () => ({
  apiKey: env.VITE_FIREBASE_API_KEY!,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID!,
});

// Initialize Firebase following CosmicHub error handling patterns
const shouldInitializeFirebase = hasValidFirebaseConfig();
const isExplicitMockMode = env.VITE_USE_MOCK_AUTH === 'true';
const isTestEnvironment = getEnvValue('NODE_ENV') === 'test' || 
  getEnvValue('VITEST') === 'true' || 
  typeof process !== 'undefined' && process.env.VITEST === 'true';

if (!shouldInitializeFirebase) {
  if (!isExplicitMockMode && !isTestEnvironment) {
    devConsole.log('🧪 Firebase environment not configured, using mock auth for development');
    devConsole.log(`Missing required Firebase environment variables: ${requiredEnvVars.filter(key => !env[key]).join(', ')}. Using mock auth.`);
  } else if (isTestEnvironment) {
    devConsole.log('🧪 Test environment detected, using mock Firebase services');
  } else {
    devConsole.log('🧪 Mock auth mode explicitly enabled for development');
  }
}

//Initialize Firebase app (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let hasAuthAvailable = false;

// Type guard for Firestore instance presence
const hasFirestoreApp = (instance: unknown): instance is Firestore => {
  return (
    typeof instance === 'object' &&
    instance !== null &&
    'app' in (instance as Record<string, unknown>)
  );
};

if (shouldInitializeFirebase && !isTestEnvironment) {
  try {
    const firebaseConfig = createFirebaseConfig();
    
    // Check if Firebase app already exists
    const existingApps = getApps();
    if (existingApps && existingApps.length > 0 && existingApps[0]) {
      app = existingApps[0];
    } else {
      app = initializeApp(firebaseConfig);
    }

    // Initialize services with error handling
    try {
      auth = getAuth(app);
      hasAuthAvailable = true;
    } catch (authError) {
      devConsole.warn?.(
        'Firebase Auth initialization failed, using fallback:',
        authError
      );
      // Create a proxy that warns instead of throwing (unless in explicit mock mode)
      /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
      auth = new Proxy({} as unknown as Auth, {
        get() {
          if (!isExplicitMockMode) {
            devConsole.warn?.(
              'Firebase Auth not available - using mock auth instead'
            );
          }
          return undefined as unknown as never;
        },
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
        },
      }) as Firestore;
      /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
    }

    // Connect to emulators in development
    if (env.DEV && env['VITE_USE_EMULATOR'] === 'true') {
      let authEmulatorConnected = false;
      let firestoreEmulatorConnected = false;

      try {
        if (!authEmulatorConnected && hasAuthAvailable) {
          connectAuthEmulator(auth, 'http://localhost:9099', {
            disableWarnings: true,
          });
          authEmulatorConnected = true;
          devConsole.log?.(
            '🔥 Firebase Auth emulator connected - development mode'
          );
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

    if (!isTestEnvironment) {
      devConsole.log(
        `🔥 Firebase initialized for project: ${env.VITE_FIREBASE_PROJECT_ID}`
      );
    }
  } catch (error) {
    devConsole.error('Firebase initialization failed:', error);
    hasAuthAvailable = false;
    // Create proxy objects for failed initialization
    /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
    auth = new Proxy({} as unknown as Auth, {
      get() {
        devConsole.warn?.('Firebase Auth not available - using mock auth instead');
        return undefined as unknown as never;
      },
    }) as Auth;
    
    db = new Proxy({} as unknown as Firestore, {
      get() {
        devConsole.warn?.('Firestore not available');
        return undefined as unknown as never;
      },
    }) as Firestore;
    /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
  }
} else {
  // Mock mode - create proxy objects that don't attempt Firebase operations
  hasAuthAvailable = false;
  
  /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
  auth = new Proxy({} as unknown as Auth, {
    get() {
      // Silent proxy for mock mode - no warnings needed
      return undefined as unknown as never;
    },
  }) as Auth;
  
  db = new Proxy({} as unknown as Firestore, {
    get() {
      // Silent proxy for mock mode - no warnings needed
      return undefined as unknown as never;
    },
  }) as Firestore;
  
  app = {} as FirebaseApp;
  /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
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
export const isEmulator = env.DEV && env['VITE_USE_EMULATOR'] === 'true';
export const isDevelopment = env.DEV;
export const projectId = env.VITE_FIREBASE_PROJECT_ID;

/**
 * Performance monitoring
 */
export const getFirebasePerformanceInfo = () => ({
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  isEmulator,
  isDevelopment,
  timestamp: Date.now(),
});
