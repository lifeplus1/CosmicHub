// firebase.ts
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator as connectFirestore, getFirestore } from 'firebase/firestore';

// Firebase config from VITE env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Use emulators in development only if they're available and we're not in production
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    // Only connect to emulators if they're explicitly enabled
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestore(db, 'localhost', 8080);
    console.log('🔥 Firebase emulators connected - zero cost development mode');
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
} else {
  console.log('🔥 Using production Firebase services');
}