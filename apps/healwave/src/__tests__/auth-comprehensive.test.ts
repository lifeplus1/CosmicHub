import { describe, it, expect, vi } from 'vitest';

// Mock the logger before importing auth
vi.mock('@cosmichub/config', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Auth Comprehensive Tests', () => {
  it('should re-export from @cosmichub/auth', async () => {
    // Test that the auth package can be imported without errors
    const authModule = await import('@cosmichub/auth');
    expect(authModule).toBeDefined();
    expect(typeof authModule.signUp).toBe('function');
    expect(typeof authModule.logIn).toBe('function');
    expect(typeof authModule.logOut).toBe('function');
  });

  it('should have access to auth functions', async () => {
    const { signUp, logIn, logOut } = await import('@cosmichub/auth');
    expect(signUp).toBeDefined();
    expect(logIn).toBeDefined();
    expect(logOut).toBeDefined();
  });
});