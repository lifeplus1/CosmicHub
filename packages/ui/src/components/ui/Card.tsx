import React, { forwardRef } from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, title, className = '' }, ref) => (
    <div
      ref={ref}
      className={`cosmic-glass bg-cosmic-dark/50 text-cosmic-silver rounded-lg border border-cosmic-purple/20 shadow-lg ${className}`}
    >
      {title && (
        <h3 className='p-4 font-semibold border-b border-cosmic-purple/20 text-cosmic-gold'>
          {title}
        </h3>
      )}
      <div className='p-4'>{children}</div>
    </div>
  )
);

Card.displayName = 'Card';

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => (
  <div className={`p-4 border-b border-cosmic-purple/20 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
}) => (
  <h3 className={`font-semibold text-cosmic-gold ${className}`}>{children}</h3>
);

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => <div className={`p-4 text-cosmic-silver ${className}`}>{children}</div>;

export const CardDescription: React.FC<CardContentProps> = ({
  children,
  className = '',
}) => <div className={`text-sm text-cosmic-silver/80 ${className}`}>{children}</div>;
