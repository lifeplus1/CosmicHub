---
title: AI Agent Coordination Instructions
owner: platform
status: active
last_reviewed: 2025-09-01
review_cycle: 120d
category: reference
---

## AI Agent Coordination Instructions

## FOR AI ASSISTANTS: CRITICAL EXECUTION RULES

> **📚 Complete Setup Guide**: See
> [docs/00-OVERVIEW/AI_CONTEXT_AUTOMATION.md](docs/00-OVERVIEW/AI_CONTEXT_AUTOMATION.md) for
> workspace configuration and context automation
>
> **📋 Essential Context**: Always read
> [docs/00-OVERVIEW/MASTER_CONTEXT.md](docs/00-OVERVIEW/MASTER_CONTEXT.md) for complete project
> context before starting work

### ⚠️ MANDATORY SEQUENCING

1. **NEVER** read output files immediately after starting commands
2. **ALWAYS** wait for exit code 0 in terminal context before reading results
3. **USE** `npm run lint:ai-coord` instead of manual coordination

### Reading Results

- **Wait for completion**: Check terminal context shows `Exit Code: 0`
- **Read full output**: `coordination-output.log` contains complete results
- **Check analysis files**: `ai-agent-coordination/*.json` for detailed data

### Current Agent Status

- **Total**: 280 errors, 89 warnings across 7 agents
- **Ready**: 5 agents (ServicesTypesAgent, UIPackageAgent, ConfigPackageAgent, FeatureFixAgent, + 1
  more)
- **Need Work**: 3 agents (ComponentFixAgent, PagesContextAgent, AppsPackagesAgent)

### Common Mistakes to Avoid

1. Reading output before command completion
2. Assuming partial terminal output is complete
3. Not checking exit codes
4. Making claims about results before verification
