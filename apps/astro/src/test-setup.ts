import { vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for tests
(globalThis as typeof globalThis & { React: typeof React }).React = React;

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
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
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
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  SubscriptionProvider: ({ children }: { children: React.ReactNode }) => children,
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
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock UI components that may be missing
vi.mock('@cosmichub/ui', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  Tooltip: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => React.createElement('div', { className }, children),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => React.createElement('div', { className }, children),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => React.createElement('div', { className }, children),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => React.createElement('h3', { className }, children),
  Button: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => React.createElement('button', { onClick, className }, children),
  Input: ({ placeholder, value, onChange, className }: { placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }) => React.createElement('input', { placeholder, value, onChange, className }),
  Table: ({ children }: { children: React.ReactNode }) => React.createElement('table', {}, children),
  TableBody: ({ children }: { children: React.ReactNode }) => React.createElement('tbody', {}, children),
  TableCell: ({ children, className }: { children: React.ReactNode; className?: string }) => React.createElement('td', { className }, children),
  TableHead: ({ children }: { children: React.ReactNode }) => React.createElement('th', {}, children),
  TableHeader: ({ children }: { children: React.ReactNode }) => React.createElement('thead', {}, children),
  TableRow: ({ children }: { children: React.ReactNode }) => React.createElement('tr', {}, children),
  Accordion: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  AccordionContent: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  AccordionItem: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  Tabs: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  TabsContent: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  TabsList: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  TabsTrigger: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
  UpgradeModal: ({ children, isOpen }: { children?: React.ReactNode; isOpen?: boolean }) => 
    isOpen === true ? React.createElement('div', { 'data-testid': 'upgrade-modal' }, children ?? 'Upgrade Modal') : null
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

// Mock Firebase config module
vi.mock('@cosmichub/config', () => ({
  default: {
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:test-app-id',
    measurementId: 'G-TEST123',
  },
  app: {},
  auth: {},
  db: {},
  isEmulator: false,
  isDevelopment: false,
  projectId: 'test-project',
  // Feature system exports used by FeatureGuard and other components
  FEATURE_KEYS: {
    SYNSTRY_ANALYSIS: 'synastry_analysis',
    AI_INTERPRETATION: 'ai_interpretation',
    TRANSIT_ANALYSIS: 'transit_analysis',
    MULTI_SYSTEM_ANALYSIS: 'multi_system_analysis'
  },
  isFeatureKey: (value: string) => [
    'synastry_analysis',
    'ai_interpretation',
    'transit_analysis',
    'multi_system_analysis'
  ].includes(value),
  FEATURE_REQUIRED_TIERS: {
    synastry_analysis: 'premium',
    ai_interpretation: 'elite',
    transit_analysis: 'elite',
    multi_system_analysis: 'premium'
  },
  FEATURE_LABELS: {
    synastry_analysis: 'Synastry Compatibility',
    ai_interpretation: 'AI Interpretation',
    transit_analysis: 'Transit Analysis',
    multi_system_analysis: 'Multi-System Analysis'
  },
  ALL_FEATURE_KEYS: [
    'synastry_analysis',
    'ai_interpretation',
    'transit_analysis',
    'multi_system_analysis'
  ],
  isFeatureEnabled: () => false,
}));