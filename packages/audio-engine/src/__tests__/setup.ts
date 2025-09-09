/**
 * Test setup for audio engine
 */

import { vi } from 'vitest';

// Mock Web Audio API globals
Object.defineProperty(global, 'AudioContext', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(global, 'webkitAudioContext', {
  writable: true,
  value: vi.fn(),
});

// Mock Performance API
Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock console methods to reduce test noise
global.console = {
  ...console,
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
