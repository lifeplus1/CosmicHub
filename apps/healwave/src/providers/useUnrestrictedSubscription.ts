import { useContext } from 'react';
import { UnrestrictedSubscriptionContextType } from './unrestrictedSubscription.types';
import { UnrestrictedSubscriptionContext } from './UnrestrictedSubscriptionProvider';

export const useUnrestrictedSubscription = (): UnrestrictedSubscriptionContextType => {
  const context = useContext(UnrestrictedSubscriptionContext);
  if (!context) {
    throw new Error('useUnrestrictedSubscription must be used within UnrestrictedSubscriptionProvider');
  }
  return context;
};
