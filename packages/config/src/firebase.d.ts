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
export declare const isEmulator: any;
export declare const isDevelopment: any;
export declare const projectId: any;
/**
 * Performance monitoring
 */
export declare const getFirebasePerformanceInfo: () => {
    projectId: any;
    authDomain: any;
    isEmulator: any;
    isDevelopment: any;
    timestamp: number;
};
//# sourceMappingURL=firebase.d.ts.map