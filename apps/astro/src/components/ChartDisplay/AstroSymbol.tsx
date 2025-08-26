import React from 'react';

interface AstroSymbolProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

export const AstroSymbol: React.FC<AstroSymbolProps> = ({ 
  symbol, 
  size = 'md', 
  className = '',
  title 
}) => {
  const sizeClass = {
    sm: 'astro-symbol-sm',
    md: 'astro-symbol',
    lg: 'astro-symbol-lg',
    xl: 'astro-symbol-xl'
  }[size];

  return (
    <span 
      className={`${sizeClass} ${className}`}
      title={title}
      aria-label={title}
    >
      {symbol}
    </span>
  );
};

export default AstroSymbol;
