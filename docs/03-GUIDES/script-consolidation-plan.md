# Script Consolidation Plan

## Current State Analysis

Total scripts in root package.json: **83+ scripts**

## Proposed Script Categories

### 1. **Development Workflow** (15 scripts)

- `dev`, `dev:astro`, `dev:healwave`, `dev:mobile`, `dev:backend`, `dev-frontend`
- `preview`, `preview:astro`, `preview:healwave`
- `storybook`, `build-storybook`
- `env:sync`
- `validate-env`, `validate-experiments`
- `setup`, `setup:backend`

### 2. **Build System** (6 scripts)

- `build`, `build:astro`, `build:healwave`, `build:analytics`
- `build:astro:analyze`
- `docker:build`, `docker:up`, `docker:down`, `docker:logs`

### 3. **Testing & Coverage** (9 scripts)

- `test`, `test:watch`, `test:ui`, `test:astro`, `test:healwave`, `test:packages`, `test:backend`
- `coverage:ratchet`, `coverage:ratchet:check`, `coverage:report`

### 4. **Type Checking** (10 scripts)

- `type-check`, `type-check:tests`, `type-check:astro`, `type-check:astro:stories`
- `type-check:healwave`, `type-check:types`, `type-check:all`
- `type-check:ratchet`, `type-check:strict:pilot`
- `type:ratchet`, `any:ratchet`

### 5. **Linting & Code Quality** (25+ scripts) ⚠️ NEEDS CONSOLIDATION

- Core: `lint`, `lint:astro`, `lint:healwave`, `lint:types`, `lint:backend`
- AI Coordination: `lint:ai-coord`, `lint:ai-coord-enhanced`, `lint:preprocess`, `lint:rebalance`
- Agent-specific: `lint:agent:agent-1-astro-components` through
  `lint:agent:agent-7-apps-small-packages`
- Quality gates: `lint:ratchet`, `lint:changed:strict`, `lint:guard`, `lint:fail-usage`
- Utilities: `lint:parallel`, `lint:delta`, `lint:update-doc`, `lint:badge`

### 6. **Formatting** (4 scripts)

- `format`, `format:astro`, `format:healwave`, `format:backend`
- `markdownlint`

### 7. **Maintenance & Utilities** (8 scripts)

- `install:all`, `clean`, `clean:astro`, `clean:healwave`, `clean:backend`
- `deps:outdated`, `audit:prod`
- `cleanup:report`, `cleanup`

### 8. **Quality Assurance** (6 scripts)

- `quality:all`, `a11y:check`
- `benchmark:synastry`

## Consolidation Strategy

### Phase 1: Group Related Scripts

Create script groups with consistent naming:

```json
{
  "dev": "concurrently \"pnpm run dev:backend\" \"pnpm run dev:astro\" \"pnpm run dev:healwave\"",
  "dev:astro": "cd apps/astro && pnpm run dev",
  "dev:healwave": "cd apps/healwave && pnpm run dev",
  "dev:mobile": "cd apps/mobile && pnpm run dev",
  "dev:backend": "cd backend && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000",
  "dev:frontend": "pnpm run dev:astro",
  "dev:preview": "pnpm run preview:astro",
  "dev:storybook": "cd apps/astro && pnpm run storybook"
}
```

### Phase 2: Consolidate Lint Scripts

The 25+ lint scripts need major consolidation:

**Before**: 25+ individual lint scripts **After**: 8-10 logical groupings

```json
{
  "lint": "pnpm run lint:core && pnpm run lint:quality",
  "lint:core": "pnpm run lint:astro && pnpm run lint:healwave && pnpm run lint:types && pnpm run lint:backend",
  "lint:ai": "pnpm run lint:ai-coord && pnpm run lint:parallel",
  "lint:agents": "node tools/development/run-agent-batch.mjs",
  "lint:quality": "pnpm run lint:ratchet && pnpm run lint:guard",
  "lint:utilities": "pnpm run lint:badge && pnpm run lint:delta"
}
```

### Phase 3: Create Meta-Commands

Combine related workflows:

```json
{
  "qa": "pnpm run lint && pnpm run type-check && pnpm run test",
  "qa:full": "pnpm run quality:all && pnpm run coverage:report",
  "ci": "pnpm run qa && pnpm run build",
  "maintenance": "pnpm run deps:outdated && pnpm run audit:prod && pnpm run cleanup"
}
```

## Expected Results

- **Before**: 83+ scripts (hard to navigate)
- **After**: ~45-50 scripts (25% reduction)
- **Developer Experience**: Clear categories, intuitive naming
- **Maintenance**: Easier to manage and extend

## Implementation Priority

1. **High**: Lint script consolidation (biggest impact)
2. **Medium**: Development workflow grouping
3. **Low**: Meta-command creation
