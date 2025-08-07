import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  jsxA11y.configs.recommended, // For WCAG accessibility
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2020 },
      parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json', // Reference tsconfig for type-aware linting
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', ignoreRestSiblings: true }],
      '@typescript-eslint/no-explicit-any': 'error', // Strict: error instead of warn
      '@typescript-eslint/explicit-function-return-type': 'error', // Strict return types
      '@typescript-eslint/consistent-type-imports': 'error', // Enforce consistent imports
      '@typescript-eslint/no-floating-promises': 'error', // Handle promises properly
      '@typescript-eslint/no-misused-promises': 'error',
      'no-unused-vars': 'off', // Defer to @typescript-eslint version
      'jsx-a11y/no-autofocus': 'warn', // Accessibility rule example
      'react-hooks/exhaustive-deps': 'error', // Strict deps for hooks
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
];