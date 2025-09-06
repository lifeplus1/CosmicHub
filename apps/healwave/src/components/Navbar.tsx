import React, { useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Cross2Icon, ChevronDownIcon } from '@radix-ui/react-icons';
import { 
  FaUser, 
  FaCrown, 
  FaStar, 
  FaCog, 
  FaMusic, 
  FaArrowUp,
  FaSignOutAlt,
  FaHeadphones
} from 'react-icons/fa';
import { useAuth, useSubscription } from '@cosmichub/auth';
import { useAppNavigation } from '../hooks/useAppNavigation';
import Login from './Login';
import Signup from './Signup';

const Navbar: React.FC = React.memo(() => {
  const { user, signOut } = useAuth();
  const { tier: userTier } = useSubscription();
  const { goToHome, goToProfile, goTo } = useAppNavigation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } catch {
      // Use proper error handling instead of console
      alert('Logout failed. Please try again.');
    }
  }, [signOut]);

  const handleNavigateToProfile = useCallback(() => {
    goToProfile();
  }, [goToProfile]);

  const handleNavigateToUpgrade = useCallback(() => {
    goTo('/upgrade');
  }, [goTo]);

  const handleNavigateToHome = useCallback(() => {
    goToHome();
  }, [goToHome]);

  const getTierIcon = useCallback((tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'clinical':
        return <FaCrown className='text-cosmic-gold' />;
      case 'premium':
        return <FaStar className='text-cosmic-purple' />;
      default:
        return <FaUser className='text-cosmic-silver' />;
    }
  }, []);

  const getTierBadge = useCallback((tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'clinical':
        return (
          <span className='px-2 py-0.5 text-xs font-bold text-cosmic-gold bg-cosmic-gold/20 rounded-full border border-cosmic-gold/30'>
            CLINICAL
          </span>
        );
      case 'premium':
        return (
          <span className='px-2 py-0.5 text-xs font-bold text-cosmic-purple bg-cosmic-purple/20 rounded-full border border-cosmic-purple/30'>
            PREMIUM
          </span>
        );
      default:
        return (
          <span className='px-2 py-0.5 text-xs font-semibold text-cosmic-silver bg-cosmic-silver/20 rounded-full'>
            FREE
          </span>
        );
    }
  }, []);

  const openLogin = useCallback(() => {
    setAuthMode('login');
    setShowAuthModal(true);
  }, []);

  const openSignup = useCallback(() => {
    setAuthMode('signup');
    setShowAuthModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const handleLoginKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLogin();
    }
  }, [openLogin]);

  const handleSignupKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openSignup();
    }
  }, [openSignup]);

  const switchToLogin = () => {
    setAuthMode('login');
  };

  const switchToSignup = () => {
    setAuthMode('signup');
  };

  return (
    <>
      <nav className='sticky top-0 z-50 border-b shadow-lg bg-black/20 backdrop-blur-lg border-white/10 shadow-black/20'>
        <div className='container px-6 mx-auto'>
          <div className='flex items-center justify-between py-4'>
            <button 
              onClick={handleNavigateToHome}
              className='flex items-center space-x-3 transition-opacity duration-200 rounded-lg cursor-pointer group hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent'
              aria-label='Navigate to home page'
            >
              <div className='flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-full shadow-lg bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:shadow-cyan-400/30'>
                <span className='text-sm font-bold text-white'>HW</span>
              </div>
              <div>
                <h1 className='text-xl font-bold text-transparent text-white font-inter bg-gradient-to-r from-white to-cyan-200 bg-clip-text'>
                  HealWave
                </h1>
                <span className='text-xs font-medium text-cyan-300/80'>
                  Frequency Generator
                </span>
              </div>
            </button>

            <div className='flex items-center space-x-4'>
              {user ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className='flex items-center px-4 py-2 space-x-3 transition-all duration-200 border rounded-lg bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent'>
                      {/* User Avatar */}
                      <div className='flex items-center justify-center w-8 h-8 border rounded-full bg-cosmic-purple/30 border-cosmic-purple/50'>
                        <FaHeadphones className='text-sm text-cosmic-silver' />
                      </div>
                      
                      {/* User Info */}
                      <div className='text-right'>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm font-medium text-white'>
                            {user.email?.split('@')[0] ?? 'User'}
                          </span>
                          {getTierIcon(userTier)}
                        </div>
                        <div className='flex items-center justify-end mt-1 space-x-2'>
                          {getTierBadge(userTier)}
                        </div>
                      </div>
                      
                      <ChevronDownIcon className='w-4 h-4 text-white/70' />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className='min-w-[220px] bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-2 shadow-xl'>
                      {/* User Identity Header */}
                      <div className='px-3 py-2 mb-2 border-b border-white/10'>
                        <div className='flex items-center space-x-3'>
                          <div className='flex items-center justify-center w-10 h-10 border rounded-full bg-cosmic-purple/30 border-cosmic-purple/50'>
                            <FaHeadphones className='text-cosmic-silver' />
                          </div>
                          <div>
                            <p className='text-sm font-medium text-white'>
                              {user.email?.split('@')[0] ?? 'User'}
                            </p>
                            <p className='text-xs text-cyan-300'>
                              {user.email}
                            </p>
                            <div className='mt-1'>
                              {getTierBadge(userTier)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <DropdownMenu.Item 
                        className='flex items-center px-3 py-2 space-x-3 text-sm text-white transition-colors rounded-md cursor-pointer hover:bg-white/10 focus:outline-none focus:bg-white/10'
                        onSelect={handleNavigateToHome}
                      >
                        <FaMusic className='w-4 h-4' />
                        <span>Home</span>
                      </DropdownMenu.Item>
                      
                      <DropdownMenu.Item 
                        className='flex items-center px-3 py-2 space-x-3 text-sm text-white transition-colors rounded-md cursor-pointer hover:bg-white/10 focus:outline-none focus:bg-white/10'
                        onSelect={handleNavigateToProfile}
                      >
                        <FaCog className='w-4 h-4' />
                        <span>Profile & Settings</span>
                      </DropdownMenu.Item>
                      
                      <DropdownMenu.Item className='flex items-center px-3 py-2 space-x-3 text-sm text-white transition-colors rounded-md cursor-pointer hover:bg-white/10 focus:outline-none focus:bg-white/10'>
                        <FaMusic className='w-4 h-4' />
                        <span>My Presets</span>
                      </DropdownMenu.Item>
                      
                      {userTier?.toLowerCase() === 'free' && (
                        <>
                          <DropdownMenu.Separator className='h-px my-2 bg-white/20' />
                          <DropdownMenu.Item 
                            className='flex items-center px-3 py-2 space-x-3 text-sm transition-colors rounded-md cursor-pointer text-cosmic-gold hover:bg-cosmic-gold/10 focus:outline-none focus:bg-cosmic-gold/10'
                            onSelect={handleNavigateToUpgrade}
                          >
                            <FaArrowUp className='w-4 h-4' />
                            <span>Upgrade to Premium</span>
                          </DropdownMenu.Item>
                        </>
                      )}
                      
                      <DropdownMenu.Separator className='h-px my-2 bg-white/20' />
                      <DropdownMenu.Item
                        className='flex items-center px-3 py-2 space-x-3 text-sm text-red-300 transition-colors rounded-md cursor-pointer hover:bg-red-500/20 focus:outline-none focus:bg-red-500/20'
                        onSelect={() => void handleLogout()}
                      >
                        <FaSignOutAlt className='w-4 h-4' />
                        <span>Sign Out</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <div className='flex items-center space-x-3'>
                  <button
                    onClick={openLogin}
                    onKeyDown={handleLoginKeyDown}
                    className='px-4 py-2 text-sm transition-colors rounded-lg text-white/80 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2'
                    aria-label='Open login modal'
                  >
                    Login
                  </button>
                  <button
                    onClick={openSignup}
                    onKeyDown={handleSignupKeyDown}
                    className='px-6 py-2 text-sm font-medium text-white transition-all duration-200 transform rounded-lg shadow-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 hover:shadow-cyan-500/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent'
                    aria-label='Open signup modal'
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Authentication Modal using Radix Dialog */}
      <Dialog.Root open={showAuthModal} onOpenChange={setShowAuthModal}>
        <Dialog.Portal>
          <Dialog.Overlay className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0' />
          <Dialog.Content className='fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-200'>
            {/* Required for accessibility - visually hidden but read by screen readers */}
            <Dialog.Title className='sr-only'>
              {authMode === 'login' ? 'Sign in to your account' : 'Create new account'}
            </Dialog.Title>
            <Dialog.Description className='sr-only'>
              {authMode === 'login' 
                ? 'Enter your email and password to sign in to HealWave' 
                : 'Create a new HealWave account to access premium features'
              }
            </Dialog.Description>
            
            <Dialog.Close asChild>
              <button
                className='absolute z-10 flex items-center justify-center w-8 h-8 text-white transition-colors bg-red-500 rounded-full -top-4 -right-4 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent'
                aria-label='Close dialog'
              >
                <Cross2Icon className='w-4 h-4' />
              </button>
            </Dialog.Close>
            {authMode === 'login' ? (
              <Login onSwitchToSignup={switchToSignup} onClose={closeModal} />
            ) : (
              <Signup onSwitchToLogin={switchToLogin} onClose={closeModal} />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
