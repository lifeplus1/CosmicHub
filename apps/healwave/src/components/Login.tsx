import React, { useState, useCallback } from 'react';
import { logIn, useAuth } from '@cosmichub/auth';
import ErrorBoundary from './ErrorBoundary';
// Removed unused useNavigate import

interface LoginProps {
  onSwitchToSignup?: () => void;
  onClose?: () => void;
}

const Login: React.FC<LoginProps> = React.memo(({ onSwitchToSignup, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleSwitchToSignup = useCallback(() => {
    onSwitchToSignup?.();
  }, [onSwitchToSignup]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await logIn(email, password);
      onClose?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, onClose]);

  // If user is already logged in, show success message
  if (user) {
    return (
      <div className='max-w-md mx-auto'>
        <div className='p-8 border shadow-2xl bg-gradient-to-br from-green-900/50 to-blue-900/50 backdrop-blur-md rounded-2xl border-green-500/20'>
          <div className='text-center'>
            <div className='mb-4 text-xl text-green-400'>✅ Already logged in!</div>
            <p className='mb-4 text-gray-300'>Welcome back, {user.email}</p>
            <button
              onClick={handleClose}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClose();
                }
              }}
              aria-label='Continue to application'
              className='px-6 py-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600'
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-md mx-auto'>
      <div className='p-8 border shadow-2xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-md rounded-2xl border-purple-500/20'>
        <div className='mb-8 text-center'>
          <div className='mb-4 text-4xl'>🎵</div>
          <h2 className='mb-2 text-2xl font-bold text-white'>Welcome Back</h2>
          <p className='text-gray-300'>
            Sign in to access your healing frequencies
          </p>
        </div>

        {error && (
          <div className='p-3 mb-6 border rounded-lg bg-red-500/20 border-red-500/50'>
            <p className='text-sm text-red-200'>{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className='space-y-6'
        >
          <div>
            <label
              htmlFor='email'
              className='block mb-2 text-sm font-medium text-gray-200'
            >
              Email Address
            </label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={handleEmailChange}
              required
              aria-label='Email address'
              className='w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              placeholder='your@email.com'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block mb-2 text-sm font-medium text-gray-200'
            >
              Password
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={handlePasswordChange}
              required
              aria-label='Password'
              className='w-full px-4 py-3 text-white placeholder-gray-400 transition-all border rounded-lg bg-white/10 border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:transform-none'
          >
            {isLoading ? (
              <div className='flex items-center justify-center'>
                <div className='w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin'></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-gray-300'>
            Don&apos;t have an account?{' '}
            <button
              onClick={handleSwitchToSignup}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSwitchToSignup();
                }
              }}
              aria-label='Switch to sign up form'
              className='font-medium text-purple-400 transition-colors hover:text-purple-300'
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
});

Login.displayName = 'Login';

// Export with ErrorBoundary wrapper
const LoginWithErrorBoundary: React.FC<LoginProps> = (props) => (
  <ErrorBoundary
    fallback={
      <div className='max-w-md mx-auto max-h-[90vh] overflow-y-auto p-8 border shadow-2xl bg-gradient-to-br from-red-900/50 to-red-800/50 backdrop-blur-md rounded-2xl border-red-500/20'>
        <div className='text-center'>
          <div className='mb-4 text-4xl'>⚠️</div>
          <h2 className='mb-2 text-2xl font-bold text-white'>Login Error</h2>
          <p className='mb-4 text-red-300'>
            The login form encountered an error. Please refresh and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className='px-6 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
          >
            Refresh Page
          </button>
        </div>
      </div>
    }
  >
    <Login {...props} />
  </ErrorBoundary>
);

export default LoginWithErrorBoundary;
