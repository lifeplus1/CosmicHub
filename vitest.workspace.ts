/// <reference types="vitest" />
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Main applications - extend their individual configurations
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

  // All packages - consolidated configuration for optimal performance
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
        // Exclude ALL third-party test files that use Jest APIs
        'packages/**/node-modules/**/*.test.ts',
        'packages/**/node-modules/**/*.spec.ts',
        'packages/**/node_modules/.ignored/**/*.test.ts',
        'packages/**/node_modules/.pnpm/**/*.test.ts',
        'packages/**/.pnpm/**/*.test.ts',
        'packages/**/.ignored/**/*.test.ts',
        // Specifically exclude Stripe test files
        'packages/integrations/node-modules/@stripe/**/*.test.ts',
        'packages/integrations/node-modules/.ignored/@stripe/**/*.test.ts',
        'packages/integrations/node-modules/.pnpm/@stripe/**/*.test.ts',
        // Exclude any test files in symlinked node_modules directories
        '**/node-modules/**/*.{test,spec}.{ts,tsx,js,jsx}',
        '**/node_modules/**/*.{test,spec}.{ts,tsx,js,jsx}',
      ],
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./apps/astro/src/test-setup.ts'],
      testTimeout: 10000,
      root: '.',
      // Optimized threading for package tests
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: false,
        },
      },
      // Optimize dependencies for better performance
      server: {
        deps: {
          inline: [
            /^@cosmichub\//,
            'vitest-axe',
          ],
        },
      },
    },
  },
]);
