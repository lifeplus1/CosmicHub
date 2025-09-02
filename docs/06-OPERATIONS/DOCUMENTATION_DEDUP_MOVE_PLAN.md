---
title: Documentation Deduplication Move Plan
owner: platform
status: active
last_reviewed: 2025-09-01
review_cycle: 30d
category: operations
---

## Objective

Eliminate duplicate / scattered docs in repo root by consolidating into structured `docs/` hierarchy
with stubs where external links may exist.

## Move / Stub Actions

| Current Path (Root)                                             | Action         | Destination (Canonical)                                                            | Rationale                                   |
| --------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| AI-COORDINATION-RULES.md                                        | Stubbed (done) | docs/99-REFERENCE/AI-COORDINATION-RULES.md                                         | Single source of truth in reference section |
| ANALYTICS-001-IMPLEMENTATION-COMPLETE.md                        | Move           | docs/04-ARCHITECTURE/IMPLEMENTATION/ANALYTICS-001-COMPLETION-SUMMARY.md            | Group all implementation summaries          |
| PERF-002-IMPLEMENTATION-COMPLETE.md                             | Move           | docs/04-ARCHITECTURE/IMPLEMENTATION/PERF-002-COMPLETION-SUMMARY.md                 | Consistent naming                           |
| PARALLEL_LINT_IMPLEMENTATION_SUMMARY.md                         | Move           | docs/04-ARCHITECTURE/IMPLEMENTATION/LINT-PARALLEL-COMPLETION-SUMMARY.md            | Thematic grouping                           |
| VITEST-WORKSPACE-IMPLEMENTATION-COMPLETE.md                     | Move           | docs/04-ARCHITECTURE/IMPLEMENTATION/VITEST-WORKSPACE-COMPLETION-SUMMARY.md         | Consistency                                 |
| TAILWIND-CONSOLIDATION-COMPLETE.md                              | Move           | docs/04-ARCHITECTURE/IMPLEMENTATION/TAILWIND-CONSOLIDATION-COMPLETION-SUMMARY.md   | Styling infra summary                       |
| TYPESCRIPT-CONSOLIDATION-COMPLETE.md                            | Move           | docs/04-ARCHITECTURE/IMPLEMENTATION/TYPESCRIPT-CONSOLIDATION-COMPLETION-SUMMARY.md | Language infra                              |
| CONFIGURATION-CONSOLIDATION-COMPLETE.md                         | Move           | docs/04-ARCHITECTURE/IMPLEMENTATION/CONFIG-CONSOLIDATION-COMPLETION-SUMMARY.md     | Central config                              |
| AI_AGENT_COORDINATION_COMPLETE.md                               | Move           | docs/05-ARCHIVE/AI_AGENT_COORDINATION_COMPLETE.md                                  | Historical; archive                         |
| ENHANCED_COORDINATION_IMPLEMENTATION_COMPLETE.md                | Move           | docs/04-ARCHITECTURE/IMPLEMENTATION/AI-COORD-ENHANCED-COMPLETION-SUMMARY.md        | Active reference                            |
| CODE_REFACTOR_SUMMARY.md                                        | Move           | docs/04-ARCHITECTURE/REFACTOR/CODE_REFACTOR_SUMMARY.md                             | Architecture / refactor grouping            |
| PERF-002-IMPLEMENTATION-COMPLETE.md (duplicate also in archive) | Deduplicate    | Keep one canonical (implementation)                                                | Remove older duplicate                      |

## Naming Standard

`<AREA>-<ID>-<DOC_TYPE>.md` where DOC_TYPE ∈ {PLAN, IMPLEMENTATION-GUIDE, COMPLETION-SUMMARY,
STATUS, REPORT}.

## Stubbing Pattern

For removed root files with potential inbound links create stub:

```markdown
---
title: <Old Title> (Stub)
status: moved
last_reviewed: 2025-09-01
review_cycle: 365d
canonical: <new path>
---

This document moved to `<new path>`.
```

## Execution Steps

1. Create `docs/04-ARCHITECTURE/IMPLEMENTATION/` (and `REFACTOR/`) folders if absent.
2. Move listed files; adjust names to standard.
3. Insert YAML frontmatter if missing post-move.
4. Leave stub files for any externally referenced paths (decide case-by-case via grep usage count).
5. Run `python scripts/doc_freshness.py --apply --report` to refresh frontmatter + freshness.
6. Update index generator (if any) to include new subfolders.

## Post-Move Validation

| Check                | Method             | Pass Criteria                              |
| -------------------- | ------------------ | ------------------------------------------ |
| Broken Links         | grep old filenames | No unresolved references                   |
| Frontmatter coverage | script report      | 100% active docs have frontmatter          |
| Duplicate removal    | manual scan        | No duplicate base names across active dirs |

## Open Questions

1. Should completion summaries live under architecture or a new `04-IMPLEMENTATION/`? (Currently
   using IMPLEMENTATION subfolder.)
2. Do we auto-generate a roll-up index of completion summaries? (Optional enhancement)

## Next Enhancements

- Add CI job to run freshness script and fail if >10% overdue.
- Auto-build doc site (MkDocs/Docusaurus) using frontmatter metadata.
