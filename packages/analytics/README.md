# @cosmichub/analytics

Lightweight multi‑provider, privacy‑first analytics layer for CosmicHub apps. Consent‑aware,
test‑friendly, tree‑shakeable. No provider SDK is loaded unless enabled in config.

## Feature Summary

| Category        | Highlights                                                                   |
| --------------- | ---------------------------------------------------------------------------- |
| Core Tracking   | Unified API (GA4, Mixpanel, PostHog, optional custom backend)                |
| Privacy         | PII stripping (email/ip + custom keys), email domain derivation, DNT respect |
| Sessions        | Auto session renewal (idle timeout), manual reset, queue until consent       |
| Reliability     | Safe DOM guards (SSR), script de‑duplication, opt-in auto error tracking     |
| Instrumentation | `withTiming` perf events, `trackError`, `advanced.onDispatch` hook           |
| React           | Provider + hook (`@cosmichub/analytics/react`)                               |
| Dev/Test        | Deterministic onDispatch capture, disable/enable/flush controls              |
| Extensibility   | Pluggable provider loaders, sanitized event pipeline                         |

### Provider Capability Matrix

| Provider       | Track   | Page View            | Identify | Notes                       |
| -------------- | ------- | -------------------- | -------- | --------------------------- |
| Google GA4     | gtag    | gtag config call     | user_id  | IP anonymize toggle         |
| Mixpanel       | track   | track('Page View')   | identify | People.set traits           |
| PostHog        | capture | capture('$pageview') | identify | Session recording flag      |
| Segment        | track   | page()               | identify | CDN key path autoload       |
| RudderStack    | track   | page()               | identify | load(writeKey, url) variant |
| Custom Backend | POST    | n/a                  | n/a      | Minimal ingestion endpoint  |

## Installation

```bash
pnpm add @cosmichub/analytics
# or
npm i @cosmichub/analytics
# or
yarn add @cosmichub/analytics
```

## Quick Start

```ts
import { initializeAnalytics } from '@cosmichub/analytics';

const analytics = initializeAnalytics({
  privacy: {
    respectDoNotTrack: true,
    anonymizeIP: true,
    cookieConsent: false,
    dataRetentionDays: 180,
  },
  googleAnalytics: { enabled: true, measurementId: 'G-XXXX' },
  mixpanel: { enabled: false, token: '', trackPageViews: false },
  posthog: { enabled: false, apiKey: '', sessionRecording: false, heatmaps: false },
  customAnalytics: { enabled: true, endpoint: '/api/analytics' },
  advanced: {
    sessionTimeoutMs: 30 * 60 * 1000,
    autoTrackErrors: true,
    onDispatch: e => console.log('DISPATCH', e),
  },
});

analytics.track({ event: 'chart_calculated', properties: { chart_type: 'natal', success: true } });
```

## React Usage

```tsx
import { AnalyticsProvider, useAnalytics } from '@cosmichub/analytics/react';

<AnalyticsProvider config={config}>
  {' '}
  <App />{' '}
</AnalyticsProvider>;

function SaveButton() {
  const { track } = useAnalytics();
  return (
    <button onClick={() => track({ event: 'save_click', properties: { location: 'toolbar' } })}>
      Save
    </button>
  );
}
```

## Advanced Config Reference

```ts
advanced: {
  sessionTimeoutMs?: number;          // default 30m
  autoFlushIntervalMs?: number;       // background flush
  piiKeys?: string[];                 // additional property keys to strip
  enrichPageContext?: boolean;        // add path/title/referrer if missing
  autoTrackErrors?: boolean;          // global window error listener
  onDispatch?: (e: AnalyticsEvent) => void; // post-dispatch hook
}
```

## Testing Basics

Use `advanced.onDispatch` to capture fully‑sanitized events (after privacy filtering):

```ts
const events: AnalyticsEvent[] = [];
const svc = initializeAnalytics({ ...config, advanced: { onDispatch: e => events.push(e) } });
svc.track({ event: 'test', properties: { email: 'user@example.com' } });
expect(events[0].properties.email).toBeUndefined();
expect(events[0].properties.email_domain).toBe('example.com');
```

### Queue & flush behavior

```ts
svc.disable();
svc.page('Home', { path: '/', title: 'Home' }); // queued
expect((svc as any).pendingPageViews.length).toBe(1);
svc.setConsentGranted(true); // auto flush
```

### Mock provider usage (example Mixpanel)

```ts
// before constructing service
// @ts-expect-error test shim
window.mixpanel = { init: vi.fn(), track: vi.fn(), identify: vi.fn(), people: { set: vi.fn() } };
```

## Adding Another Provider

1. Extend `AnalyticsConfig` with new provider settings.
2. Implement dynamic loader (see Segment/PostHog patterns).
3. Hook into `dispatchEvent`, `identify`, `page` appropriately.
4. Update README matrix.

## Backend Tie‑In

`backend/main.py` adds FastAPI middleware measuring response times and pushing them into rolling
window used by real‑time metrics endpoint.

## Event Naming Guidelines

Conventions:

1. snake_case events (e.g., `chart_calculated`, `ai_interaction_requested`).
2. Prefix domain to lifecycle: `chart_saved`, `user_signed_in`.
3. Duration properties end with `_ms`.
4. Error fields: `error_type`, `message`, `stack_present` (boolean).

## Migration Notes

If migrating from a prototype version: rename any deprecated `onEventDispatch` to
`advanced.onDispatch`.

## Roadmap (Next)

- Batch transport + retry (offline persistence)
- Source‑map aware error stack scrubbing
- Config hot reload & provider re-init
- IndexedDB outbox for offline capture
- Optional client sampling (volume control)

## License

MIT
