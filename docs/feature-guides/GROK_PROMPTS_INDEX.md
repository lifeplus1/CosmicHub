# Grok Prompts Index (Consolidated)

Single reference catalog of active Grok prompts for ideation, content generation, and domain elaboration. Source tasks come from `docs/PROJECT_PRIORITIES_2025.md`, `docs/ISSUE_TRACKER.md`, and `ROADMAP.md`.

Status Legend: ✅ Complete (historical reference), 🔄 Active (use now), 💤 Deferred (future), 🧪 Exploration.

## Core Feature Domains

| Task | Status | Intent | Primary Prompt File/Section |
|------|--------|--------|------------------------------|
| EXP-002 Upgrade Modal Copy | ✅ | Variants JSON spec | `data/upgrade_modal_variants.json` |
| (Completed) COLLAB-050 Collaborative Sharing | ✅ | Spec archived | `COLLABRATIVE_CHART_SHARING.md` |
| (Completed) SOCIAL-060 Marketplace Roadmap | ✅ | Spec archived | `MARKETPLACE_PHASED_ROADMAP.md` |
| (Completed) AI-070 Layered AI Evolution | ✅ | Spec archived | `feature-guides/AI_LAYERED_INTERPRETATION_ROADMAP.md` |

## Active Inline Prompts (Copy/Paste)

<!-- EXP-002 prompt removed after completion; see data file for canonical variants. -->

<!-- Historical completed prompts removed per cleanup directive. References retained in table above. -->

## Usage Guidelines

1. Run creative/ideation prompts in **Grok** first for breadth, then refine implementation details with Claude 3.5 Sonnet.
2. Request JSON where structured ingestion or A/B testing pipelines are anticipated.
3. Keep a local copy of raw Grok responses under `docs/feature-guides/grok-responses/YYYY-MM-DD/` (not yet automated).
4. After acceptance, distill stable specifications into implementation summary docs.

## Future Candidate Prompts (Backlog)

- EXP-011 Guardrail breach notification message taxonomy
- REL-011 Fallback message tone variants (user empathy focus)
- UX-020 Offline mode onboarding copy & empty state messaging

---
Generated: 2025-08-16
