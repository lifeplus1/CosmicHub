import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
// @ts-ignore - Type conflict between @types/node versions in monorepo
export default defineConfig(({ mode }) => {
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
      port: 3000,
      host: true, // Listen on all addresses (0.0.0.0)
      open: false, // Don't auto-open browser
      strictPort: false, // Allow fallback to different port
      hmr: {
        port: 3000,
        host: 'localhost',
        overlay: true, // Show errors in browser overlay
      },
      watch: {
        usePolling: false, // Better performance than polling
        ignored: [
          'node_modules/**', 
          'dist/**',
          'test-results/**',
          'coverage/**',
          '.git/**',
          'backups/**'
        ],
      },
    },

    // Build optimizations
    build: {
      target: 'es2022',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,

      // Code splitting and chunk optimization
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'firebase-vendor': [
              'firebase/app',
              'firebase/auth',
              'firebase/firestore',
            ],
            'radix-vendor': [
              '@radix-ui/react-slider',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-switch',
              '@radix-ui/react-tabs',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
            ],
            // CosmicHub packages chunks
            'cosmichub-auth': ['@cosmichub/auth'],
            'cosmichub-integrations': ['@cosmichub/integrations'],
            // Audio components chunk
            'audio-components': [
              './src/components/AudioPlayer.enhanced',
              './src/components/FrequencyControls',
              './src/components/DurationTimer',
            ],
          },
          // Asset naming for long-term caching
          chunkFileNames: mode === 'production' 
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          entryFileNames: mode === 'production' 
            ? 'assets/js/[name]-[hash].js'
            : 'assets/js/[name].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
              return mode === 'production' 
                ? 'assets/images/[name]-[hash][extname]'
                : 'assets/images/[name][extname]';
            }
            if (/\.css$/.test(name ?? '')) {
              return mode === 'production'
                ? 'assets/css/[name]-[hash][extname]'
                : 'assets/css/[name][extname]';
            }
            return mode === 'production'
              ? 'assets/[name]-[hash][extname]'
              : 'assets/[name][extname]';
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
      exclude: [
        '@cosmichub/*', // Don't pre-bundle our packages
      ],
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      // Define process.env for browser compatibility
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env': {},
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
