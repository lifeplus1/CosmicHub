import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logIn } from '@cosmichub/auth';
import { devConsole } from '../config/environment';

interface LoginData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  devConsole.log?.('🔐 Login page rendered');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  devConsole.log?.('📝 Login input changed:', { name, value });
    setLoginData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
  if (error !== '') setError('');
  }, [error]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
  devConsole.log?.('🚀 Login form submitted with data:', loginData);
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
  if (loginData.email === '' || loginData.password === '') {
        throw new Error('Please enter both email and password');
      }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
        throw new Error('Please enter a valid email address');
      }

  devConsole.log?.('🔐 Attempting to log in user...');
  await logIn(loginData.email, loginData.password);
  devConsole.log?.('✅ Login successful!');
      
      // Navigate to dashboard after successful login
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
  devConsole.error('❌ Login error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [loginData, navigate]);

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 rounded-2xl border border-cosmic-silver/10 mb-8">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Sign In
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Welcome back to your cosmic journey
        </p>
      </div>

    <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
  {error !== '' && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

  <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-cosmic-silver/80 mb-2">Email</label>
            <input 
              id="email"
              name="email"
              type="email" 
              value={loginData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-cosmic-silver/80 mb-2">Password</label>
            <input 
              id="password"
              name="password"
              type="password" 
              value={loginData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              required
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading || loginData.email === '' || loginData.password === ''}
            className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:from-cosmic-purple/80 hover:to-cosmic-blue/80 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-300 font-semibold disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center">
            <p className="text-cosmic-silver/70">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-cosmic-gold hover:text-cosmic-gold/80 font-semibold">
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
