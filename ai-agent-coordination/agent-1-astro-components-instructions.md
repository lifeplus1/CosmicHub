# ComponentFixAgent - Lint Fix Instructions

## Mission

Fix all ESLint errors and warnings in: **Astro Components**

## Target Files

- `apps/astro/src/components`

## Specialization

React component lint fixes

## Common Issues to Fix

- `unused-vars`
- `react-hooks`
- `jsx-a11y`

## Performance Targets

- **Estimated Files**: ~65
- **Max Warnings**: 30
- **Priority Level**: 3/5
- **Conflict Risk**: low

## Dependencies

- None (can start immediately)

## Pre-Execution Checklist

1. [ ] Check coordination manifest for conflicts
2. [ ] Run batch-specific lint analysis: `npm run lint:agent:agent-1-astro-components`
3. [ ] Review error patterns in coordination directory
4. [ ] Verify dependencies are complete

## Execution Commands

### Analysis Phase

```bash
# Run targeted lint analysis (OVERWRITES existing analysis file)
npx eslint apps/astro/src/components --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --max-warnings=30 --format json > ai-agent-coordination/agent-1-astro-components-analysis.json

# Generate fix suggestions (temporary file - will be cleaned up)
npx eslint apps/astro/src/components --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix-dry-run --format json > /tmp/agent-1-astro-components-fixes-temp.json
```

### Fix Phase

```bash
# Apply automatic fixes
npx eslint apps/astro/src/components --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix

# Verify fixes (use standard analysis filename)
npm run lint:agent:agent-1-astro-components
```

## Success Criteria

- [ ] Zero ESLint errors in target files
- [ ] Warnings under 30 limit
- [ ] No new TypeScript compilation errors
- [ ] No broken imports or dependencies
- [ ] All tests pass in affected areas

## Conflict Prevention

- Update `ai-agent-coordination/agent-1-astro-components-status.json` during execution
- Check for conflicts before making cross-file changes
- Coordinate with dependent agents: None

## Completion Report

Create `ai-agent-coordination/agent-1-astro-components-completion.json` with:

- Files modified
- Errors fixed
- Warnings remaining
- Any conflicts encountered
- Recommendations for dependent agents

---

**Generated**: 2025-09-05T07:19:20.699Z **Coordination ID**: agent-1-astro-components
