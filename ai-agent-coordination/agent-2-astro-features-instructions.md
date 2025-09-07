# FeatureFixAgent - Lint Fix Instructions

## Mission
Fix all ESLint errors and warnings in: **Astro Features**

## Target Files
- `apps/astro/src/features`

## Specialization
Feature module lint fixes

## Common Issues to Fix
- `unused-vars`
- `no-explicit-any`

## Performance Targets
- **Estimated Files**: ~25
- **Max Warnings**: 15
- **Priority Level**: 3/5
- **Conflict Risk**: low

## Dependencies
- Wait for completion of: `agent-1-astro-components`

## Pre-Execution Checklist
1. [ ] Check coordination manifest for conflicts
2. [ ] Run batch-specific lint analysis: `npm run lint:agent:agent-2-astro-features`
3. [ ] Review error patterns in coordination directory
4. [ ] Verify dependencies are complete

## Execution Commands

### Analysis Phase
```bash
# Run targeted lint analysis (OVERWRITES existing analysis file)
npx eslint apps/astro/src/features --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --max-warnings=15 --format json > ai-agent-coordination/agent-2-astro-features-analysis.json

# Generate fix suggestions (temporary file - will be cleaned up)  
npx eslint apps/astro/src/features --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix-dry-run --format json > /tmp/agent-2-astro-features-fixes-temp.json
```

### Fix Phase
```bash
# Apply automatic fixes
npx eslint apps/astro/src/features --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix

# Verify fixes (use standard analysis filename)
npm run lint:agent:agent-2-astro-features
```

## Success Criteria
- [ ] Zero ESLint errors in target files
- [ ] Warnings under 15 limit
- [ ] No new TypeScript compilation errors
- [ ] No broken imports or dependencies
- [ ] All tests pass in affected areas

## Conflict Prevention
- Update `ai-agent-coordination/agent-2-astro-features-status.json` during execution
- Check for conflicts before making cross-file changes
- Coordinate with dependent agents: agent-1-astro-components

## Completion Report
Create `ai-agent-coordination/agent-2-astro-features-completion.json` with:
- Files modified
- Errors fixed
- Warnings remaining
- Any conflicts encountered
- Recommendations for dependent agents

---
**Generated**: 2025-09-07T06:34:33.755Z
**Coordination ID**: agent-2-astro-features
