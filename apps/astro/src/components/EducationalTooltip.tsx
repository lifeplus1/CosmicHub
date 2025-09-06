import React, { useMemo } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

/**
 * Tier configuration for the educational tooltip system
 */
const TIER_CONFIG = {
  elite: {
    color: 'cosmic-gold',
    bgColor: 'cosmic-gold/20',
    icon: '👑',
    label: 'Elite'
  },
  premium: {
    color: 'cosmic-purple',
    bgColor: 'cosmic-purple/20',
    icon: '🌟',
    label: 'Premium'
  },
  free: {
    color: 'cosmic-silver',
    bgColor: 'cosmic-silver/20',
    icon: '📖',
    label: 'Free'
  }
} as const;

type TierType = keyof typeof TIER_CONFIG;

interface EducationalTooltipProps {
  /** Main title displayed in the tooltip */
  title: string;
  /** Detailed description text */
  description: string;
  /** Optional array of example texts */
  examples?: string[];
  /** Feature tier for styling and labeling */
  tier?: TierType;
  /** Child element to wrap with tooltip */
  children?: React.ReactNode;
  /** Tooltip placement relative to trigger */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Additional CSS classes for customization */
  className?: string;
  /** Disable the tooltip */
  disabled?: boolean;
}

/**
 * Educational tooltip component following cosmic design system
 * Provides contextual information with tier-based styling
 * 
 * @example
 * ```tsx
 * <EducationalTooltip
 *   title="Birth Chart"
 *   description="A map of planetary positions at your birth time"
 *   tier="premium"
 *   examples={["Natal chart analysis", "Planetary aspects"]}
 * >
 *   <button>Learn More</button>
 * </EducationalTooltip>
 * ```
 */
export const EducationalTooltip = React.memo<EducationalTooltipProps>(
  ({
    title,
    description,
    examples = [],
    tier,
    children,
    placement = 'top',
    className,
    disabled = false,
  }) => {
    // Memoize tier configuration to prevent unnecessary recalculations
    const tierConfig = useMemo(() => {
      return tier ? TIER_CONFIG[tier] : null;
    }, [tier]);

    // Memoize tooltip content for performance
    const tooltipContent = useMemo(() => (
      <div className="flex flex-col space-y-3 max-w-sm p-4">
        {/* Header with title and tier badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-cosmic-silver leading-tight">
            {title}
          </h3>
          {tierConfig && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${tierConfig.bgColor} text-${tierConfig.color} whitespace-nowrap`}
              aria-label={`${tierConfig.label} feature`}
            >
              <span role="img" aria-hidden="true">{tierConfig.icon}</span>
              {tierConfig.label}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-cosmic-silver/90 leading-relaxed">
          {description}
        </p>

        {/* Examples section */}
        {examples.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-cosmic-silver">
              Examples:
            </p>
            <ul className="space-y-1">
              {examples.map((example, index) => (
                <li 
                  key={index} 
                  className="text-xs text-cosmic-silver/70 flex items-start gap-2"
                >
                  <span className="text-cosmic-gold/60 mt-0.5" aria-hidden="true">
                    •
                  </span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ), [title, description, examples, tierConfig]);

    // Default trigger button with proper accessibility
    const defaultTrigger = useMemo(() => (
      <button
        type="button"
        className={`
          inline-flex items-center justify-center
          w-6 h-6 p-0
          bg-transparent border-none
          text-cosmic-silver/60 hover:text-cosmic-silver
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple focus-visible:ring-offset-2
          cursor-help
          ${className ?? ''}
        `.trim()}
        aria-label={`Learn more about ${title}`}
      >
        <FaQuestionCircle 
          className="w-4 h-4" 
          aria-hidden="true"
        />
      </button>
    ), [title, className]);

    if (disabled) {
      return children ? <>{children}</> : defaultTrigger;
    }

    return (
      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild={!!children}>
          {children ?? defaultTrigger}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={placement}
            sideOffset={8}
            className="
              bg-cosmic-blue/95 backdrop-blur-lg
              border border-cosmic-silver/20
              rounded-lg shadow-xl
              text-cosmic-silver
              z-50
              animate-in fade-in-0 zoom-in-95
              data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
              data-[side=bottom]:slide-in-from-top-2
              data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2
              data-[side=top]:slide-in-from-bottom-2
            "
            role="tooltip"
          >
            {tooltipContent}
            <Tooltip.Arrow 
              className="fill-cosmic-blue/95" 
              width={12} 
              height={6}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }
);

EducationalTooltip.displayName = 'EducationalTooltip';

interface InfoIconProps {
  /** Tooltip text content */
  tooltip: string;
  /** Optional custom aria label */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** Icon size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Simple info icon with tooltip
 * Used for quick contextual information
 * 
 * @example
 * ```tsx
 * <InfoIcon 
 *   tooltip="This feature helps you understand planetary influences" 
 *   size="md"
 * />
 * ```
 */
export const InfoIcon = React.memo<InfoIconProps>(
  ({ 
    tooltip, 
    ariaLabel = 'More information',
    className,
    size = 'sm'
  }) => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4', 
      lg: 'w-5 h-5'
    };

    const buttonClasses = {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10'
    };

    return (
      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className={`
              inline-flex items-center justify-center
              ${buttonClasses[size]}
              ml-1 p-0
              bg-transparent border-none
              text-cosmic-blue/70 hover:text-cosmic-blue
              transition-colors duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple focus-visible:ring-offset-2
              cursor-help
              ${className ?? ''}
            `.trim()}
            aria-label={ariaLabel}
          >
            <FaInfoCircle 
              className={`${sizeClasses[size]}`}
              aria-hidden="true"
            />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={8}
            className="
              bg-cosmic-blue/95 backdrop-blur-lg
              border border-cosmic-silver/20
              rounded-lg shadow-lg
              p-3 text-cosmic-silver
              max-w-xs text-sm
              z-50
              animate-in fade-in-0 zoom-in-95
              data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
              data-[side=bottom]:slide-in-from-top-2
              data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2
              data-[side=top]:slide-in-from-bottom-2
            "
            role="tooltip"
          >
            <p className="leading-relaxed">{tooltip}</p>
            <Tooltip.Arrow 
              className="fill-cosmic-blue/95" 
              width={12} 
              height={6}
            />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }
);

InfoIcon.displayName = 'InfoIcon';
