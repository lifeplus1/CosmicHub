# AI Agent Coordination Instructions

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
3. **USE** `npm run lint:ai-coord-safe` instead of manual coordination

### Correct Execution Pattern

```bash
# ✅ RECOMMENDED: Use enhanced coordination workflow
npm run lint:enhanced-workflow

# ✅ ALTERNATIVE: Use individual components
npm run lint:preprocess          # Smart preprocessing
npm run lint:rebalance          # Agent rebalancing
npm run lint:ai-coord-enhanced  # Enhanced coordination

# ✅ LEGACY: Safe wrapper (still supported)
npm run lint:ai-coord-safe

# ❌ OUTDATED: Manual execution without enhancements
npm run lint:ai-coord
# (missing enhanced features and optimization)
```

### Reading Results

- **Enhanced Workflow**: Check complete output with performance improvements
- **Rebalanced Config**: Review `ai-agent-coordination/rebalanced-agent-config.json`
- **Complexity Analysis**: Examine error complexity scores and workload distribution
- **Performance Metrics**: Monitor coordination efficiency and overall performance score
- **Wait for completion**: Check terminal context shows `Exit Code: 0`

### Current Enhanced System Status

- **Coordination Efficiency**: 82.7% (improved from 80.8%)
- **Performance Score**: 59.1% overall system performance
- **Error Analysis**: 348 errors analyzed with complexity scoring
- **Agent Rebalancing**: 6 agents optimized based on workload distribution
- **Workload Variance**: 3.93s spread analyzed and optimized
- **Ready Agents**: System ready for enhanced deployment

### Enhanced System Features to Leverage

1. **Smart Preprocessing** - Automatic bulk error fixes and pattern recognition
2. **Intelligent Rebalancing** - Complexity-based workload distribution
3. **Performance Monitoring** - Real-time efficiency tracking and optimization
4. **Error Complexity Analysis** - 1-7 scale complexity scoring system
5. **Comprehensive Workflow** - 5-phase optimization with before/after metrics
