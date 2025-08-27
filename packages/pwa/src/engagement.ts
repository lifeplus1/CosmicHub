/**
 * Lightweight engagement gating helper for install / upgrade prompts.
 * Apps previously implemented ad-hoc heuristics (page views + dwell time + dismiss cooldown).
 * This helper centralizes that logic with safe localStorage access and configurable thresholds.
 */

export interface EngagementGateOptions {
  /** Minimum distinct page views required before eligible (default 2). */
  minPageViews?: number;
  /** Minimum elapsed ms since first gate creation in this session before eligible (default 10_000). */
  minTimeMs?: number;
  /** Cooldown after a dismissal before eligible again (ms, default 24h). */
  dismissCooldownMs?: number;
  /** Storage key prefix to differentiate apps (default 'pwa_engagement'). */
  storagePrefix?: string;
  /** Whether to auto increment a page view on creation (default true). */
  autoIncrementOnCreate?: boolean;
}

export interface EngagementGateState {
  pageViews: number;
  firstSeen: number; // ms epoch when first page view recorded
  lastDismissed: number; // ms epoch of last dismissal (0 if never)
}

export interface EngagementGate {
  isEligible(): boolean;
  recordPageView(): EngagementGateState;
  markDismissed(): EngagementGateState;
  getState(): EngagementGateState;
}

const now = () => Date.now();

function safeParseInt(v: string | null): number { const n = parseInt(v ?? '0', 10); return Number.isFinite(n) ? n : 0; }

function getStorage(): Storage | null {
  try { if (typeof window !== 'undefined' && window.localStorage) return window.localStorage; } catch { /* ignore */ }
  return null;
}

export function createEngagementGate(opts: EngagementGateOptions = {}): EngagementGate {
  const {
    minPageViews = 2,
    minTimeMs = 10_000,
    dismissCooldownMs = 24 * 60 * 60 * 1000,
    storagePrefix = 'pwa_engagement',
    autoIncrementOnCreate = true,
  } = opts;

  const store = getStorage();
  const pvKey = `${storagePrefix}_page_views`;
  const firstSeenKey = `${storagePrefix}_first_seen`;
  const dismissedKey = `${storagePrefix}_dismissed_at`;

  function readState(): EngagementGateState {
    if (!store) return { pageViews: 0, firstSeen: 0, lastDismissed: 0 };
    return {
      pageViews: safeParseInt(store.getItem(pvKey)),
      firstSeen: safeParseInt(store.getItem(firstSeenKey)),
      lastDismissed: safeParseInt(store.getItem(dismissedKey)),
    };
  }

  function writeState(mutator: (s: EngagementGateState) => void): EngagementGateState {
    const state = readState();
    mutator(state);
    if (store) {
      try {
        store.setItem(pvKey, String(state.pageViews));
        store.setItem(firstSeenKey, String(state.firstSeen));
        store.setItem(dismissedKey, String(state.lastDismissed));
      } catch { /* ignore quota / privacy errors */ }
    }
    return state;
  }

  function ensureFirstSeen(): void {
    writeState(s => { if (s.firstSeen <= 0) s.firstSeen = now(); });
  }

  if (autoIncrementOnCreate) {
    ensureFirstSeen();
    writeState(s => { s.pageViews += 1; if (!s.firstSeen) s.firstSeen = now(); });
  }

  function isEligible(): boolean {
    const s = readState();
    if (s.pageViews < minPageViews) return false;
    if (now() - s.firstSeen < minTimeMs) return false;
    if (s.lastDismissed && now() - s.lastDismissed < dismissCooldownMs) return false;
    return true;
  }

  function recordPageView(): EngagementGateState {
    ensureFirstSeen();
    return writeState(s => { s.pageViews += 1; });
  }

  function markDismissed(): EngagementGateState {
    return writeState(s => { s.lastDismissed = now(); });
  }

  return { isEligible, recordPageView, markDismissed, getState: readState };
}

// Convenience one-shot function for quick checks without holding an instance.
export function isEngagementEligible(opts?: EngagementGateOptions): boolean {
  return createEngagementGate({ ...opts, autoIncrementOnCreate: false }).isEligible();
}
