import { vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Make React available globally for tests
(globalThis as typeof globalThis & { React: typeof React }).React = React;

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

// Test setup with comprehensive mocking for external dependencies

// Mock Firebase modules completely
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  connectAuthEmulator: vi.fn(),
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { uid: 'test-uid' } })
  ),
  createUserWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { uid: 'test-uid' } })
  ),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn(() => vi.fn()),
  User: {},
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  connectFirestoreEmulator: vi.fn(),
  enableNetwork: vi.fn(() => Promise.resolve()),
  disableNetwork: vi.fn(() => Promise.resolve()),
}));

// Mock Auth package with useAuth hook
vi.mock('@cosmichub/auth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
  })),
  AuthProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactNode => children,
  SubscriptionProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactNode => children,
  useSubscription: vi.fn(() => ({
    plan: 'free',
    userTier: 'free',
    loading: false,
    usage: { daily: 0, monthly: 0 },
    hasFeature: vi.fn(() => false), // Mock hasFeature function
  })),
  logIn: vi.fn(),
  signUp: vi.fn(),
  logOut: vi.fn(),
}));

// Mock ToastProvider and useToast hook
vi.mock('./components/ToastProvider', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
  ToastProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactNode => children,
}));

// Mock UI components that may be missing
vi.mock('@cosmichub/ui', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
  TooltipProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('div', {}, children),
  Tooltip: ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement('div', {}, children),
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }): React.ReactElement => React.createElement('div', { className }, children),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }): React.ReactElement => React.createElement('div', { className }, children),
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }): React.ReactElement => React.createElement('div', { className }, children),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }): React.ReactElement => React.createElement('h3', { className }, children),
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }): React.ReactElement =>
    React.createElement('button', { onClick, className }, children),
  Input: ({
    placeholder,
    value,
    onChange,
    className,
  }: {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }): React.ReactElement =>
    React.createElement('input', { placeholder, value, onChange, className }),
  Table: ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement('table', {}, children),
  TableBody: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('tbody', {}, children),
  TableCell: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }): React.ReactElement => React.createElement('td', { className }, children),
  TableHead: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('th', {}, children),
  TableHeader: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('thead', {}, children),
  TableRow: ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement('tr', {}, children),
  Accordion: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('div', {}, children),
  AccordionContent: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('div', {}, children),
  AccordionItem: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('div', {}, children),
  AccordionTrigger: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('div', {}, children),
  Tabs: ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement('div', {}, children),
  TabsContent: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('div', {}, children),
  TabsList: ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement('div', {}, children),
  TabsTrigger: ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => React.createElement('div', {}, children),
  UpgradeModal: ({
    children,
    isOpen,
  }: {
    children?: React.ReactNode;
    isOpen?: boolean;
  }): React.ReactElement | null =>
    isOpen === true
      ? React.createElement(
          'div',
          { 'data-testid': 'upgrade-modal' },
          children ?? 'Upgrade Modal'
        )
      : null,
}));

// Mock integrations package
vi.mock('@cosmichub/integrations', () => ({
  useCrossAppStore: vi.fn(() => ({
    addNotification: vi.fn(),
    notifications: [],
    clearNotifications: vi.fn(),
  })),
  subscriptionManager: {
    checkLimits: vi.fn(() => Promise.resolve({ allowed: true })),
    getCurrentPlan: vi.fn(() => 'free'),
    getUsage: vi.fn(() => ({ daily: 0, monthly: 0 })),
    checkFeatureAccess: vi.fn(() => ({ canAccess: true, isLimited: false })),
  },
  API_ENDPOINTS: {
    astrology: '/api/astrology',
    healwave: '/api/healwave',
    numerology: '/api/numerology',
    humanDesign: '/api/human-design',
  },
}));

// Avoid full mock of '@cosmichub/config' so type exports (ApiResult, ok/fail/etc.) remain available.
// If runtime values need stubbing, consider partial mocking with vi.importActual in individual tests.

// Provide a robust localStorage polyfill (jsdom localStorage may be partial when disabled)
if (
  (typeof window !== 'undefined' && !('localStorage' in window)) ||
  typeof window.localStorage.clear !== 'function'
) {
  const storage: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => (key in storage ? storage[key] : null),
      setItem: (key: string, value: string) => {
        storage[key] = String(value);
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        for (const k of Object.keys(storage)) delete storage[k];
      },
      key: (index: number) => Object.keys(storage)[index] ?? null,
      get length() {
        return Object.keys(storage).length;
      },
    },
    configurable: true,
  });
}

// Canvas polyfill for a11y + components relying on getContext
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS { interface Global {} }
}
if (typeof HTMLCanvasElement !== 'undefined') {
  // Minimal safe mock that satisfies most libs expecting 2d context
  const ctx: any = {
    fillRect: () => {}, clearRect: () => {}, getImageData: () => new ImageData(1,1),
    putImageData: () => {}, createImageData: () => new ImageData(1,1), setTransform: () => {},
    drawImage: () => {}, save: () => {}, fillText: () => {}, restore: () => {}, beginPath: () => {},
    moveTo: () => {}, lineTo: () => {}, closePath: () => {}, stroke: () => {}, translate: () => {},
    scale: () => {}, rotate: () => {}, arc: () => {}, fill: () => {}, measureText: () => ({
      width: 0,
      actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0,
      actualBoundingBoxLeft: 0, actualBoundingBoxRight: 0,
      fontBoundingBoxAscent: 0, fontBoundingBoxDescent: 0,
      emHeightAscent: 0, emHeightDescent: 0, hangingBaseline: 0,
      alphabeticBaseline: 0, ideographicBaseline: 0
    }),
    transform: () => {}, rect: () => {}, clip: () => {},
  };
  HTMLCanvasElement.prototype.getContext = function getContext(type: any) {
    if (type === '2d') return ctx;
    return null as any;
  };
}

// Global RTL cleanup
afterEach(() => {
  cleanup();
});

