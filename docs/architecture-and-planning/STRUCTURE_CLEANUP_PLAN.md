# CosmicHub Structure Cleanup Plan (August 2025)

Goal: finalize migration from legacy `shared/` directory to first-class typed packages and reduce
duplication (especially subscription tier definitions) without breaking current builds.

## 1. Completed in this pass

1. Expanded root `workspaces` to include `packages/*` and `ephemeris_server` for proper hoisting &
   install consistency.
2. Marked all `shared/` modules with clear deprecation headers.
3. Established this documented plan for staged removal.

### 2. Next (Low-Risk) Steps

1. Create `packages/subscriptions` (or fold into `integrations`) exporting unified tier interfaces +
   utilities.
2. Refactor `apps/astro` & `apps/healwave` to import tier constants/utilities from that package.
3. Remove duplicate tier logic in:
   - `apps/astro/src/types/subscription.ts` (deleted)
   - `apps/healwave/src/types/subscription.ts` (deleted)
   - `packages/auth/src/subscription-utils.ts` (refactored)
   - `shared/subscription-types.ts` (deleted)
4. Replace any relative mocks in tests pointing to `../shared/*` with package-based mocks.

### 3. Shared Directory Deletion Criteria

All of the following must be true before deleting `shared/`:

- grep for `shared/` returns no matches in `apps`, `packages`, or backend sources (excluding
  docs/changelogs).
- CI passes after redirects/import refactors.
- Dockerfiles no longer COPY `shared/` (update `apps/astro/Dockerfile`).

### 4. Scripted Verification (to implement)

Add a validation script to ensure no runtime imports reference deprecated paths (see
`scripts/project-cleanup.mjs`). Integrate into CI as a pre-build or lint step once fully migrated.

### 5. Longer-Term Enhancements

- Introduce `@cosmichub/domain-*` package namespaces for distinct bounded contexts (auth,
  subscriptions, astrology, audio).
- Add type-only packages for shared DTOs used by backend & frontend (generate via openapi/typescript
  if an OpenAPI spec is introduced).
- Use a root `tsconfig.packages.json` with project references for faster incremental builds.

### 6. Risk Mitigation

- Perform changes in two PR waves: (A) add new package + dual exports, (B) remove legacy.
- Enable strict import lint rule to forbid `shared/` after migration: custom ESLint rule or
  `no-restricted-imports`.

### 7. Tracking

Progress can be tracked in a GitHub issue: "Deprecate shared directory and consolidate subscription
tiers" with checklist mirroring sections above.

---

This document should be updated as each phase completes.

## Update (2025-08-16)

- Central `@cosmichub/subscriptions` package created and now exports unified `COSMICHUB_TIERS` with
  full metadata plus HealWave tiers.
- Astro components (PricingPage, UserProfile, SubscriptionStatus, UpgradePrompt) refactored to
  consume centralized tiers.
- Local `apps/astro/src/types/subscription.ts`, `apps/healwave/src/types/subscription.ts`, and
  `shared/subscription-types.ts` have been deleted after migration.
- ESLint rule added to forbid any future imports from `shared/`.
