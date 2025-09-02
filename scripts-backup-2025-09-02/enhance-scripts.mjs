#!/usr/bin/env node

import fs from 'fs';

const packageJsonPath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Create enhanced consolidation with meta-commands and logical groupings
const enhancedScripts = {
  // === WORKFLOW META-COMMANDS ===
  qa: 'pnpm run lint:core && pnpm run type-check && pnpm run test',
  'qa:full': 'pnpm run quality:all && pnpm run coverage:report',
  ci: 'pnpm run qa && pnpm run build',
  maintenance:
    'pnpm run deps:outdated && pnpm run audit:prod && pnpm run cleanup:report',

  // === DEVELOPMENT WORKFLOW ===
  dev: 'concurrently "pnpm run dev:backend" "pnpm run dev:astro" "pnpm run dev:healwave"',
  'dev:astro': 'cd apps/astro && pnpm run dev',
  'dev:healwave': 'cd apps/healwave && pnpm run dev',
  'dev:mobile': 'cd apps/mobile && pnpm run dev',
  'dev:backend':
    'cd backend && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000',
  'dev:frontend': 'pnpm run dev:astro',
  'dev:preview': 'pnpm run preview:astro', // Enhanced naming
  'dev:storybook': 'cd apps/astro && pnpm run storybook', // Moved to dev namespace

  // === BUILD SYSTEM ===
  build:
    'pnpm run build:analytics && pnpm run build:astro && pnpm run build:healwave',
  'build:astro': 'cd apps/astro && pnpm run build',
  'build:healwave': 'cd apps/healwave && pnpm run build',
  'build:analytics': 'cd packages/analytics && pnpm run build',
  'build:astro:analyze': 'cd apps/astro && ANALYZE=1 pnpm run build',
  'build:storybook': 'cd apps/astro && pnpm run build-storybook',

  // === DOCKER OPERATIONS ===
  docker: 'pnpm run docker:up', // Quick access
  'docker:build': 'docker-compose build',
  'docker:up': 'docker-compose up -d',
  'docker:down': 'docker-compose down',
  'docker:logs': 'docker-compose logs -f',

  // === TESTING & COVERAGE ===
  test: 'vitest run --workspace vitest.workspace.ts && pnpm run test:backend',
  'test:watch': 'vitest --workspace vitest.workspace.ts',
  'test:ui': 'vitest --ui --workspace vitest.workspace.ts',
  'test:astro':
    'vitest run --workspace vitest.workspace.ts --project astro-app',
  'test:healwave':
    'vitest run --workspace vitest.workspace.ts --project healwave-app',
  'test:packages':
    'vitest run --workspace vitest.workspace.ts --project core-packages --project ui-packages',
  'test:backend':
    'cd backend && python3 -m pytest tests/ -v --cov=astro --cov-report=xml --cov-report=html',
  'test:coverage': 'pnpm run coverage:report && pnpm run coverage:ratchet', // Combined coverage workflow

  // === TYPE CHECKING ===
  'type-check': 'node ./scripts/typecheck.mjs',
  'type-check:watch': 'pnpm run type-check:astro:watch', // Enhanced watch mode
  'type-check:astro': 'cd apps/astro && pnpm run type-check',
  'type-check:astro:watch': 'cd apps/astro && tsc --noEmit --watch',
  'type-check:astro:stories':
    'cd apps/astro && tsc -p tsconfig.json --noEmit --pretty',
  'type-check:healwave': 'cd apps/healwave && pnpm run type-check',
  'type-check:types':
    'tsc -p packages/types/tsconfig.json --noEmit && tsc -p packages/types/tsconfig.test.json --noEmit',
  'type-check:all':
    'pnpm run type-check:astro && pnpm run type-check:healwave && pnpm run type-check:types',
  'type-check:ratchet': 'node ./scripts/type-error-ratchet.mjs',
  'type-check:tests': 'node ./scripts/typecheck-tests.cjs',
  'type-check:strict:pilot': 'tsc -p tsconfig.strict-incremental.json --noEmit',

  // === LINT SYSTEM - CONSOLIDATED ===
  lint: 'pnpm run lint:core && pnpm run lint:quality',
  'lint:core':
    'pnpm run lint:astro && pnpm run lint:healwave && pnpm run lint:types && pnpm run lint:backend',
  'lint:astro':
    'eslint apps/astro/src --ext .ts,.tsx --max-warnings=2 --config eslint.config.js',
  'lint:healwave': 'cd apps/healwave && pnpm run lint',
  'lint:types':
    'eslint packages/types/src --ext .ts --max-warnings=0 --config eslint.config.js',
  'lint:backend':
    'cd backend && (command -v python >/dev/null 2>&1 && PY=python || PY=python3; $PY -m flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics)',

  'lint:ai': 'pnpm run lint:ai-coord && pnpm run lint:parallel',
  'lint:ai-coord': './scripts/safe-coordination.sh',
  'lint:ai-coord-enhanced': 'node scripts/ai-agent-lint-coordinator.mjs',
  'lint:parallel': 'node scripts/lint-parallel-batches.mjs',
  'lint:preprocess': 'node scripts/ai-agent-preprocessor.mjs',
  'lint:rebalance': 'node scripts/smart-agent-rebalancer.mjs',
  'lint:enhanced-workflow': 'node scripts/enhanced-coordination-workflow.mjs',
  'lint:refresh-agent': 'node scripts/refresh-agent-analysis.mjs',

  'lint:agents': 'pnpm run lint:agents:astro && pnpm run lint:agents:packages',
  'lint:agents:astro':
    'pnpm run lint:agent:agent-1-astro-components && pnpm run lint:agent:agent-2-astro-features && pnpm run lint:agent:agent-3-astro-pages-context && pnpm run lint:agent:agent-4-astro-services-types',
  'lint:agents:packages':
    'pnpm run lint:agent:agent-5-ui-package && pnpm run lint:agent:agent-6-config-package && pnpm run lint:agent:agent-7-apps-small-packages',

  'lint:quality':
    'pnpm run lint:ratchet && pnpm run lint:guard && pnpm run lint:fail-usage',
  'lint:utilities':
    'pnpm run lint:badge && pnpm run lint:delta && pnpm run lint:update-doc',

  // === QUALITY ASSURANCE ===
  'quality:all':
    'pnpm run lint && pnpm run type-check && pnpm run coverage:ratchet && pnpm run a11y:check',
  'a11y:check': 'cd apps/astro && pnpm run a11y:check',

  // === FORMATTING ===
  format:
    'pnpm run format:astro && pnpm run format:healwave && pnpm run format:backend',
  'format:astro': 'cd apps/astro && pnpm run format',
  'format:healwave': 'cd apps/healwave && pnpm run format',
  'format:backend':
    'cd backend && (command -v python >/dev/null 2>&1 && PY=python || PY=python3; $PY -m black . && $PY -m isort .)',
  markdownlint:
    'markdownlint-cli2 "*.md" "docs/**/*.md" "apps/**/*.md" "packages/*/*.md" -c .markdownlint.json --ignore node_modules/** --ignore pnpm/** --ignore packages/*/node_modules/** --ignore apps/*/node_modules/**',
};

// Add remaining individual scripts that weren't enhanced
const originalScripts = packageJson.scripts;
const enhancedKeys = new Set(Object.keys(enhancedScripts));

Object.keys(originalScripts).forEach(key => {
  if (!enhancedKeys.has(key)) {
    enhancedScripts[key] = originalScripts[key];
  }
});

// Update package.json
packageJson.scripts = enhancedScripts;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Enhanced script consolidation completed');
console.log('🎯 Added meta-commands: qa, qa:full, ci, maintenance');
console.log('🔄 Improved naming: dev:preview, dev:storybook, test:coverage');
console.log(
  '📦 Consolidated lint groups: core, ai, agents, quality, utilities'
);
console.log(`📊 Total scripts: ${Object.keys(enhancedScripts).length}`);
