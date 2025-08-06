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

// Mock shared auth module
vi.mock('../shared/auth.ts', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(() => ({ uid: 'test_user', email: 'test@example.com' })),
  onAuthStateChanged: vi.fn()
}));

// Mock shared api module
vi.mock('../shared/api.ts', () => ({
  fetchNatalChart: vi.fn(),
  fetchSynastryAnalysis: vi.fn(),
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
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

// Mock useToast hook from Chakra UI
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: vi.fn(() => vi.fn())
  };
});

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));