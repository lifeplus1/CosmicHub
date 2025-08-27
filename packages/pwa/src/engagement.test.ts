import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEngagementGate } from './engagement';

// Ensure a DOM + localStorage (Vitest may not auto-provide if environment config differs)
if (typeof window === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://example.test/' });
  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  // @ts-ignore
  global.localStorage = dom.window.localStorage;
}

vi.useFakeTimers();

beforeEach(() => {
  window.localStorage.clear();
  vi.setSystemTime(0);
});

describe('engagement gate', () => {
  it('not eligible until min views and time met', () => {
    const gate = createEngagementGate({ minPageViews: 3, minTimeMs: 5000, storagePrefix: 'test1' });
  expect(gate.getState().pageViews).toBe(1);
  expect(gate.isEligible()).toBe(false); // 1st view auto
    gate.recordPageView(); // 2
  expect(gate.getState().pageViews).toBe(2);
    gate.recordPageView(); // 3
  expect(gate.getState().pageViews).toBe(3);
    expect(gate.isEligible()).toBe(false); // time not met
    vi.setSystemTime(6000);
    expect(gate.isEligible()).toBe(true);
  });

  it('dismiss cooldown blocks eligibility', () => {
    const gate = createEngagementGate({ minPageViews: 1, minTimeMs: 0, dismissCooldownMs: 10_000, storagePrefix: 'test2' });
    // auto view is present; minTimeMs=0 so eligible immediately
    vi.setSystemTime(1);
  expect(gate.getState().pageViews).toBe(1);
    expect(gate.isEligible()).toBe(true);
    gate.markDismissed();
  expect(gate.getState().lastDismissed).toBe(1);
    expect(gate.isEligible()).toBe(false);
    vi.setSystemTime(10_001);
    expect(gate.isEligible()).toBe(true);
  });

  it('state persists via localStorage', () => {
    const prefix = 'persist';
    const a = createEngagementGate({ minPageViews: 2, minTimeMs: 0, storagePrefix: prefix });
    a.recordPageView(); // now pageViews >= 2
  expect(a.getState().pageViews).toBe(2);
    vi.setSystemTime(1); // satisfy minTimeMs (0) trivially
    const b = createEngagementGate({ minPageViews: 2, minTimeMs: 0, storagePrefix: prefix, autoIncrementOnCreate: false });
    expect(b.getState().pageViews).toBeGreaterThanOrEqual(2);
    expect(b.isEligible()).toBe(true);
  });
});
