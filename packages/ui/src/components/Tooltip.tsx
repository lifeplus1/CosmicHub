import React, { useState, useRef, createContext, useContext } from 'react';

// Tooltip Provider Context
export interface TooltipProviderContextValue {
  delayDuration?: number;
  skipDelayDuration?: number;
}

const TooltipProviderContext = createContext<TooltipProviderContextValue>({});

export interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  delayDuration = 200,
  skipDelayDuration = 100
}) => {
  return (
    <TooltipProviderContext.Provider value={{ delayDuration, skipDelayDuration }}>
      {children}
    </TooltipProviderContext.Provider>
  );
};

export interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay,
  className = ''
}) => {
  const context = useContext(TooltipProviderContext);
  const effectiveDelay = delay ?? context.delayDuration ?? 200;
  
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-cosmic-dark border-t-4 border-x-transparent border-x-4 border-b-0',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-cosmic-dark border-b-4 border-x-transparent border-x-4 border-t-0',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-cosmic-dark border-l-4 border-y-transparent border-y-4 border-r-0',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-cosmic-dark border-r-4 border-y-transparent border-y-4 border-l-0'
  };

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), effectiveDelay);
    setTimeoutId(id as unknown as number);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 px-3 py-2 text-sm text-cosmic-gold bg-cosmic-dark/90 border border-cosmic-purple/30 rounded-lg shadow-lg shadow-cosmic-purple/20
            whitespace-nowrap pointer-events-none backdrop-blur-sm
            ${positionClasses[position]}
            ${className}
          `}
          role="tooltip"
          aria-live="polite"
        >
          {content}
          <div className={`absolute ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};
