// firebase.ts
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator as connectFirestore, getFirestore } from 'firebase/firestore';

// Initialize Firebase Auth and Firestore
export const auth = getAuth();
const db = getFirestore();

if (import.meta.env.VITE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestore(db, 'localhost', 8080);
}