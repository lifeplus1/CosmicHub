/**
 * Mobile Responsiveness Enhancements
 * UX Enhancement: Advanced mobile-first responsive components and utilities
 */

// Ensure global JSX namespace is available; if using React 17+ with jsx runtime, keep React import for types
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';

// Responsive breakpoint detection hook
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<
    'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  >('md');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      let currentBreakpoint: typeof breakpoint;

      if (width < 480) {
        currentBreakpoint = 'xs';
      } else if (width < 640) {
        currentBreakpoint = 'sm';
      } else if (width < 768) {
        currentBreakpoint = 'md';
      } else if (width < 1024) {
        currentBreakpoint = 'lg';
      } else if (width < 1280) {
        currentBreakpoint = 'xl';
      } else {
        currentBreakpoint = '2xl';
      }

      setBreakpoint(currentBreakpoint);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);

    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    width: {
      xs: breakpoint === 'xs',
      sm: breakpoint === 'sm',
      md: breakpoint === 'md',
      lg: breakpoint === 'lg',
      xl: breakpoint === 'xl',
      '2xl': breakpoint === '2xl',
    },
  };
};

// Responsive container with safe areas
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  safeArea?: boolean;
  centerContent?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  safeArea = true,
  centerContent = false,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    xs: 'px-2 sm:px-3',
    sm: 'px-3 sm:px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        safeArea && 'safe-area-padding',
        centerContent && 'flex items-center justify-center min-h-screen',
        className
      )}
    >
      {children}
    </div>
  );
};

// Responsive grid system
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  autoRows?: boolean;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  autoRows = false,
}) => {
  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1 sm:gap-2',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
    xl: 'gap-6 sm:gap-8 lg:gap-12',
  };

  const getGridCols = (breakpoint: keyof typeof cols, count: number) => {
    const colClasses: Record<string, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    };

    const prefix = breakpoint === 'xs' ? '' : `${breakpoint}:`;
    return `${prefix}${colClasses[count] ?? `grid-cols-${count}`}`;
  };

  const gridColsClasses = Object.entries(cols)
    .map(([breakpoint, count]) =>
      count ? getGridCols(breakpoint as keyof typeof cols, count) : ''
    )
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cn(
        'grid',
        gridColsClasses,
        gapClasses[gap],
        autoRows && 'grid-rows-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

// Mobile-optimized modal/drawer
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  backdrop?: boolean;
  closeOnBackdrop?: boolean;
  showHandle?: boolean;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className,
  position = 'bottom',
  backdrop = true,
  closeOnBackdrop = true,
  showHandle = true,
}) => {
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return {
          container: 'items-end',
          content: isOpen ? 'translate-y-0' : 'translate-y-full',
          contentClass: 'w-full rounded-t-xl',
        };
      case 'top':
        return {
          container: 'items-start',
          content: isOpen ? 'translate-y-0' : '-translate-y-full',
          contentClass: 'w-full rounded-b-xl',
        };
      case 'left':
        return {
          container: 'items-center justify-start',
          content: isOpen ? 'translate-x-0' : '-translate-x-full',
          contentClass: 'h-full max-w-sm w-full rounded-r-xl',
        };
      case 'right':
        return {
          container: 'items-center justify-end',
          content: isOpen ? 'translate-x-0' : 'translate-x-full',
          contentClass: 'h-full max-w-sm w-full rounded-l-xl',
        };
      default:
        return {
          container: 'items-end',
          content: isOpen ? 'translate-y-0' : 'translate-y-full',
          contentClass: 'w-full rounded-t-xl',
        };
    }
  };

  const { container, content, contentClass } = getPositionClasses();

  if (!isMobile) {
    // On desktop, render as a regular modal
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center transition-all duration-300',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      >
        {backdrop && (
          <div
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={handleBackdropClick}
            onKeyDown={e => {
              if (e.key === 'Escape' && closeOnBackdrop) {
                onClose();
              }
            }}
            role='button'
            tabIndex={0}
            aria-label='Close modal'
          />
        )}
        <div
          className={cn(
            'relative bg-cosmic-dark border border-cosmic-silver/30 rounded-xl max-w-md w-full mx-4',
            className
          )}
        >
          {title && (
            <div className='flex items-center justify-between p-4 border-b border-cosmic-silver/20'>
              <h2 className='text-lg font-semibold text-cosmic-gold'>
                {title}
              </h2>
              <button
                type='button'
                onClick={onClose}
                className='text-cosmic-silver hover:text-cosmic-gold focus:outline-none'
                aria-label='Close modal'
              >
                <svg
                  className='w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          )}
          <div className='p-4'>{children}</div>
        </div>
      </div>
    );
  }

  // Mobile drawer
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex transition-all duration-300',
        container,
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      )}
    >
      {backdrop && (
        <div
          className='absolute inset-0 bg-black/50 backdrop-blur-sm'
          onClick={handleBackdropClick}
          onKeyDown={e => {
            if (e.key === 'Escape' && closeOnBackdrop) {
              onClose();
            }
          }}
          role='button'
          tabIndex={0}
          aria-label='Close drawer'
        />
      )}

      <div
        className={cn(
          'relative bg-cosmic-dark border border-cosmic-silver/30 transform transition-transform duration-300 ease-out',
          contentClass,
          content,
          className
        )}
      >
        {/* Pull handle for bottom drawer */}
        {showHandle && position === 'bottom' && (
          <div className='flex justify-center pt-3 pb-1'>
            <div className='w-10 h-1 bg-cosmic-silver/40 rounded-full' />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className='flex items-center justify-between p-4 border-b border-cosmic-silver/20'>
            <h2 className='text-lg font-semibold text-cosmic-gold'>{title}</h2>
            <button
              type='button'
              onClick={onClose}
              className='text-cosmic-silver hover:text-cosmic-gold focus:outline-none'
              aria-label='Close drawer'
            >
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            'overflow-y-auto',
            position === 'bottom' && 'max-h-[85vh]',
            position === 'top' && 'max-h-[85vh]',
            (position === 'left' || position === 'right') && 'h-full'
          )}
        >
          <div className='p-4 pb-safe'>{children}</div>
        </div>
      </div>
    </div>
  );
};

// Touch-optimized button
interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  haptic?: boolean; // For future haptic feedback
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  haptic = false,
  disabled,
  onClick,
  ...props
}) => {
  const { isMobile } = useBreakpoint();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // Add haptic feedback for mobile devices (if supported)
      if (haptic && isMobile && 'vibrate' in navigator) {
        navigator.vibrate(10); // Short vibration
      }

      if (onClick && !loading && !disabled) {
        onClick(e);
      }
    },
    [haptic, isMobile, onClick, loading, disabled]
  );

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-white hover:from-cosmic-purple/80 hover:to-cosmic-blue/80',
    secondary:
      'bg-cosmic-silver/20 text-cosmic-silver border border-cosmic-silver/30 hover:bg-cosmic-silver/30',
    ghost: 'text-cosmic-silver hover:bg-cosmic-silver/10',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizeClasses = {
    sm: isMobile ? 'px-3 py-2 text-sm min-h-[44px]' : 'px-3 py-1.5 text-sm',
    md: isMobile ? 'px-4 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-base',
    lg: isMobile ? 'px-6 py-4 text-lg min-h-[52px]' : 'px-6 py-3 text-lg',
  };

  return (
    <button
      type='button'
      className={cn(
        'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cosmic-purple/50 active:transform active:scale-95',
        'touch-manipulation', // Optimize for touch
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (loading || disabled) && 'opacity-50 cursor-not-allowed',
        isMobile && 'select-none', // Prevent text selection on mobile
        className
      )}
      disabled={loading || disabled}
      onClick={handleClick}
      {...props}
    >
      {loading ? (
        <div className='flex items-center justify-center gap-2'>
          <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Responsive text that scales with screen size
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  responsive?: boolean;
}
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  as = 'p',
  size = 'md',
  weight = 'normal',
  responsive = true,
}) => {
  const Component = as as keyof React.ReactHTML;

  const sizeClasses = responsive
    ? {
        xs: 'text-xs sm:text-sm',
        sm: 'text-sm sm:text-base',
        md: 'text-base sm:text-lg',
        lg: 'text-lg sm:text-xl lg:text-2xl',
        xl: 'text-xl sm:text-2xl lg:text-3xl',
        '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
        '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
      }
    : {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
      };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Component
      className={cn(sizeClasses[size], weightClasses[weight], className)}
    >
      {children}
    </Component>
  );
};

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className,
  padding = 'md',
  interactive = false,
  loading = false,
  header,
  footer,
}) => {
  const { isMobile } = useBreakpoint();

  const paddingClasses = {
    none: '',
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-6' : 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-cosmic-dark/50 border border-cosmic-silver/20 backdrop-blur-sm',
        isMobile ? 'rounded-lg' : 'rounded-xl',
        interactive &&
          'hover:bg-cosmic-dark/60 transition-colors cursor-pointer',
        loading && 'animate-pulse',
        className
      )}
    >
      {header && (
        <div className='border-b border-cosmic-silver/20 p-4'>{header}</div>
      )}

      <div className={paddingClasses[padding]}>{children}</div>

      {footer && (
        <div className='border-t border-cosmic-silver/20 p-4'>{footer}</div>
      )}
    </div>
  );
};
