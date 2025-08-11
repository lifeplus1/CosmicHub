import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

interface EducationalTooltipProps {
  title: string;
  description: string;
  examples?: string[];
  tier?: 'free' | 'premium' | 'elite';
  children?: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const EducationalTooltip: React.FC<EducationalTooltipProps> = React.memo(({
  title,
  description,
  examples = [],
  tier,
  children,
  placement = 'top'
}) => {
  const getTierColor = (tier?: 'free' | 'premium' | 'elite') => {
    switch (tier) {
      case 'elite': return 'gold-500';
      case 'premium': return 'purple-500';
      case 'free': return 'gray-500';
      default: return 'gray-500';
    }
  };

  const tooltipContent = (
    <div className="flex flex-col space-y-2 max-w-[300px] p-2">
      <div className="flex justify-between w-full">
        <p className="text-sm font-bold text-cosmic-silver">{title}</p>
        {tier && (
          <span className={`bg-${getTierColor(tier)}/20 text-${getTierColor(tier)} px-2 py-1 rounded text-xs`}>
            {tier === 'elite' ? '👑' : tier === 'premium' ? '🌟' : '📖'} {tier}
          </span>
        )}
      </div>
      <p className="text-xs text-cosmic-silver/80">{description}</p>
      {examples.length > 0 && (
        <div className="flex flex-col space-y-1">
          <p className="text-xs font-bold">Examples:</p>
          {examples.map((example, index) => (
            <p key={index} className="text-xs text-cosmic-silver/60">• {example}</p>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild={!!children}>
        {children || (
          <button 
            className="inline-block cursor-help border-none bg-transparent p-0" 
            aria-label={`Learn more about ${title}`}
            type="button"
          >
            <FaQuestionCircle className="text-sm text-gray-400" />
          </button>
        )}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={placement}
          className="p-2 border rounded-md shadow-lg bg-cosmic-blue/80 backdrop-blur-md border-cosmic-silver/20 text-cosmic-silver"
        >
          {tooltipContent}
          <Tooltip.Arrow className="fill-cosmic-blue/80" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
});

EducationalTooltip.displayName = 'EducationalTooltip';

export const InfoIcon: React.FC<{ tooltip: string }> = React.memo(({ tooltip }) => (
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <button 
        className="inline-block ml-1 cursor-help border-none bg-transparent p-0"
        aria-label="More information"
        type="button"
      >
        <FaInfoCircle className="text-sm text-blue-400" />
      </button>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content
        side="top"
        className="bg-cosmic-blue/80 backdrop-blur-md border border-cosmic-silver/20 rounded-md shadow-lg p-2 text-cosmic-silver max-w-[300px]"
      >
        <p className="text-sm">{tooltip}</p>
        <Tooltip.Arrow className="fill-cosmic-blue/80" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
));

InfoIcon.displayName = 'InfoIcon';