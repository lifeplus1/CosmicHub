// frontend/src/lib/auth.test.js
import { vi } from 'vitest';
import { getAuthToken, logOut } from './auth';

vi.mock('firebase/auth', () => {
  const getAuth = vi.fn();
  const getIdToken = vi.fn(() => Promise.resolve('mock-token'));
  const signOut = vi.fn(() => Promise.resolve());
  return { getAuth, getIdToken, signOut };
});

describe('Auth', () => {
  it('gets auth token', async () => {
    const token = await getAuthToken();
    expect(token).toBe('mock-token');
  });

  it('logs out', async () => {
    await logOut();
    expect(vi.mocked(signOut)).toHaveBeenCalled();
  });
});