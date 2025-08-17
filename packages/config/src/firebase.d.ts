/**
 * Optimized Firebase Configuration
 * Centralized configuration with performance optimizations and emulator support
 */
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
declare let app: FirebaseApp;
declare let auth: Auth;
declare let db: Firestore;
declare let hasAuthAvailable: boolean;
/**
 * Performance optimization: Network management
 */
export declare const enableFirestoreNetwork: () => Promise<void>;
export declare const disableFirestoreNetwork: () => Promise<void>;
/**
 * Firebase service instances
 */
export { app, auth, db };
export { hasAuthAvailable };
/**
 * Environment utilities
 */
export declare const isEmulator: boolean;
export declare const isDevelopment: boolean;
export declare const projectId: string;
/**
 * Performance monitoring
 */
export declare const getFirebasePerformanceInfo: () => {
    projectId: string;
    authDomain: string;
    isEmulator: boolean;
    isDevelopment: boolean;
    timestamp: number;
};
//# sourceMappingURL=firebase.d.ts.map