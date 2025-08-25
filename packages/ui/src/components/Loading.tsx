import React from 'react';

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({ size = 'medium' }) => (
  <div className={`loading loading-${size}`}>
    <div className='spinner'></div>
  </div>
);
