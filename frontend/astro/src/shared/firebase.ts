import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'test-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'test-auth-domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'test-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'test-storage-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'test-messaging-sender-id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'test-app-id',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
