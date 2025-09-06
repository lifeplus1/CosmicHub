// Alternative Vite config with better type safety
import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const config: UserConfig = {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        include: '**/*.{jsx,tsx}',
      }),
    ],

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

    server: {
      port: 3000,
      host: true,
      open: false,
      strictPort: false,
      hmr: {
        port: 3000,
        host: 'localhost',
        overlay: true,
      },
      watch: {
        usePolling: false,
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

    build: {
      target: 'es2022',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            'radix-vendor': ['@radix-ui/react-slider', '@radix-ui/react-tooltip', '@radix-ui/react-switch'],
          },
        },
      },
      chunkSizeWarningLimit: 500,
    },

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
      exclude: ['@cosmichub/*'],
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      devSourcemap: mode === 'development',
    },

    preview: {
      port: 4174,
      host: true,
    },

    worker: {
      format: 'es',
    },

    json: {
      namedExports: true,
      stringify: false,
    },
  };

  return config;
});
