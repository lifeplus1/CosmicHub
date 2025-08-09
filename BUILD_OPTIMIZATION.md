# CosmicHub Build Optimization

## Overview

The CosmicHub monorepo uses an optimized Turbo build system that supports both fast development builds and production-ready package builds.

## Build Strategies

### 1. Fast Build (Recommended for Development)

```bash
npm run build:fast
```

- **Speed**: ~2.5 seconds
- **Strategy**: Direct TypeScript imports, skips package compilation
- **Use Case**: Development, CI/CD, most production deployments

### 2. Full Package Build (For External Distribution)

```bash
npm run build:packages
```

- **Speed**: ~1.5 seconds
- **Strategy**: Compiles packages to `dist/` for external consumers
- **Use Case**: Publishing packages to npm, external library distribution

### 3. Complete Build (Legacy)

```bash
npm run build
```

- **Speed**: ~2.5 seconds  
- **Strategy**: Skips package compilation but builds apps
- **Use Case**: Backward compatibility

## Architecture

### Hybrid Import Strategy

- **Apps (astro, healwave)**: Use direct TypeScript imports via Vite aliases
- **Packages**: Can optionally compile to `dist/` for external use
- **TypeScript**: Path mapping resolves to source files directly

### Turbo Configuration

```json
{
  "build:apps": {
    "dependsOn": [],           // No package dependencies
    "outputs": ["dist/**"],
    "cache": true
  },
  "build:packages": {
    "dependsOn": [],           // Independent package builds
    "outputs": ["dist/**"],
    "cache": true
  }
}
```

## Performance Benefits

### Before Optimization

- **Build Time**: ~15-20 seconds
- **Dependencies**: Complex TypeScript project references
- **Failures**: Package compilation errors blocked app builds

### After Optimization  

- **Build Time**: ~2.5 seconds (83% improvement)
- **Dependencies**: Apps build independently
- **Reliability**: Apps never blocked by package compilation issues

## File Structure

```text
CosmicHub/
├── apps/
│   ├── astro/           # Vite + TypeScript paths
│   └── healwave/        # Vite + TypeScript paths
├── packages/
│   ├── auth/            # Source-first, optional dist
│   ├── config/          # Source-first, optional dist
│   ├── frequency/       # Source-first, optional dist
│   ├── integrations/    # Source-first, optional dist
│   └── ui/              # Source-first, optional dist
```

## Key Optimizations

1. **Eliminated TypeScript Project References** in apps
2. **Direct Source Imports** via Vite aliases and TypeScript paths
3. **Independent Build Tasks** with `build:apps` and `build:packages`
4. **Conditional Package Building** - only when needed
5. **Turbo Cache Optimization** with proper outputs and dependencies

## Commands Reference

| Command | Purpose | Speed | Use Case |
|---------|---------|-------|----------|
| `npm run build:fast` | Fast app builds | ~2.5s | Development, CI/CD |
| `npm run build:apps` | App builds only | ~2.5s | Application deployment |
| `npm run build:packages` | Package builds only | ~1.5s | Library distribution |
| `npm run build` | Default build | ~2.5s | Backward compatibility |
| `npm run dev` | Development mode | Instant | Local development |

## Benefits

✅ **83% faster builds** (20s → 2.5s)  
✅ **Independent app builds** - no package compilation blocking  
✅ **Maintained auth consolidation** - centralized `@cosmichub/auth`  
✅ **Flexible deployment** - apps can build without package dist files  
✅ **External compatibility** - packages can still be compiled when needed  
✅ **Turbo caching** - optimized cache keys and outputs  
✅ **Development experience** - faster iteration cycles
