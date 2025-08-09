import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastProvider';
import { logIn } from '@cosmichub/auth';

const Login: React.FC = React.memo(() => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await logIn(email, password);
      toast({
        title: 'Logged In',
        description: 'Successfully logged into your account',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/chart');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, navigate, toast]);

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-lg p-8 mx-auto border shadow-2xl bg-cosmic-dark/80 backdrop-blur-xl border-cosmic-silver/20 rounded-3xl">
        <div className="flex flex-col space-y-6">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold text-cosmic-gold font-cinzel">Sign In</h2>
            <p className="text-lg text-cosmic-silver">Log in to access your personalized astrology insights.</p>
          </div>

          <form onSubmit={handleSubmit} aria-label="Login Form">
            <div className="flex flex-col space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 text-cosmic-gold">Email <span aria-hidden="true">*</span></label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="cosmic-input"
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-cosmic-gold">Password <span aria-hidden="true">*</span></label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="cosmic-input"
                  aria-required="true"
                />
              </div>
              <button
                type="submit"
                className="w-full cosmic-button"
                disabled={isLoading}
              >
                Sign In
              </button>
            </div>
          </form>

          <hr className="my-8 border-cosmic-silver/30" />

          <div className="flex flex-col space-y-4 text-center">
            <p className="text-sm text-cosmic-silver">🧪 For Testing & Development</p>
            <button
              className="w-full mx-auto cosmic-button sm:w-auto"
              onClick={() => navigate('/mock-login')}
              aria-label="Quick Mock Login"
            >
              Quick Mock Login Panel
            </button>
            <p className="max-w-sm mx-auto text-xs text-cosmic-silver/60">
              Access demo accounts for Free, Premium, and Elite tiers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

Login.displayName = 'Login';

export default Login;