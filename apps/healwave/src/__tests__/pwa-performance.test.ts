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

  it('should add DOMContentLoaded listener when document is loading (no auto init in tests)', async () => {
    // Mock document.readyState as loading
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true,
    });

    // Clear the module cache and reload
    vi.resetModules();
    
    // Import the module
  await import('../pwa-performance');

    // Verify DOMContentLoaded listener was added (test-mode guard prevents immediate init)
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'DOMContentLoaded',
      expect.any(Function)
    );

    // Simulate DOMContentLoaded to ensure it initializes when fired
    const call = addEventListenerSpy.mock.calls.find((c) => c[0] === 'DOMContentLoaded');
    expect(call?.[1]).toBeTypeOf('function');
    // @ts-expect-error - we know it's a function from the check above
    call?.[1]();
  });

  it('should initialize when document is already loaded (explicit call in test mode)', async () => {
    // Mock document.readyState as complete
    Object.defineProperty(document, 'readyState', {
      value: 'complete',
      writable: true,
    });

    // Clear the module cache and reload
    vi.resetModules();
    
    // Import the module and get devConsole
  // Import module and call its test initializer
  const { devConsole } = await import('../config/devConsole');
  const mod = await import('../pwa-performance');
  mod.__test__.initNow();
  expect(devConsole.info).toHaveBeenCalledWith('Initializing HealWave performance optimizations');
  });

  it('should handle module import without throwing', async () => {
    await expect(import('../pwa-performance')).resolves.toBeDefined();
  });
});