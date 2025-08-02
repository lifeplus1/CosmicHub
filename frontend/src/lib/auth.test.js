// frontend/src/lib/auth.test.js
import { signUp, logIn, logOut, getAuthToken } from './auth';
import { vi } from 'vitest';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getIdToken, setPersistence } from 'firebase/auth';

vi.mock('./firebase', () => ({
  auth: { currentUser: null },
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  getIdToken: vi.fn(),
  setPersistence: vi.fn(),
  browserSessionPersistence: {},
}));

describe('Auth Functions', () => {
  it('signUp calls createUserWithEmailAndPassword', async () => {
    const mockUser = { user: { uid: '123' } };
    createUserWithEmailAndPassword.mockResolvedValue(mockUser);
    await signUp('test@example.com', 'password');
    expect(setPersistence).toHaveBeenCalledWith(auth, {});
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
  });

  it('logIn calls signInWithEmailAndPassword', async () => {
    const mockUser = { user: { uid: '123' } };
    signInWithEmailAndPassword.mockResolvedValue(mockUser);
    await logIn('test@example.com', 'password');
    expect(setPersistence).toHaveBeenCalledWith(auth, {});
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
  });

  it('logOut calls signOut', async () => {
    await logOut();
    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it('getAuthToken calls getIdToken', async () => {
    auth.currentUser = { uid: '123' };
    getIdToken.mockResolvedValue('token');
    const token = await getAuthToken();
    expect(getIdToken).toHaveBeenCalledWith({ uid: '123' }, true);
    expect(token).toBe('token');
  });
});