import React, { type ReactNode } from 'react';

interface FeatureGuardProps {
  children: ReactNode;
  requiredTier: 'premium' | 'elite';
  feature: string;
  upgradeMessage?: string;
  showPreview?: boolean;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({ children }) => {
  return <>{children}</>;
};
