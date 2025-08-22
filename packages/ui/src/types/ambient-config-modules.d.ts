// Temporary ambient module declarations to satisfy TypeScript until package export d.ts fully resolves
declare module '@cosmichub/config/firebase' {
  import type { FirebaseApp } from 'firebase/app';
  import type { Auth } from 'firebase/auth';
  import type { Firestore } from 'firebase/firestore';
  export const app: FirebaseApp;
  export const auth: Auth;
  export const db: Firestore;
  export const hasAuthAvailable: boolean;
  export const enableFirestoreNetwork: () => Promise<void>;
  export const disableFirestoreNetwork: () => Promise<void>;
  export const isEmulator: boolean;
  export const isDevelopment: boolean;
  export const projectId: string | undefined;
  export function getFirebasePerformanceInfo(): Record<string, unknown>;
}
