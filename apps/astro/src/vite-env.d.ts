/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom" />
/// <reference types="vitest/globals" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}