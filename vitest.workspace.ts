/// <reference types="vitest" />
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Main applications
  {
    extends: './apps/astro/vitest.config.ts',
    test: {
      name: 'astro-app',
      root: './apps/astro',
    },
  },
  {
    extends: './apps/healwave/vitest.config.ts',
    test: {
      name: 'healwave-app',
      root: './apps/healwave',
    },
  },
  
  // Core packages - grouped for performance
  {
    test: {
      name: 'core-packages',
      include: [
        'packages/analytics/**/*.{test,spec}.{ts,tsx}',
        'packages/types/**/*.{test,spec}.{ts,tsx}',
        'packages/config/**/*.{test,spec}.{ts,tsx}',
      ],
      environment: 'node',
      globals: true,
    },
  },
  
  // UI and interaction packages - grouped for performance  
  {
    test: {
      name: 'ui-packages',
      include: [
        'packages/hooks/**/*.{test,spec}.{ts,tsx}',
        'packages/integrations/**/*.{test,spec}.{ts,tsx}',
      ],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./apps/astro/src/test-setup.ts'],
    },
  },
]);
