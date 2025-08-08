/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': '"test-api-key"',
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': '"test-project.firebaseapp.com"',
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': '"test-project"',
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': '"test-project.appspot.com"',
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': '"123456789"',
    'import.meta.env.VITE_FIREBASE_APP_ID': '"1:123456789:web:test-app-id"',
    'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': '"G-TEST123"',
    'import.meta.env.DEV': 'false',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    env: {
      VITE_FIREBASE_API_KEY: 'test-api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
      VITE_FIREBASE_APP_ID: '1:123456789:web:test-app-id',
      VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST123',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@cosmichub/frequency': path.resolve(__dirname, '../../packages/frequency/src'),
      '@cosmichub/auth': path.resolve(__dirname, '../../packages/auth/src'),
      '@cosmichub/config': path.resolve(__dirname, '../../packages/config/src'),
      '@cosmichub/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@cosmichub/integrations': path.resolve(__dirname, '../../packages/integrations/src'),
    },
  },
});