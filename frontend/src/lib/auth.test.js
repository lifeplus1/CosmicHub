// frontend/src/lib/auth.test.js
import { vi } from 'vitest';
import { getAuthToken, logOut } from './auth';

const mockGetIdToken = vi.fn(() => Promise.resolve('mock-token'));
const mockSignOut = vi.fn(() => Promise.resolve());

vi.mock('firebase/auth', () => {
  const getAuth = vi.fn(() => ({
    currentUser: { uid: 'mock-uid' },
    signOut: mockSignOut,
  }));
  return { getAuth, getIdToken: mockGetIdToken };
});

describe('Auth', () => {
  it('gets auth token', async () => {
    const token = await getAuthToken();
    expect(token).toBe('mock-token');
    expect(mockGetIdToken).toHaveBeenCalled();
  });

  it('logs out', async () => {
    await logOut();
    expect(mockSignOut).toHaveBeenCalled();
  });
});