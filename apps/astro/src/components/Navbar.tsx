import React, { useCallback, useState, lazy, Suspense } from 'react';
import { devConsole } from '../config/environment';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FaHome, FaCalculator, FaUsers, FaStar, FaCrown, FaUser, FaChartLine, FaBook, FaBrain, FaSignOutAlt, FaGlobe, FaCompass, FaChevronDown, FaTools, FaKey } from 'react-icons/fa';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useSubscription } from '@cosmichub/auth';
import { EducationalTooltip } from './EducationalTooltip';

// Lazy load components for performance
const UserMenu = lazy(() => import('./UserMenu'));

// Type definitions for navigation items
interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  tooltip: {
    title: string;
    description: string;
    examples?: string[];
    tier?: 'free' | 'premium' | 'elite';
  };
  tier?: 'free' | 'premium' | 'elite';
}

interface DropdownNavItem {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

// Using type instead of interface for inheritance to avoid empty interface warnings
type NavLinkProps = NavItem;

// Using type instead of interface for inheritance to avoid empty interface warnings
type DropdownNavProps = DropdownNavItem;

const NavLink: React.FC<NavLinkProps> = React.memo(({ to, icon: Icon, label, tooltip, tier }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        navigate(to);
      } catch (error) {
  devConsole.error('Navigation error:', error);
        window.location.href = to;
      }
    },
    [navigate, to]
  );

  return (
    <EducationalTooltip {...tooltip}>
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 min-h-[44px] ${
          isActive
            ? 'bg-gradient-to-r from-cosmic-purple/30 to-cosmic-blue/30 text-cosmic-gold border-cosmic-purple/50 shadow-md'
            : 'text-cosmic-silver hover:bg-cosmic-purple/10 hover:text-cosmic-gold'
        }`}
        aria-label={`Navigate to ${label}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
        {tier && tier !== 'free' && (
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
            tier === 'elite' ? 'bg-gold-500/20 text-gold-500 border-gold-500/30' : 'bg-purple-500/20 text-purple-500 border-purple-500/30'
          }`}>
            {tier === 'elite' ? '👑' : '🌟'}
          </span>
        )}
      </button>
    </EducationalTooltip>
  );
});

NavLink.displayName = 'NavLink';

// Dropdown Navigation Component
const DropdownNav: React.FC<DropdownNavProps> = React.memo(({ label, icon: Icon, items }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if any dropdown item is active
  const isDropdownActive = items.some(item => location.pathname === item.to);

  const handleItemClick = useCallback((to: string) => {
    try {
      navigate(to);
    } catch (error) {
  devConsole.error('Navigation error:', error);
      window.location.href = to;
    }
  }, [navigate]);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 min-h-[44px] group ${
            isDropdownActive
              ? 'bg-gradient-to-r from-cosmic-purple/30 to-cosmic-blue/30 text-cosmic-gold border-cosmic-purple/50 shadow-md'
              : 'text-cosmic-silver hover:bg-cosmic-purple/10 hover:text-cosmic-gold'
          }`}
          aria-label={`${label} menu`}
        >
          <Icon className="w-5 h-5" />
          <span className="hidden sm:inline">{label}</span>
          <FaChevronDown className="w-3 h-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[220px] bg-cosmic-dark/95 backdrop-blur-lg border border-cosmic-silver/20 rounded-lg shadow-xl p-2 mt-2"
          sideOffset={5}
          align="start"
        >
          {items.map((item) => (
            <DropdownMenu.Item key={item.to} asChild>
              <EducationalTooltip {...item.tooltip}>
                <button
                  onClick={() => handleItemClick(item.to)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors duration-200 text-left ${
                    location.pathname === item.to
                      ? 'bg-cosmic-purple/30 text-cosmic-gold'
                      : 'text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{item.label}</span>
                    {item.tier && item.tier !== 'free' && (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.tier === 'elite' 
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {item.tier === 'elite' ? '👑 Elite' : '🌟 Premium'}
                      </span>
                    )}
                  </div>
                </button>
              </EducationalTooltip>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
});

DropdownNav.displayName = 'DropdownNav';

const Navbar: React.FC = React.memo(() => {
  const { user, signOut } = useAuth();
  const { tier: userTier } = useSubscription();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      devConsole.error('Sign out error:', error);
    }
  }, [signOut, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  // Consolidated navigation items - now organized into dropdowns
  const coreNavItems: NavItem[] = [
    { 
      to: '/', 
      icon: FaHome, 
      label: 'Home',
      tooltip: { title: 'Home', description: 'Your personal cosmic dashboard with personalized insights.' }
    },
    { 
      to: '/chart', 
      icon: FaCompass, 
      label: 'Interactive Chart',
      tooltip: { title: 'Interactive Chart', description: 'Explore your birth chart with beautiful D3.js visualizations and interactive elements.' }
    }
  ];

  // Grouped navigation for dropdowns
  const chartingTools: NavItem[] = [
    { 
      to: '/calculator', 
      icon: FaCalculator, 
      label: 'Chart Calculator',
      tooltip: { title: 'Chart Calculator', description: 'Calculate natal charts, transits, and progressions with precise astronomical data.' }
    },
    { 
      to: '/multi-system', 
      icon: FaGlobe, 
      label: 'Multi-System Analysis',
      tooltip: { title: 'Multi-System Charts', description: 'Compare Western, Vedic, Chinese, and other astrological systems side by side.' }
    },
    ...(user !== null ? [
      { 
        to: '/saved-charts', 
        icon: FaChartLine, 
        label: 'Saved Charts',
        tooltip: { title: 'Saved Charts', description: 'Access and manage your collection of saved astrological charts.' }
      }
    ] : [])
  ];

  const personalInsights: NavItem[] = [
    { 
      to: '/numerology', 
      icon: FaChartLine, 
      label: 'Numerology',
      tooltip: { title: 'Numerology Calculator', description: 'Discover your life path number, destiny number, and numerological patterns.' }
    },
    { 
      to: '/human-design', 
      icon: FaBook, 
      label: 'Human Design',
      tooltip: { title: 'Human Design System', description: 'Explore your Human Design chart and discover your type, strategy, and authority.' }
    },
    { 
      to: '/gene-keys', 
      icon: FaKey, 
      label: 'Gene Keys',
      tooltip: { title: 'Gene Keys Profile', description: 'Journey through the contemplative path of consciousness evolution with your genetic blueprint.' }
    }
  ];

  const premiumFeatures: NavItem[] = user !== null ? [
    { 
      to: '/synastry', 
      icon: FaUsers, 
      label: 'Synastry Analysis',
      tier: 'premium' as const,
      tooltip: { title: 'Synastry & Compatibility', description: 'Analyze relationship compatibility through comprehensive chart comparison.', tier: 'premium' as const }
    },
    { 
      to: '/ai-interpretation', 
      icon: FaBrain, 
      label: 'AI Insights',
      tier: 'elite' as const,
      tooltip: { title: 'AI-Powered Analysis', description: 'Get personalized interpretations powered by advanced AI technology.', tier: 'elite' as const }
    }
  ] : [];

  // Dropdown menu configuration
  const dropdownMenus: DropdownNavItem[] = [
    {
      label: 'Charts',
      icon: FaTools,
      items: chartingTools
    },
    {
      label: 'Insights',
      icon: FaBrain,
      items: personalInsights
    },
    ...(user !== null && premiumFeatures.length > 0 ? [{
      label: 'Premium',
      icon: FaCrown,
      items: premiumFeatures
    }] : [])
  ];

  return (
    <nav className="sticky top-0 z-50 bg-cosmic-dark/95 backdrop-blur-lg border-b border-cosmic-silver/10 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <RouterLink 
            to="/" 
            className="flex items-center gap-3 text-2xl font-bold text-cosmic-gold font-cinzel hover:scale-105 transition-all duration-300 group"
          >
            <div className="relative">
              <FaStar className="text-cosmic-gold group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 bg-cosmic-gold/20 rounded-full blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="bg-gradient-to-r from-cosmic-gold to-cosmic-purple bg-clip-text text-transparent">
              Cosmic Hub
            </span>
          </RouterLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Core navigation items */}
            {coreNavItems.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
            
            {/* Dropdown menus */}
            {dropdownMenus.map((dropdown) => (
              <DropdownNav key={dropdown.label} {...dropdown} />
            ))}
          </div>

          {/* User Menu / Auth */}
          <div className="hidden md:flex items-center gap-4">
            <Suspense fallback={<div className="w-24 h-10 bg-cosmic-purple/20 rounded-lg animate-pulse" />}>
              {user?.email !== null && user?.email !== undefined ? (
                <UserMenu 
                  user={{ email: user.email }} 
                  userTier={userTier} 
                  handleSignOut={handleSignOut as () => void} 
                />
              ) : (
                <div className="flex items-center gap-3">
                  <NavLink 
                    to="/login"
                    icon={FaUser}
                    label="Sign In"
                    tooltip={{ title: 'Sign In', description: 'Access your account and unlock premium astrological features.' }}
                  />
                  <button
                    onClick={() => void navigate('/signup')}
                    className="px-6 py-2 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 border border-cosmic-gold/20"
                    aria-label="Sign Up for Cosmic Hub"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </Suspense>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-cosmic-silver hover:bg-cosmic-purple/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50"
            aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            {...(isMobileMenuOpen ? { 'aria-expanded': 'true' } : { 'aria-expanded': 'false' })}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'} 
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 px-2 bg-cosmic-dark/98 backdrop-blur-lg border-t border-cosmic-silver/10 rounded-b-lg shadow-xl">
            <div className="space-y-2">
              {/* Core items in mobile */}
              {coreNavItems.map((item) => (
                <div 
                  key={item.to} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  onKeyDown={(e) => { 
                    if (e.key === 'Enter' || e.key === ' ') {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Navigate to ${item.label} and close menu`}
                >
                  <NavLink {...item} />
                </div>
              ))}
              
              {/* Chart tools section */}
              <div className="pt-2 border-t border-cosmic-silver/10">
                <h3 className="px-4 py-2 text-sm font-semibold text-cosmic-gold uppercase tracking-wider">
                  Chart Tools
                </h3>
                {chartingTools.map((item) => (
                  <div 
                    key={item.to} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Navigate to ${item.label} and close menu`}
                  >
                    <NavLink {...item} />
                  </div>
                ))}
              </div>
              
              {/* Personal Insights section */}
              <div className="pt-2 border-t border-cosmic-silver/10">
                <h3 className="px-4 py-2 text-sm font-semibold text-cosmic-gold uppercase tracking-wider">
                  Personal Insights
                </h3>
                {personalInsights.map((item) => (
                  <div 
                    key={item.to} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Navigate to ${item.label} and close menu`}
                  >
                    <NavLink {...item} />
                  </div>
                ))}
              </div>
              
              {/* Premium features section */}
              {user !== null && premiumFeatures.length > 0 && (
                <div className="pt-2 border-t border-cosmic-silver/10">
                  <h3 className="px-4 py-2 text-sm font-semibold text-cosmic-gold uppercase tracking-wider flex items-center gap-2">
                    <FaCrown className="text-yellow-400" />
                    Premium Features
                  </h3>
                  {premiumFeatures.map((item) => (
                    <div 
                      key={item.to} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter' || e.key === ' ') {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Navigate to ${item.label} and close menu`}
                    >
                      <NavLink {...item} />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Auth section */}
              <div className="pt-4 border-t border-cosmic-silver/10">
                {user?.email !== null && user?.email !== undefined ? (
                  <button
                    onClick={() => {
                      void handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 rounded-lg hover:bg-red-900/10 transition-colors duration-200 font-medium"
                    aria-label="Sign Out"
                  >
                    <FaSignOutAlt />
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div 
                      onClick={() => setIsMobileMenuOpen(false)}
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter' || e.key === ' ') {
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label="Navigate to sign in and close menu"
                    >
                      <NavLink 
                        to="/login"
                        icon={FaUser}
                        label="Sign In"
                        tooltip={{ title: 'Sign In', description: 'Access your account and premium features.' }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        navigate('/signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple text-cosmic-dark rounded-lg font-semibold transition-all duration-300"
                      aria-label="Sign Up"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;