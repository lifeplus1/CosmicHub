import { defineConfig } from 'vitest/config';

// Analytics package Vitest configuration ensuring tests use the dedicated test tsconfig.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/__tests__/**/*.test.ts',
      'src/**/__tests__/**/*.test.tsx',
    ],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/__tests__/**'],
    },
  },
  // Using default esbuild; TS path resolution handled by project references / base config.
  resolve: {
    conditions: ['browser', 'module', 'import', 'default'],
  },
});
