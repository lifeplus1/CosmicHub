// Temporary ambient module declarations to satisfy TypeScript until package export d.ts fully resolves
declare module '@cosmichub/config/firebase' {
  import type { FirebaseApp } from 'firebase/app';
  import type { Auth } from 'firebase/auth';
  import type { Firestore } from 'firebase/firestore';
  export const app: FirebaseApp;
  export const auth: Auth;
  export const db: Firestore;
  export const hasAuthAvailable: boolean;
  export const isDevelopment: boolean;
}
