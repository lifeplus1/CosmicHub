/**
 * Enhanced Card Component with Advanced Architecture
 * Demonstrates compound components, polymorphism, performance tracking, and accessibility
 */

import React, { forwardRef } from 'react';
import { 
  createCompoundComponent, 
  createPolymorphicComponent,
  useComponentContext,
  withPerformanceTracking,
  type PolymorphicComponentProps
} from '@cosmichub/config/component-architecture';

// Base card props
export interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  clickable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
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

  return (
    <PolymorphicCard
      ref={ref}
      className={cardClasses}
      data-testid={testId}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      aria-busy={loading}
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
);

// Polymorphic card header
export interface CardHeaderProps<T extends React.ElementType = 'div'> 
  extends PolymorphicComponentProps<T> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const CardHeader = <T extends React.ElementType = 'div'>(
  props: CardHeaderProps<T>
) => {
  const { as, title, subtitle, actions, ...otherProps } = props;
  const { children, className = '', ...restProps } = otherProps as any;
  const Component = as || 'div';

  return (
    <Component
      className={`card__header ${className}`}
      {...restProps}
    >
      {(title || subtitle) && (
        <div className="card__header-content">
          {title && (
            <h3 className="card__title" data-testid="card-title">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="card__subtitle" data-testid="card-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
      {actions && (
        <div className="card__actions" data-testid="card-actions">
          {actions}
        </div>
      )}
    </Component>
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
    className
  ].filter(Boolean).join(' ');

  const bodyStyle: React.CSSProperties = {
    ...(maxHeight && { maxHeight }),
    ...(scrollable && { overflowY: 'auto' })
  };

  return (
    <div 
      className={bodyClasses}
      style={bodyStyle}
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
}>(({ onClick, onKeyDown, ...props }, ref) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
    onKeyDown?.(event);
  };

  return (
    <Card
      ref={ref}
      {...props}
      clickable
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    />
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
  data: any[];
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
  const [ChartComponent, setChartComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadChart = async () => {
      try {
        setLoading(true);
        setError(null);

        let module;
        switch (chartType) {
          case 'astrology':
            module = await import('./lazy-components');
            break;
          default:
            // Fallback chart component
            module = { LazyAstrologyChart: () => <div>Chart placeholder</div> };
        }

        if (isMounted) {
          setChartComponent(() => module.LazyAstrologyChart);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load chart'));
          setLoading(false);
        }
      }
    };

    loadChart();

    return () => {
      isMounted = false;
    };
  }, [chartType]);

  if (loading) {
    return <LoadingCard {...props} loadingText={`Loading ${chartType} chart...`} />;
  }

  if (error) {
    return (
      <ErrorCard 
        {...props} 
        error={error} 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <Card {...props}>
      {title && (
        <Card.Header 
          title={title}
          subtitle={description}
        />
      )}
      <Card.Body>
        {ChartComponent && <ChartComponent data={data} />}
      </Card.Body>
    </Card>
  );
};

// Export all card components
export default Card;
