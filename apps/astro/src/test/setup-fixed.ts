import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Type definitions for test mocks
interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

interface ApiError {
  response?: {
    status: number;
  };
  message?: string;
}

interface ApiOptions {
  auth?: string;
  notFound?: string;
  defaultMsg?: string;
}

interface UIComponentProps {
  children?: React.ReactNode;
  onClick?: () => void;
  onChange?: (value: unknown) => void;
  onCheckedChange?: (checked: boolean) => void;
  onValueChange?: (value: number[]) => void;
  onClose?: () => void;
  onSelect?: () => void;
  value?: unknown;
  checked?: boolean;
  isOpen?: boolean;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  [key: string]: unknown;
}

interface MockAudioNode {
  frequency?: {
    setValueAtTime: () => void;
  };
  gain?: {
    setValueAtTime: () => void;
    linearRampToValueAtTime: () => void;
    exponentialRampToValueAtTime: () => void;
  };
  type?: string;
  connect: () => void;
  start?: () => void;
  stop?: () => void;
  disconnect: () => void;
}

interface MockAudioContext {
  createOscillator: () => MockAudioNode;
  createGain: () => MockAudioNode;
  destination: Record<string, unknown>;
  currentTime: number;
  state: string;
  resume: () => Promise<void>;
}

// Mock environment variables for Firebase
process.env.VITE_FIREBASE_API_KEY = 'mock-api-key';
process.env.VITE_FIREBASE_PROJECT_ID = 'mock-project-id';
process.env.VITE_FIREBASE_APP_ID = 'mock-app-id';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'mock-auth-domain';
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'mock-storage-bucket';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = 'mock-sender-id';

// Mock @cosmichub/config logger and API helpers
vi.mock('@cosmichub/config', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  // API Result helpers for test compatibility
  ok: vi.fn().mockImplementation(<T>(data: T, message?: string): ApiResult<T> => ({
    success: true,
    data,
    message: message ?? 'Success',
  })),
  fail: vi.fn().mockImplementation((error: string, code?: string): ApiResult => ({
    success: false,
    error,
    code: code ?? '500',
  })),
  toFailure: vi.fn().mockImplementation((error: ApiError, options?: ApiOptions): ApiResult => {
    const status = error?.response?.status;
    if (status && options) {
      const statusStr = status.toString();
      if (statusStr === '401' && options.auth) {
        return { success: false, error: options.auth, code: '401' };
      }
      if (statusStr === '404' && options.notFound) {
        return { success: false, error: options.notFound, code: '404' };
      }
    }
    const errorMsg = options?.defaultMsg ?? error?.message ?? 'Error';
    return { success: false, error: errorMsg, code: '500' };
  }),
  unwrap: vi.fn().mockImplementation(<T>(result: ApiResult<T>): T => {
    if (result.success) return result.data as T;
    throw new Error(result.error);
  }),
  unwrapOr: vi.fn().mockImplementation(<T, U>(result: ApiResult<T>, fallback: U): T | U => {
    return result.success ? (result.data as T) : fallback;
  }),
  mapSuccess: vi.fn().mockImplementation(<T, U>(result: ApiResult<T>, fn: (data: T) => U): ApiResult<U> => {
    if (result.success) {
      return { ...result, data: fn(result.data as T) };
    }
    return result as unknown as ApiResult<U>;
  }),
  mapFailure: vi.fn().mockImplementation(<T>(result: ApiResult<T>, fn: (result: ApiResult<T>) => ApiResult<T>): ApiResult<T> => {
    if (!result.success) {
      return fn(result);
    }
    return result;
  }),
  isSuccess: vi.fn().mockImplementation(<T>(result: ApiResult<T>): result is ApiResult<T> & { success: true } => result.success === true),
  isFailure: vi.fn().mockImplementation(<T>(result: ApiResult<T>): result is ApiResult<T> & { success: false } => result.success === false),
  mapResult: vi.fn().mockImplementation(<T, U, V>(result: ApiResult<T>, successFn: (data: T) => U, failureFn: (result: ApiResult<T>) => V): U | V => {
    return result.success ? successFn(result.data as T) : failureFn(result);
  }),
}));

// Mock @cosmichub/ui components
vi.mock('@cosmichub/ui', () => ({
  // Button components
  Button: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('button', { onClick: props.onClick, 'data-testid': 'ui-button', ...props }, props.children)
  ),
  ButtonPrimary: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('button', { onClick: props.onClick, 'data-testid': 'ui-button-primary', ...props }, props.children)
  ),
  ButtonSecondary: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('button', { onClick: props.onClick, 'data-testid': 'ui-button-secondary', ...props }, props.children)
  ),

  // Input components
  Input: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('input', { value: props.value, onChange: props.onChange, 'data-testid': 'ui-input', ...props })
  ),
  Select: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('select', { 'data-testid': 'ui-select', ...props }, props.children)
  ),
  TextArea: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('textarea', { value: props.value, onChange: props.onChange, 'data-testid': 'ui-textarea', ...props })
  ),

  // Layout components
  Card: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('div', { 'data-testid': 'ui-card', ...props }, props.children)
  ),
  Modal: vi.fn().mockImplementation((props: UIComponentProps) => 
    props.isOpen ? React.createElement('div', { 'data-testid': 'ui-modal', ...props }, 
      React.createElement('button', { onClick: props.onClose, 'data-testid': 'modal-close' }, 'Close'),
      props.children
    ) : null
  ),

  // Error handling components
  ErrorBoundary: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('div', { 'data-testid': 'integration-error-boundary', 'data-name': props.name, ...props }, props.children)
  ),
  ChartErrorBoundary: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('div', { 'data-testid': 'ui-chart-error-boundary', ...props }, props.children)
  ),

  // Navigation components
  Tabs: {
    Root: vi.fn().mockImplementation((props: UIComponentProps) => 
      React.createElement('div', { 'data-testid': 'ui-tabs-root', ...props }, props.children)
    ),
    List: vi.fn().mockImplementation((props: UIComponentProps) => 
      React.createElement('div', { 'data-testid': 'ui-tabs-list', ...props }, props.children)
    ),
    Trigger: vi.fn().mockImplementation((props: UIComponentProps & { value?: string }) => 
      React.createElement('button', { 'data-testid': 'ui-tabs-trigger', 'data-value': props.value, ...props }, props.children)
    ),
    Content: vi.fn().mockImplementation((props: UIComponentProps & { value?: string }) => 
      React.createElement('div', { 'data-testid': 'ui-tabs-content', 'data-value': props.value, ...props }, props.children)
    ),
  },

  // Form components
  Label: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('label', { 'data-testid': 'ui-label', ...props }, props.children)
  ),
  Switch: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('button', { 
      'data-testid': 'ui-switch', 
      'data-checked': props.checked,
      onClick: () => props.onCheckedChange?.(!props.checked),
      ...props
    }, props.checked ? 'ON' : 'OFF')
  ),
  Slider: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('input', {
      type: 'range',
      'data-testid': 'ui-slider',
      value: Array.isArray(props.value) ? props.value[0] ?? 0 : 0,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => props.onValueChange?.([Number(e.target.value)]),
      min: props.min,
      max: props.max,
      step: props.step,
      ...props
    })
  ),

  // Display components
  Spinner: vi.fn().mockImplementation(() => React.createElement('div', { 'data-testid': 'ui-spinner' }, 'Loading...')),
  LoadingSpinner: vi.fn().mockImplementation(() => React.createElement('div', { 'data-testid': 'ui-loading-spinner' }, 'Loading...')),
  Progress: vi.fn().mockImplementation((props: UIComponentProps) => 
    React.createElement('div', { 'data-testid': 'ui-progress', 'data-value': props.value, ...props }, `${String(props.value)}%`)
  ),

  // Utility components
  Tooltip: {
    Provider: vi.fn().mockImplementation((props: UIComponentProps) => props.children),
    Root: vi.fn().mockImplementation((props: UIComponentProps) => props.children),
    Trigger: vi.fn().mockImplementation((props: UIComponentProps) => props.children),
    Content: vi.fn().mockImplementation((props: UIComponentProps) => 
      React.createElement('div', { 'data-testid': 'ui-tooltip-content', ...props }, props.children)
    ),
  },

  // Dropdown/Menu components
  DropdownMenu: {
    Root: vi.fn().mockImplementation((props: UIComponentProps) => props.children),
    Trigger: vi.fn().mockImplementation((props: UIComponentProps) => 
      React.createElement('button', { 'data-testid': 'ui-dropdown-trigger', ...props }, props.children)
    ),
    Content: vi.fn().mockImplementation((props: UIComponentProps) => 
      React.createElement('div', { 'data-testid': 'ui-dropdown-content', ...props }, props.children)
    ),
    Item: vi.fn().mockImplementation((props: UIComponentProps) => 
      React.createElement('div', { 'data-testid': 'ui-dropdown-item', onClick: props.onSelect, ...props }, props.children)
    ),
  },
}));

// Mock Web Audio API for testing
(
  globalThis as typeof globalThis & { AudioContext: new() => MockAudioContext }
).AudioContext = vi.fn().mockImplementation((): MockAudioContext => ({
  createOscillator: vi.fn(() => ({
    frequency: { setValueAtTime: vi.fn() },
    type: 'sine',
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: {
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
(
  globalThis as typeof globalThis & { ResizeObserver: new() => ResizeObserver }
).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
(
  globalThis as typeof globalThis & {
    IntersectionObserver: new() => IntersectionObserver;
  }
).IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Firebase modules
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

// Mock crypto.randomUUID for request ID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid-123'),
  },
});
