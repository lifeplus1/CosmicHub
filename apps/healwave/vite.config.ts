import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react({
        // Include JSX runtime automatically
        jsxRuntime: 'automatic',
        // Enable React DevTools in development
        include: '**/*.{jsx,tsx}',
      }),
    ],
    
    // Path resolution for cleaner imports
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@pages': resolve(__dirname, './src/pages'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@utils': resolve(__dirname, './src/utils'),
        '@services': resolve(__dirname, './src/services'),
        '@types': resolve(__dirname, './src/types'),
      },
    },

    // Development server configuration
    server: {
      port: 3000, // Changed from 3001 to match Docker mapping
      host: true,
      open: false, // Don't auto-open browser
      hmr: {
        port: 3000, // Changed from 3001 to match Docker mapping
        host: 'localhost',
      },
      watch: {
        usePolling: false, // Better performance than polling
        ignored: ['**/node_modules/**', '**/dist/**'],
      },
    },

    // Build optimizations
    build: {
      target: 'es2022',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: 'esbuild', // Faster than terser
      
      // Code splitting and chunk optimization
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'radix-vendor': ['@radix-ui/react-slider', '@radix-ui/react-tooltip', '@radix-ui/react-switch'],
          },
          // Asset naming for long-term caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      
      // Performance budgets
      chunkSizeWarningLimit: 500,
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        '@radix-ui/react-slider',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-switch',
      ],
      exclude: ['@cosmichub/*'], // Don't pre-bundle our packages
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    // CSS configuration
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      devSourcemap: mode === 'development',
    },

    // Preview server (for production builds)
    preview: {
      port: 4174,
      host: true,
    },

    // Worker configuration for Web Workers
    worker: {
      format: 'es',
    },

    // JSON configuration
    json: {
      namedExports: true,
      stringify: false,
    },
  };
});