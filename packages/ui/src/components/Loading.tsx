import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md' }) => (
  <div className={`loading loading-${size}`}>
    <div className='spinner'></div>
  </div>
);
