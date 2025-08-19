import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '@cosmichub/auth';
import { devConsole } from '../config/environment';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  devConsole.log?.('🎨 SignUp page rendered with form data:', formData);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  devConsole.log?.('📝 Form input changed:', { name, value });
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
  devConsole.log?.('🚀 Form submitted with data:', formData);
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
  if (formData.email === '' || formData.password === '' || formData.fullName === '') {
        throw new Error('Please fill in all fields');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

  devConsole.log?.('🔐 Attempting to create user account...');
      await signUp(formData.email, formData.password);
  devConsole.log?.('✅ Account created successfully!');
      
      // Navigate to dashboard or login
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
  devConsole.error('❌ Signup error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate]);

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-gold/20 to-cosmic-purple/20 rounded-2xl border border-cosmic-silver/10 mb-8">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Sign Up
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Begin your cosmic journey today
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
            <label htmlFor="fullName" className="block text-cosmic-silver/80 mb-2">Full Name</label>
            <input 
              id="fullName"
              name="fullName"
              type="text" 
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-cosmic-silver/80 mb-2">Email</label>
            <input 
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-cosmic-silver/80 mb-2">Password</label>
            <input 
              id="password"
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password"
              className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              required
              minLength={6}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple hover:from-cosmic-gold/80 hover:to-cosmic-purple/80 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-300 font-semibold disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-cosmic-silver/70">
              Already have an account?{' '}
              <a href="/login" className="text-cosmic-gold hover:text-cosmic-gold/80 font-semibold">
                Sign In
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
