import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '../../utils/cn';
import styles from '../../styles/modules/components/SacredGeometryDemo.module.css';

export interface ColorSwatch {
  id: number;
  color: string;
}

export interface ColorSwatchProps {
  swatches: ColorSwatch[];
  className?: string;
}

const getColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    '#FF4444': 'color-swatch--fire',
    '#FFAA00': 'color-swatch--earth', 
    '#88FF88': 'color-swatch--air',
    '#4444FF': 'color-swatch--water',
    '#AA44FF': 'color-swatch--ether'
  };
  return colorMap[color] ?? '';
};

export const ColorSwatchGrid: React.FC<ColorSwatchProps> = ({ 
  swatches, 
  className 
}) => {
  return (
    <div className={cn(styles['color-swatches'], className)}>
      {swatches.map((swatch) => (
        <Tooltip.Provider key={swatch.id}>
          <Tooltip.Root>
            <Tooltip.Trigger>
              <div
                className={cn(
                  styles['color-swatch'], 
                  styles[getColorClass(swatch.color)]
                )}
                role="button"
                tabIndex={0}
                aria-label={`Color swatch ${swatch.color}`}
              />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                sideOffset={5}
              >
                {swatch.color}
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      ))}
    </div>
  );
};

export interface ExpertModeSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const ExpertModeSwitch: React.FC<ExpertModeSwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  className
}) => {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault();
      onCheckedChange(!checked);
    }
  };

  // Pre-compute button props with literal ARIA values for Microsoft Edge
  const buttonProps = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    disabled,
    className: cn(
      'px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500',
      checked
        ? 'bg-purple-600 text-white hover:bg-purple-500'
        : 'bg-gray-700 text-gray-300 hover:bg-purple-500',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    ),
    'aria-label': `Toggle expert mode. Currently ${checked ? 'enabled' : 'disabled'}`,
    role: "switch" as const,
    'aria-checked': checked ? "true" as const : "false" as const
  };

  return (
    <button {...buttonProps}>
      Expert Mode: {checked ? 'ON' : 'OFF'}
    </button>
  );
};

export interface MetricCardProps {
  value: string | number;
  label: string;
  variant?: 'default' | 'large' | 'count';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  variant = 'default',
  className
}) => {
  const valueClass = {
    default: styles['metric-value'],
    large: styles['metric-large'],
    count: styles['metric-count']
  }[variant];

  return (
    <div className={cn(styles['metric-card'], className)}>
      <div className={valueClass}>
        {value}
      </div>
      <div className={styles['metric-label']}>
        {label}
      </div>
    </div>
  );
};

export interface TimeBadgeProps {
  times: string[];
  className?: string;
}

export const TimeBadgeGrid: React.FC<TimeBadgeProps> = ({ 
  times, 
  className 
}) => {
  return (
    <div className={styles['meditation-times']}>
      <h5 className={styles['meditation-times-title']}>
        Optimal Meditation Times:
      </h5>
      <div className={cn(styles['time-badges'], className)}>
        {times.map((time, index) => (
          <span key={index} className={styles['time-badge']}>
            {time}
          </span>
        ))}
      </div>
    </div>
  );
};

export interface DataSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DataSection: React.FC<DataSectionProps> = ({
  title,
  children,
  className
}) => {
  return (
    <div className={className}>
      <h4 className={styles['data-section-title']}>{title}</h4>
      <div className={styles['data-section']}>
        {children}
      </div>
    </div>
  );
};

export interface DataItemProps {
  label: string;
  value: string;
  colorClass?: string;
}

export const DataItem: React.FC<DataItemProps> = ({
  label,
  value,
  colorClass
}) => {
  return (
    <div className={styles['data-item']}>
      <span className={cn(styles['data-label'], colorClass)}>
        {label}
      </span>
      <span className={cn(styles['data-value'], colorClass)}>
        {value}
      </span>
    </div>
  );
};

export interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  className
}) => {
  return (
    <div className={cn(styles['section-card'], className)}>
      <h3 className={styles['section-title']}>
        {title}
      </h3>
      {children}
    </div>
  );
};
