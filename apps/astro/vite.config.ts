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
      '@cosmichub/frequency': path.resolve(__dirname, '../../packages/frequency/src'),
      '@cosmichub/auth': path.resolve(__dirname, '../../packages/auth/src'),
      '@cosmichub/config': path.resolve(__dirname, '../../packages/config/src'),
      '@cosmichub/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@cosmichub/integrations': path.resolve(__dirname, '../../packages/integrations/src'),
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
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-slider', '@radix-ui/react-tooltip'],
          astro: ['@cosmichub/frequency'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  
  server: {
    port: 5174, // Swapped: astro now on 5174
    host: true,
    cors: true,
    proxy: {
      '/api': {
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