"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var js_1 = require("@eslint/js");
var globals_1 = require("globals");
var eslint_plugin_react_hooks_1 = require("eslint-plugin-react-hooks");
var eslint_plugin_react_refresh_1 = require("eslint-plugin-react-refresh");
var eslint_plugin_1 = require("@typescript-eslint/eslint-plugin");
var parser_1 = require("@typescript-eslint/parser");
var eslint_plugin_jsx_a11y_1 = require("eslint-plugin-jsx-a11y");
exports.default = [
    { ignores: ['dist', 'node_modules', '**/*.d.ts'] },
    js_1.default.configs.recommended,
    eslint_plugin_1.default.configs.recommended,
    eslint_plugin_jsx_a11y_1.default.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
            globals: __assign(__assign({}, globals_1.default.browser), globals_1.default.es2020),
            parser: parser_1.default,
            parserOptions: {
                ecmaFeatures: { jsx: true },
                project: './tsconfig.json',
            },
        },
        plugins: {
            'react-hooks': eslint_plugin_react_hooks_1.default,
            'react-refresh': eslint_plugin_react_refresh_1.default,
            '@typescript-eslint': eslint_plugin_1.default,
            'jsx-a11y': eslint_plugin_jsx_a11y_1.default,
        },
        rules: __assign(__assign({}, eslint_plugin_react_hooks_1.default.configs.recommended.rules), { 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }], 
            // Strict TypeScript Rules
            '@typescript-eslint/no-unused-vars': ['error', {
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                    ignoreRestSiblings: true
                }], '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/explicit-function-return-type': ['error', {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true,
                    allowHigherOrderFunctions: true,
                }], '@typescript-eslint/consistent-type-imports': ['error', {
                    prefer: 'type-imports',
                    fixStyle: 'inline-type-imports',
                }], '@typescript-eslint/no-floating-promises': 'error', '@typescript-eslint/no-misused-promises': 'error', '@typescript-eslint/await-thenable': 'error', '@typescript-eslint/require-await': 'error', '@typescript-eslint/prefer-nullish-coalescing': 'error', '@typescript-eslint/prefer-optional-chain': 'error', 
            // Accessibility Rules  
            'jsx-a11y/no-autofocus': 'warn', 'jsx-a11y/anchor-is-valid': 'error', 'jsx-a11y/alt-text': 'error', 
            // Performance Rules
            'react-hooks/exhaustive-deps': 'error', 
            // Code Quality
            'no-console': ['warn', { allow: ['warn', 'error'] }], 'no-debugger': 'error', 'prefer-const': 'error', 'no-var': 'error', 'object-shorthand': 'error', 'prefer-template': 'error' }),
    },
    {
        files: ['**/*.{js,jsx}'],
        rules: {
            'no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
        },
    },
];
