# Vitest Workspace Configuration

## Overview

The CosmicHub project now uses a **Vitest workspace** configuration to optimize test performance and resolve the "multiple projects" warning from the Vitest VS Code extension.

## Problem Solved

**Before**: Vitest detected 14+ individual config files across apps and packages, causing performance concerns and VS Code extension warnings.

**After**: Single workspace configuration that groups projects efficiently while maintaining test isolation.

## Configuration Structure

### Workspace Projects

1. **astro-app**: Main astrology application tests
2. **healwave-app**: HealWave application tests  
3. **core-packages**: Analytics, types, config packages (Node.js environment)
4. **ui-packages**: Hooks, integrations packages (jsdom environment)

### File Location

- **Main config**: `vitest.workspace.ts` (root)
- **VS Code settings**: `.vscode/settings.json` (Vitest extension config)
- **Individual configs**: Preserved for standalone package development

## Usage Commands

### Run All Tests

```bash
pnpm test                    # All frontend tests + backend
pnpm test:watch              # Watch mode for all tests
pnpm test:ui                 # Vitest UI for all projects
```

### Run Specific Projects

```bash
pnpm test:astro              # Astro app only
pnpm test:healwave           # HealWave app only  
pnpm test:packages           # Core + UI packages only
```

### VS Code Integration

The Vitest extension now:

- ✅ Recognizes single workspace config
- ✅ Shows organized test projects
- ✅ Avoids performance warnings
- ✅ Maintains test debugging capabilities

## Benefits

1. **Performance**: Reduced config overhead from 14→4 projects
2. **Organization**: Logical grouping of related packages
3. **Consistency**: Unified test execution across workspace
4. **Maintainability**: Single source of truth for test configuration

## Individual Package Development

Each package still has its own `vitest.config.ts` for:

- Standalone development
- Package-specific CI/CD
- Isolated testing during development

The workspace config **extends** these individual configs where appropriate.

## Troubleshooting

### Extension Still Shows Multiple Projects

1. Restart VS Code
2. Reload TypeScript server: `Cmd+Shift+P` → "Reload Window"
3. Check `.vscode/settings.json` has correct `vitest.workspaceConfig` path

### Tests Not Running

1. Verify workspace config: `vitest --workspace ./vitest.workspace.ts --list`
2. Check individual package configs are valid
3. Ensure test files match include patterns

### Coverage Issues

Coverage is handled per-project with aggregation at the workspace level.

## Migration Notes

- **No breaking changes** to existing test files
- Individual package test commands still work
- Workspace commands provide unified experience
- VS Code extension performance significantly improved

---

**Status**: ✅ **IMPLEMENTED** - Vitest workspace optimized and functional
