# Phase 1 Completion and Phase 2 Plan

## Phase 1 Summary

Phase 1 of our linting and TypeScript infrastructure improvements has been completed. This phase focused on establishing a stable build foundation for the monorepo, with particular attention to cross-package dependencies between `@cosmichub/config` and `@cosmichub/ui`.

### Key Accomplishments

- **Module Resolution**: Fixed cross-package imports using proper subpath exports and path mappings
- **Build Configuration**: Corrected TypeScript configs to emit both JavaScript and declaration files
- **Type Declarations**: Added proper handling for declaration files, especially in subpath directories like `hooks/`
- **Import Patterns**: Fixed Firebase analytics dynamic import pattern for type compatibility
- **Package Export Maps**: Structured exports with proper `types` and `default` fields in package.json

### Implementation Details

1. **Config Package**:
   - Created dedicated runtime build configuration (`tsconfig.build.runtime.json`)
   - Enhanced declaration file copying script to include hooks directory
   - Fixed selective exports to avoid name collisions (especially for Firebase)

2. **UI Package**:
   - Updated path mappings to reference compiled outputs instead of source
   - Fixed dynamic imports for Firebase analytics modules
   - Implemented temporary build script with relaxed type checking for bootstrapping

## Phase 2 Plan

The next phase will focus on tightening ESLint rules and resolving the remaining type issues that were temporarily bypassed in Phase 1.

### Immediate Next Steps

1. **Fix Declaration File Resolution**:
   - Correct the remaining subpath resolution issues:
     - `@cosmichub/config/component-architecture`
     - `@cosmichub/config/lazy-loading`
     - `@cosmichub/config/hooks`
     - `@cosmichub/config/firebase`
   - Ensure declaration maps correctly reference source

2. **Firebase Module Type Resolution**:
   - Update Firebase analytics dynamic imports to properly handle ESM exports
   - Consider replacing dynamic imports with static imports + tree-shaking

3. **Linting Improvements**:
   - Enable stricter ESLint rules gradually
   - Start with no-any and no-explicit-any rules
   - Progress to enabling strict null checks

4. **Quality Automation**:
   - Add CI checks to validate exports map matches actual files
   - Create pre-commit hooks to prevent regressions

### Timeline

- **Week 1**: Fix remaining declaration file issues
- **Week 2**: Implement Firebase module typing solutions
- **Week 3**: Begin ESLint rule tightening
- **Week 4**: Complete automation and validation tools

## Current Status

The monorepo can now be built with these commands:

```bash
# Build config package properly
pnpm --filter @cosmichub/config build

# Build UI package with temporary workarounds
pnpm --filter @cosmichub/ui build:phase1
```

Once Phase 2 is complete, all packages will build with standard commands without requiring any special flags or workarounds.

## Documentation

For detailed information about Phase 1 completion, see:

- [PHASE_1_COMPLETION.md](/docs/PHASE_1_COMPLETION.md)

For the overall linting improvement plan, see:

- [LINTING_IMPROVEMENT_PLAN.md](/docs/LINTING_IMPROVEMENT_PLAN.md)
