import React from 'react';
import { AccessibleButton } from '@cosmichub/ui';

interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: string;
    isActive: boolean;
    count?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`mobile-tabs-container ${className}`}>
      {/* Mobile horizontal scroll tabs */}
      <div className='flex overflow-x-auto gap-2 mb-6 bg-cosmic-black/30 p-2 rounded-lg scrollbar-hide'>
        {tabs.map((tab) => (
          <AccessibleButton
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all ${
              tab.isActive
                ? 'bg-cosmic-purple/30 text-cosmic-gold border border-cosmic-purple/50'
                : 'text-cosmic-silver hover:bg-cosmic-purple/10 hover:text-cosmic-gold'
            }`}
            accessibleName={`${tab.label} Tab${tab.isActive ? ' - Active' : ''}`}
          >
            <span className='mr-2'>{tab.icon}</span>
            <span className='whitespace-nowrap'>{tab.label}</span>
            {tab.count && tab.count > 0 && (
              <span className='ml-2 px-1.5 py-0.5 text-xs bg-cosmic-purple/50 rounded-full'>
                {tab.count}
              </span>
            )}
          </AccessibleButton>
        ))}
      </div>
    </div>
  );
};

interface ResponsiveChartContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  className?: string;
}

export const ResponsiveChartContainer: React.FC<ResponsiveChartContainerProps> = ({
  children,
  title,
  subtitle,
  isLoading = false,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`responsive-chart-container ${className}`}>
        <div className='cosmic-card bg-gradient-to-br from-cosmic-purple/20 to-cosmic-blue/20 border border-cosmic-purple/30'>
          <div className='p-4 sm:p-6 text-center'>
            <div className='animate-spin w-8 h-8 border-2 border-cosmic-purple border-t-transparent rounded-full mx-auto mb-4'></div>
            <h3 className='text-lg font-semibold text-cosmic-purple mb-2'>{title}</h3>
            {subtitle && (
              <p className='text-cosmic-silver text-sm'>{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`responsive-chart-container ${className}`}>
      <div className='cosmic-card bg-gradient-to-br from-cosmic-purple/10 to-cosmic-blue/10 border border-cosmic-purple/20'>
        <div className='p-4 sm:p-6'>
          <div className='mb-4 sm:mb-6'>
            <h2 className='text-xl sm:text-2xl font-bold text-cosmic-purple mb-2'>
              {title}
            </h2>
            {subtitle && (
              <p className='text-cosmic-silver text-sm sm:text-base'>
                {subtitle}
              </p>
            )}
          </div>
          
          <div className='chart-content'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccessibilityIndicatorProps {
  score?: number;
  improvements?: string[];
  className?: string;
}

export const AccessibilityIndicator: React.FC<AccessibilityIndicatorProps> = ({
  score = 100,
  improvements = [],
  className = ''
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/20';
    if (score >= 70) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className={`accessibility-indicator ${className}`}>
      <div className='flex items-center justify-between p-3 bg-cosmic-black/20 rounded-lg'>
        <div className='flex items-center space-x-3'>
          <span className='text-sm text-cosmic-silver'>WCAG 2.1 AA</span>
          <div className={`px-2 py-1 rounded text-xs font-semibold ${getScoreBg(score)} ${getScoreColor(score)}`}>
            {score}%
          </div>
        </div>
        
        {score >= 90 ? (
          <span className='text-green-400'>✓ Accessible</span>
        ) : (
          <span className='text-yellow-400'>⚠ Improving</span>
        )}
      </div>
      
      {improvements.length > 0 && (
        <div className='mt-2 text-xs text-cosmic-silver/70'>
          <details>
            <summary className='cursor-pointer hover:text-cosmic-silver'>
              Accessibility Improvements ({improvements.length})
            </summary>
            <ul className='mt-2 space-y-1 pl-4'>
              {improvements.map((improvement, index) => (
                <li key={index} className='flex items-start'>
                  <span className='text-yellow-400 mr-2'>→</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
};

// Hook for responsive behavior
export const useResponsiveCharts = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);

  React.useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};

export default {
  MobileTabs,
  ResponsiveChartContainer,
  AccessibilityIndicator,
  useResponsiveCharts
};
