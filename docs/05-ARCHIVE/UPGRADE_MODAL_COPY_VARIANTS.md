# Upgrade Modal Copy Variants (EXP-002)

Source moved to JSON for experimentation.

Data File: `docs/data/upgrade_modal_variants.json`

Implementation Notes:

- Load JSON once at app start or lazy-load before modal display.
- Use `useABTest({ testName: 'upgrade_modal', variants: ['v1','v2','v3','v4','v5'] })`.
- Map selected variant index to JSON array entry.
- Fire events: `view`, `cta_click`, `conversion` via `trackEvent`.

Guardrails:

- Headlines <= 8 words; subheadlines <= 14 words (validated).
- Benefits mapped to: AI interpretations, advanced synastry, saved charts.

Future Enhancements:

- Add `experimentId`, `audience`, `localeKey` fields.
- Introduce control variant fallback logic if JSON changes.

Raw JSON removed to avoid duplication.
