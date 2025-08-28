import { describe, it, expect, beforeEach } from 'vitest';
import { __test__, initPWA } from './pwa';

// Ensure JSDOM environment (some runners may default to node)
if (typeof document === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body></body></html>'
  );
  // @ts-ignore
  global.window = dom.window;
  // @ts-ignore
  global.document = dom.window.document;
  // @ts-ignore
  Object.defineProperty(global, 'navigator', {
    value: dom.window.navigator,
    configurable: true,
  });
}

// Basic JSDOM environment assumptions

describe('HealWave PWA module', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // remove injected styles between tests
    const style = document.getElementById('healwave-pwa-styles');
    style?.remove();
    // matchMedia polyfill for JSDOM
    if (!(window as any).matchMedia) {
      (window as any).matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      });
    }
  });

  it('shows update banner via helper', () => {
    __test__.triggerUpdate();
    expect(document.getElementById('pwa-update-banner')).toBeTruthy();
  });

  it('shows install banner via helper', () => {
    __test__.triggerInstall();
    expect(document.getElementById('pwa-install-banner')).toBeTruthy();
  });

  it('initializes and disposes PWA', () => {
    const api = initPWA();
    expect(typeof api.dispose).toBe('function');
    api.dispose();
  });
});
