import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
  files: ['apps/**/*.{ts,tsx}','packages/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      globals: { ...globals.browser, ...globals.es2020 },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
  project: ['apps/astro/tsconfig.json', 'apps/healwave/tsconfig.json', 'packages/auth/tsconfig.json', 'packages/types/tsconfig.json'],
        ecmaFeatures: { jsx: true }
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      ...tseslint.configs['recommended-type-checked'].rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'error',
      'react/no-unescaped-entities': 'error',
      'react/jsx-key': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'no-restricted-imports': [
        'error',
        {
          'paths': [{ 'name': 'shared', 'message': 'Do not import from shared/. Use @cosmichub/subscriptions or other packages.' }],
          'patterns': ['shared/*']
        }
      ]
    },
  },
  // Test files and setup (jest, node globals)
  {
    files: [
      '**/test/**',
      '**/tests/**',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/setupTests.*',
      '**/test-setup.*'
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest, ...globals.browser, ...globals.es2020 },
    },
    rules: {
      // Relax browser-only rules in test runner environment
      'no-console': 'off',
    },
  },
  prettier,
];
