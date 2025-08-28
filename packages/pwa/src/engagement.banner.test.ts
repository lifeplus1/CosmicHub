import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEngagementGate } from './engagement';
import { showInstallBanner } from './ui';

// Minimal DOM setup if not present
if (typeof window === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body></body></html>',
    { url: 'https://example.test/' }
  );
  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  // @ts-ignore
  global.localStorage = dom.window.localStorage;
}

vi.useFakeTimers();

beforeEach(() => {
  document.body.innerHTML = '';
  try {
    window.localStorage?.clear();
  } catch {
    /* ignore */
  }
  vi.setSystemTime(0);
});

describe('engagement + banner dismissal integration', () => {
  it('marks dismissal and enforces cooldown until elapsed', () => {
    const gate = createEngagementGate({
      minPageViews: 1,
      minTimeMs: 0,
      dismissCooldownMs: 1_000,
      storagePrefix: 'banner_int',
    });
    // Initially eligible
    expect(gate.isEligible()).toBe(true);

    // Show banner
    showInstallBanner({
      title: 'Install',
      subtitle: 'Test',
      action: 'Install',
    });
    const banner = document.getElementById('pwa-install-banner');
    expect(banner).toBeTruthy();

    // Wire dismissal -> markDismissed (mirrors app integration)
    banner
      ?.querySelector('[data-act="dismiss"]')
      ?.addEventListener('click', () => gate.markDismissed(), { once: true });

    // Advance time slightly then dismiss
    vi.setSystemTime(10);
    (
      banner?.querySelector('[data-act="dismiss"]') as HTMLButtonElement
    ).click();
    expect(gate.getState().lastDismissed).toBe(10);
    expect(gate.isEligible()).toBe(false); // cooldown active

    // Advance beyond cooldown
    vi.setSystemTime(1_200);
    expect(gate.isEligible()).toBe(true);
  });
});
