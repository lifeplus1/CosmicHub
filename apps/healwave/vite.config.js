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
                '@': resolve(process.cwd(), './src'),
                '@components': resolve(process.cwd(), './src/components'),
                '@pages': resolve(process.cwd(), './src/pages'),
                '@hooks': resolve(process.cwd(), './src/hooks'),
                '@utils': resolve(process.cwd(), './src/utils'),
                '@services': resolve(process.cwd(), './src/services'),
                '@types': resolve(process.cwd(), './src/types'),
                // Package aliases for direct TypeScript imports
                '@cosmichub/auth': resolve(process.cwd(), '../../packages/auth/src/index.tsx'),
                '@cosmichub/config': resolve(process.cwd(), '../../packages/config/src/index.ts'),
                '@cosmichub/frequency': resolve(process.cwd(), '../../packages/frequency/src/index.ts'),
                '@cosmichub/integrations': resolve(process.cwd(), '../../packages/integrations/src/index.ts'),
            },
        },
        // Development server configuration
        server: {
            port: 5174,
            host: true,
            open: false, // Don't auto-open browser
            hmr: {
                port: 5174,
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
