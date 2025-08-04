import { vi, describe, it, expect } from 'vitest';
import { getAuthToken, logOut } from '../auth';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: { uid: 'mock-uid' },
    signOut: vi.fn(() => Promise.resolve()),
  })),
  getIdToken: vi.fn(() => Promise.resolve('mock-token')),
  signOut: vi.fn(() => Promise.resolve()),
}));

describe('Auth', () => {
  it('gets auth token', async () => {
    const token = await getAuthToken();
    expect(token).toBe('mock-token');
  });

  it('logs out', async () => {
    const { signOut } = await import('firebase/auth');
    await logOut();
    expect(signOut).toHaveBeenCalled();
  });
});