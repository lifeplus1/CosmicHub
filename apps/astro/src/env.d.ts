/**
 * Ambient environment variable type declarations for Vite / Astro app.
 * Provides explicit properties so we can safely use dot property access
 * under the `noPropertyAccessFromIndexSignature` compiler option.
 *
 * Required vars are non-optional (validated by zod in environment.ts),
 * optional vars are marked optional and may be absent at build time.
 *
 * NOTE:
 * - Prefer consuming configuration via the exported helpers/objects
 *   in `config/environment.ts` (e.g. `apiConfig.baseUrl`) instead of
 *   reading from `import.meta.env` directly inside feature code.
 * - `VITE_BACKEND_URL` is retained as a backwards-compatibility alias
 *   but new code should use `VITE_API_URL`.
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** Primary backend API base URL (preferred). */
  readonly VITE_API_URL?: string;
  /** Deprecated: fallback / legacy variable name for API base URL. */
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_XAI_API_KEY?: string;
  /** Feature flags (string 'true' interpreted elsewhere). */
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_ERROR_REPORTING?: string;
  /** Standard Vite injected variables */
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
