/**
 * Optimized Firebase Configuration
 * Centralized configuration with performance optimizations and emulator support
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// Firebase config with environment validation
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required config
const requiredEnvVars = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'];
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.warn(`Missing required Firebase environment variables: ${missingVars.join(', ')}. Using mock auth.`);
}

//Initialize Firebase app (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let hasAuthAvailable = false;

try {
  // Check if Firebase app already exists
  const existingApps = getApps();
  app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  
  // Initialize services with error handling
  try {
    auth = getAuth(app);
    hasAuthAvailable = true;
  } catch (authError) {
    console.warn('Firebase Auth initialization failed, using fallback:', authError);
    // Create a proxy that warns instead of throwing
    auth = new Proxy({} as Auth, {
      get() {
        console.warn('Firebase Auth not available - using mock auth instead');
        return undefined;
      }
    }) as Auth;
    hasAuthAvailable = false;
  }
  
  try {
    db = getFirestore(app);
  } catch (dbError) {
    console.warn('Firestore initialization failed:', dbError);
    // Create a proxy for Firestore as well
    db = new Proxy({} as Firestore, {
      get() {
        console.warn('Firestore not available');
        return undefined;
      }
    }) as Firestore;
  }

  // Connect to emulators in development
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
    let authEmulatorConnected = false;
    let firestoreEmulatorConnected = false;

    try {
      if (!authEmulatorConnected && hasAuthAvailable) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        authEmulatorConnected = true;
        console.log('🔥 Firebase Auth emulator connected - development mode');
      }
    } catch (error) {
      console.log('Auth emulator already connected or unavailable');
    }

    try {
      if (!firestoreEmulatorConnected && db && db.app) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        firestoreEmulatorConnected = true;
        console.log('🔥 Firestore emulator connected - development mode');
      }
    } catch (error) {
      console.log('Firestore emulator already connected or unavailable');
    }
  }

  console.log(`🔥 Firebase initialized for project: ${firebaseConfig.projectId}`);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw error;
}

/**
 * Performance optimization: Network management
 */
export const enableFirestoreNetwork = async (): Promise<void> => {
  try {
    if (db && db.app) {
      await enableNetwork(db);
      console.log('📡 Firestore network enabled');
    } else {
      console.log('📡 Firestore not available, skipping network enable');
    }
  } catch (error) {
    console.warn('Failed to enable Firestore network:', error);
  }
};

export const disableFirestoreNetwork = async (): Promise<void> => {
  try {
    if (db && db.app) {
      await disableNetwork(db);
      console.log('📡 Firestore network disabled');
    } else {
      console.log('📡 Firestore not available, skipping network disable');
    }
  } catch (error) {
    console.warn('Failed to disable Firestore network:', error);
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
export const isEmulator = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true';
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
