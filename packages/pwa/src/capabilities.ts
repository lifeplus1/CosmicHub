/**
 * Capability detection & subscription utilities.
 * Provides a lightweight singleton that tracks:
 * - platform (ios / android / desktop / other)
 * - standalone status (reactive via matchMedia)
 * - touch support
 * - install / push support
 * - vibration & web share support
 *
 * Returned objects are shallow-frozen to prevent accidental mutation.
 */
export type Platform = 'ios' | 'android' | 'desktop' | 'other';
export interface RuntimeCapabilities {
  platform: Platform;
  isStandalone: boolean;
  hasTouch: boolean;
  supportsInstall: boolean;
  supportsPush: boolean;
  hasVibration: boolean;
  hasWebShare: boolean;
}

const HAS_WINDOW = typeof window !== 'undefined';

function safeUA(): string {
  if (!HAS_WINDOW) return '';
  try { return navigator.userAgent.toLowerCase(); } catch { return ''; }
}

function detectPlatform(ua: string): Platform {
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/win|mac|linux/.test(ua)) return 'desktop';
  return 'other';
}

function compute(): RuntimeCapabilities {
  if (!HAS_WINDOW) {
    return Object.freeze({
      platform: 'other',
  isStandalone: false,
  hasTouch: false,
  supportsInstall: false,
  supportsPush: false,
  hasVibration: false,
  hasWebShare: false,
    }) as RuntimeCapabilities;
  }
  const ua = safeUA();
  const platform = detectPlatform(ua);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true);
  const caps: RuntimeCapabilities = {
    platform,
  isStandalone,
  hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  supportsInstall: 'serviceWorker' in navigator,
  supportsPush: 'serviceWorker' in navigator && 'PushManager' in window,
  hasVibration: 'vibrate' in navigator,
  hasWebShare: 'share' in navigator,
  };
  return Object.freeze({ ...caps });
}

class CapabilityDetector {
  private static instance: CapabilityDetector | null = null;
  private caps: RuntimeCapabilities = compute();
  private listeners: Array<(c: RuntimeCapabilities) => void> = [];
  private disposers: Array<() => void> = [];

  private constructor() {
    if (HAS_WINDOW) {
      const mm = window.matchMedia('(display-mode: standalone)');
      const handle = () => {
        // Recompute only fields that may change (standalone). Full recompute for consistency.
        this.caps = compute();
        this.emit();
      };
      mm.addEventListener('change', handle);
      this.disposers.push(() => mm.removeEventListener('change', handle));
    }
  }

  static getInstance(): CapabilityDetector {
    this.instance ??= new CapabilityDetector();
    return this.instance;
  }

  private emit(): void {
  const snapshot = this.value();
  // Call in a microtask to avoid re-entrancy issues if listeners mutate subscriptions
  queueMicrotask(() => this.listeners.forEach(l => {
      try { l(snapshot); } catch { /* swallow listener errors */ }
    }));
  }

  value(): RuntimeCapabilities {
    return this.caps; // already frozen
  }

  onChange(fn: (c: RuntimeCapabilities) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(f => f !== fn);
    };
  }

  refresh(): RuntimeCapabilities {
    this.caps = compute();
    this.emit();
    return this.caps;
  }

  dispose(): void {
    this.disposers.forEach(d => {
      try { d(); } catch { /* ignore */ }
    });
    this.disposers = [];
    this.listeners = [];
  }
  /** TEST-ONLY: reset singleton */
  static __resetForTests(): void {
    this.instance?.dispose();
    this.instance = null;
  }
}

// Backwards compatible export
export { CapabilityDetector };

/**
 * Returns a snapshot of current runtime capabilities (frozen object).
 */
export function detectRuntimeCapabilities(): RuntimeCapabilities { // legacy name
  return CapabilityDetector.getInstance().value();
}

/** Shorthand alias. */
export function getCapabilities(): RuntimeCapabilities {
  return detectRuntimeCapabilities();
}

/** Subscribe to capability changes; returns unsubscribe function. */
export function onCapabilitiesChange(listener: (c: RuntimeCapabilities) => void): () => void {
  return CapabilityDetector.getInstance().onChange(listener);
}

/** Force recomputation (e.g., after dynamic UA override in tests). */
export function refreshCapabilities(): RuntimeCapabilities {
  return CapabilityDetector.getInstance().refresh();
}

/** TEST ONLY: resets internal singleton so a clean detector can be created. */
export function __resetCapabilitiesForTests(): void {
  CapabilityDetector.__resetForTests();
}
