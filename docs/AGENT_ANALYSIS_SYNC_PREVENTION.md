---
title: Agent Analysis Sync Prevention Guide
owner: platform
status: active
last_reviewed: 2025-09-02
review_cycle: 90d
category: guide
---

## Problem: Stale Analysis Files After Manual Fixes

When you manually fix ESLint issues in individual files, the AI agent coordination system can show
stale results because analysis files are not automatically updated.

## Root Cause

The coordination system uses cached analysis files (`ai-agent-coordination/agent-X-analysis.json`)
that are only updated when:

1. Running the full coordination analysis (`npm run lint:ai-coord`)
2. The individual agent runs through the coordination script

Manual ESLint fixes don't automatically trigger analysis file updates.

## Prevention Solutions

### 1. **Always Refresh After Manual Fixes** ⭐ RECOMMENDED

After manually fixing ESLint issues, immediately refresh the affected agent's analysis:

```bash
# For Agent 7 (Apps & Small Packages)
npm run lint:refresh-agent agent-7-apps-small-packages

# For other agents
npm run lint:refresh-agent agent-1-astro-components
npm run lint:refresh-agent agent-2-astro-features
# etc.
```

### 2. **Full Coordination Refresh**

If you fixed multiple agents or want to refresh everything:

```bash
npm run lint:ai-coord
```

### 3. **Verify Current Status**

Check if an agent's analysis is current:

```bash
# Check individual agent
npm run lint:agent:agent-7-apps-small-packages

# Compare with analysis file timestamp
ls -la ai-agent-coordination/agent-7-apps-small-packages-analysis.json
```

## Available Commands

### Individual Agent Lint (Manual Check)

```bash
npm run lint:agent:agent-1-astro-components
npm run lint:agent:agent-2-astro-features
npm run lint:agent:agent-3-astro-pages-context
npm run lint:agent:agent-4-astro-services-types
npm run lint:agent:agent-5-ui-package
npm run lint:agent:agent-6-config-package
npm run lint:agent:agent-7-apps-small-packages
```

### Agent Analysis Refresh (Updates Coordination Files)

```bash
npm run lint:refresh-agent <agent-id>
```

### Full Coordination Analysis

```bash
npm run lint:ai-coord
```

## Best Practices

1. **After Manual Fixes**: Always run `npm run lint:refresh-agent <agent-id>`
2. **Before Declaring Complete**: Verify with `npm run lint:ai-coord`
3. **File Timestamps**: Check analysis file timestamps vs your fix times
4. **Individual vs Coordination**: Run both individual ESLint and coordination refresh

## Quick Reference

| Action          | Command                              | Purpose                        |
| --------------- | ------------------------------------ | ------------------------------ |
| Fix & Verify    | `npm run lint:agent:agent-X`         | Check current ESLint status    |
| Update Analysis | `npm run lint:refresh-agent agent-X` | Sync coordination files        |
| Full Check      | `npm run lint:ai-coord`              | Complete coordination analysis |

## Example Workflow

```bash
# 1. Fix ESLint issues manually in files
# 2. Verify fixes work
npm run lint:agent:agent-7-apps-small-packages

# 3. Update coordination analysis
npm run lint:refresh-agent agent-7-apps-small-packages

# 4. Verify coordination sees the fixes
npm run lint:ai-coord
```

This ensures the coordination system always has current, accurate analysis data.
