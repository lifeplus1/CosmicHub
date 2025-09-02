/// <reference types="vitest" />
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Main applications - primary test suites
  {
    extends: './apps/astro/vitest.config.ts',
    test: {
      name: 'astro-app',
      root: './apps/astro',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  },
  {
    extends: './apps/healwave/vitest.config.ts', 
    test: {
      name: 'healwave-app',
      root: './apps/healwave',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  },

  // All packages - consolidated for performance
  {
    test: {
      name: 'packages',
      include: [
        'packages/**/*.{test,spec}.{ts,tsx}',
      ],
      exclude: [
        'packages/**/node_modules/**',
        'packages/**/dist/**',
        'packages/**/*.d.ts',
      ],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./apps/astro/src/test-setup.ts'],
      testTimeout: 10000,
      root: '.',
    },
  },
]);
