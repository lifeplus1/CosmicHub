import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock devConsole before importing the module
vi.mock('../config/devConsole', () => ({
  devConsole: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PWA Performance Module', () => {
  let originalReadyState: string;
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Store original document state
    originalReadyState = document.readyState;
    
    // Spy on event listeners
    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original state
    Object.defineProperty(document, 'readyState', {
      value: originalReadyState,
      writable: true,
    });
    
    // Restore spies
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should load without errors', async () => {
    await expect(import('../pwa-performance')).resolves.toBeDefined();
  });

  it('should add DOMContentLoaded listener when document is loading', async () => {
    // Mock document.readyState as loading
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
    });

    // Clear the module cache and reload
    vi.resetModules();
    
    // Import the module
    await import('../pwa-performance');

    // Verify DOMContentLoaded listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function)
    );
  });

  it('should initialize immediately when document is already loaded', async () => {
    // Mock document.readyState as complete
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
    });

    // Clear the module cache and reload
    vi.resetModules();
    
    // Import the module and get devConsole
    const { devConsole } = await import('../config/devConsole');
    await import('../pwa-performance');

    // Verify initialization was called immediately
    expect(devConsole.info).toHaveBeenCalledWith(
      'Initializing HealWave performance optimizations'
    );
  });

  it('should handle module import without throwing', async () => {
    await expect(import('../pwa-performance')).resolves.toBeDefined();
  });
});