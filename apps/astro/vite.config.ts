import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Modern JSX runtime
      jsxRuntime: 'automatic',
    }),
  ],

  css: {
    postcss: './postcss.config.js',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@cosmichub/frequency': path.resolve(
        __dirname,
        '../../packages/frequency/src'
      ),
      '@cosmichub/auth': path.resolve(__dirname, '../../packages/auth/src'),
      '@cosmichub/config': path.resolve(__dirname, '../../packages/config/src'),
      '@cosmichub/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@cosmichub/integrations': path.resolve(
        __dirname,
        '../../packages/integrations/src'
      ),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core framework chunks
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // UI library chunks
          ui: [
            '@radix-ui/react-slider',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
          ],

          // Chart and visualization chunks (heavy components)
          charts: [
            './src/components/ChartDisplay/ChartDisplay.tsx',
            './src/features/ChartWheel.tsx',
            './src/components/MultiSystemChart/MultiSystemChartDisplay.tsx',
          ],

          // Authentication and user management
          auth: ['@cosmichub/auth'],

          // Astrology calculations and utilities
          astro: ['@cosmichub/frequency', './src/services/api.ts'],

          // Configuration and types
          config: ['@cosmichub/config', '@cosmichub/integrations'],

          // Shared UI components
          uiComponents: ['@cosmichub/ui'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  server: {
    port: 5174, // Swapped: astro now on 5174
    host: true,
    cors: true,
    hmr: {
      port: 5174,
      host: 'localhost',
    },
    proxy: {
      '/api': {
        // Proxy API calls to backend during development
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    port: 5174,
    host: true,
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@radix-ui/react-slider',
      '@radix-ui/react-tooltip',
    ],
    exclude: [
      '@cosmichub/frequency',
      '@cosmichub/auth',
      '@cosmichub/config',
      '@cosmichub/ui',
      '@cosmichub/integrations',
    ],
  },

  esbuild: {
    target: 'es2020',
    format: 'esm',
  },
});
