# CosmicHub Monorepo

A high-performance monorepo for astrology and healing frequency applications with optimized build system and production-ready architecture.

## 🚀 Current Status - August 2025

**Production Ready**: ✅ Both apps fully functional and optimized  
**Recent Updates**: All core development complete (100% test success rate)  
**Active TODOs**: Infrastructure hardening and advanced features  
**Build Performance**: 83% improvement (20s → 2s)

**Production Ready**: ✅ Both apps fully functional and optimized
**Recent Updates**: Phase 3 vectorized backend complete (213/213 tests passing) + Major project structure cleanup
**Active TODOs**: 0 remaining items (ALL COMPLETED! 🎉)
**Build Performance**: 83% improvement (20s → 2s)

## 🏗️ Architecture

```text
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
├── tests/               # Centralized testing (newly organized)
└── docs/                # Documentation (consolidated)
```

## ⚡ Optimized Build System

### 📘 Component Development with Storybook

Storybook is integrated for the `apps/astro` frontend (React + Vite, Storybook 8.6.x).

Run locally:

```bash
pnpm run storybook        # launches at http://localhost:6006
```

Build static Storybook (artifact in `apps/astro/storybook-static`):

```bash
pnpm run build-storybook
```

Add a new story:

1. Create `*.stories.tsx` next to the component (or inside a `stories/` folder).
2. Export a default `Meta` and one or more named `StoryObj` exports.
3. Use existing examples: `ChartDisplay.stories.tsx`, `ErrorBoundary.stories.tsx`.

Notable configuration:

- Config path: `apps/astro/.storybook/`
- Global decorators: QueryClient provider for data-enabled components
- CI build: `.github/workflows/storybook.yml` uploads an artifact on PRs / pushes to `main`.

Planned (optional) enhancements:

- Visual regression (Loki or Chromatic)
- Docs mode + MDX usage for complex astrology components
- Accessibility snapshot reporting in CI

### 🧪 Storybook QA Tooling (Added)

| Capability | Tool | How it Works | Command |
|------------|------|--------------|---------|
| Visual Regression (local, free) | Loki | Captures screenshots of selected stories and compares against approved baselines | `pnpm --filter frontend run storybook:visual` |
| Approve New Baselines | Loki | Moves current test output to baseline after review | `pnpm --filter frontend run storybook:visual:approve` |
| Automated A11y Checks | Storybook test runner + axe | Runs axe-core against each story in a headless browser | `pnpm --filter frontend run storybook:a11y` |
| Story Inventory Report | Custom script | Scans `*.stories.*` files and lists exported stories | `pnpm --filter frontend run storybook:report` |

Baseline images for Loki are stored under `apps/astro/.loki`. Commit approved baselines to version control to track visual changes.

The accessibility test runner currently runs in watch mode; integrate into CI by adding a step executing the same command and collecting its exit code.

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

### Performance Enhancements (August 2025)

#### Phase 3 Vectorized Backend (COMPLETE)

- **All 213 backend tests passing** - Production-ready vectorized operations
- **Intelligent caching system** - Multi-tier with in-memory + persistent layers
- **Memory optimization** - Array pooling with automatic cleanup
- **Performance monitoring** - Regression detection and metrics retention
- **Synthetic journey testing** - End-to-end integration validation

#### Build System Optimizations

- **83% faster builds** (20s → 2s)
- **Advanced code splitting** - Route & component-level chunking
- **Dynamic asset generation** - PWA icons with WebP optimization
- **Project structure cleanup** - Removed 12+ unnecessary files
- **Enhanced automation** - Log rotation and asset optimization scripts
- **Log rotation automation** - Production-ready log management
- **Bundle size optimization** - 60-80% reduction through strategic splitting

### Recent Structure Optimizations

- **Cleaned project structure** - Removed 12+ redundant files
- **Centralized testing** - Organized tests in `/tests/` directory
- **Enhanced automation** - Improved PWA icon generation and log rotation
- **Better documentation** - Consolidated development phase archives

See `BUILD_OPTIMIZATION.md` and `CLEANUP_IMPLEMENTATION_SUMMARY.md` for detailed information.

## 🛠️ Development

Use the Makefile for common tasks:

- `make test` — run all tests
- `make lint` — run all linters
- `make build` — build all frontends
- `make format` — format frontend code

### 🔧 New Development Tools (2025)

#### Asset Generation

- `./scripts/generate-pwa-icons.sh` — Generate optimized PWA icons with WebP support
- Supports SVG minification and PNG fallbacks

#### Log Management  

- `./scripts/rotate-logs.sh` — Automated log rotation with compression
- Prevents disk space issues in production

#### Testing Structure

- Centralized tests in `/tests/` directory
- Integration tests in `/tests/integration/`
- Organized by app: `tests/{astro,healwave,backend}/`

### 📊 Performance Targets (Updated 2025)

- **Build Time**: Sub-2 second builds with TurboRepo
- **Bundle Size**: <500KB initial load (after code splitting)
- **Time to Interactive**: <2 seconds on 3G networks
- **Core Web Vitals**: All metrics in green zone
- **PWA Score**: 95+ on Lighthouse audits

## 🔄 Recent Technical Enhancements (August 2025)

### Unified Notification System

- Consolidated legacy managers into a single `UnifiedNotificationManager` (`notificationManager.unified.ts`).
- Legacy files (`notificationManager.ts`, `notificationManager.new.ts`) are shims re-exporting the unified implementation.
- Runtime guards: subscription method fallback (`subscribeUser` → `subscribe`), sync message validation, strict ID presence checks.
- Public API surface: `initialize`, `subscribe`, `notifyChartReady`, `sendTest`, `status` plus `getNotificationManager()` singleton helper.
- New unit tests validate guard logic and subscription fallback.

### Stricter Chart Data Validation

- Zod schema (`validateChart.ts`) now enforces:
	- Planet position range (0–360)
	- House array length (1–12) & cusp range (0–360)
	- Angle value ranges
	- Safe, forward-compatible aspect/asteroid structures (passthrough for extra fields)
- Accepts partial charts so progressive loading & streaming remain supported.
- Removed unsafe upstream casts; `ChartDisplay` consumes a unified `ChartLike` + runtime validation.

### API Layer Reliability Improvements

- Corrected `NotFoundError` & `ValidationError` constructor usage (resource + id + validation payload).
- Consolidated response type imports; ensured single discriminated union `ApiResponse<T>`.

### Test Coverage Expansion

- Astro app suite: 113 passing tests including validator & notification manager specs.
- Faster feedback via focused unit tests (reduced reliance on broad integration tests).

### Backward Compatibility & Migration

- Shims slated for removal after deprecation window (target: Q4 2025). Update imports to point directly at `notificationManager.unified.ts`.
- Consider adding an environment flag if early removal desired.

### Quick Commands

```bash
# Run only validator & notification tests
pnpm --filter apps/astro test -- --run src/components/ChartDisplay/__tests__/validateChart.test.ts src/services/__tests__/notificationManager.unified.test.ts

# Full type + lint + test pipeline
pnpm run type-check && pnpm run lint:astro && pnpm run test:astro -- --run
```

### Next Optional Steps

- Remove notification shim files once all imports updated.
- Add `validateChartStrict` variant if a lenient mode is ever reintroduced.
- Auto-generate API docs for error hierarchy & `ApiResponse` via typedoc.
- Add Loki baselines around chart tables for visual regression safety.


## �🔑 Salt Management Subsystem (Backend)

Lightweight in-memory salt rotation system powering pseudonymization:

- Per-user & global salts with rotation metadata
- Adapter layer (`SaltBackendProtocol`) ready for future Firestore implementation
- Environment-configurable intervals: `USER_SALT_ROTATION_DAYS` (default 90), `GLOBAL_SALT_ROTATION_DAYS` (default 30)
- Deterministic pseudonymization helpers (user + analytics contexts)
- Admin API endpoints (`/api/admin/salts/...`): status, rotate (user/global/batch), audit, pseudonymize (dev), reload
- Explicit reload endpoint: `POST /api/admin/salts/reload` applies env overrides during a running process (test/admin use)

Planned: real Firestore backend (transactional rotations) and metrics/logging. See `docs/implementation-summaries/salt-management-implementation.md` for architecture details.

## Environment Variables

Environment strategy: strict separation of public (VITE_*) and server-only variables.
Docs: `docs/ENVIRONMENT.md`

Validation commands:

- `npm run validate-env` (rules & leakage)
- `npm run validate-env-schema` (JSON schema enforcement)

### 🔐 Security & Production

#### Firestore Security

- Comprehensive security rules with user data validation
- Rate limiting protection (60 requests/minute per user)
- Role-based access control for premium content

#### Operational Log Management

- Automated log rotation to prevent disk space issues  
- Compressed archive storage for historical data
- Production-ready logging with structured output

#### Asset Optimization

- Dynamic PWA icon generation with WebP compression
- SVG minification for optimal loading performance
- Automated optimization pipeline for production builds

## 📋 Current Development Status

### Active TODOs (ALL COMPLETED! 🎉)

**🎊 MILESTONE ACHIEVED**: All 9 TODO items have been successfully implemented!

### **Recently Completed** ✅

All major development phases complete! See [DEVELOPMENT_COMPLETION_SUMMARY.md](docs/DEVELOPMENT_COMPLETION_SUMMARY.md) for full details:

- ✅ **Core Features**: Synastry analysis, AI interpretations, chart persistence, Stripe integration
- ✅ **Backend Systems**: 213/213 tests passing with vectorized calculations and caching
- ✅ **Frontend Applications**: Both Astro and HealWave fully functional with 69/69 tests passing  
- ✅ **Infrastructure**: Security, monitoring, performance optimization, and deployment systems
- ✅ **User Experience**: Complete user journeys from authentication to premium features

**Current Focus**: Infrastructure hardening (monitoring dashboards, security enhancements, accessibility)

### Recent Completions (August 2025)

- ✅ Project structure cleanup (12+ unnecessary files removed)
- ✅ Enhanced build system with advanced code splitting
- ✅ Automated log rotation and asset optimization
- ✅ Consolidated documentation and testing structure

## CI/CD

Use `.gitlab-ci.yml` for GitLab or `.github/workflows/ci.yml` for GitHub Actions. Only one should be active.
