# TypeScript Workspace Consolidation Plan

## Current State Analysis

- ✅ Root tsconfig.json already uses project references (good foundation!)
- 🔧 86 individual tsconfig files across packages/apps
- 🔧 Multiple test-specific tsconfigs duplicating configuration
- 🔧 Inconsistent compiler options across packages

## Recommended Consolidation Strategy

### 1. **Create Shared Base Configurations**

#### `/tsconfig.base.json` (Shared compiler options)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext", 
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### `/tsconfig.packages.json` (Package-specific settings)

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  }
}
```

#### `/tsconfig.apps.json` (Application-specific settings)

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "allowJs": false
  }
}
```

### 2. **Consolidate Test Configurations**

Instead of individual `tsconfig.test.json` in each package:

#### `/tsconfig.test.base.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "types": ["vitest/globals", "node", "@testing-library/jest-dom"],
    "noEmit": true
  },
  "include": [
    "**/__tests__/**/*",
    "**/*.test.*", 
    "**/*.spec.*"
  ]
}
```

### 3. **Simplified Package TSConfigs**

Each package would only need:

```json
{
  "extends": "../../tsconfig.packages.json",
  "include": ["src/**/*"],
  "exclude": ["**/*.test.*", "**/*.spec.*", "dist", "node_modules"]
}
```

### 4. **Benefits**

- ✅ Reduce 86 configs to ~20 focused configs
- ✅ Consistent compiler options across workspace
- ✅ Faster TypeScript compilation with shared settings
- ✅ Easier maintenance and updates
- ✅ Better IDE performance with unified configuration
