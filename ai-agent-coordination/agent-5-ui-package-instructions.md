---
title: UIPackageAgent - Lint Fix Instructions
owner: platform
status: active
last_reviewed: 2025-09-02
review_cycle: 60d
category: overview
---

# UIPackageAgent - Lint Fix Instructions

## Mission
Fix all ESLint errors and warnings in: **UI Package**

## Target Files
- `packages/ui/src`

## Specialization
Shared UI component fixes

## Common Issues to Fix
- `unused-vars`
- `react-hooks`
- `jsx-a11y`

## Performance Targets
- **Estimated Files**: ~54
- **Max Warnings**: 25
- **Priority Level**: 2/5
- **Conflict Risk**: high

## Dependencies
- None (can start immediately)

## Pre-Execution Checklist
1. [ ] Check coordination manifest for conflicts
2. [ ] Run batch-specific lint analysis: `npm run lint:agent:agent-5-ui-package`
3. [ ] Review error patterns in coordination directory
4. [ ] Verify dependencies are complete

## Execution Commands

### Analysis Phase
```bash
# Run targeted lint analysis (OVERWRITES existing analysis file)
npx eslint packages/ui/src --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --max-warnings=25 --format json > ai-agent-coordination/agent-5-ui-package-analysis.json

# Generate fix suggestions (temporary file - will be cleaned up)  
npx eslint packages/ui/src --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix-dry-run --format json > /tmp/agent-5-ui-package-fixes-temp.json
```

### Fix Phase
```bash
# Apply automatic fixes
npx eslint packages/ui/src --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix

# Verify fixes (use standard analysis filename)
npm run lint:agent:agent-5-ui-package
```

## Success Criteria
- [ ] Zero ESLint errors in target files
- [ ] Warnings under 25 limit
- [ ] No new TypeScript compilation errors
- [ ] No broken imports or dependencies
- [ ] All tests pass in affected areas

## Conflict Prevention
- Update `ai-agent-coordination/agent-5-ui-package-status.json` during execution
- Check for conflicts before making cross-file changes
- Coordinate with dependent agents: None

## Completion Report
Create `ai-agent-coordination/agent-5-ui-package-completion.json` with:
- Files modified
- Errors fixed
- Warnings remaining
- Any conflicts encountered
- Recommendations for dependent agents

---
**Generated**: 2025-08-28T03:35:32.978Z
**Coordination ID**: agent-5-ui-package
