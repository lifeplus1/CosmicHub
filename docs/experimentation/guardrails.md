# Purpose of Guardrail Metrics

---
Status: Draft
Owner: Experimentation Lead
Last-Updated: 2025-08-16
Next-Review: 2025-09-10
Source: Grok Generated
---

Guardrail metrics serve as protective measures in experimentation frameworks, such as A/B testing or feature rollouts, particularly in data-driven applications like an astrology app handling user insights, subscriptions, or AI interpretations. Their primary purpose is to monitor critical aspects of system health and user experience that should not be negatively impacted by changes. Unlike primary metrics (which measure the success of an experiment, e.g., increased user engagement), guardrails act as "safety nets" to detect unintended harm early, allowing teams to pause or abort experiments if thresholds are breached. For instance, in an app analyzing large datasets for astrology trends or AI chatbots, guardrails might track user retention, error rates in chart calculations, or subscription churn to ensure that new features (e.g., enhanced numerology integrations or performance optimizations like lazy loading) do not degrade core functionality, scalability, or marketability. This aligns with robustness and performance standards by preventing regressions in key areas like accessibility (WCAG compliance) or security (e.g., rate limiting in Firestore queries).

## Selection Criteria for Guardrail Metrics

When selecting guardrail metrics, prioritize those that uphold the app's type safety, scalability, modularity, security, marketability, robustness, and performance. Key criteria include:

- **Relevance to Business and User Health**: Metrics should tie directly to core objectives, such as maintaining high user satisfaction (e.g., AI interpretation accuracy) or operational stability (e.g., API response times under high loads with Redis caching). Avoid metrics unrelated to potential risks from the experiment.
  
- **Sensitivity and Detectability**: Choose metrics capable of detecting small but meaningful changes (e.g., a 5% drop in session duration due to inefficient data fetches). They should have low natural variance for reliable signaling, making them suitable for statistical tests.

- **Reliability and Measurability**: Metrics must be accurately tracked with existing tools (e.g., Firestore indexing for query efficiency or Vitest for testing coverage). They should be observable in real-time or near-real-time, with minimal bias from external factors like seasonal astrology trends.

- **Independence from Primary Metrics**: Guardrails should not be highly correlated with the experiment's success metrics to avoid false positives/negatives. For example, if the primary metric is premium subscription upsells via Stripe, a guardrail might be overall app crash rates rather than direct revenue.

- **Actionability and Thresholds**: Select metrics where thresholds can be predefined (e.g., no more than 2% degradation) and tied to automated alerts or rollbacks. Consider performance optimizations, like ensuring metrics don't increase bundle sizes or render cycles in React components.

- **Coverage Across Dimensions**: Include a mix: business (e.g., churn rate), technical (e.g., latency in ephemeris calculations), and user-centric (e.g., accessibility errors via Radix UI).

In a monorepo like this (using TurboRepo for shared packages), guardrails can be modularly implemented across apps (e.g., `astro` and `healwave`) to share utilities while optimizing for horizontal scaling.

### Sample Calculation for Minimum Sample Size

To determine the minimum sample size (n) for a guardrail metric in an A/B test, we use statistical power analysis. This ensures the experiment has enough data to detect a Minimum Detectable Effect (MDE) with given significance level (alpha) and power (1 - beta, where beta is the Type II error rate). The MDE is the smallest change we care about detecting (e.g., a drop in a key metric like user retention rate).

For simplicity, assume a binary/proportion metric (common for guardrails like conversion or error rates). The formula for the minimum sample size per group (control and treatment) in a two-sided z-test for proportions is:

\[
n = \frac{(Z_{1 - \alpha/2} + Z_{1 - \beta})^2 \cdot (p(1 - p) + (p + \delta)(1 - (p + \delta))) }{\delta^2}
\]

Where:

- \( p \): Baseline proportion (e.g., current error rate).
- \( \delta \): MDE (absolute difference we want to detect).
- \( Z_{1 - \alpha/2} \): Z-score for alpha (e.g., 1.96 for alpha=0.05).
- \( Z_{1 - \beta} \): Z-score for power (e.g., 0.8416 for power=0.8).
- This approximates the pooled variance; for large n, it's reliable.

A conservative simplification (assuming equal variance and p ≈ 0.5 for max variance) is:

\[
n = \frac{2 \cdot (Z_{1 - \alpha/2} + Z_{1 - \beta})^2 \cdot p(1 - p) }{\delta^2}
\]

But we'll use the full formula for accuracy.

#### Step-by-Step Reasoning for Sample Calculation

1. **Define Parameters**:
   - Baseline \( p = 0.10 \) (e.g., 10% error rate in AI chart interpretations).
   - MDE \( \delta = 0.02 \) (absolute, e.g., detect a 2% increase to 12%).
   - Alpha \( \alpha = 0.05 \) (5% chance of false positive; two-sided, so \( Z_{1 - \alpha/2} = 1.96 \)).
   - Power = 0.80 (80% chance of detecting true effect; \( \beta = 0.20 \), \( Z_{1 - \beta} = 0.8416 \)).

2. **Compute Z-Scores**:
   - Look up or calculate: \( Z_{0.975} = 1.96 \), \( Z_{0.80} = 0.8416 \).

3. **Plug into Formula**:
   - Numerator: \( (1.96 + 0.8416)^2 \cdot (0.10 \cdot 0.90 + 0.12 \cdot 0.88) = (2.8016)^2 \cdot (0.09 + 0.1056) = 7.849 \cdot 0.1956 \approx 1.535 \)
   - Denominator: \( (0.02)^2 = 0.0004 \)
   - \( n \approx 1.535 / 0.0004 = 3837.5 \) (round up to 3838 per group).

4. **Total Sample Size**: For two groups, total N = 2 × 3838 = 7676 users.

This calculation ensures statistical validity while optimizing performance (e.g., batched Firestore reads to handle large datasets efficiently). For continuous metrics (e.g., latency), use a t-test variant with standard deviations. In practice, tools like Python's `statsmodels` or online calculators can refine this, considering app-specific factors like user traffic variability. If variance is unknown, pilot tests help estimate p and δ.
