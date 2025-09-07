---
title: Documentation Consolidation Strategy
owner: platform
status: proposed
last_reviewed: 2025-09-07
review_cycle: 30d
category: operations
---

## Goals

- Reduce redundant docs and conflicting variants
- Establish canonical locations and naming
- Keep root clean (<= 3 md files)
- Ensure cross-links and stubs prevent broken references

## Canonical Information Architecture

- 00-OVERVIEW: high-level overview, roadmap, master context
- 01-CURRENT-STATUS: status, summaries, daily updates
- 02-ACTIVE-PRIORITIES: immediate plans and trackers
- 03-IMPLEMENTATION-PLANS: detailed plans and ADRs
- 04-ARCHITECTURE: system, refactors, implementation summaries
- 05-ARCHIVE: completed items, historical reports
- 06-OPERATIONS: governance, runbooks, docs maintenance
- 07-MONITORING: audits, metrics, reports
- 08-SECURITY: security and privacy docs
- 99-REFERENCE: quick references/indices

## High-Redundancy Clusters

- Implementation Complete: pattern "FEATURE-NAME-IMPLEMENTATION-COMPLETE.md" appears across root, docs/04-ARCHITECTURE/IMPLEMENTATION, and docs/05-ARCHIVE/completed-features. Canonical: docs/05-ARCHIVE/completed-features/ with normalized naming "AREA-ID-IMPLEMENTATION-COMPLETE.md".
- Optimization Summaries: COMPONENT-OPTIMIZATION-*.md at repo root and monitoring archives. Canonical: docs/07-MONITORING/COMPONENT-AUDIT-COMPLETION-REPORT.md (rollup) + keep a single root executive summary if needed; otherwise move to 07-MONITORING.
- Enhancement Summaries: *ENHANCEMENT-*.md duplicated under root and apps. Canonical: docs/01-CURRENT-STATUS/PROJECT-STATUS-SUMMARY.md with per-feature summaries under 04-ARCHITECTURE/IMPLEMENTATION/.
- Refactoring Plans/Summaries: REFACTOR*.md scattered. Canonical: docs/04-ARCHITECTURE/REFACTOR/.
- CI/CD: CI-CD-ENHANCEMENT-SUMMARY.md and docs/CI-CD-IMPROVEMENTS.md duplicates. Canonical: docs/03-GUIDES/deployment/CI-CD-IMPROVEMENTS.md, root file becomes stub.
- Lint Summaries: LINT-FIXES-SUMMARY.md, ESLINT-FIXES-SUMMARY.md and their copies. Canonical: docs/01-CURRENT-STATUS/completions/PARALLEL-LINT-IMPLEMENTATION-SUMMARY.md. Root duplicates become stubs.
- Phase docs: PHASE-*.md spread across root and archive. Canonical: docs/05-ARCHIVE/completed-features/ with a single live tracker in 02-ACTIVE-PRIORITIES.
- cosmichub-*.md: overview/tree/structure duplicates. Canonical: docs/00-OVERVIEW/INDEX.md; keep one overview at root README linking to canonical index.

## Naming & Metadata

- Standard: AREA-ID-DOC_TYPE.md where DOC_TYPE ∈ {PLAN, IMPLEMENTATION-GUIDE, IMPLEMENTATION-COMPLETE, COMPLETION-SUMMARY, STATUS, REPORT}
- All active docs must include YAML frontmatter with title, owner, status, last_reviewed, review_cycle, category.

## Actions

1. Move & Stub

- Move duplicates to canonical directories; create stub at old path when external links likely exist.
- Keep only one executive summary at root when necessary; prefer index pages in docs.

1. Deduplicate Content

- Merge near-identical content; keep most recent by date in frontmatter/body.
- Consolidate small single-topic files into rollups (e.g., Lint improvements rollup; Optimization rollup).

1. Automate Governance

- Add pre-commit doc freshness check (fail if >10% overdue).
- Add duplicate basename detector in CI.
- Generate indices for 03-IMPLEMENTATION-PLANS and 05-ARCHIVE.

## Concrete Mappings (initial)

- CI-CD-ENHANCEMENT-SUMMARY.md → docs/03-GUIDES/deployment/CI-CD-IMPROVEMENTS.md (stub old)
- LINT-FIXES-SUMMARY.md, ESLINT-FIXES-SUMMARY.md → docs/01-CURRENT-STATUS/completions/PARALLEL-LINT-IMPLEMENTATION-SUMMARY.md (consolidate, stub old)
- COMPONENT-ANALYSIS-REPORT.md (root) → docs/07-MONITORING/COMPONENT-AUDIT-COMPLETION-REPORT.md (merge)
- cosmichub-overview.md, cosmichub-tree.md, cosmichub-structure.md → docs/00-OVERVIEW/INDEX.md (merge sections) with root README links.
- *IMPLEMENTATION-COMPLETE.md (root) → docs/05-ARCHIVE/completed-features/ (move)
- PHASE-3-IMPLEMENTATION-SUMMARY.md → docs/05-ARCHIVE/implementation-summaries/ (keep a single live tracker in 02-ACTIVE-PRIORITIES/PHASE-6B-READINESS-MONITOR.md)

## Rollup Documents to Create

- docs/07-MONITORING/OPTIMIZATION-CAMPAIGN-2025.md (merge COMPONENT-OPTIMIZATION-* and COMPONENT-ANALYSIS-REPORT)
- docs/01-CURRENT-STATUS/LINT-IMPROVEMENTS-2025.md (merge lint summaries)
- docs/04-ARCHITECTURE/REFACTOR/REFACTORING-INDEX.md (index of plans/summaries)

## Workflow

- Weekly: run docs freshness and duplicate check, open issues for overdue/dupes
- Monthly: prune stubs with zero inbound references (grep count 0)
- Quarterly: archive stale status docs to 05-ARCHIVE

## Success Criteria

- Root: <= 3 md files
- No duplicate basenames among active docs
- 100% active docs with frontmatter
- All canonical indices updated
