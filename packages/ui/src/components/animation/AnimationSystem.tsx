/**
 * UX-002: Advanced Animation System
 * Professional micro-interactions and animation refinements for enhanced user engagement
 */

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../../utils/cn';
import '../styles/animation-system.css';

// Stagger animation container for lists and grids
export interface StaggerAnimationProps {
  children: React.ReactElement[];
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'scaleIn' | 'rotateIn';
  threshold?: number;
}

export const StaggerAnimation: React.FC<StaggerAnimationProps> = ({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  className,
  animation = 'fadeInUp',
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const animationClasses = {
    fadeInUp: 'animate-fade-in-up',
    fadeInLeft: 'animate-fade-in-left',
    scaleIn: 'animate-scale-in',
    rotateIn: 'animate-rotate-in',
  };

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-500 ease-out stagger-item',
            isVisible ? `${animationClasses[animation]} visible` : ''
          )}
          data-stagger-delay={
            isVisible ? initialDelay + index * staggerDelay : 0
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Morphing button with smooth state transitions
export interface MorphingButtonProps {
  children: React.ReactNode;
  loadingChildren?: React.ReactNode;
  successChildren?: React.ReactNode;
  errorChildren?: React.ReactNode;
  state: 'idle' | 'loading' | 'success' | 'error';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  resetDelay?: number;
}

export const MorphingButton: React.FC<MorphingButtonProps> = ({
  children,
  loadingChildren = 'Loading...',
  successChildren = '✓ Success',
  errorChildren = '✗ Error',
  state,
  onClick,
  className,
  disabled = false,
  resetDelay = 2000,
}) => {
  const [displayState, setDisplayState] = useState(state);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (state === 'success' || state === 'error') {
      setDisplayState(state);
      const timer = setTimeout(() => {
        setIsResetting(true);
        setTimeout(() => {
          setDisplayState('idle');
          setIsResetting(false);
        }, 200);
      }, resetDelay);

      return () => clearTimeout(timer);
    } else {
      setDisplayState(state);
      return undefined;
    }
  }, [state, resetDelay]);

  const stateClasses = {
    idle: 'morphing-button-idle',
    loading: 'morphing-button-loading',
    success: 'morphing-button-success',
    error: 'morphing-button-error animate-shake',
  };

  const content = {
    idle: children,
    loading: loadingChildren,
    success: successChildren,
    error: errorChildren,
  };

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled ?? displayState === 'loading'}
      className={cn(
        'relative px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 ease-in-out overflow-hidden group',
        stateClasses[displayState],
        isResetting && 'transform scale-100',
        className
      )}
    >
      {/* Background ripple effect */}
      <div className='absolute inset-0 bg-white/20 rounded-lg transform scale-0 transition-transform duration-300 group-active:scale-100 opacity-0 group-active:opacity-100' />

      {/* Content with smooth transitions */}
      <span
        className={cn(
          'relative z-10 flex items-center justify-center gap-2 transition-all duration-200',
          displayState === 'loading' && 'animate-pulse'
        )}
      >
        {content[displayState]}
      </span>

      {/* Loading spinner overlay */}
      {displayState === 'loading' && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
        </div>
      )}
    </button>
  );
};

// Floating Action Button with magnetic effect
export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  magneticStrength?: number;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  magneticStrength = 20,
  className,
}) => {
  const [transform, setTransform] = useState('translate(0px, 0px) scale(1)');
  const [isHovering, setIsHovering] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / magneticStrength;
    const deltaY = (e.clientY - centerY) / magneticStrength;
    const scale = isHovering ? 1.1 : 1;

    setTransform(`translate(${deltaX}px, ${deltaY}px) scale(${scale})`);
  };

  const handleMouseLeave = () => {
    setTransform('translate(0px, 0px) scale(1)');
    setIsHovering(false);
  };

  const positionClasses = {
    'bottom-right': 'fab-position-bottom-right',
    'bottom-left': 'fab-position-bottom-left',
    'top-right': 'fab-position-top-right',
    'top-left': 'fab-position-top-left',
  };

  const tooltipClasses = {
    'bottom-right': 'fab-tooltip-right',
    'bottom-left': 'fab-tooltip-left',
    'top-right': 'fab-tooltip-right',
    'top-left': 'fab-tooltip-left',
  };

  return (
    <button
      type='button'
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'fixed z-50 w-14 h-14 bg-cosmic-purple hover:bg-cosmic-purple/90 text-white rounded-full shadow-lg transition-all duration-200 ease-out group',
        'hover:shadow-xl active:scale-95',
        positionClasses[position],
        className
      )}
      data-transform={transform}
      aria-label={label}
    >
      {/* Ripple effect */}
      <div className='absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200' />

      {/* Icon */}
      <div className='relative z-10 flex items-center justify-center w-full h-full'>
        {icon}
      </div>

      {/* Tooltip */}
      {label && (
        <div
          className={cn(
            'absolute px-3 py-1 bg-cosmic-dark text-cosmic-silver text-sm rounded-lg whitespace-nowrap transition-all duration-200 pointer-events-none',
            'opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100',
            tooltipClasses[position],
            'top-1/2 -translate-y-1/2'
          )}
        >
          {label}
          <div className={cn('fab-tooltip', tooltipClasses[position])} />
        </div>
      )}
    </button>
  );
};

// Parallax scroll container
export interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  disabled?: boolean;
}

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  speed = 0.5,
  className,
  disabled = false,
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return undefined;

    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const isVisible = rect.bottom >= 0 && rect.top <= window.innerHeight;

        if (isVisible) {
          setScrollOffset(window.scrollY * speed);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, disabled]);

  return (
    <div
      ref={elementRef}
      className={cn('will-change-transform', className)}
      data-parallax-offset={disabled ? 0 : scrollOffset}
    >
      {children}
    </div>
  );
};

// Attention-seeking animation for important elements
export interface AttentionAnimationProps {
  children: React.ReactNode;
  trigger?: boolean;
  animation?: 'pulse' | 'bounce' | 'shake' | 'glow' | 'wiggle';
  duration?: number;
  className?: string;
}

export const AttentionAnimation: React.FC<AttentionAnimationProps> = ({
  children,
  trigger = false,
  animation = 'pulse',
  duration = 1000,
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [trigger, duration]);

  const animationClasses = {
    pulse: isAnimating ? 'animate-pulse-attention' : '',
    bounce: isAnimating ? 'animate-bounce-attention' : '',
    shake: isAnimating ? 'animate-shake-attention' : '',
    glow: isAnimating ? 'animate-glow-attention' : '',
    wiggle: isAnimating ? 'animate-wiggle-attention' : '',
  };

  return (
    <div
      className={cn(
        'transition-all duration-200',
        animationClasses[animation],
        className
      )}
    >
      {children}
    </div>
  );
};

// Smooth progress indicator with easing
export interface SmoothProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  animated?: boolean;
  color?: 'cosmic' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SmoothProgress: React.FC<SmoothProgressProps> = ({
  value,
  max = 100,
  showLabel = true,
  animated = true,
  color = 'cosmic',
  size = 'md',
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (progressRef.current) {
      observer.observe(progressRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !animated) {
      setDisplayValue(percentage);
      return undefined;
    }

    const duration = 1500;
    const startTime = Date.now();
    const startValue = displayValue;
    const targetValue = percentage;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easeOut;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    return undefined;
  }, [percentage, isVisible, animated, displayValue]);

  const colorClasses = {
    cosmic: 'progress-cosmic',
    success: 'progress-success',
    warning: 'progress-warning',
    error: 'progress-error',
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div ref={progressRef} className={cn('space-y-2', className)}>
      {showLabel && (
        <div className='flex justify-between items-center text-sm'>
          <span className='text-cosmic-silver'>Progress</span>
          <span className='text-cosmic-gold font-medium'>
            {Math.round(displayValue)}%
          </span>
        </div>
      )}

      <div
        className={cn(
          'w-full bg-cosmic-dark rounded-full overflow-hidden relative',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden',
            colorClasses[color],
            animated && 'transform-gpu'
          )}
          data-width={`${displayValue}%`}
        >
          {/* Shimmer effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer' />
        </div>
      </div>
    </div>
  );
};

// Card hover effect with 3D tilt
export interface TiltCardProps {
  children: React.ReactNode;
  tiltStrength?: number;
  glareEffect?: boolean;
  className?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  tiltStrength = 15,
  glareEffect = true,
  className,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = ((e.clientY - centerY) / rect.height) * tiltStrength;
    const rotateY = ((centerX - e.clientX) / rect.width) * tiltStrength;

    setTilt({ x: rotateX, y: rotateY });

    if (glareEffect) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlare({ x: glareX, y: glareY, opacity: 0.1 });
    }
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative transform-gpu transition-transform duration-200 ease-out tilt-card',
        className
      )}
      data-tilt-x={tilt.x}
      data-tilt-y={tilt.y}
    >
      {children}

      {glareEffect && (
        <div
          className='absolute inset-0 pointer-events-none rounded-lg tilt-card-glare'
          data-glare-x={glare.x}
          data-glare-y={glare.y}
          data-glare-opacity={glare.opacity}
        />
      )}
    </div>
  );
};
