import React, { useState } from 'react';
import { useAuth } from '@cosmichub/auth';
import Login from './Login';
import Signup from './Signup';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Use proper error handling instead of console
      alert('Logout failed. Please try again.');
    }
  };

  // Close dropdown when clicking outside
  const openLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const closeModal = () => {
    setShowAuthModal(false);
  };

  const switchToLogin = () => {
    setAuthMode('login');
  };

  const switchToSignup = () => {
    setAuthMode('signup');
  };

  return (
    <>
      <nav className='sticky top-0 z-50 border-b bg-black/20 backdrop-blur-md border-white/10'>
        <div className='container px-6 mx-auto'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center space-x-3'>
              <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400'>
                <span className='text-sm font-bold text-white'>HW</span>
              </div>
              <div>
                <h1 className='text-xl font-bold text-white'>HealWave</h1>
                <span className='text-xs text-gray-300'>
                  Frequency Generator
                </span>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              {user ? (
                <div className='flex items-center space-x-4'>
                  <div className='text-right'>
                    <div className='text-sm font-medium text-white'>
                      {user.email?.split('@')[0] ?? 'User'}
                    </div>
                    <div className='text-xs text-gray-300'>Authenticated</div>
                  </div>
                  <button
                    onClick={() => {
                      void handleLogout();
                    }}
                    className='px-4 py-2 text-sm text-red-300 transition-all duration-200 border rounded-full bg-red-500/20 hover:bg-red-500/30 hover:text-red-200 border-red-500/30'
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className='flex items-center space-x-3'>
                  <button
                    onClick={openLogin}
                    className='px-4 py-2 text-sm text-gray-300 transition-colors rounded-full hover:text-white'
                  >
                    Login
                  </button>
                  <button
                    onClick={openSignup}
                    className='px-6 py-2 text-sm text-white transition-all duration-200 rounded-full shadow-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
          <div className='relative'>
            <button
              onClick={closeModal}
              className='absolute z-10 flex items-center justify-center w-8 h-8 text-white transition-colors bg-red-500 rounded-full -top-4 -right-4 hover:bg-red-600'
            >
              ×
            </button>
            {authMode === 'login' ? (
              <Login onSwitchToSignup={switchToSignup} onClose={closeModal} />
            ) : (
              <Signup onSwitchToLogin={switchToLogin} onClose={closeModal} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
