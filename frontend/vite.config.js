// In frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',  // index.html in frontend root
  build: {
    outDir: 'dist',  // Output to frontend/dist
    assetsDir: 'assets',  // JS/CSS in dist/assets
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',  // Ensure consistent naming
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    proxy: {
      '/calculate': {
        target: 'https://astrology-app-0emh.onrender.com',
        changeOrigin: true
      }
    }
  }
});