// shared/firebase.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase config from VITE env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log('🔥 Initializing Firebase with config:', firebaseConfig);

// Initialize Firebase app first
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize services with proper error handling
export const auth: Auth = (() => {
  try {
    const authInstance = getAuth(app);
    console.log('✅ Firebase Auth initialized successfully');
    return authInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Auth:', error);
    throw error;
  }
})();

export const db: Firestore = (() => {
  try {
    const dbInstance = getFirestore(app);
    console.log('✅ Firebase Firestore initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Firestore:', error);
    throw error;
  }
})();

// Use emulators in development only if they're available and we're not in production
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('🔥 Firebase Auth emulator connected - zero cost development mode');
  } catch (error) {
    console.log('Auth emulator already connected or not available');
  }
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔥 Firebase Firestore emulator connected - zero cost development mode');
  } catch (error) {
    console.log('Firestore emulator already connected or not available');
  }
}
