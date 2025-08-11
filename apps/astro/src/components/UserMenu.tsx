import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FaUser, FaChartLine, FaBolt, FaSignOutAlt, FaCrown, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  user: { email: string };
  userTier: string;
  handleSignOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = React.memo(({ user, userTier, handleSignOut }) => {
  const navigate = useNavigate();

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'elite': return <FaCrown className="text-gold-500" />;
      case 'premium': return <FaStar className="text-purple-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'elite':
        return <span className="px-2 py-1 text-xs font-bold text-gold-900 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full">ELITE</span>;
      case 'premium':
        return <span className="px-2 py-1 text-xs font-bold text-purple-900 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full">PRO</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">FREE</span>;
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-3 p-2 rounded-lg bg-cosmic-blue/20 hover:bg-cosmic-blue/30 transition-colors"
          aria-label="User Menu"
        >
          <div className="w-8 h-8 rounded-full bg-cosmic-silver/20 flex items-center justify-center">
            {getTierIcon(userTier)}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-cosmic-silver truncate max-w-32">{user.email}</span>
            {getTierBadge(userTier)}
          </div>
          <svg className="w-4 h-4 text-cosmic-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-cosmic-dark/95 backdrop-blur-lg border border-cosmic-silver/20 rounded-lg p-2 min-w-[200px] shadow-lg"
          sideOffset={8}
        >
          <DropdownMenu.Item
            className="flex items-center gap-2 p-2 rounded-md hover:bg-cosmic-purple/10 text-cosmic-silver cursor-pointer transition-colors"
            onSelect={() => navigate('/profile')}
          >
            <FaUser />
            Profile
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center gap-2 p-2 rounded-md hover:bg-cosmic-purple/10 text-cosmic-silver cursor-pointer transition-colors"
            onSelect={() => navigate('/saved-charts')}
          >
            <FaChartLine />
            Saved Charts
          </DropdownMenu.Item>
          {userTier === 'free' && (
            <DropdownMenu.Item
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gold-500/10 text-gold-400 cursor-pointer transition-colors"
              onSelect={() => navigate('/upgrade')}
            >
              <FaBolt />
              Upgrade to Pro
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="h-px my-2 bg-cosmic-silver/20" />
          <DropdownMenu.Item
            className="flex items-center gap-2 p-2 rounded-md hover:bg-red-900/10 text-red-400 cursor-pointer transition-colors"
            onSelect={handleSignOut}
          >
            <FaSignOutAlt />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
});

UserMenu.displayName = 'UserMenu';

export default UserMenu;