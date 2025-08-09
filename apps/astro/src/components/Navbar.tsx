import React, { useCallback, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FaHome, FaCalculator, FaUsers, FaStar, FaCrown, FaUser, FaChartLine, FaBook, FaBrain, FaSignOutAlt } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth, logOut } from '@cosmichub/auth';
import { useSubscription } from '@cosmichub/auth';
import { EducationalTooltip } from './EducationalTooltip';

interface NavLinkProps {
  children: React.ReactNode;
  to: string;
  icon?: React.ElementType;
  tooltip?: {
    title: string;
    description: string;
    examples?: string[];
    tier?: 'free' | 'premium' | 'elite';
  };
  tier?: 'free' | 'premium' | 'elite';
}

const NavLink: React.FC<NavLinkProps> = React.memo(({ children, to, icon: Icon, tooltip, tier }) => (
  <EducationalTooltip
    title={tooltip?.title || ''}
    description={tooltip?.description || ''}
    examples={tooltip?.examples}
    tier={tooltip?.tier || tier}
  >
    <a
      href={to}
      className="flex items-center gap-2 px-2 py-1 font-medium transition-colors rounded-md text-cosmic-silver hover:bg-cosmic-purple/20"
      onClick={(e) => {
        e.preventDefault();
        window.location.href = to; // RouterLink equivalent for <a>
      }}
    >
      {Icon && <Icon className="w-4 h-4 text-cosmic-silver" />}
      {children}
      {tier && tier !== 'free' && (
        <span className={`bg-${tier === 'elite' ? 'gold-500' : 'purple-500'}/20 text-${tier === 'elite' ? 'gold-500' : 'purple-500'} px-2 py-1 rounded text-xs`}>
          {tier === 'elite' ? '👑' : '🌟'}
        </span>
      )}
    </a>
  </EducationalTooltip>
));

NavLink.displayName = 'NavLink';

const Navbar: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { tier: userTier } = useSubscription();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [navigate]);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'elite': return <FaCrown className="text-gold-500" />;
      case 'premium': return <FaStar className="text-purple-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  return (
    <nav className="border-b bg-cosmic-dark/80 backdrop-blur-md border-cosmic-silver/20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-cosmic-gold font-cinzel">Cosmic Hub</a>
          </div>

          <div className="items-center hidden space-x-4 md:flex">
            <NavLink to="/" icon={FaHome} tooltip={{ title: 'Home', description: 'Return to the main dashboard.' }}>
              Home
            </NavLink>
            <NavLink to="/calculator" icon={FaCalculator} tooltip={{ title: 'Calculator', description: 'Calculate your natal chart or other astrological systems.' }}>
              Calculator
            </NavLink>
            <NavLink to="/numerology" icon={FaChartLine} tooltip={{ title: 'Numerology', description: 'Explore your numerology profile based on your birth data.' }}>
              Numerology
            </NavLink>
            <NavLink to="/human-design" icon={FaBook} tooltip={{ title: 'Human Design', description: 'Discover your Human Design chart and energy type.' }}>
              Human Design
            </NavLink>
            {user && (
              <>
                <NavLink to="/synastry" icon={FaUsers} tier="premium" tooltip={{ title: 'Synastry', description: 'Analyze relationship compatibility.', tier: 'premium' }}>
                  Synastry
                </NavLink>
                <NavLink to="/ai-interpretation" icon={FaBrain} tier="elite" tooltip={{ title: 'AI Analysis', description: 'Get AI-powered chart interpretations.', tier: 'elite' }}>
                  AI Analysis
                </NavLink>
                <NavLink to="/saved-charts" icon={FaChartLine} tooltip={{ title: 'Saved Charts', description: 'View your saved astrological charts.' }}>
                  Saved Charts
                </NavLink>
                <NavLink to="/profile" icon={FaUser} tooltip={{ title: 'Profile', description: 'Manage your account and subscription.' }}>
                  Profile
                </NavLink>
              </>
            )}
          </div>

          <div className="items-center hidden space-x-4 md:flex">
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center p-2 space-x-2 transition-colors rounded-full bg-cosmic-blue/30 hover:bg-cosmic-blue/50" aria-label="User Menu">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cosmic-silver/30">
                      {getTierIcon(userTier)}
                    </div>
                    <span className="text-sm font-medium text-cosmic-silver">{user.email}</span>
                    <svg className="w-4 h-4 text-cosmic-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="bg-cosmic-blue/80 backdrop-blur-md border border-cosmic-silver/20 rounded-lg shadow-lg p-2 min-w-[200px]" sideOffset={5}>
                    <DropdownMenu.Item className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-cosmic-purple/20 text-cosmic-silver focus:outline-none focus:bg-cosmic-purple/20" onSelect={() => navigate('/profile')}>
                      <FaUser />
                      <span>Profile</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="flex items-center p-2 space-x-2 rounded cursor-pointer hover:bg-cosmic-purple/20 text-cosmic-silver focus:outline-none focus:bg-cosmic-purple/20" onSelect={() => navigate('/saved-charts')}>
                      <FaChartLine />
                      <span>Saved Charts</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px my-1 bg-cosmic-silver/20" />
                    <DropdownMenu.Item className="flex items-center p-2 space-x-2 text-red-500 rounded cursor-pointer hover:bg-red-50 focus:outline-none focus:bg-red-50" onSelect={handleSignOut}>
                      <FaSignOutAlt />
                      <span>Sign Out</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink to="/login" tooltip={{ title: 'Sign In', description: 'Access your saved charts, premium features, and personalized astrological insights.' }}>
                  Sign In
                </NavLink>
                <NavLink to="/signup" tooltip={{ title: 'Create Account', description: 'Join CosmicHub to save charts, access premium features, and unlock your full astrological potential.' }}>
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-cosmic-silver hover:bg-cosmic-purple/20"
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="pb-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              <NavLink to="/" icon={FaHome}>Home</NavLink>
              <NavLink to="/calculator" icon={FaCalculator}>Calculator</NavLink>
              <NavLink to="/numerology" icon={FaChartLine}>Numerology</NavLink>
              <NavLink to="/human-design" icon={FaBook}>Human Design</NavLink>
              {user && (
                <>
                  <NavLink to="/synastry" icon={FaUsers} tier="premium">Synastry</NavLink>
                  <NavLink to="/ai-interpretation" icon={FaBrain} tier="elite">AI Analysis</NavLink>
                  <NavLink to="/saved-charts" icon={FaChartLine}>Saved Charts</NavLink>
                  <NavLink to="/profile" icon={FaUser}>Profile</NavLink>
                  <button
                    className="flex items-center gap-2 px-2 py-1 text-red-500 rounded-md hover:bg-red-50"
                    onClick={handleSignOut}
                    aria-label="Sign Out"
                  >
                    <FaSignOutAlt />
                    Sign Out
                  </button>
                </>
              )}
              {!user && (
                <>
                  <NavLink to="/login">Sign In</NavLink>
                  <NavLink to="/signup">Sign Up</NavLink>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;