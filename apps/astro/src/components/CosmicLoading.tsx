import React from 'react';

interface CosmicLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const CosmicLoading: React.FC<CosmicLoadingProps> = ({ 
  size = 'md', 
  message = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`${sizeClasses[size]} border-2 border-cosmic-purple/30 border-t-cosmic-gold rounded-full animate-spin`}></div>
        
        {/* Inner pulsing core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-cosmic-gold rounded-full animate-pulse"></div>
        </div>
      </div>
      
  {(typeof message === 'string' && message.length > 0) && (
        <p className="mt-4 text-cosmic-silver/80 font-playfair animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export const PageLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-cosmic-dark">
    <CosmicLoading size="lg" message="Preparing your cosmic experience..." />
  </div>
);

export default CosmicLoading;
