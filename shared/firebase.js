"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = exports.app = void 0;
// shared/firebase.ts
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
// Firebase config from VITE env variables
var firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// Initialize Firebase app
exports.app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Auth and Firestore
exports.auth = (0, auth_1.getAuth)(exports.app);
exports.db = (0, firestore_1.getFirestore)(exports.app);
// Use emulators in development only if they're available and we're not in production
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
    try {
        (0, auth_1.connectAuthEmulator)(exports.auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('🔥 Firebase Auth emulator connected - zero cost development mode');
    }
    catch (error) {
        console.log('Auth emulator already connected or not available');
    }
    try {
        (0, firestore_1.connectFirestoreEmulator)(exports.db, 'localhost', 8080);
        console.log('🔥 Firebase Firestore emulator connected - zero cost development mode');
    }
    catch (error) {
        console.log('Firestore emulator already connected or not available');
    }
}
