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
  throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
}

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // Check if Firebase app already exists
  const existingApps = getApps();
  app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  
  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);

  // Connect to emulators in development
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
    let authEmulatorConnected = false;
    let firestoreEmulatorConnected = false;

    try {
      if (!authEmulatorConnected) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        authEmulatorConnected = true;
        console.log('🔥 Firebase Auth emulator connected - development mode');
      }
    } catch (error) {
      console.log('Auth emulator already connected or unavailable');
    }

    try {
      if (!firestoreEmulatorConnected) {
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
    await enableNetwork(db);
    console.log('📡 Firestore network enabled');
  } catch (error) {
    console.warn('Failed to enable Firestore network:', error);
  }
};

export const disableFirestoreNetwork = async (): Promise<void> => {
  try {
    await disableNetwork(db);
    console.log('📡 Firestore network disabled');
  } catch (error) {
    console.warn('Failed to disable Firestore network:', error);
  }
};

/**
 * Firebase service instances
 */
export { app, auth, db };

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
