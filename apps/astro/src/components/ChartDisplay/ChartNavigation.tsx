import React, { memo, useCallback, useMemo } from 'react';

export interface ChartSection {
  id: string;
  title: string;
  icon: string;
  count?: number;
  isActive?: boolean;
}

export interface ChartNavigationProps {
  /** Available chart sections */
  sections: ChartSection[];
  /** Currently active section */
  activeSection: string;
  /** Section change handler */
  onSectionChange: (sectionId: string) => void;
  /** Show section counts */
  showCounts?: boolean;
  /** Navigation style */
  variant?: 'tabs' | 'pills' | 'sidebar';
}

/**
 * Navigation component for chart sections
 * Provides tabs/pills for switching between chart views
 */
export const ChartNavigation: React.FC<ChartNavigationProps> = memo(({
  sections,
  activeSection,
  onSectionChange,
  showCounts = true,
  variant = 'tabs'
}) => {
  // Memoize section handlers
  const sectionHandlers = useMemo(() => {
    const handlers: Record<string, () => void> = {};
    sections.forEach(section => {
      handlers[section.id] = () => onSectionChange(section.id);
    });
    return handlers;
  }, [sections, onSectionChange]);

  // Get navigation styles based on variant
  const getNavStyles = useCallback(() => {
    switch (variant) {
      case 'pills':
        return {
          container: 'flex flex-wrap gap-2 p-2',
          item: 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
          active: 'bg-cosmic-purple text-white shadow-lg shadow-cosmic-purple/25',
          inactive: 'bg-cosmic-silver/10 text-cosmic-silver hover:bg-cosmic-silver/20'
        };
      case 'sidebar':
        return {
          container: 'flex flex-col gap-1 p-2',
          item: 'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left',
          active: 'bg-cosmic-purple text-white',
          inactive: 'text-cosmic-silver hover:bg-cosmic-silver/10'
        };
      default: // tabs
        return {
          container: 'flex border-b border-cosmic-purple/20',
          item: 'px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2',
          active: 'border-cosmic-purple text-cosmic-purple',
          inactive: 'border-transparent text-cosmic-silver hover:text-cosmic-purple hover:border-cosmic-purple/50'
        };
    }
  }, [variant]);

  const navStyles = getNavStyles();

  return (
    <nav
      className={navStyles.container}
      role='tablist'
      aria-label='Chart sections navigation'
    >
      {sections.map((section) => {
        const isActive = section.id === activeSection;
        const buttonClass = `${navStyles.item} ${isActive ? navStyles.active : navStyles.inactive}`;
        const ariaControls = `chart-section-${section.id}`;
        const tabId = `chart-tab-${section.id}`;
        
        return (
          <button
            key={section.id}
            onClick={sectionHandlers[section.id]}
            className={buttonClass}
            role='tab'
            {...(isActive ? { 'aria-selected': 'true' } : { 'aria-selected': 'false' })}
            aria-controls={ariaControls}
            id={tabId}
            type='button'
          >
            <div className='flex items-center gap-2'>
              <span className='text-base' aria-hidden='true'>
                {section.icon}
              </span>
              <span>{section.title}</span>
              {showCounts && section.count !== undefined && (
                <span
                  className={`
                    ml-2 px-2 py-0.5 text-xs rounded-full
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-cosmic-purple/20 text-cosmic-purple'
                    }
                  `}
                  aria-label={`${section.count} items`}
                >
                  {section.count}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
});

ChartNavigation.displayName = 'ChartNavigation';
