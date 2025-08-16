# Capacity Planning for CosmicHub Astrology App

---
Status: Draft
Owner: Platform Engineering
Last-Updated: 2025-08-16
Next-Review: 2025-09-01
Source: Grok Generated
---

## Overview

Capacity planning for the CosmicHub astrology app ensures that the system can handle current and projected workloads while maintaining high performance, availability, and cost efficiency. The app processes large datasets for astrology charts, personality assessments, numerology, human design, gene keys, and AI-driven insights, with integrations like frequency generation and Stripe subscriptions. Built on a scalable stack (React frontend, FastAPI backend, Firestore database, Redis caching, and Docker/Render deployment), the plan focuses on proactive scaling to support user growth from freemium to premium tiers. We target a 30% headroom to absorb unexpected spikes, aligning with enterprise-grade optimizations like lazy loading, memoization, and efficient Firestore queries.

### Demand Drivers

Demand is driven by several key factors that influence resource consumption across compute, storage, and network:

1. **User Growth and Activity**:
   - Organic growth from onboarding, cross-app promotions (e.g., Healwave integration), and marketing. Freemium users generate basic chart requests, while premium subscribers drive higher loads via AI chatbots, synastry analyses, and transit forecasts.
   - Peak usage during astrological events (e.g., full moons, retrogrades) or viral social shares, potentially increasing concurrent sessions by 2-3x.

2. **Feature-Specific Workloads**:
   - Compute-intensive tasks: AI interpretations (using models like Grok), ephemeris calculations (via PySwissEph), and multi-system charts (Western, Vedic, etc.), which can spike CPU/GPU usage.
   - Data-heavy operations: Storing/analyzing large user datasets in Firestore (e.g., birth data, saved charts), with batched reads and Redis caching to mitigate I/O bottlenecks.
   - Real-time demands: WebSocket-based AI chats, push notifications, and frequency generators (Web Audio API), driving network traffic and memory usage.

3. **External Factors**:
   - Seasonal trends: Higher engagement during New Year resolutions or zodiac seasons.
   - Integration loads: Stripe webhooks for subscriptions, XAI API calls, and Healwave binaural beats, which add API latency and external dependencies.
   - Global accessibility: Traffic from diverse time zones, requiring 24/7 uptime.

Current baseline: Assuming 10,000 monthly active users (MAU) in 2025, with 20% premium, average session duration of 5-10 minutes, and 50% of sessions involving AI/compute-heavy features.

#### Forecasting Method

We employ a hybrid forecasting approach combining historical data analysis, trend extrapolation, and scenario modeling to predict capacity needs over 3-12 months:

1. **Historical Data Analysis**:
   - Use Firestore analytics, Vercel/Render metrics, and custom logging (e.g., via usePerformance hook) to track KPIs like requests per minute (RPM), CPU/memory utilization, query response times, and error rates.
   - Tools: Integrate with Google Cloud Monitoring for Firestore and Render dashboards for container metrics. Analyze logs from app.log for patterns in demand drivers.

2. **Trend Extrapolation**:
   - Linear regression on user growth (e.g., 20-30% QoQ based on marketing projections) and feature adoption (e.g., AI usage doubling post-enhancements).
   - Seasonal adjustments using time-series models (e.g., ARIMA via Python's statsmodels in backend scripts) to account for peaks.

3. **Scenario Modeling**:
   - Best-case: Steady growth with efficient caching (e.g., 70% cache hit rate via Redis).
   - Worst-case: Viral spikes (e.g., 5x traffic from a social media trend) or outages in dependencies (e.g., XAI API downtime).
   - Simulation: Run load tests with Vitest/pytest and tools like Artillery to model 1.5x-3x current load, incorporating TurboRepo caching for faster CI/CD iterations.

Forecast cadence: Monthly reviews, with automated alerts for deviations >10% from projections.

#### Headroom Target (30%)

To ensure resilience, we maintain a 30% headroom across key resources:

- **Compute/Containers**: Scale Docker pods on Render to keep average CPU <70% (e.g., auto-scale from 2-4 instances).
- **Database**: Firestore read/write capacity provisioned at 130% of forecasted queries, with indexing and batched operations to avoid throttling.
- **Memory/Network**: Target <70% utilization, using code splitting/lazy loading in React to reduce bundle sizes and frontend render cycles.
- Rationale: This buffer absorbs bursts (e.g., 30% spike during events) without degraded performance (e.g., >200ms response times), while optimizing costs—e.g., avoiding over-provisioning via horizontal scaling.

#### Scaling Triggers

Automated scaling is triggered by monitoring thresholds, with manual overrides for edge cases. We use Render's auto-scaling rules, Firebase alerts, and custom hooks (e.g., useUsageTracking) for real-time decisions:

1. **Performance Metrics**:
   - CPU/Memory: Scale up if >70% sustained for 5 minutes; scale down if <40% for 15 minutes.
   - Response Time: Trigger if API latency >300ms or frontend render >100ms (monitored via EphemerisPerformanceDashboard).

2. **Usage Thresholds**:
   - RPM: Auto-scale at 80% of current capacity (e.g., 1,000 RPM baseline → trigger at 800).
   - Error Rates: >5% 5xx errors or Firestore quota exceeds (e.g., due to unoptimized queries).

3. **Business Triggers**:
   - User Milestones: Pre-scale for projected MAU increases (e.g., post-marketing campaigns).
   - Feature Releases: Monitor post-deployment (e.g., new AI prompts) and adjust based on adoption.

Implementation: Integrate with Docker Compose for dev testing, ensuring modularity (e.g., separate Healwave from Astro via TurboRepo). Regular cleanups (e.g., via cleanup-project.sh) maintain efficiency.

This plan supports the app's goals of scalability and performance, with ongoing refinements based on real-world data.
