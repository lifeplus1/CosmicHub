import { describe, it, expect, beforeEach } from 'vitest';
import { signUp, logIn, logOut } from '@cosmichub/auth';

// Skip real Firebase tests in CI/push environments  
const shouldSkipRealTests = process.env.CI || process.env.NODE_ENV === 'test';

describe.skipIf(shouldSkipRealTests)('HealWave Auth Functions (Real Implementation)', () => {
  let testCounter = 0;
  const testPassword = 'testpassword123';

  beforeEach(async () => {
    // Clean up: log out before each test
    try {
      await logOut();
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  it('should create and log in user successfully', async () => {
    const testEmail = `test_signup_${testCounter++}@example.com`;
    
    // Sign up a new user
    const user = await signUp(testEmail, testPassword);
    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    
    // Clean up
    await logOut();
  });

  it('should log in existing user', async () => {
    const testEmail = `test_login_${testCounter++}@example.com`;
    
    // First, create a user
    await signUp(testEmail, testPassword);
    await logOut();
    
    // Then try to log in
    const user = await logIn(testEmail, testPassword);
    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    
    // Clean up
    await logOut();
  });
});
