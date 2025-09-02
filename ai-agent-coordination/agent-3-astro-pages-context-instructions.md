---
title: PagesContextAgent - Lint Fix Instructions
owner: platform
status: active
last_reviewed: 2025-09-02
review_cycle: 60d
category: overview
---

## PagesContextAgent - Lint Fix Instructions

## Mission

Fix all ESLint errors and warnings in: **Astro Pages & Context**

## Target Files

- `apps/astro/src/pages`
- `apps/astro/src/contexts`
- `apps/astro/src/hooks`

## Specialization

Page routing and context management fixes

## Common Issues to Fix

- `prefer-nullish-coalescing`
- `no-unsafe-assignment`

## Performance Targets

- **Estimated Files**: ~70
- **Max Warnings**: 30
- **Priority Level**: 2/5
- **Conflict Risk**: medium

## Dependencies

- Wait for completion of: `agent-1-astro-components`

## Pre-Execution Checklist

1. [ ] Check coordination manifest for conflicts
2. [ ] Run batch-specific lint analysis: `npm run lint:agent:agent-3-astro-pages-context`
3. [ ] Review error patterns in coordination directory
4. [ ] Verify dependencies are complete

## Execution Commands

### Analysis Phase

```bash
# Run targeted lint analysis (OVERWRITES existing analysis file)
npx eslint apps/astro/src/pages apps/astro/src/contexts apps/astro/src/hooks --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --max-warnings=30 --format json > ai-agent-coordination/agent-3-astro-pages-context-analysis.json

# Generate fix suggestions (temporary file - will be cleaned up)
npx eslint apps/astro/src/pages apps/astro/src/contexts apps/astro/src/hooks --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix-dry-run --format json > /tmp/agent-3-astro-pages-context-fixes-temp.json
```

### Fix Phase

```bash
# Apply automatic fixes
npx eslint apps/astro/src/pages apps/astro/src/contexts apps/astro/src/hooks --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix

# Verify fixes (use standard analysis filename)
npm run lint:agent:agent-3-astro-pages-context
```

## Success Criteria

- [ ] Zero ESLint errors in target files
- [ ] Warnings under 30 limit
- [ ] No new TypeScript compilation errors
- [ ] No broken imports or dependencies
- [ ] All tests pass in affected areas

## Conflict Prevention

- Update `ai-agent-coordination/agent-3-astro-pages-context-status.json` during execution
- Check for conflicts before making cross-file changes
- Coordinate with dependent agents: agent-1-astro-components

## Completion Report

Create `ai-agent-coordination/agent-3-astro-pages-context-completion.json` with:

- Files modified
- Errors fixed
- Warnings remaining
- Any conflicts encountered
- Recommendations for dependent agents

---

**Generated**: 2025-08-28T03:35:32.978Z **Coordination ID**: agent-3-astro-pages-context
