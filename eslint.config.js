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
  // Global ignores - applies to all configurations
  {
    ignores: [
      // Build artifacts and dependencies
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/out/**',
      '**/public/**',
      '**/static/**',
      '**/*.min.js',
      '**/vendor/**',
      '**/lib/**',
      '**/generated/**',
      '**/htmlcov/**',
      
      // Configuration and tooling files that shouldn't be linted
      '**/.storybook/**',
      '**/storybook-static/**',
      '**/scripts/**',
      '**/postcss.config.*',
      '**/tailwind.config.*',
      '**/vite.config.*',
      '**/vitest.config.*',
      
      // Test setup and utility files that shouldn't be linted
      '**/test-setup.ts',
      '**/test-utils/**',
      
      // Story files (separate linting if needed)
      '**/*.stories.{js,ts,tsx}',
      
      // Backend files (Python project, not TypeScript)
      'backend/**',
      
      // Cache and temp files
      '**/.cache/**',
      '**/tmp/**',
      '**/temp/**',
      '**/cache/**',
      '**/logs/**',
      
      // Additional build artifacts
      '**/storybook-static/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/htmlcov/**',
      
      // Non-JS files that shouldn't be linted
      '**/*.py',
      '**/*.pyc',
      '**/*.log',
      '**/*.cache',
      '**/*.md',
      '**/*.json',
      '**/*.yaml',
      '**/*.yml',
      
      // Generated type files
      '**/*.d.ts'
    ]
  },
  // Stricter test files configuration with full type-aware rules
  {
    files: [
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/tests/**/*.{ts,tsx,js,jsx}',
      '**/__tests__/**/*.{ts,tsx,js,jsx}'
    ],
    languageOptions: {
      parser: tsparser,
      globals: { ...globals.node, ...globals.browser, ...globals.es2020, JSX: 'readonly' },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: [
          'apps/astro/tsconfig.json',
          'apps/healwave/tsconfig.json',
          'packages/types/tsconfig.test.json',
          'packages/auth/tsconfig.json',
          'packages/ui/tsconfig.json'
        ],
        ecmaFeatures: { jsx: true }
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Relax overly strict rules in tests to reduce noise
      'no-console': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/strict-boolean-expressions': ['error', {
        allowString: false,
        allowNumber: false,
        allowNullableObject: false,
        allowNullableBoolean: false,
        allowNullableString: false,
        allowNullableNumber: false,
        allowNullableEnum: false,
        allowAny: false
      }],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowHigherOrderFunctions: true,
        allowConciseArrowFunctionExpressionsStartingWithVoid: true
      }],
      '@typescript-eslint/no-explicit-any': 'warn'
    },
  },
  
  // Test files with relaxed TypeScript rules
  {
    files: [
      '**/*.test.{ts,tsx}', 
      '**/*.spec.{ts,tsx}', 
      '**/tests/**/*.{ts,tsx}', 
      '**/__tests__/**/*.{ts,tsx}', 
      '**/test/**/*.{ts,tsx}',
      '**/apps/astro/src/test/setup.ts'
    ],
    languageOptions: {
      parser: tsparser,
      globals: { ...globals.browser, ...globals.jest, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: [
          'apps/astro/tsconfig.json',
          'apps/healwave/tsconfig.json'
        ]
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off'
    }
  },
  
  {
  files: ['apps/**/*.{ts,tsx}','packages/**/*.{ts,tsx}'],
  // Exclude test/spec files here; they are handled by the earlier, more relaxed test config.
  ignores: [
    '**/*.test.*',
    '**/*.spec.*', 
    '**/tests/**',
    '**/__tests__/**'
  ],
    languageOptions: {
      parser: tsparser,
      globals: { ...globals.browser, ...globals.es2020 },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: [
          'apps/astro/tsconfig.json',
          'apps/healwave/tsconfig.json',
          'packages/auth/tsconfig.json',
          'packages/config/tsconfig.json',
          'packages/integrations/tsconfig.json',
          'packages/types/tsconfig.json',
          'packages/ui/tsconfig.json'
        ],
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
      'react-hooks/exhaustive-deps': 'off',
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
      'no-console': 'off',
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: false, ignoreRestArgs: false }],
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': false,
        'ts-nocheck': false,
        'ts-check': false,
        minimumDescriptionLength: 10
      }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
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
  prettier,
];
