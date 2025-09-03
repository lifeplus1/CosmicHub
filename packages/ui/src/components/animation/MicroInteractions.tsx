/**
 * UX-002: Micro-Interaction Components
 * Delightful micro-interactions for enhanced user engagement
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import '../styles/animation-system.css';

// Interactive Rating Component with hover animations
export interface InteractiveRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  icon?: 'star' | 'heart' | 'thumb';
  className?: string;
}

export const InteractiveRating: React.FC<InteractiveRatingProps> = ({
  rating,
  maxRating = 5,
  onRatingChange,
  size = 'md',
  readonly = false,
  icon = 'star',
  className,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (newRating: number) => {
    if (readonly) return;

    setIsAnimating(true);
    onRatingChange?.(newRating);

    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const iconComponents = {
    star: '★',
    heart: '♥',
    thumb: '👍',
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const itemRating = index + 1;
        const isActive = itemRating <= displayRating;
        const isHovered = itemRating <= hoverRating;

        return (
          <button
            key={index}
            type='button'
            onClick={() => handleClick(itemRating)}
            onMouseEnter={() => !readonly && setHoverRating(itemRating)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={readonly}
            className={cn(
              'transition-all duration-200 ease-out transform',
              sizeClasses[size],
              !readonly && 'hover:scale-125 cursor-pointer',
              readonly && 'cursor-default',
              isActive && 'text-yellow-400 scale-110',
              isHovered && 'animate-bounce',
              isAnimating && itemRating <= rating && 'animate-pulse-attention',
              'focus:outline-none focus:ring-2 focus:ring-cosmic-purple focus:ring-offset-2'
            )}
            aria-label={`Rate ${itemRating} out of ${maxRating}`}
          >
            <span
              className={cn(
                'block transition-all duration-200',
                isActive ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-400'
              )}
            >
              {iconComponents[icon]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Ripple Button with customizable ripple effect
export interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  rippleColor?: string;
  className?: string;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  className,
}) => {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  const variantClasses = {
    primary: 'bg-cosmic-purple hover:bg-cosmic-purple/90 text-white',
    secondary:
      'bg-cosmic-silver/20 hover:bg-cosmic-silver/30 text-cosmic-silver',
    ghost: 'bg-transparent hover:bg-cosmic-purple/10 text-cosmic-silver',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      ref={buttonRef}
      type='button'
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative overflow-hidden rounded-lg font-medium transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-cosmic-purple focus:ring-offset-2',
        'active:scale-95',
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span className='relative z-10'>{children}</span>

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className='absolute rounded-full animate-ping pointer-events-none ripple-effect'
          data-ripple-x={ripple.x - 20}
          data-ripple-y={ripple.y - 20}
          data-ripple-color={rippleColor}
        />
      ))}
    </button>
  );
};

// Magnetic Hover Effect Component
export interface MagneticHoverProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticHover: React.FC<MagneticHoverProps> = ({
  children,
  strength = 0.3,
  className,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;

    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={elementRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('transition-transform duration-200 ease-out', className)}
      data-transform={`translate(${mousePosition.x}px, ${mousePosition.y}px)`}
    >
      {children}
    </div>
  );
};

// Elastic Scale Animation on Interaction
export interface ElasticInteractionProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export const ElasticInteraction: React.FC<ElasticInteractionProps> = ({
  children,
  duration = 300,
  className,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'transition-transform duration-200 ease-out cursor-pointer',
        'hover:scale-105 active:scale-95',
        isPressed && 'transform scale-95',
        className
      )}
      data-transition-duration={duration}
    >
      {children}
    </div>
  );
};

// Tooltip with smooth animations
export interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 500,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number>();

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-cosmic-dark',
    bottom:
      'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-cosmic-dark',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-cosmic-dark',
    right:
      'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-cosmic-dark',
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-1 text-sm text-white bg-cosmic-dark rounded-lg shadow-lg',
            'animate-fade-in-up pointer-events-none whitespace-nowrap',
            positionClasses[position]
          )}
        >
          {content}
          <div className={cn('absolute w-0 h-0', arrowClasses[position])} />
        </div>
      )}
    </div>
  );
};

// Pulse on Change Animation
export interface PulseOnChangeProps {
  children: React.ReactNode;
  watchValue: unknown;
  duration?: number;
  color?: string;
  className?: string;
}

export const PulseOnChange: React.FC<PulseOnChangeProps> = ({
  children,
  watchValue,
  duration = 500,
  color = 'rgba(124, 58, 237, 0.3)',
  className,
}) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const previousValue = useRef(watchValue);

  useEffect(() => {
    if (previousValue.current !== watchValue) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), duration);

      previousValue.current = watchValue;

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [watchValue, duration]);

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isPulsing && 'animate-pulse-attention',
        className
      )}
      data-pulse-color={color}
      data-is-pulsing={isPulsing}
    >
      {children}
    </div>
  );
};

// Count-up Animation for Numbers
export interface CountUpProps {
  value: number;
  duration?: number;
  startValue?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 2000,
  startValue = 0,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState(startValue);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const startVal = displayValue;
    const endVal = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startVal + (endVal - startVal) * easeOut;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, displayValue]);

  return (
    <span
      className={cn(
        'inline-block transition-all duration-200',
        isAnimating && 'text-cosmic-gold',
        className
      )}
    >
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};
