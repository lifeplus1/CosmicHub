import { describe, it, expect, beforeEach } from 'vitest';
import { signUp, logIn, logOut, getAuthToken } from '../../../shared/auth';

describe('HealWave Auth Functions (Real Implementation)', () => {
  let testCounter = 0;
  const testPassword = 'testpassword123';

  beforeEach(async () => {
    // Clean up: log out before each test
    try {
      await logOut();
    } catch (error) {
      // User might not be logged in
    }
  });

  // Helper function to get unique email for each test
  const getUniqueEmail = () => {
    testCounter++;
    const timestamp = Date.now();
    return `healwave-test-${timestamp}-${testCounter}@example.com`;
  };

  it('should sign up a new user successfully', async () => {
    const testEmail = getUniqueEmail();
    
    const user = await signUp(testEmail, testPassword);
    
    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.uid).toBeDefined();
    expect(typeof user.uid).toBe('string');
    expect(user.uid.length).toBeGreaterThan(0);
  });

  it('should log in with correct credentials', async () => {
    const testEmail = getUniqueEmail();
    
    // First sign up
    await signUp(testEmail, testPassword);
    
    // Log out
    await logOut();
    
    // Then log in
    const user = await logIn(testEmail, testPassword);
    
    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.uid).toBeDefined();
  });

  it('should get auth token for logged in user', async () => {
    const testEmail = getUniqueEmail();
    
    // Sign up to get a logged in user
    await signUp(testEmail, testPassword);
    
    // Get auth token
    const token = await getAuthToken();
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    // JWT tokens typically start with "ey"
    expect(token.startsWith('ey')).toBe(true);
  });

  it('should fail to get auth token when not logged in', async () => {
    // Make sure no user is logged in
    await logOut();
    
    // Try to get auth token
    await expect(getAuthToken()).rejects.toThrow('No user logged in');
  });

  it('should log out successfully', async () => {
    const testEmail = getUniqueEmail();
    
    // Sign up to get a logged in user
    await signUp(testEmail, testPassword);
    
    // Log out should not throw
    await expect(logOut()).resolves.not.toThrow();
  });

  it('should fail with invalid email format', async () => {
    await expect(signUp('invalid-email', testPassword)).rejects.toThrow();
  });

  it('should fail with weak password', async () => {
    const testEmail = getUniqueEmail();
    
    await expect(signUp(testEmail, '123')).rejects.toThrow();
  });

  it('should fail to log in with wrong password', async () => {
    const testEmail = getUniqueEmail();
    
    // First sign up
    await signUp(testEmail, testPassword);
    
    // Log out
    await logOut();
    
    // Try to log in with wrong password
    await expect(logIn(testEmail, 'wrongpassword')).rejects.toThrow();
  });

  it('should fail to sign up with existing email', async () => {
    const testEmail = getUniqueEmail();
    
    // First sign up
    await signUp(testEmail, testPassword);
    
    // Try to sign up again with same email
    await expect(signUp(testEmail, testPassword)).rejects.toThrow('Email already in use');
  });
});
