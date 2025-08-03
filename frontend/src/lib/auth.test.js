// frontend/src/lib/auth.test.js
import { vi } from 'vitest';
import { getAuthToken, logOut } from './auth';

vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(() => ({
      currentUser: { uid: 'mock-uid' },
    })),
    getIdToken: vi.fn(() => Promise.resolve('mock-token')),
    signOut: vi.fn(() => Promise.resolve()),
  };
});

describe('Auth', () => {
  it('gets auth token', async () => {
    const token = await getAuthToken();
    expect(token).toBe('mock-token');
  });

  it('logs out', async () => {
    await logOut();
    // You can check if signOut was called if you re-export it from your module
  });
});