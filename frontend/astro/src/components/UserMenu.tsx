import React, { useCallback } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FaUser, FaCrown, FaStar, FaCog, FaSignOutAlt, FaChartLine, FaSave, FaCreditCard } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastProvider';
import { logOut } from '../auth';
import type { COSMICHUB_TIERS } from '../types/subscription';

interface UserMenuProps {
  userInfo?: {
    email: string;
  } | null;
}

const UserMenu: React.FC<UserMenuProps> = React.memo(({ userInfo }) => {
  const { user } = useAuth();
  const { userTier } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = useCallback(async () => {
    try {
      await logOut();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [navigate, toast]);

  const getTierIcon = (tier: keyof typeof COSMICHUB_TIERS) => {
    switch (tier) {
      case 'free': return <FaUser className="text-gray-500" />;
      case 'premium': return <FaStar className="text-purple-500" />;
      case 'elite': return <FaCrown className="text-orange-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getTierColor = (tier: keyof typeof COSMICHUB_TIERS) => {
    switch (tier) {
      case 'free': return 'gray-500';
      case 'premium': return 'purple-500';
      case 'elite': return 'orange-500';
      default: return 'gray-500';
    }
  };

  const isPremium = userTier === 'premium' || userTier === 'elite';

  if (!user) return null;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center p-2 space-x-2 transition-colors rounded-full bg-cosmic-blue/30 hover:bg-cosmic-blue/50" aria-label="User Menu">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cosmic-silver/30">
            <FaUser className="text-cosmic-silver" />
          </div>
          <span className="text-sm font-medium text-cosmic-silver">{userInfo?.email || user.email}</span>
          <svg className="w-4 h-4 text-cosmic-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-cosmic-blue/80 backdrop-blur-md border border-cosmic-silver/20 rounded-lg shadow-lg p-2 min-w-[200px]" sideOffset={5}>
          <DropdownMenu.Item className="flex items-center p-2 space-x-2 rounded hover:bg-cosmic-purple/20 text-cosmic-silver focus:outline-none focus:bg-cosmic-purple/20">
            <div className="flex items-center space-x-2">
              {getTierIcon(userTier)}
              <span className="text-sm">{userInfo?.email || user.email}</span>
            </div>
            <span className={`bg-${getTierColor(userTier)}/20 text-${getTierColor(userTier)} px-2 py-1 rounded text-sm font-semibold uppercase`}>
              {userTier}
            </span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px my-1 bg-cosmic-silver/20" />

          <DropdownMenu.Item className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-cosmic-purple/20 text-cosmic-silver focus:outline-none focus:bg-cosmic-purple/20" onSelect={() => navigate('/profile')}>
            <FaUser />
            <span>View Profile</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-cosmic-purple/20 text-cosmic-silver focus:outline-none focus:bg-cosmic-purple/20" onSelect={() => navigate('/saved-charts')}>
            <FaSave />
            <span>Saved Charts</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-cosmic-purple/20 text-cosmic-silver focus:outline-none focus:bg-cosmic-purple/20" onSelect={() => navigate('/calculator')}>
            <FaChartLine />
            <span>Chart Calculator</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px my-1 bg-cosmic-silver/20" />

          {isPremium ? (
            <DropdownMenu.Item className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-cosmic-purple/20 text-cosmic-silver focus:outline-none focus:bg-cosmic-purple/20" onSelect={() => navigate('/profile')}>
              <FaCreditCard />
              <span>Manage Subscription</span>
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item className="flex items-center p-2 space-x-2 font-medium text-purple-600 rounded cursor-pointer hover:bg-cosmic-purple/20 focus:outline-none focus:bg-cosmic-purple/20" onSelect={() => navigate('/premium')}>
              <FaStar className="text-purple-500" />
              <span>🌟 Upgrade to Premium</span>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Item className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-cosmic-purple/20 text-cosmic-silver focus:outline-none focus:bg-cosmic-purple/20" onSelect={() => navigate('/profile')}>
            <FaCog />
            <span>Account Settings</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px my-1 bg-cosmic-silver/20" />

          <DropdownMenu.Item className="flex items-center p-2 space-x-2 text-red-500 rounded cursor-pointer hover:bg-red-50 focus:outline-none focus:bg-red-50" onSelect={handleLogout}>
            <FaSignOutAlt />
            <span>Sign Out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
});

UserMenu.displayName = 'UserMenu';

export default UserMenu;