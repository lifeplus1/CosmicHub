import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Cross2Icon, ChevronDownIcon } from '@radix-ui/react-icons';
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
      <nav className='sticky top-0 z-50 border-b bg-black/20 backdrop-blur-lg border-white/10 shadow-lg shadow-black/20'>
        <div className='container px-6 mx-auto'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center space-x-3 group'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 shadow-lg group-hover:shadow-cyan-400/30 transition-all duration-300'>
                <span className='text-sm font-bold text-white'>HW</span>
              </div>
              <div>
                <h1 className='text-xl font-bold text-white font-inter bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent'>
                  HealWave
                </h1>
                <span className='text-xs text-cyan-300/80 font-medium'>
                  Frequency Generator
                </span>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              {user ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className='flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent'>
                      <div className='text-right'>
                        <div className='text-sm font-medium text-white'>
                          {user.email?.split('@')[0] ?? 'User'}
                        </div>
                        <div className='text-xs text-cyan-300'>
                          Authenticated
                        </div>
                      </div>
                      <ChevronDownIcon className='w-4 h-4 text-white/70' />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className='min-w-[200px] bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-2 shadow-xl'>
                      <DropdownMenu.Item className='flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 cursor-pointer transition-colors focus:outline-none focus:bg-white/10'>
                        Profile Settings
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className='flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 cursor-pointer transition-colors focus:outline-none focus:bg-white/10'>
                        My Presets
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator className='h-px my-2 bg-white/20' />
                      <DropdownMenu.Item
                        className='flex items-center px-3 py-2 text-sm text-red-300 rounded-md hover:bg-red-500/20 cursor-pointer transition-colors focus:outline-none focus:bg-red-500/20'
                        onSelect={() => void handleLogout()}
                      >
                        Sign Out
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <div className='flex items-center space-x-3'>
                  <button
                    onClick={openLogin}
                    className='px-4 py-2 text-sm text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/5'
                  >
                    Login
                  </button>
                  <button
                    onClick={openSignup}
                    className='px-6 py-2 text-sm text-white font-medium bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent'
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
          <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0' />
          <Dialog.Content className='fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-200'>
            <Dialog.Close asChild>
              <button
                className='absolute -top-4 -right-4 z-10 flex items-center justify-center w-8 h-8 text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent'
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
};

export default Navbar;
