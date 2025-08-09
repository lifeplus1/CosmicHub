// Simple vite.config.js for container compatibility
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname || __dirname, './src'),
      '@cosmichub/frequency': path.resolve(import.meta.dirname || __dirname, '../../packages/frequency/src'),
      '@cosmichub/auth': path.resolve(import.meta.dirname || __dirname, '../../packages/auth/src'),
      '@cosmichub/config': path.resolve(import.meta.dirname || __dirname, '../../packages/config/src'),
      '@cosmichub/ui': path.resolve(import.meta.dirname || __dirname, '../../packages/ui/src'),
      '@cosmichub/integrations': path.resolve(import.meta.dirname || __dirname, '../../packages/integrations/src'),
    },
  },
  
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
    ],
  },
});