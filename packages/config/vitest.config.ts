/**
 * CosmicHub Testing Configuration
 * Central configuration for comprehensive testing infrastructure
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment setup
    environment: 'jsdom',
    setupFiles: ['./src/testing/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/',
        '**/.{git,turbo,vscode}/',
        'packages/config/src/testing/setup.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      watermarks: {
        statements: [60, 80],
        functions: [60, 80],
        branches: [60, 80],
        lines: [60, 80],
      },
    },

    // Performance settings
    testTimeout: 10000,
    hookTimeout: 10000,

    // Output configuration
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html',
    },

    // Global test settings
    globals: true,

    // File patterns
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'packages/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'apps/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: ['node_modules', 'dist', 'coverage', '**/*.d.ts'],
  },

  // Resolve aliases for testing
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@packages': resolve(__dirname, './packages'),
      '@apps': resolve(__dirname, './apps'),
      '@testing': resolve(__dirname, './packages/config/src/testing'),
    },
  },

  // Define for testing environment
  define: {
    __TEST__: true,
    __DEV__: process.env.NODE_ENV !== 'production',
  },
});
