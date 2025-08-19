import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase modules
vi.mock('./firebase', () => ({
  auth: {
    currentUser: { uid: 'test_user', email: 'test@example.com' },
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn()
  },
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      })),
      add: vi.fn(),
      where: vi.fn(),
      orderBy: vi.fn(),
      limit: vi.fn(),
      get: vi.fn()
    }))
  }
}));

// Mock subscriptions package (lightweight)
vi.mock('@cosmichub/subscriptions', () => ({
  COSMICHUB_TIERS: {
    free: { name: 'Free', description: 'Free tier', icon: '👤', color: 'gray', price: { monthly: 0, yearly: 0 }, features: [], limits: { chartsPerMonth: 0, chartStorage: 0, synastryAnalyses: 0, aiQueries: 0 } },
    premium: { name: 'Premium', description: 'Premium tier', icon: '⭐', color: 'purple', price: { monthly: 10, yearly: 100 }, features: [], limits: { chartsPerMonth: -1, chartStorage: -1, synastryAnalyses: 10, aiQueries: 0 } }
  }
}));

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_BACKEND_URL: 'https://astrology-app-0emh.onrender.com',
    VITE_FIREBASE_API_KEY: 'test-key',
    VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    VITE_USE_EMULATOR: 'false',
    DEV: false
  }
});

// Global test utilities
(globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserver }).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));