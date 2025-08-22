/**
 * Enhanced Card Component with Advanced Architecture
 * Demonstrates compound components, polymorphism, performance tracking, and accessibility
 */

import React, { forwardRef } from 'react';
import { 
  createCompoundComponent, 
  createPolymorphicComponent,
  useComponentContext,
  withPerformanceTracking
} from '@cosmichub/config/component-architecture';
import styles from './EnhancedCard.module.css';

// Base card props
export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  clickable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  'data-testid'?: string;
}

// Polymorphic card component
const PolymorphicCard = createPolymorphicComponent('div', 'Card');

// Base card implementation
const BaseCard = forwardRef<HTMLDivElement, CardProps>(({
  variant = 'elevated',
  size = 'medium',
  clickable = false,
  disabled = false,
  loading = false,
  className = '',
  children,
  'data-testid': testId = 'card',
  ...props
}, ref) => {
  const context = useComponentContext();

  const cardClasses = [
    'card',
    `card--${variant}`,
    `card--${size}`,
    `card--theme-${context.theme}`,
    clickable && 'card--clickable',
    disabled && 'card--disabled',
    loading && 'card--loading',
    className
  ].filter(Boolean).join(' ');

  return disabled ? (
    <PolymorphicCard
      ref={ref}
      className={cardClasses}
      data-testid={testId}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      aria-disabled="true"
      aria-busy={loading ? 'true' : 'false'}
      {...props}
    >
      {loading && (
        <div className="card__loading-overlay" aria-hidden="true">
          <div className="card__spinner" />
        </div>
      )}
      {children}
    </PolymorphicCard>
  ) : (
    <PolymorphicCard
      ref={ref}
      className={cardClasses}
      data-testid={testId}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      aria-disabled="false"
      aria-busy={loading ? 'true' : 'false'}
      {...props}
    >
      {loading && (
        <div className="card__loading-overlay" aria-hidden="true">
          <div className="card__spinner" />
        </div>
      )}
      {children}
    </PolymorphicCard>
  );
});

BaseCard.displayName = 'BaseCard';

// Create compound component with performance tracking
export const Card = createCompoundComponent(
  withPerformanceTracking(BaseCard, 'Card'),
  'Card'
) as unknown as React.FC<CardProps> & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

// Card header with essential props
export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  actions,
  children,
  className = ''
}) => {
  return (
    <div
      className={`card__header ${className}`}
    >
      {(Boolean(title) || Boolean(subtitle)) && (
        <div className="card__header-content">
          {Boolean(title) && (
            <h3 className="card__title" data-testid="card-title">
              {title}
            </h3>
          )}
          {Boolean(subtitle) && (
            <p className="card__subtitle" data-testid="card-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
      {Boolean(actions) && (
        <div className="card__actions" data-testid="card-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

// Enhanced card body with content management
export interface CardBodyProps {
  scrollable?: boolean;
  maxHeight?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  children?: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  scrollable = false,
  maxHeight,
  padding = 'medium',
  children,
  className = ''
}) => {
  const bodyClasses = [
    'card__body',
    `card__body--padding-${padding}`,
    scrollable && 'card__body--scrollable',
  scrollable && styles['bodyScrollable'],
  Boolean(maxHeight) && styles['bodyWithMaxHeight'],
    className
  ].filter(Boolean).join(' ');

  const bodyStyle = (maxHeight !== null && maxHeight !== undefined) ? { '--card-body-max-height': maxHeight } as React.CSSProperties : undefined;

  return (
    <div 
      className={bodyClasses}
      {...(bodyStyle && { style: bodyStyle })}
      data-testid="card-body"
    >
      {children}
    </div>
  );
};

// Card footer with action management
export interface CardFooterProps {
  align?: 'left' | 'center' | 'right' | 'between';
  children?: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  align = 'right',
  children,
  className = ''
}) => {
  const footerClasses = [
    'card__footer',
    `card__footer--align-${align}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={footerClasses}
      data-testid="card-footer"
    >
      {children}
    </div>
  );
};

// Assign compound components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Enhanced card variants
export const InteractiveCard = forwardRef<HTMLDivElement, CardProps & {
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}>(({ onClick, onKeyDown, ...props }) => {
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
    onKeyDown?.(event);
  };

  return (
  <Card {...props} clickable onClick={onClick ?? (() => {})} onKeyDown={handleKeyDown} />
  );
});

InteractiveCard.displayName = 'InteractiveCard';

// Loading card variant
export const LoadingCard: React.FC<Omit<CardProps, 'loading'> & {
  loadingText?: string;
}> = ({ loadingText = 'Loading...', ...props }) => (
  <Card {...props} loading>
    <Card.Body>
      <div className="loading-content" aria-live="polite">
        <span className="sr-only">{loadingText}</span>
      </div>
    </Card.Body>
  </Card>
);

// Error card variant
export interface ErrorCardProps extends Omit<CardProps, 'variant'> {
  error: Error | string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  error,
  onRetry,
  retryText = 'Retry',
  ...props
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Card {...props} variant="outlined">
      <Card.Body>
        <div className="error-content" role="alert">
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <p className="error-message">{errorMessage}</p>
        </div>
      </Card.Body>
      {onRetry && (
        <Card.Footer>
          <button 
            type="button"
            onClick={onRetry}
            className="retry-button"
            data-testid="error-retry-button"
          >
            {retryText}
          </button>
        </Card.Footer>
      )}
    </Card>
  );
};

// Chart card with lazy loading
export interface ChartCardProps extends CardProps {
  chartType: 'line' | 'bar' | 'pie' | 'astrology';
  data: unknown[];
  title?: string;
  description?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  chartType,
  data,
  title,
  description,
  ...props
}) => {
  const [ChartComponent, setChartComponent] = React.useState<React.ComponentType<{ data: unknown[] }> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadChart = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

  let module: { LazyAstrologyChart: unknown };
        switch (chartType) {
          case 'astrology':
            module = await import('./lazy-components');
            break;
          default:
            // Fallback chart component
            module = { LazyAstrologyChart: (): React.ReactElement => <div>Chart placeholder</div> };
        }

        if (isMounted === true) {
          const comp = module.LazyAstrologyChart;
          if (typeof comp === 'function' || (typeof comp === 'object' && comp !== null)) {
            setChartComponent(() => comp as React.ComponentType<{ data: unknown[] }>);
          }
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted === true) {
          setError(err instanceof Error ? err : new Error('Failed to load chart'));
          setLoading(false);
        }
      }
    };

    void loadChart();

  return (): void => { isMounted = false; };
  }, [chartType]);

  if (loading === true) {
    return <LoadingCard {...props} loadingText={`Loading ${chartType} chart...`} />;
  }

  if (error !== null) {
    return (
      <ErrorCard 
        {...props} 
        error={error} 
        onRetry={(): void => { window.location.reload(); }} 
      />
    );
  }

  return (
    <Card {...props}>
      {Boolean(title) && (
        <Card.Header 
          {...(title ? { title } : {})}
          {...(description ? { subtitle: description } : {})}
        />
      )}
      <Card.Body>
  {(ChartComponent !== null) && <ChartComponent data={data} />}
      </Card.Body>
    </Card>
  );
};

// Export all card components
export default Card;
