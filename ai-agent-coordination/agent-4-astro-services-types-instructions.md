# ServicesTypesAgent - Lint Fix Instructions

## Mission
Fix all ESLint errors and warnings in: **Astro Services & Types**

## Target Files
- `apps/astro/src/services`
- `apps/astro/src/types`
- `apps/astro/src/config`

## Specialization
Service layer and type definitions

## Common Issues to Fix
- `no-explicit-any`
- `strict-boolean-expressions`

## Performance Targets
- **Estimated Files**: ~65
- **Max Warnings**: 25
- **Priority Level**: 1/5
- **Conflict Risk**: high

## Dependencies
- None (can start immediately)

## Pre-Execution Checklist
1. [ ] Check coordination manifest for conflicts
2. [ ] Run batch-specific lint analysis: `npm run lint:agent:agent-4-astro-services-types`
3. [ ] Review error patterns in coordination directory
4. [ ] Verify dependencies are complete

## Execution Commands

### Analysis Phase
```bash
# Run targeted lint analysis (OVERWRITES existing analysis file)
npx eslint apps/astro/src/services apps/astro/src/types apps/astro/src/config --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --max-warnings=25 --format json > ai-agent-coordination/agent-4-astro-services-types-analysis.json

# Generate fix suggestions (temporary file - will be cleaned up)  
npx eslint apps/astro/src/services apps/astro/src/types apps/astro/src/config --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix-dry-run --format json > /tmp/agent-4-astro-services-types-fixes-temp.json
```

### Fix Phase
```bash
# Apply automatic fixes
npx eslint apps/astro/src/services apps/astro/src/types apps/astro/src/config --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix

# Verify fixes (use standard analysis filename)
npm run lint:agent:agent-4-astro-services-types
```

## Success Criteria
- [ ] Zero ESLint errors in target files
- [ ] Warnings under 25 limit
- [ ] No new TypeScript compilation errors
- [ ] No broken imports or dependencies
- [ ] All tests pass in affected areas

## Conflict Prevention
- Update `ai-agent-coordination/agent-4-astro-services-types-status.json` during execution
- Check for conflicts before making cross-file changes
- Coordinate with dependent agents: None

## Completion Report
Create `ai-agent-coordination/agent-4-astro-services-types-completion.json` with:
- Files modified
- Errors fixed
- Warnings remaining
- Any conflicts encountered
- Recommendations for dependent agents

---
**Generated**: 2025-09-04T02:15:13.989Z
**Coordination ID**: agent-4-astro-services-types
