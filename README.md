# CosmicHub Monorepo

A high-performance monorepo for astrology and healing frequency applications with optimized build system.

## 🏗️ Architecture

```
CosmicHub/
├── apps/
│   ├── astro/           # Astrology app with chart generation
│   └── healwave/        # Binaural frequency healing app
├── packages/
│   ├── auth/            # Centralized authentication
│   ├── config/          # Shared configuration
│   ├── frequency/       # Audio engine & frequency presets
│   ├── integrations/    # Cross-app integrations
│   └── ui/              # Shared UI components
├── backend/             # Python FastAPI backend
└── docs/                # Documentation
```

## ⚡ Optimized Build System

### Quick Start
```bash
# Fast development build (~2 seconds)
npm run build:fast

# Development mode with hot reload  
npm run dev

# Individual app development
npm run dev --workspace=apps/astro
npm run dev --workspace=apps/healwave
```

### Build Commands
| Command | Purpose | Speed | Use Case |
|---------|---------|-------|----------|
| `npm run build:fast` | **Recommended** - Fast app builds | ~2s | Development, CI/CD |
| `npm run build:apps` | App builds only | ~2s | Application deployment |
| `npm run build:packages` | Package builds only | ~1.5s | Library distribution |
| `npm run build` | Legacy full build | ~2s | Backward compatibility |

### Performance
- **83% faster builds** (20s → 2s)
- **Direct TypeScript imports** - no compilation step needed
- **Independent builds** - apps never blocked by package issues
- **Turbo caching** - optimized cache keys and outputs

See `BUILD_OPTIMIZATION.md` for detailed technical information.

## 🛠️ Development

Use the Makefile for common tasks:
- `make test` — run all tests
- `make lint` — run all linters
- `make build` — build all frontends
- `make format` — format frontend code

## Environment Variables
See `docs/ENVIRONMENT.md` for all required secrets and environment variables.

## CI/CD
Use `.gitlab-ci.yml` for GitLab or `.github/workflows/ci.yml` for GitHub Actions. Only one should be active.
