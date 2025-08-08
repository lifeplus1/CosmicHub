import { vi } from 'vitest';
// Vitest-specific setup that automatically extends expect with jest-dom matchers
import { vi } from 'vitest';

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

// Mock ToastProvider and useToast hook
vi.mock('./components/ToastProvider', () => ({
  useToast: vi.fn(() => vi.fn()),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock UI components that may be missing
vi.mock('@cosmichub/ui', () => ({
  useToast: vi.fn(() => vi.fn()),
}));

// Mock integrations package
vi.mock('@cosmichub/integrations', () => ({
  useCrossAppStore: vi.fn(() => ({
    addNotification: vi.fn(),
    notifications: [],
    clearNotifications: vi.fn(),
  })),
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
