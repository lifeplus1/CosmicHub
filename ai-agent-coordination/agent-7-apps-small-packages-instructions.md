# AppsPackagesAgent - Lint Fix Instructions

## Mission
Fix all ESLint errors and warnings in: **Apps & Small Packages**

## Target Files
- `apps/healwave/src`
- `apps/mobile/src`
- `packages/auth/src`
- `packages/frequency/src`
- `packages/hooks/src`
- `packages/integrations/src`
- `packages/pwa/src`
- `packages/storage/src`
- `packages/subscriptions/src`
- `packages/types/src`

## Specialization
Secondary apps and utility packages

## Common Issues to Fix
- `no-unsafe-assignment`
- `unused-vars`
- `no-explicit-any`

## Performance Targets
- **Estimated Files**: ~79
- **Max Warnings**: 35
- **Priority Level**: 4/5
- **Conflict Risk**: medium

## Dependencies
- Wait for completion of: `agent-4-astro-services-types`
- Wait for completion of: `agent-5-ui-package`
- Wait for completion of: `agent-6-config-package`

## Pre-Execution Checklist
1. [ ] Check coordination manifest for conflicts
2. [ ] Run batch-specific lint analysis: `npm run lint:agent:agent-7-apps-small-packages`
3. [ ] Review error patterns in coordination directory
4. [ ] Verify dependencies are complete

## Execution Commands

### Analysis Phase
```bash
# Run targeted lint analysis (OVERWRITES existing analysis file)
npx eslint apps/healwave/src apps/mobile/src packages/auth/src packages/frequency/src packages/hooks/src packages/integrations/src packages/pwa/src packages/storage/src packages/subscriptions/src packages/types/src --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --max-warnings=35 --format json > ai-agent-coordination/agent-7-apps-small-packages-analysis.json

# Generate fix suggestions (temporary file - will be cleaned up)  
npx eslint apps/healwave/src apps/mobile/src packages/auth/src packages/frequency/src packages/hooks/src packages/integrations/src packages/pwa/src packages/storage/src packages/subscriptions/src packages/types/src --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix-dry-run --format json > /tmp/agent-7-apps-small-packages-fixes-temp.json
```

### Fix Phase
```bash
# Apply automatic fixes
npx eslint apps/healwave/src apps/mobile/src packages/auth/src packages/frequency/src packages/hooks/src packages/integrations/src packages/pwa/src packages/storage/src packages/subscriptions/src packages/types/src --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix

# Verify fixes (use standard analysis filename)
npm run lint:agent:agent-7-apps-small-packages
```

## Success Criteria
- [ ] Zero ESLint errors in target files
- [ ] Warnings under 35 limit
- [ ] No new TypeScript compilation errors
- [ ] No broken imports or dependencies
- [ ] All tests pass in affected areas

## Conflict Prevention
- Update `ai-agent-coordination/agent-7-apps-small-packages-status.json` during execution
- Check for conflicts before making cross-file changes
- Coordinate with dependent agents: agent-4-astro-services-types, agent-5-ui-package, agent-6-config-package

## Completion Report
Create `ai-agent-coordination/agent-7-apps-small-packages-completion.json` with:
- Files modified
- Errors fixed
- Warnings remaining
- Any conflicts encountered
- Recommendations for dependent agents

---
**Generated**: 2025-08-27T12:03:09.595Z
**Coordination ID**: agent-7-apps-small-packages
