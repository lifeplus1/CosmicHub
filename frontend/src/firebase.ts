import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'astrology-app-9c2e9.firebaseapp.com',
  projectId: 'astrology-app-9c2e9',
  storageBucket: 'astrology-app-9c2e9.appspot.com',
  messagingSenderId: '341259782663',
  appId: '1:341259782663:web:132d7b85d8518c5f3bf8a2', // Replace with your actual appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
// Initialize Auth
const auth = getAuth(app);

export { db, auth };