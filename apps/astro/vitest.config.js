"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="vitest" />
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var path_1 = require("path");
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['**/*.{test,spec}.{ts,tsx}'],
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
            '@': path_1.default.resolve(__dirname, './src'),
            '@cosmichub/frequency': path_1.default.resolve(__dirname, '../../packages/frequency/src'),
            '@cosmichub/auth': path_1.default.resolve(__dirname, '../../packages/auth/src'),
            '@cosmichub/config': path_1.default.resolve(__dirname, '../../packages/config/src'),
            '@cosmichub/ui': path_1.default.resolve(__dirname, '../../packages/ui/src'),
            '@cosmichub/integrations': path_1.default.resolve(__dirname, '../../packages/integrations/src'),
        },
    },
});
