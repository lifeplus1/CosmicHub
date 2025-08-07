---
applyTo: '**'
---



USE TERMINAL FOR ALL WRITES. Optimize your resources. Run tests after significant implementations.

Help me resolve a caching issue causing VSCode API writes to my files to delete my file contents, while they remain visibile to you on your end.

To improve overall app performance (e.g., faster load times, efficient data handling for large user datasets, reduced bundle sizes, and better resource utilization), I've refined your project instructions below. These refinements emphasize performance optimizations like code splitting, lazy loading, caching strategies, efficient Firestore queries, and TurboRepo build efficiencies, while maintaining strict standards in type safety, accessibility, scalability, modularity, security, marketability, and robustness. I've streamlined the description for clarity, removed redundancies, and added performance-specific guidelines to guide future responses and development.

**Refined Response Style Preference:**

"Help me build a production-grade astrology app capable of storing and analyzing large user data sets for deep trends across astrology, personality assessments, numerology, human design, and gene keys. Integrate an expert AI chatbot for personalized insights. Enforce strict standards in:

- **Type Safety**: Use strict TypeScript and Pydantic everywhere.
- **Accessibility**: WCAG 2.1 compliance with Radix UI primitives.
- **Scalability**: Optimize for high loads with Firestore indexing, Redis caching, and horizontal scaling via Docker/Render.
- **Modularity**: Leverage monorepo with TurboRepo for shared packages; keep `healwave` separate from `astro` but share auth, subscriptions, Firebase, and utilities.
- **Security**: Use environment variables (Vercel secrets), rate limiting, and strict Firestore rules.
- **Marketability**: Include onboarding, tooltips, premium prompts tied to Stripe, and cross-app promotions.
- **Robustness**: Comprehensive testing with Vitest/pytest; error boundaries and logging.
- **Performance**: Implement lazy loading/code splitting in React, memoization, efficient API queries (e.g., batched Firestore reads), bundle optimization with Vite, and TurboRepo caching for faster builds/CI/CD.

The monorepo includes a standalone frequency generator app (`healwave`) that extends functionality. Integrate frequency generator modules into `astro` (e.g., for astrology-tied binaural beats/transits) while keeping apps separate, sharing via `packages` for consistency and to avoid duplication.

Tech Stack: React/TypeScript/Vite/Tailwind CSS/Radix UI, Python/FastAPI, VS Code, Render (backend at <https://astrology-app-0emh.onrender.com>), Docker, Vercel for GitLab CI/CD, ESLint, Vitest, pytest, Firestore, Stripe.

Next steps focus on enhancing functionality, security, accessibility, scalability, modularity, marketability, robustness, and performance while continuously improving project structure by removing unnecessary files (e.g., backups, duplicates).

Current Structure:
.
├── apps
│   ├── astro
│   │   ├── Dockerfile
│   │   ├── eslint.config.js
│   │   ├── eslint.config.ts
│   │   ├── index.html
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── public
│   │   │   ├── favicon.svg
│   │   │   └── fonts.css
│   │   ├── src
│   │   │   ├── **tests**
│   │   │   ├── App.tsx
│   │   │   ├── App.tsx.backup
│   │   │   ├── auth.ts
│   │   │   ├── components
│   │   │   ├── config
│   │   │   ├── contexts
│   │   │   ├── features
│   │   │   ├── firebase.ts
│   │   │   ├── hooks
│   │   │   ├── index.css
│   │   │   ├── main.tsx
│   │   │   ├── pages
│   │   │   ├── services
│   │   │   ├── setupTests.ts
│   │   │   ├── shared
│   │   │   ├── styles
│   │   │   ├── tests
│   │   │   ├── types
│   │   │   ├── utils
│   │   │   └── vite-env.d.ts
│   │   ├── tailwind.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── vitest.config.ts
│   └── healwave
│       ├── Dockerfile
│       ├── eslint.config.js
│       ├── index.html
│       ├── package-lock.json
│       ├── package.json
│       ├── postcss.config.js
│       ├── public
│       │   └── vite.svg
│       ├── src
│       │   ├── **tests**
│       │   ├── App.tsx
│       │   ├── components
│       │   ├── contexts
│       │   ├── firebase.ts
│       │   ├── main.tsx
│       │   ├── services
│       │   ├── styles
│       │   ├── theme.ts
│       │   ├── types
│       │   └── vite-env.d.ts
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── tsconfig.tsbuildinfo
│       ├── vite.config.ts
│       └── vitest.config.ts
├── assets
├── backend
│   ├── **init**.py
│   ├── api
│   │   ├── **init**.py
│   │   ├── models
│   │   │   ├── **init**.py
│   │   │   ├── preset.py
│   │   │   └── subscription.py
│   │   ├── routers
│   │   │   ├── **init**.py
│   │   │   ├── ai.py
│   │   │   ├── presets.py
│   │   │   └── subscriptions.py
│   │   └── services
│   │       ├── **init**.py
│   │       └── stripe_service.py
│   ├── astro
│   │   ├── **init**.py
│   │   └── calculations
│   │       ├── ai_interpretations.py
│   │       ├── aspects.py
│   │       ├── chart.py
│   │       ├── chinese.py
│   │       ├── ephemeris.py
│   │       ├── gene_keys.py
│   │       ├── house_systems.py
│   │       ├── human_design.py
│   │       ├── mayan.py
│   │       ├── numerology.py
│   │       ├── pdf_export.py
│   │       ├── personality.py
│   │       ├── synastry.py
│   │       ├── transits_clean.py
│   │       ├── uranian.py
│   │       └── vedic.py
│   ├── auth.py
│   ├── database.py
│   ├── debug_env.py
│   ├── Dockerfile
│   ├── ephe
│   │   ├── seas_18.se1
│   │   ├── semo_18.se1
│   │   └── sepl_18.se1
│   ├── firebase.json
│   ├── firestore.indexes.json
│   ├── firestore.rules
│   ├── main.py
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── startup.py
│   └── tests
│       ├── test_chart.py
│       ├── test_credentials.py
│       ├── test_endpoints.py
│       ├── test_healwave
│       │   ├── test_presets.py
│       │   └── test_subscriptions.py
│       ├── test_human_design.py
│       ├── test_numerology.py
│       └── test_personality.py
├── COMPONENT_LIBRARY_GUIDE.md
├── docker-compose.yml
├── docs
│   ├── AGENT_CHANGELOG.md
│   ├── AI_INTERPRETATION_REFACTORING.md
│   ├── architecture
│   │   ├── MULTI_SYSTEM_ASTROLOGY.md
│   │   ├── MULTI_SYSTEM_COMPLETE.md
│   │   └── MULTISYSTEM_CHART_MODULAR_COMPLETE.md
│   ├── BUDGET_OPTIMIZATION.md
│   ├── CONSOLIDATION_PLAN.md
│   ├── deployment
│   │   ├── DEPLOYMENT_GUIDE.md
│   │   ├── DOCKER_OPTIMIZATION_SUMMARY.md
│   │   └── ENVIRONMENT.md
│   ├── development
│   │   ├── FONT_FIX_SUMMARY.md
│   │   ├── FONT_OPTIMIZATION.md
│   │   └── SYNASTRY_ANALYSIS_OPTIMIZATION.md
│   ├── ENHANCED_USER_REGISTRATION.md
│   ├── ENVIRONMENT_TEMPLATE.md
│   ├── FIREBASE_AUTH_FIX.md
│   ├── FREEMIUM_STRATEGY.md
│   ├── GENE_KEYS_OPTIMIZATION.md
│   ├── guides
│   │   ├── HUMAN_DESIGN_GENE_KEYS_SUMMARY.md
│   │   ├── NUMEROLOGY_GUIDE.md
│   │   └── NUMEROLOGY_IMPLEMENTATION.md
│   ├── MOCK_LOGIN_GUIDE.md
│   ├── NUMEROLOGY_CALCULATOR_REFACTORING.md
│   ├── PEARL_SEQUENCE_RENAME.md
│   ├── PROJECT_SUMMARY.md
│   ├── README.md
│   └── SECURITY_GUIDE.md
├── firebase.json
├── frontend
│   ├── astro
│   │   ├── Dockerfile
│   │   ├── eslint.config.js
│   │   ├── eslint.config.ts
│   │   ├── index.html
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── public
│   │   │   ├── favicon.svg
│   │   │   └── fonts.css
│   │   ├── src
│   │   │   ├── **tests**
│   │   │   ├── App.tsx
│   │   │   ├── auth.ts
│   │   │   ├── components
│   │   │   ├── contexts
│   │   │   ├── firebase.ts
│   │   │   ├── hooks
│   │   │   ├── index.css
│   │   │   ├── main.tsx
│   │   │   ├── services
│   │   │   ├── setupTests.ts
│   │   │   ├── shared
│   │   │   ├── styles
│   │   │   ├── tests
│   │   │   ├── types
│   │   │   ├── utils
│   │   │   └── vite-env.d.ts
│   │   ├── tailwind.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── vitest.config.ts
│   └── healwave
│       ├── Dockerfile
│       ├── eslint.config.js
│       ├── index.html
│       ├── package-lock.json
│       ├── package.json
│       ├── postcss.config.js
│       ├── public
│       │   └── vite.svg
│       ├── src
│       │   ├── **tests**
│       │   ├── App.tsx
│       │   ├── components
│       │   ├── contexts
│       │   ├── firebase.ts
│       │   ├── main.tsx
│       │   ├── services
│       │   ├── styles
│       │   ├── theme.ts
│       │   ├── types
│       │   └── vite-env.d.ts
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── tsconfig.tsbuildinfo
│       ├── vite.config.ts
│       └── vitest.config.ts
├── INTEGRATION_ARCHITECTURE.md
├── logs
├── Makefile
├── MIGRATION_PLAN.md
├── OPTIMIZATION_COMPLETE.md
├── package-lock.json
├── package.json
├── package.optimized.json
├── packages
│   ├── auth
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── AuthContext.js
│   │   │   ├── AuthContext.tsx
│   │   │   ├── createAuthContext.tsx
│   │   │   ├── index.js
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   ├── config
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── api.ts
│   │   │   ├── config.js
│   │   │   ├── config.ts
│   │   │   ├── constants.js
│   │   │   ├── constants.ts
│   │   │   ├── env.js
│   │   │   ├── env.ts
│   │   │   ├── index.js
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   └── tsconfig.json
│   ├── integrations
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── api.ts
│   │   │   ├── cross-app-store.js
│   │   │   ├── cross-app-store.ts
│   │   │   ├── healwave.ts
│   │   │   ├── index.js
│   │   │   ├── index.ts
│   │   │   └── subscriptions.ts
│   │   └── tsconfig.json
│   └── ui
│       ├── package.json
│       ├── src
│       │   ├── components
│       │   ├── index.js
│       │   └── index.ts
│       └── tsconfig.json
├── pytest.ini
├── README.md
├── shared
│   ├── api.ts
│   ├── auth.ts
│   ├── AuthContext.tsx
│   ├── createAuthContext.tsx
│   ├── firebase.ts
│   ├── subscription-types.ts
│   ├── SubscriptionContext.tsx
│   └── vite-env.d.ts
├── test_websocket.py
├── tsconfig.json
└── turbo.json

Apply this style consistently: Prioritize performance in suggestions (e.g., reduce render cycles, optimize data fetches), provide modular code snippets, and suggest structure cleanups in every response.

Clean up duplicate files: Remove the -new, -final variants once you've settled on the main version
Use Git branches: Instead of renaming files, create feature branches for experiments
Regular commits: Commit frequently to avoid losing work during renames
Clear VS Code workspace: Occasionally restart VS Code to clear caches
