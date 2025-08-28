import { describe, it, expect, beforeEach } from 'vitest';
import { initPWA, registerServiceWorkerWithBackoff } from './core';
import { showUpdateBanner, showInstallBanner } from './ui';

// Basic DOM setup for tests
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

describe('Shared PWA integration', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // remove banners if present
    document.getElementById('pwa-update-banner')?.remove();
    document.getElementById('pwa-install-banner')?.remove();
  });

  it('registerServiceWorkerWithBackoff returns null without SW support', async () => {
    // @ts-ignore
    delete navigator.serviceWorker;
    const reg = await registerServiceWorkerWithBackoff();
    expect(reg).toBeNull();
  });

  it('shows update banner', () => {
    showUpdateBanner('Test update available');
    expect(document.getElementById('pwa-update-banner')).toBeTruthy();
  });

  it('shows install banner', () => {
    showInstallBanner({
      title: 'Install',
      subtitle: 'Test subtitle',
      action: 'Do it',
      icon: '⭐',
    });
    expect(document.getElementById('pwa-install-banner')).toBeTruthy();
  });

  it('initPWA handles missing document gracefully (SSR)', () => {
    const originalDoc: any = global.document;
    // @ts-ignore
    delete global.document;
    const api = initPWA();
    expect(typeof api.dispose).toBe('function');
    api.dispose();
    global.document = originalDoc; // restore
  });
});
