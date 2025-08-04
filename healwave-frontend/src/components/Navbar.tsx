import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../auth';
import Login from './Login';
import Signup from './Signup';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">HW</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">HealWave</h1>
                <span className="text-xs text-gray-300">Frequency Generator</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-white font-medium">
                      {user.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-300">Authenticated</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-2 rounded-full text-sm transition-all duration-200 border border-red-500/30"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={openLogin}
                    className="text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={openSignup}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-2 rounded-full text-sm transition-all duration-200 shadow-lg"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative">
            <button
              onClick={closeModal}
              className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
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
