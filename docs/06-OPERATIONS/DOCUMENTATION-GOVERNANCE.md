---
title: Documentation Governance & Freshness Workflow
owner: platform
status: active
last_reviewed: 2025-09-02
review_cycle: 60d
category: operations
---

## Documentation Governance & Freshness Workflow

Defines the lifecycle rules, review cadence, and automation used to keep documentation current.

## Frontmatter Schema

```yaml
---
title: Human readable title
owner: team-or-individual
status: active|archived|deprecated
last_reviewed: YYYY-MM-DD
review_cycle: <Nd>
category: overview|plan|guide|architecture|operations|monitoring|security|reference|archive|context
canonical: path/to/canonical (optional)
---
```

## Review Cadence Guidelines

| Category     | Default Cycle | Rationale                    |
| ------------ | ------------- | ---------------------------- |
| overview     | 60d           | High visibility entry points |
| status       | 14d           | Rapid status drift risk      |
| plan         | 30d           | Priorities shift monthly     |
| guide        | 90d           | Stable how-to content        |
| architecture | 90d           | Evolves quarterly            |
| operations   | 120d          | Runbooks less volatile       |
| monitoring   | 60d           | Alerting/metrics change      |
| security     | 60d           | Policy & threat updates      |
| reference    | 120d          | API/schema stability         |
| archive      | 365d          | Rarely changes               |

## Automation

Script: `python scripts/doc_freshness.py`

Modes:

```bash
# Add missing frontmatter everywhere
python scripts/doc_freshness.py --apply

# Generate / update freshness report only
python scripts/doc_freshness.py --report

# Enforce max overdue percentage (CI)
python scripts/doc_freshness.py --report --fail-overdue-pct 10
```

CI Workflows:

- Freshness: `.github/workflows/docs-freshness.yml` (weekly + push to main) fails if >10% overdue.
- Priorities & Snapshot: `.github/workflows/docs-priorities.yml` (weekly + push) regenerates Active
  Priorities index and refreshes executive snapshot / change log in `PROJECT_PRIORITIES_2025.md`.

(Optional: add a Slack/webhook notification step in customized workflows if desired.)

## Adding New Documents

1. Create file under appropriate `docs/<NN-CATEGORY>/` folder.
2. Add compliant frontmatter (or rely on `--apply` to fill defaults).
3. Commit alongside related code changes.
4. If replacing a document, leave a stub at the old path with `status: deprecated` + `canonical`
   pointing to the new file.

## When a Doc Becomes Overdue

1. Open the doc, validate accuracy.
2. Update content as needed.
3. Update `last_reviewed` to today.
4. (Optional) Adjust `review_cycle` if the doc should refresh more/less frequently.

## Deprecation & Archival

- Deprecated: Still relevant for history; add notice + canonical to replacement.
- Archived: Move into an archive folder or set status to `archived`; review yearly.

## Implementation Index

Primary implementation summaries: `docs/04-ARCHITECTURE/IMPLEMENTATION/INDEX.md`.

## Quality Checks Before Merge

- Lint: markdownlint (single H1 rule, spacing, fenced languages).
- Freshness: CI threshold (<10% overdue) must pass.
- Canonical links resolve (no dead references).

## Future Enhancements (Backlog)

- Pre-commit hook to run freshness add + lint. (Implemented: `scripts/pre_commit_docs.sh` +
  `.husky/pre-commit`)
- Dashboard summarizing overdue count by category.
- Slack notifier for >5% overdue spike.

---

Maintained by the platform team. Propose changes via PR referencing this file.
