import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set session persistence
setPersistence(auth, browserSessionPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(mapAuthError(error.code));
  }
};

export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(mapAuthError(error.code));
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(mapAuthError(error.code));
  }
};

export const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken(true);
  }
  throw new Error("No user logged in");
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Map Firebase error codes to user-friendly messages
const mapAuthError = (code) => {
  const errors = {
    "auth/invalid-email": "Invalid email format.",
    "auth/user-disabled": "Account is disabled.",
    "auth/user-not-found": "No account found. Please sign up.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "Email already in use.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-credential": "Invalid credentials.",
  };
  return errors[code] || "An error occurred. Please try again.";
};