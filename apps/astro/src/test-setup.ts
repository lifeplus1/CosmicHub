import { vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for tests
global.React = React;

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
}));