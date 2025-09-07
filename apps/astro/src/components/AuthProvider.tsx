import React from 'react';
import {
  AuthProvider as BaseAuthProvider,
  SubscriptionProvider,
} from '@cosmichub/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = React.memo(({ children }) => {
  return (
    <BaseAuthProvider>
      <SubscriptionProvider appType='astro'>{children}</SubscriptionProvider>
    </BaseAuthProvider>
  );
});

AuthProvider.displayName = 'AuthProvider';

export default React.memo(AuthProvider);
