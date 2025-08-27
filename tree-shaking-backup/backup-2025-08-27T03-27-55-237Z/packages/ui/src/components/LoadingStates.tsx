/**
 * Enhanced Loading States - Progressive Loading Components
 * UX Enhancement: Professional loading indicators with accessibility and mobile optimization
 */

import React, { useEffect, useState } from 'react';
import { cn } from '../utils/cn';

// Base loading spinner with cosmic theme
  color?: 'primary' | 'secondary' | 'cosmic' | 'white';
  className?: string;
  'aria-label'?: string;
}

  const sizeClasses = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    cosmic: 'border-cosmic-purple border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role='status'
      aria-label={ariaLabel}
    >
      <span className='sr-only'>{ariaLabel}...</span>
    </div>
  );
};

// Progressive loading with stages
  message?: string;
  progress?: number; // 0-100
  className?: string;
  showProgress?: boolean;
  timeout?: number; // Show timeout warning after this many ms
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stage,
  message,
  progress,
  className,
  showProgress = true,
  timeout = 15000, // 15 seconds
}) => {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      if (elapsed > timeout && stage !== 'complete') {
        setShowTimeoutWarning(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeout, stage]);

  useEffect(() => {
    if (stage === 'complete') {
      setShowTimeoutWarning(false);
    }
  }, [stage]);

  const stageMessages = {
    initializing: 'Initializing...',
    processing: 'Processing data...',
    finalizing: 'Finalizing results...',
    complete: 'Complete!',
  };

  const stageProgress = {
    initializing: 25,
    processing: 50,
    finalizing: 75,
    complete: 100,
  };

  const currentProgress = progress ?? stageProgress[stage];
  const currentMessage = message ?? stageMessages[stage];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-6',
        className
      )}
    >
      {/* Main spinner */}
      <div className='relative'>
        <LoadingSpinner size='lg' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-4 h-4 bg-gradient-to-r from-cosmic-purple to-cosmic-blue rounded-full opacity-60 animate-pulse' />
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className='w-64 bg-gray-700 rounded-full h-2 overflow-hidden'>
          <div
            className='bg-gradient-to-r from-cosmic-purple to-cosmic-blue h-full rounded-full transition-all duration-500 ease-out'
            data-progress={currentProgress}
            ref={el => {
              if (el) {
                el.style.width = `${currentProgress}%`;
              }
            }}
          />
        </div>
      )}

      {/* Stage message */}
      <div className='text-center space-y-2'>
        <div className='text-lg font-medium text-cosmic-silver'>
          {currentMessage}
        </div>
        {showProgress && (
          <div className='text-sm text-cosmic-silver/70'>
            {currentProgress}% complete
          </div>
        )}
      </div>

      {/* Timeout warning */}
      {showTimeoutWarning && (
        <div className='bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 text-center max-w-md'>
          <div className='text-yellow-300 text-sm font-medium mb-1'>
            Taking longer than expected...
          </div>
          <div className='text-yellow-200/80 text-xs'>
            This operation may take additional time for complex calculations.
          </div>
          <div className='text-yellow-200/60 text-xs mt-1'>
            Elapsed: {Math.round(elapsedTime / 1000)}s
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton loading for content areas
  className?: string;
  showAvatar?: boolean;
  showImage?: boolean;
}

  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      {showAvatar && (
        <div className='flex items-center space-x-4'>
          <div className='rounded-full bg-gray-600 h-10 w-10' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 bg-gray-600 rounded w-3/4' />
            <div className='h-3 bg-gray-700 rounded w-1/2' />
          </div>
        </div>
      )}

      {showImage && <div className='bg-gray-600 rounded-lg h-48 w-full' />}

      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-gray-600 rounded',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

// Loading overlay for interactive elements
  children: React.ReactNode;
  message?: string;
  className?: string;
  blur?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  message = 'Loading...',
  className,
  blur = true,
}) => {
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'transition-all duration-200',
          loading && blur && 'blur-sm opacity-60'
        )}
      >
        {children}
      </div>

      {loading && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50'>
          <div className='bg-cosmic-dark/90 backdrop-blur border border-cosmic-silver/30 rounded-lg p-6 text-center'>
            <LoadingSpinner size='md' className='mb-3' />
            <div className='text-cosmic-silver text-sm'>{message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline loading for buttons and small areas
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  size?: 'sm' | 'md';
}

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <LoadingSpinner size={size === 'sm' ? 'xs' : 'sm'} />
        <span
          className={cn(
            'text-cosmic-silver',
            size === 'sm' ? 'text-sm' : 'text-base'
          )}
        >
          {loadingText}
        </span>
      </div>
    );
  }

  return <>{children}</>;
};

// Card loading state with shimmer effect
  showHeader?: boolean;
  showImage?: boolean;
  headerLines?: number;
  bodyLines?: number;
}

  return (
    <div
      className={cn(
        'bg-cosmic-dark/50 border border-cosmic-silver/20 rounded-lg overflow-hidden',
        className
      )}
    >
      {showHeader && (
        <div className='bg-cosmic-purple/10 p-4 border-b border-cosmic-silver/20'>
          <div className='animate-pulse space-y-2'>
            {Array.from({ length: headerLines }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-4 bg-cosmic-silver/20 rounded',
                  i === headerLines - 1 ? 'w-2/3' : 'w-full'
                )}
              />
            ))}
          </div>
        </div>
      )}

      <div className='p-4'>
        <div className='animate-pulse space-y-3'>
          {showImage && (
            <div className='bg-cosmic-silver/20 rounded-lg h-32 w-full' />
          )}

          {Array.from({ length: bodyLines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-3 bg-cosmic-silver/20 rounded',
                i === bodyLines - 1 ? 'w-3/4' : 'w-full'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
