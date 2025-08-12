---
applyTo: '**'
---

# Project Instructions

Review my project stucture. Check the shared folder for contexts. Optimize your resources. Run tests after significant implementations. Resolve all errors when you see them. Always check to see if a file already exists before you create a new file.

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

Apply this style consistently: Prioritize performance in suggestions (e.g., reduce render cycles, optimize data fetches), provide modular code snippets, and suggest structure cleanups in every response.

Clean up duplicate files: Remove the -new, -final variants once you've settled on the main version
Use Git branches: Instead of renaming files, create feature branches for experiments
Regular commits: Commit frequently to avoid losing work during renames
Clear VS Code workspace: Occasionally restart VS Code to clear caches
