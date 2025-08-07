// shared/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
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
export const app = initializeApp(firebaseConfig);
// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
// Use emulators in development only if they're available and we're not in production
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
    try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('🔥 Firebase Auth emulator connected - zero cost development mode');
    }
    catch (error) {
        console.log('Auth emulator already connected or not available');
    }
    try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('🔥 Firebase Firestore emulator connected - zero cost development mode');
    }
    catch (error) {
        console.log('Firestore emulator already connected or not available');
    }
}
