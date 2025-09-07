import '@testing-library/jest-dom';
import { vi, afterEach, afterAll } from 'vitest';
import React from 'react';

// Set test environment variables early to prevent Firebase initialization
process.env.NODE_ENV = 'test';
process.env.VITEST = 'true';
process.env.VITE_USE_MOCK_AUTH = 'true';

// Mock environment variables for Firebase
process.env.VITE_FIREBASE_API_KEY = 'mock-api-key';
process.env.VITE_FIREBASE_PROJECT_ID = 'mock-project-id';
process.env.VITE_FIREBASE_APP_ID = 'mock-app-id';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'mock-auth-domain';
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'mock-storage-bucket';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = 'mock-sender-id';

// Prevent Firebase initialization during tests
process.env.VITE_DISABLE_FIREBASE = 'true';
process.env.NODE_ENV = 'test';

// Ensure HealWave PWA does not auto-initialize in tests (prevents open timers/listeners)
// Must be set before pwa.ts is imported anywhere in tests
(globalThis as Record<string, unknown>).HEALWAVE_PWA_MANUAL_INIT = true;

// Mock @cosmichub/config completely to prevent Firebase initialization
vi.mock('@cosmichub/config', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  // Firebase mocks
  app: {},
  auth: {},
  db: {},
  hasAuthAvailable: false,
  isEmulator: false,
  isDevelopment: true,
  projectId: 'mock-project-id',
  enableFirestoreNetwork: vi.fn().mockResolvedValue(undefined),
  disableFirestoreNetwork: vi.fn().mockResolvedValue(undefined),
  getFirebasePerformanceInfo: vi.fn(() => ({
    projectId: 'mock-project-id',
    authDomain: 'mock-auth-domain',
    isEmulator: false,
    isDevelopment: true,
    timestamp: Date.now(),
  })),
  // API Result helpers for test compatibility
  ok: vi.fn((data: unknown, message?: string) => ({
    success: true,
    data,
    message: message || 'Success',
  })),
  fail: vi.fn((error: string, statusCode?: string) => ({
    success: false,
    error,
    statusCode: statusCode || '500',
  })),
  toFailure: vi.fn((error: Error | { message?: string; response?: { status?: number } }) => ({
    success: false,
    error: error?.message || 'Error',
    statusCode: 'response' in error && error.response?.status ? String(error.response.status) : '500',
  })),
  unwrap: vi.fn((result: { success: boolean; data?: unknown; error?: string }) => {
    if (result.success) return result.data;
    throw new Error(result.error);
  }),
  unwrapOr: vi.fn((result: { success: boolean; data?: unknown }, fallback: unknown) => {
    return result.success ? result.data : fallback;
  }),
  mapSuccess: vi.fn((result: { success: boolean; data?: unknown }, fn: (data: unknown) => unknown) => {
    if (result.success) {
      return { ...result, data: fn(result.data) };
    }
    return result;
  }),
  mapFailure: vi.fn((result: { success: boolean }, fn: (result: unknown) => unknown) => {
    if (!result.success) {
      return fn(result);
    }
    return result;
  }),
  isSuccess: vi.fn((result: { success: boolean }) => result.success === true),
  isFailure: vi.fn((result: { success: boolean }) => result.success === false),
  mapResult: vi.fn((result: { success: boolean; data?: unknown }, successFn: (data: unknown) => unknown, failureFn: (result: unknown) => unknown) => {
    return result.success ? successFn(result.data) : failureFn(result);
  }),
}));

// Prevent hard reloads in tests if any code calls it
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    reload: vi.fn(),
  },
  writable: true,
});

// Track and clean timers and RAF to avoid hanging test runner
const originalSetTimeout = window.setTimeout.bind(window);
const originalClearTimeout = window.clearTimeout.bind(window);
const originalSetInterval = window.setInterval.bind(window);
const originalClearInterval = window.clearInterval.bind(window);
const originalRAF = window.requestAnimationFrame?.bind(window) ?? ((cb: FrameRequestCallback) => originalSetTimeout(() => cb(performance.now()), 16) as unknown as number);
const originalCAF = window.cancelAnimationFrame?.bind(window) ?? ((id: number) => originalClearTimeout(id as unknown as number));

const timeouts: number[] = [];
const intervals: number[] = [];
const rafs: number[] = [];

window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
  const id = originalSetTimeout(handler as TimerHandler, timeout as number, ...(args as []));
  timeouts.push(id as unknown as number);
  return id;
}) as typeof setTimeout;

window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
  const id = originalSetInterval(handler as TimerHandler, timeout as number, ...(args as []));
  intervals.push(id as unknown as number);
  return id;
}) as typeof setInterval;

window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
  const id = originalRAF(cb);
  rafs.push(id as unknown as number);
  return id;
}) as typeof requestAnimationFrame;

window.cancelAnimationFrame = ((id: number) => {
  originalCAF(id);
}) as typeof cancelAnimationFrame;

// Track and clean window/document event listeners
type ListenerEntry = { type: string; listener: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions };
const windowListeners: ListenerEntry[] = [];
const documentListeners: ListenerEntry[] = [];

const winAdd = window.addEventListener.bind(window);
const winRemove = window.removeEventListener.bind(window);
const docAdd = document.addEventListener.bind(document);
const docRemove = document.removeEventListener.bind(document);

window.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
  windowListeners.push({ type, listener, options });
  winAdd(type, listener as EventListener, options as never);
}) as typeof window.addEventListener;

window.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
  winRemove(type, listener as EventListener, options as never);
}) as typeof window.removeEventListener;

document.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
  documentListeners.push({ type, listener, options });
  docAdd(type, listener as EventListener, options as never);
}) as typeof document.addEventListener;

document.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
  docRemove(type, listener as EventListener, options as never);
}) as typeof document.removeEventListener;

// Cleanup hooks
afterEach(() => {
  // Clear timers
  for (const id of timeouts.splice(0)) originalClearTimeout(id);
  for (const id of intervals.splice(0)) originalClearInterval(id);
  for (const id of rafs.splice(0)) originalCAF(id);

  // Remove window listeners
  for (const { type, listener, options } of windowListeners.splice(0)) {
    try { winRemove(type, listener as EventListener, options as never); } catch { /* ignore */ }
  }
  // Remove document listeners
  for (const { type, listener, options } of documentListeners.splice(0)) {
    try { docRemove(type, listener as EventListener, options as never); } catch { /* ignore */ }
  }
});

afterAll(() => {
  // Final safety net
  for (const id of timeouts.splice(0)) originalClearTimeout(id);
  for (const id of intervals.splice(0)) originalClearInterval(id);
  for (const id of rafs.splice(0)) originalCAF(id);
  for (const { type, listener, options } of windowListeners.splice(0)) {
    try { winRemove(type, listener as EventListener, options as never); } catch { /* ignore */ }
  }
  for (const { type, listener, options } of documentListeners.splice(0)) {
    try { docRemove(type, listener as EventListener, options as never); } catch { /* ignore */ }
  }
});

// Mock Firebase modules early to prevent initialization
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  connectAuthEmulator: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  connectFirestoreEmulator: vi.fn(),
  enableNetwork: vi.fn(),
  disableNetwork: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
}));

// Mock @cosmichub/ui components
vi.mock('@cosmichub/ui', () => ({
  // Button components
  Button: vi.fn(({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => 
    React.createElement('button', { onClick, 'data-testid': 'ui-button', ...props }, children)
  ),
  ButtonPrimary: vi.fn(({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => 
    React.createElement('button', { onClick, 'data-testid': 'ui-button-primary', ...props }, children)
  ),
  ButtonSecondary: vi.fn(({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void; [key: string]: unknown }) => 
    React.createElement('button', { onClick, 'data-testid': 'ui-button-secondary', ...props }, children)
  ),

  // Input components
  Input: vi.fn(({ value, onChange, ...props }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; [key: string]: unknown }) => 
    React.createElement('input', { value, onChange, 'data-testid': 'ui-input', ...props })
  ),
  Select: vi.fn(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
    React.createElement('select', { 'data-testid': 'ui-select', ...props }, children)
  ),
  TextArea: vi.fn(({ value, onChange, ...props }: { value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; [key: string]: unknown }) => 
    React.createElement('textarea', { value, onChange, 'data-testid': 'ui-textarea', ...props })
  ),

  // Layout components
  Card: vi.fn(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
    React.createElement('div', { 'data-testid': 'ui-card', ...props }, children)
  ),
  Modal: vi.fn(({ children, isOpen, onClose, ...props }: { children: React.ReactNode; isOpen?: boolean; onClose?: () => void; [key: string]: unknown }) => 
    isOpen ? React.createElement('div', { 'data-testid': 'ui-modal', ...props }, 
      React.createElement('button', { onClick: onClose, 'data-testid': 'modal-close' }, 'Close'),
      children
    ) : null
  ),

  // Error handling components
  ErrorBoundary: vi.fn(({ children, name, ...props }: { children: React.ReactNode; name?: string; [key: string]: unknown }) => 
    React.createElement('div', { 'data-testid': 'ui-error-boundary', 'data-name': name, ...props }, children)
  ),
  ChartErrorBoundary: vi.fn(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
    React.createElement('div', { 'data-testid': 'ui-chart-error-boundary', ...props }, children)
  ),

  // Navigation components
  Tabs: {
    Root: vi.fn(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
      React.createElement('div', { 'data-testid': 'ui-tabs-root', ...props }, children)
    ),
    List: vi.fn(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
      React.createElement('div', { 'data-testid': 'ui-tabs-list', ...props }, children)
    ),
    Trigger: vi.fn(({ children, value, ...props }: { children: React.ReactNode; value?: string; [key: string]: unknown }) => 
      React.createElement('button', { 'data-testid': 'ui-tabs-trigger', 'data-value': value, ...props }, children)
    ),
    Content: vi.fn(({ children, value, ...props }: { children: React.ReactNode; value?: string; [key: string]: unknown }) => 
      React.createElement('div', { 'data-testid': 'ui-tabs-content', 'data-value': value, ...props }, children)
    ),
  },

  // Form components
  Label: vi.fn(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
    React.createElement('label', { 'data-testid': 'ui-label', ...props }, children)
  ),
  Switch: vi.fn(({ checked, onCheckedChange, ...props }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void; [key: string]: unknown }) => 
    React.createElement('button', { 
      'data-testid': 'ui-switch', 
      'data-checked': checked,
      onClick: () => onCheckedChange?.(!checked),
      ...props
    }, checked ? 'ON' : 'OFF')
  ),
  Slider: vi.fn(({ value, onValueChange, min, max, step, ...props }: { 
    value?: number[]; 
    onValueChange?: (value: number[]) => void; 
    min?: number; 
    max?: number; 
    step?: number; 
    [key: string]: unknown 
  }) => 
    React.createElement('input', {
      type: 'range',
      'data-testid': 'ui-slider',
      value: value?.[0] || 0,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onValueChange?.([Number(e.target.value)]),
      min,
      max,
      step,
      ...props
    })
  ),

  // Display components
  Spinner: vi.fn(() => React.createElement('div', { 'data-testid': 'ui-spinner' }, 'Loading...')),
  LoadingSpinner: vi.fn(() => React.createElement('div', { 'data-testid': 'ui-loading-spinner' }, 'Loading...')),
  ProgressiveLoading: vi.fn(({ stage, message }: { stage?: string; message?: string }) => 
    React.createElement('div', { 'data-testid': 'ui-progressive-loading' }, message || `Loading: ${stage}`)
  ),
  Progress: vi.fn(({ value, ...props }: { value?: number; [key: string]: unknown }) => 
    React.createElement('div', { 'data-testid': 'ui-progress', 'data-value': value, ...props }, `${value}%`)
  ),

  // Utility components
  Tooltip: {
    Provider: vi.fn(({ children }: { children: React.ReactNode }) => children),
    Root: vi.fn(({ children }: { children: React.ReactNode }) => children),
    Trigger: vi.fn(({ children }: { children: React.ReactNode }) => children),
    Content: vi.fn(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
      React.createElement('div', { 'data-testid': 'ui-tooltip-content', ...props }, children)
    ),
  },

  // Dropdown/Menu components
  DropdownMenu: {
    Root: vi.fn(({ children }: { children: React.ReactNode }) => children),
    Trigger: vi.fn(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
      React.createElement('button', { 'data-testid': 'ui-dropdown-trigger', ...props }, children)
    ),
    Content: vi.fn(({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => 
      React.createElement('div', { 'data-testid': 'ui-dropdown-content', ...props }, children)
    ),
    Item: vi.fn(({ children, onSelect, ...props }: { children: React.ReactNode; onSelect?: () => void; [key: string]: unknown }) => 
      React.createElement('div', { 'data-testid': 'ui-dropdown-item', onClick: onSelect, ...props }, children)
    ),
  },
}));

// Mock window.matchMedia for all tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Audio API
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    createOscillator: vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
      type: 'sine',
    })),
    createGain: vi.fn(() => ({
      connect: vi.fn(),
      gain: { value: 0 },
    })),
    destination: {},
    currentTime: 0,
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  })),
});

// Mock Web Audio API
globalThis.AudioContext ??= vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn(),
  createGain: vi.fn(),
  destination: {},
  currentTime: 0,
}));

// Mock crypto.randomUUID for request ID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-123'),
  },
});

// Mock React's act function to avoid warnings - must be done early
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    act: vi.fn((callback: () => void | Promise<void>) => {
      if (typeof callback === 'function') {
        const result = callback();
        if (result && typeof result.then === 'function') {
          return result;
        }
      }
      return Promise.resolve();
    }),
  };
});

// Mock @testing-library/react act as well
vi.mock('@testing-library/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@testing-library/react')>();
  return {
    ...actual,
    act: vi.fn((callback: () => void | Promise<void>) => {
      if (typeof callback === 'function') {
        const result = callback();
        if (result && typeof result.then === 'function') {
          return result;
        }
      }
      return Promise.resolve();
    }),
  };
});
