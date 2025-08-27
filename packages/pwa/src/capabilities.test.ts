import { describe, it, expect, beforeEach } from 'vitest';
import { getCapabilities, onCapabilitiesChange, refreshCapabilities, __resetCapabilitiesForTests } from './capabilities';

// Ensure a DOM exists (Vitest jsdom usually provides this; fallback for safety)
if (typeof window === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
}

// Keep tests simple: rely on ambient (jsdom) environment; avoid complex matchMedia mutation.

beforeEach(() => { __resetCapabilitiesForTests(); });

describe('capabilities singleton', () => {
  it('returns a frozen snapshot', () => {
    const caps = getCapabilities();
    expect(Object.isFrozen(caps)).toBe(true);
    expect('platform' in caps).toBe(true);
  });

  it('emits change asynchronously (microtask) on refresh', async () => {
    let syncCalled = false;
    onCapabilitiesChange(() => { syncCalled = true; });
    refreshCapabilities();
    expect(syncCalled).toBe(false); // should not be synchronous
    await Promise.resolve();
    expect(syncCalled).toBe(true);
  });

  it('reset produces a fresh snapshot object reference', () => {
    const first = getCapabilities();
    const second = getCapabilities();
    expect(second).toBe(first); // same reference before reset
    __resetCapabilitiesForTests();
    const third = getCapabilities();
    expect(third).not.toBe(first); // new reference
    expect(third).toStrictEqual(first); // but same shape/values (environment unchanged)
  });
});
