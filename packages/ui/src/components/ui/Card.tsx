import React, { forwardRef, useMemo } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

// Base classes for consistent styling
const BASE_CARD_CLASSES = 'cosmic-glass bg-cosmic-dark/50 text-cosmic-silver rounded-lg border border-cosmic-purple/20 shadow-lg';
const BASE_HEADER_CLASSES = 'p-4 border-b border-cosmic-purple/20';
const BASE_TITLE_CLASSES = 'font-semibold text-cosmic-gold';
const BASE_CONTENT_CLASSES = 'p-4 text-cosmic-silver';
const BASE_DESCRIPTION_CLASSES = 'text-sm text-cosmic-silver/80';

export const Card = React.memo(forwardRef<HTMLDivElement, CardProps>(
  function Card({ children, title, className = '', ...props }, ref) {
    // Memoize combined classes to prevent recalculation
    const combinedClasses = useMemo(() => {
      return `${BASE_CARD_CLASSES} ${className}`.trim();
    }, [className]);

    return (
      <div
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {title && (
          <h3 className="p-4 font-semibold border-b border-cosmic-purple/20 text-cosmic-gold">
            {title}
          </h3>
        )}
        <div className="p-4">{children}</div>
      </div>
    );
  }
));

export const CardHeader: React.FC<CardHeaderProps> = React.memo(function CardHeader({
  children,
  className = '',
  ...props
}) {
  const combinedClasses = useMemo(() => {
    return `${BASE_HEADER_CLASSES} ${className}`.trim();
  }, [className]);

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
});

export const CardTitle: React.FC<CardTitleProps> = React.memo(function CardTitle({
  children,
  className = '',
  ...props
}) {
  const combinedClasses = useMemo(() => {
    return `${BASE_TITLE_CLASSES} ${className}`.trim();
  }, [className]);

  return (
    <h3 className={combinedClasses} {...props}>
      {children}
    </h3>
  );
});

export const CardContent: React.FC<CardContentProps> = React.memo(function CardContent({
  children,
  className = '',
  ...props
}) {
  const combinedClasses = useMemo(() => {
    return `${BASE_CONTENT_CLASSES} ${className}`.trim();
  }, [className]);

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
});

export const CardDescription: React.FC<CardDescriptionProps> = React.memo(function CardDescription({
  children,
  className = '',
  ...props
}) {
  const combinedClasses = useMemo(() => {
    return `${BASE_DESCRIPTION_CLASSES} ${className}`.trim();
  }, [className]);

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardContent.displayName = 'CardContent';
CardDescription.displayName = 'CardDescription';
