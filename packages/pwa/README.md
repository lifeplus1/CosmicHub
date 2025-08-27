# @cosmichub/pwa

Shared PWA core utilities and mobile enhancement features for CosmicHub apps.

## Features

- Service worker registration with exponential backoff
- Visibility-aware update scheduling
- Update + controllerchange hooks
- Lightweight capability detection singleton (platform / standalone / touch / push / vibration / web share)
- Mobile viewport optimization & touch feedback (`initMobileUX`)
- Accessible, sanitized update & install banners
- Engagement-based install prompt patterns (apps can layer their own gating logic)
- Configurable engagement gating helper (`createEngagementGate`)
- (Deprecated) legacy monolithic mobile enhancements module (see Deprecations)

## Quick Start

```ts
import { initPWA } from '@cosmichub/pwa';

// Basic
initPWA();

// With hooks
initPWA({
  onUpdateFound: () => { /* show banner */ },
  onControllerChange: () => { /* optional reload */ },
  checkIntervalMs: 60_000,
});
```json

## API

### initPWA(options)

Returns `{ dispose() }` to tear down listeners (use in tests or HMR).

Options:

- `swPath` (string) default `/sw.js`
- `scope` (string) default `/`
- `type` ('classic'|'module') default 'module'
- `checkIntervalMs` number default 60000
- `maxRetries` number default 5
- `onUpdateFound` callback when a new SW version is installing
- `onControllerChange` callback when controller changes (post-activation)

### registerServiceWorkerWithBackoff(options)

Low-level function used by `initPWA`.

### Capability Detection

The capability layer is a singleton that returns a frozen snapshot of runtime features and lets you subscribe to changes (currently only `display-mode: standalone` can change at runtime, but full recompute keeps the API simple).

Exports:

```ts
import {
  getCapabilities,              // current frozen snapshot
  detectRuntimeCapabilities,    // legacy alias of getCapabilities
  onCapabilitiesChange,         // subscribe to updates; returns unsubscribe fn
  refreshCapabilities,          // force recomputation (tests / UA overrides)
} from '@cosmichub/pwa';

const caps = getCapabilities();
if (caps.platform === 'ios' && !caps.isStandalone) {
  // show iOS specific A2HS education UI
}

const dispose = onCapabilitiesChange(next => {
  if (next.isStandalone) {
    document.documentElement.classList.add('is-standalone');
  }
});
```

Snapshots are shallow-frozen; do not mutate. Call `refreshCapabilities()` only in controlled contexts (tests, after injecting new mocks).

### Mobile UX

```ts
import { initMobileUX } from '@cosmichub/pwa';
const mobile = initMobileUX();
// Applies CSS classes: has-touch, is-standalone, platform-[ios|android|desktop|other]
// Sets --vh for accurate viewport sizing and optional vibration feedback for button taps.
// Call mobile.dispose() during teardown/tests.
```

### UI Banners

```ts
import { showUpdateBanner, showInstallBanner } from '@cosmichub/pwa';

showUpdateBanner('New version available');
showInstallBanner({ title: 'Install App', subtitle: 'Offline access.', action: 'Install', icon: '⭐' });
```

Both banners sanitize user-provided copy. The install banner dispatches a `window` event `install-app` when its primary button is clicked; your app listens for that to either show iOS instructions or call the captured `beforeinstallprompt` event.

### Engagement Gating (App Responsibility)

Use `createEngagementGate()` for a small, configurable heuristic (page views, dwell time, dismiss cooldown) before presenting an install banner.

```ts
import { createEngagementGate } from '@cosmichub/pwa';
const gate = createEngagementGate({
  minPageViews: 2,
  minTimeMs: 10_000,
  dismissCooldownMs: 24 * 60 * 60 * 1000,
  storagePrefix: 'myapp',
});

if (gate.isEligible()) {
  showInstallBanner({ title: 'Install', subtitle: 'Offline access', action: 'Install' });
}
```

Call `gate.markDismissed()` when a user explicitly dismisses your banner to enforce cooldown.

Example hooking into the shared banner dismiss button:

```ts
showInstallBanner(copy);
const banner = document.getElementById('pwa-install-banner');
banner?.querySelector('[data-act="dismiss"]')?.addEventListener('click', () => gate.markDismissed(), { once: true });
```

## Global Opt-Out

Set `globalThis.HEALWAVE_PWA_MANUAL_INIT = true` (or similar app flag) before importing your app’s PWA module to skip auto-init and manually call `initPWA()`.

## Testing

Use JSDOM; polyfill `matchMedia` and call `dispose()` after tests.

## Migration Notes

- Astro and HealWave now delegate SW logic to this package.
- Remove duplicated backoff / visibility loops from app-level code when adding new apps.

## Deprecations

The file `mobile-enhancements.ts` is deprecated and will be removed after all apps migrate to the slimmer primitives:

- Use `initMobileUX()` instead of custom viewport + gesture helpers.
- Use capability APIs instead of bespoke UA detection.
- Use `showInstallBanner` / `showUpdateBanner` instead of legacy banner builders.

Importing the deprecated module logs a development-only warning. Avoid introducing new dependencies on it.

## Future Enhancements

- Optional push notification permission brokering
- Unified install prompt builder
- Metrics/analytics hook injection
- Configurable engagement gating helper
- Extended capability set (e.g. navigation API, file handling) with lazy probing

## Telemetry Events

Apps using the engagement gate emit a custom browser event when the install UI is first shown in a session:

`pwa:engagement-install-shown` — detail payload:

{
  app: string;        // 'astro' | 'healwave' | etc.
  pageViews: number;  // page views counted by the gate
  firstSeen: number;  // epoch ms when first engagement was recorded
  ts: number;         // emission timestamp
}

```text
{
  app: string;        // 'astro' | 'healwave' | etc.
  pageViews: number;  // page views counted by the gate
  firstSeen: number;  // epoch ms when first engagement was recorded
  ts: number;         // emission timestamp
}
```

Listen for it to pipe into analytics:

```ts
window.addEventListener('pwa:engagement-install-shown', (e: Event) => {
  const detail = (e as CustomEvent).detail;
  // analytics.track('pwa_install_prompt_shown', detail);
});
```
