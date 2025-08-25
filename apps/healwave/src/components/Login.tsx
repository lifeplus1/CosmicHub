import React, { useState } from 'react';
import { logIn, useAuth } from '@cosmichub/auth';
// Removed unused useNavigate import

interface LoginProps {
  onSwitchToSignup?: () => void;
  onClose?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // If user is already logged in, show success message
  if (user) {
    return (
      <div className='text-center'>
        <div className='text-green-400 text-xl mb-4'>✅ Already logged in!</div>
        <p className='text-gray-300 mb-4'>Welcome back, {user.email}</p>
        <button
          onClick={onClose}
          className='px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors'
        >
          Continue
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  return (
    <div className='max-w-md mx-auto'>
      <div className='bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-md rounded-2xl p-8 border border-purple-500/20 shadow-2xl'>
        <div className='text-center mb-8'>
          <div className='text-4xl mb-4'>🎵</div>
          <h2 className='text-2xl font-bold text-white mb-2'>Welcome Back</h2>
          <p className='text-gray-300'>
            Sign in to access your healing frequencies
          </p>
        </div>

        {error && (
          <div className='bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6'>
            <p className='text-red-200 text-sm'>{error}</p>
          </div>
        )}

        <form
          onSubmit={e => {
            void handleSubmit(e);
          }}
          className='space-y-6'
        >
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-200 mb-2'
            >
              Email Address
            </label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email input"
              className='w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
              placeholder='your@email.com'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-200 mb-2'
            >
              Password
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password input"
              className='w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
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
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
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
              onClick={onSwitchToSignup}
              className='text-purple-400 hover:text-purple-300 font-medium transition-colors'
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
