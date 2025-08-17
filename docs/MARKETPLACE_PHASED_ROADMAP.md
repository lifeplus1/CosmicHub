# Phased Marketplace Roadmap for CosmicHub Astrology App

**Status:** ✅ Complete (v1 approved specification) – 2025-08-16

_Note: Further changes should be tracked via incremental CHANGELOG entries rather than editing core phase definitions; add extensions under a new “Post-Community Enhancements” section if needed._

The following roadmap outlines the development of a marketplace feature within the CosmicHub astrology app. This marketplace will enable users to buy/sell astrology-related digital goods (e.g., custom AI interpretations, frequency presets tied to transits, personalized charts, or community-shared numerology reports). It emphasizes modularity (e.g., shared packages for auth/subscriptions), scalability (Firestore indexing, Redis caching), security (rate limiting, Stripe integration), performance (lazy loading for listings, batched queries), and marketability (premium prompts, cross-promotions with Healwave). Phases are MVP (core functionality), Growth (expansion and analytics), and Community (user-driven engagement). Suggestions: Integrate with existing Firebase Auth for seamless user onboarding; use TurboRepo for shared UI components; add Vitest/pytest for marketplace transaction testing; clean up redundant files (e.g., backups in docs/archive) post-MVP.

## Summary Table

| Phase     | Features | User Stories | Moderation Controls | Risk Mitigations | Success Metrics |
|-----------|----------|--------------|---------------------|------------------|-----------------|
| **MVP** | - Basic listing creation/upload for digital goods (e.g., PDF charts, AI interpretations); - Secure purchase flow via Stripe; - User dashboard for sales/purchases; - Search/filter by astrology categories (e.g., signs, houses) | - As a seller, I can upload and price my custom astrology content; - As a buyer, I can browse, preview, and buy items with one-click payment; - As a premium user, I get discounted access to marketplace items | - Automated content scanning for copyright/IP violations; - Manual approval queue for new listings; - Report/flagging system for users | - Use Pydantic for input validation to prevent injection attacks; - Rate limit API endpoints to avoid abuse; - Encrypt sensitive data with Firebase rules; pseudonymize user info | - 100+ listings created in first month; - 50% conversion rate from browse to purchase; - <5% transaction failure rate; - App load time <2s for marketplace pages |
| **Growth** | - Advanced analytics dashboard for sellers (e.g., sales trends tied to astrology transits); - Recommendation engine using ML (e.g., based on user birth data); - Integration with Healwave for bundled frequency/astrology products; - Promo codes and affiliate sharing | - As a seller, I can track performance and optimize listings based on buyer feedback; - As a buyer, I receive personalized recommendations (e.g., "Venus transit bundles"); - As an admin, I can run promotions cross-app | - AI-assisted moderation for spam/scams (e.g., keyword filters on reviews); - User verification badges for trusted sellers; - Automated takedowns for low-rated content | - Implement Redis caching for high-traffic queries to scale loads; - Horizontal scaling via Docker; monitor with performance hooks; - Backup/rollback for failed transactions; comply with GDPR via pseudonymization | - 500+ active users/month; - 20% MoM growth in sales volume; - >4.5 average rating for listings; - Bundle analysis: 30% uplift in cross-sells with Healwave |
| **Community** | - User forums/reviews with threaded discussions; - Collaborative editing for shared content (e.g., community gene keys libraries); - Live events (e.g., astrology webinars with ticket sales); - Social sharing integrations (e.g., export to X/Twitter) | - As a community member, I can collaborate on and co-sell group-created content; - As a participant, I can join live sessions and rate them post-event; - As a moderator, I can oversee forums for positive engagement | - Community-elected moderators with tools for editing/banning; - Sentiment analysis on reviews to flag toxicity; - Age-gated access for sensitive content (e.g., human design insights) | - Use error boundaries and logging for robust event handling; - Accessibility audits (WCAG 2.1) to mitigate exclusion risks; - Rate limiting on forums; secure WebSockets for live features | - 1,000+ community interactions/month (posts/reviews); - 15% user retention from events; - <1% moderation escalations; - 40% of sales from community-driven content |

## Phase Objectives (Concise)

| Phase | Core Goal | North-Star KPI | Time Horizon | Exit Criteria |
|-------|-----------|----------------|--------------|---------------|
| MVP | Launch a secure, minimal commerce loop | 100 paid transactions | 6–8 weeks | Payment success >95%, Listings >=100, Latency p95 < 1200ms |
| Growth | Accelerate discovery & monetization efficiency | 20% MoM GMV growth | +10 weeks | Recommendation CTR >8%, Seller retention >70%, Bundle attach >30% |
| Community | Unlock network effects & UGC velocity | 40% sales from UGC | +12 weeks | Community content GMV share 40%, Event retention 15%, Moderation SLA <4h |

## Architecture Evolution

| Layer | MVP | Growth | Community |
|-------|-----|--------|-----------|
| Auth & Identity | Firebase Auth | Roles & seller verification badges | Community roles + delegated moderation |
| Data Storage | Firestore (Listings, Orders) | Add Analytics collections (events, impressions) | Forum threads, reviews, collaborative docs (CRDT / merge strategy) |
| Caching | None / client-side | Redis: hot listings + recommendation feature vectors | Redis + stream channels for live events presence |
| Payments | Stripe Checkout (one-time) | Stripe webhooks (refunds, promotions) | Tiered revenue sharing & pooled payouts |
| Search/Filter | Firestore composite indexes | Denormalized search facets + precomputed popularity ranks | Semantic tagging + ML topic clusters |
| Recommendations | Static category filtering | ML: user profile + behavioral embedding | Community affinity graph + social signals |
| Moderation | Manual review queue | AI keyword + image hash scanning | Hybrid (AI + community escalation workflows) |
| Observability | Basic request logs | Metrics (latency, conversion), trace sampling | Full tracing + anomaly detection (fraud / abuse) |
| Frontend Delivery | Lazy route + incremental data fetch | Prefetch + React Query cache priming | Realtime updates (WebSockets) & optimistic collaboration |

## Core Data Model (Initial Draft)

```mermaid
erDiagram
  USER ||--o{ LISTING : "creates"
  USER ||--o{ ORDER : "purchases"
  USER ||--o{ REVIEW : "writes"
  LISTING ||--o{ ORDER : "sold_in"
  LISTING ||--o{ REVIEW : "reviewed_by"
  LISTING {
    string id
    string sellerId
    string title
    string category
    string mediaRef
    number priceCents
    string currency
    string status // draft|active|suspended
    string[] tags
    number createdAt
    number updatedAt
  }
  ORDER {
    string id
    string listingId
    string buyerId
    number priceCents
    string currency
    string stripeSessionId
    string status // pending|paid|refunded|failed
    number createdAt
  }
  REVIEW {
    string id
    string listingId
    string userId
    number rating // 1-5
    string comment
    number createdAt
    string sentiment // optional derived
  }
```

## API Endpoint Draft (MVP)

| Method | Path | Purpose | Notes |
|--------|------|---------|-------|
| POST | `/api/marketplace/listings` | Create listing | Auth seller; validate price/currency |
| GET | `/api/marketplace/listings` | Query listings | Filter: category, tag, price_range |
| GET | `/api/marketplace/listings/{id}` | Get listing detail | Include seller summary |
| POST | `/api/marketplace/checkout` | Begin Stripe session | Returns checkout URL/session id |
| POST | `/api/marketplace/webhook` | Stripe webhook listener | Verify signature; idempotent upsert |
| POST | `/api/marketplace/listings/{id}/reviews` | Add review | Rate limit per buyer + purchase check |
| GET | `/api/marketplace/listings/{id}/reviews` | List reviews | Paginated, cached |

## Metrics & Instrumentation

| Metric | Type | Dimension Labels | Phase Introduced | Use |
|--------|------|------------------|------------------|-----|
| `marketplace_requests_total` | Counter | endpoint,status | MVP | Traffic & error rate |
| `listing_creation_latency_seconds` | Histogram | seller_tier | MVP | UX performance |
| `checkout_conversion_ratio` | Gauge (derived) | tier | MVP | Funnel health |
| `recommendation_click_through` | Counter (with impressions) | algo_version | Growth | Algorithm efficacy |
| `ugc_content_share` | Gauge | period | Community | Network effects |
| `moderation_queue_age_seconds` | Histogram | content_type | Community | Ops responsiveness |
| `refund_rate` | Gauge | tier | Growth | Trust & payment quality |

## Risk Register (Expanded)

| Risk | Phase Sensitivity | Impact | Likelihood | Mitigation | Owner |
|------|-------------------|--------|------------|------------|-------|
| Fraudulent listings | MVP | High | Medium | Manual review + seller verification | Marketplace Lead |
| Payment failures | MVP | High | Low | Stripe retries + idempotent order finalize | Backend Lead |
| Recommendation bias | Growth | Medium | Medium | Offline eval & fairness checks | Data Lead |
| Toxic community content | Community | High | Medium | Sentiment + escalation workflow | Community Mod Lead |
| Latency spikes (query fan-out) | Growth | Medium | Medium | Redis result caching + index planning | Infra |
| Data consistency (webhooks) | MVP | Medium | Low | Idempotent keys + replay queue | Backend Lead |

## Backlog & Progressive Enhancements

| Category | Candidate Items | Target Phase |
|----------|-----------------|--------------|
| Monetization | Bundled subscription + listing discounts; seller tiers | Growth |
| Personalization | Astrological transit-aware ranking | Growth |
| Social | Follow sellers, activity feeds | Community |
| Trust & Safety | ML anomaly detection (sudden refund spikes) | Growth |
| Analytics | Cohort retention & revenue segmentation | Growth |
| Internationalization | Multi-currency + localized copy | Growth |
| Events | Ticketed interactive workshops, replay library | Community |
| Developer Extensibility | Public listing/embed widget | Community |

## Rollout & Migration Plan

1. MVP Beta (internal testers) – enable feature flag `marketplace_mvp` for staff accounts only.
2. Soft Launch – open to subset of premium users (batch invite) + monitor error budgets.
3. Gradual Exposure – progressive ramp to all premium; add elite-exclusive bundles.
4. Growth Phase – enable recommendation service (shadow mode → active) and analytics dashboards.
5. Community Phase – activate forums + live events under separate WebSocket namespace; monitor moderation load.

## Decommission / Sunset Considerations

- Preserve export API (`/api/marketplace/export`) for sellers to retrieve historical sales if feature evolves.
- Maintain backward-compatible webhook contract versioning (`X-Stripe-Webhook-Version`).
- Archive inactive listings (>12 months no sales) to cold storage bucket with signed retrieval.

---

```json
{
  "phases": [
    {
      "phase": "MVP",
      "features": [
        "Basic listing creation/upload for digital goods (e.g., PDF charts, AI interpretations).",
        "Secure purchase flow via Stripe.",
        "User dashboard for sales/purchases.",
        "Search/filter by astrology categories (e.g., signs, houses)."
      ],
      "userStories": [
        "As a seller, I can upload and price my custom astrology content.",
        "As a buyer, I can browse, preview, and buy items with one-click payment.",
        "As a premium user, I get discounted access to marketplace items."
      ],
      "moderationControls": [
        "Automated content scanning for copyright/IP violations.",
        "Manual approval queue for new listings.",
        "Report/flagging system for users."
      ],
      "riskMitigations": [
        "Use Pydantic for input validation to prevent injection attacks.",
        "Rate limit API endpoints to avoid abuse.",
        "Encrypt sensitive data with Firebase rules; pseudonymize user info."
      ],
      "successMetrics": [
        "100+ listings created in first month.",
        "50% conversion rate from browse to purchase.",
        "<5% transaction failure rate.",
        "App load time <2s for marketplace pages."
      ]
    },
    {
      "phase": "Growth",
      "features": [
        "Advanced analytics dashboard for sellers (e.g., sales trends tied to astrology transits).",
        "Recommendation engine using ML (e.g., based on user birth data).",
        "Integration with Healwave for bundled frequency/astrology products.",
        "Promo codes and affiliate sharing."
      ],
      "userStories": [
        "As a seller, I can track performance and optimize listings based on buyer feedback.",
        "As a buyer, I receive personalized recommendations (e.g., \"Venus transit bundles\").",
        "As an admin, I can run promotions cross-app."
      ],
      "moderationControls": [
        "AI-assisted moderation for spam/scams (e.g., keyword filters on reviews).",
        "User verification badges for trusted sellers.",
        "Automated takedowns for low-rated content."
      ],
      "riskMitigations": [
        "Implement Redis caching for high-traffic queries to scale loads.",
        "Horizontal scaling via Docker; monitor with performance hooks.",
        "Backup/rollback for failed transactions; comply with GDPR via pseudonymization."
      ],
      "successMetrics": [
        "500+ active users/month.",
        "20% MoM growth in sales volume.",
        ">4.5 average rating for listings.",
        "Bundle analysis: 30% uplift in cross-sells with Healwave."
      ]
    },
    {
      "phase": "Community",
      "features": [
        "User forums/reviews with threaded discussions.",
        "Collaborative editing for shared content (e.g., community gene keys libraries).",
        "Live events (e.g., astrology webinars with ticket sales).",
        "Social sharing integrations (e.g., export to X/Twitter)."
      ],
      "userStories": [
        "As a community member, I can collaborate on and co-sell group-created content.",
        "As a participant, I can join live sessions and rate them post-event.",
        "As a moderator, I can oversee forums for positive engagement."
      ],
      "moderationControls": [
        "Community-elected moderators with tools for editing/banning.",
        "Sentiment analysis on reviews to flag toxicity.",
        "Age-gated access for sensitive content (e.g., human design insights)."
      ],
      "riskMitigations": [
        "Use error boundaries and logging for robust event handling.",
        "Accessibility audits (WCAG 2.1) to mitigate exclusion risks.",
        "Rate limiting on forums; secure WebSockets for live features."
      ],
      "successMetrics": [
        "1,000+ community interactions/month (posts/reviews).",
        "15% user retention from events.",
        "<1% moderation escalations.",
        "40% of sales from community-driven content."
      ]
    }
  ]
}
```
