# ConfigPackageAgent - Lint Fix Instructions

## Mission
Fix all ESLint errors and warnings in: **Config Package**

## Target Files
- `packages/config/src`

## Specialization
Configuration and build setup

## Common Issues to Fix
- `no-explicit-any`
- `unused-vars`

## Performance Targets
- **Estimated Files**: ~48
- **Max Warnings**: 20
- **Priority Level**: 1/5
- **Conflict Risk**: high

## Dependencies
- None (can start immediately)

## Pre-Execution Checklist
1. [ ] Check coordination manifest for conflicts
2. [ ] Run batch-specific lint analysis: `npm run lint:agent:agent-6-config-package`
3. [ ] Review error patterns in coordination directory
4. [ ] Verify dependencies are complete

## Execution Commands

### Analysis Phase
```bash
# Run targeted lint analysis (OVERWRITES existing analysis file)
npx eslint packages/config/src --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --max-warnings=20 --format json > ai-agent-coordination/agent-6-config-package-analysis.json

# Generate fix suggestions (temporary file - will be cleaned up)  
npx eslint packages/config/src --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix-dry-run --format json > /tmp/agent-6-config-package-fixes-temp.json
```

### Fix Phase
```bash
# Apply automatic fixes
npx eslint packages/config/src --ext .ts,.tsx --config eslint.config.js --ignore-pattern "**/*.test.*" --ignore-pattern "**/*.spec.*" --ignore-pattern "**/__tests__/**" --ignore-pattern "**/test-utils/**" --ignore-pattern "**/tests/**" --fix

# Verify fixes (use standard analysis filename)
npm run lint:agent:agent-6-config-package
```

## Success Criteria
- [ ] Zero ESLint errors in target files
- [ ] Warnings under 20 limit
- [ ] No new TypeScript compilation errors
- [ ] No broken imports or dependencies
- [ ] All tests pass in affected areas

## Conflict Prevention
- Update `ai-agent-coordination/agent-6-config-package-status.json` during execution
- Check for conflicts before making cross-file changes
- Coordinate with dependent agents: None

## Completion Report
Create `ai-agent-coordination/agent-6-config-package-completion.json` with:
- Files modified
- Errors fixed
- Warnings remaining
- Any conflicts encountered
- Recommendations for dependent agents

---
**Generated**: 2025-09-04T02:15:13.989Z
**Coordination ID**: agent-6-config-package
