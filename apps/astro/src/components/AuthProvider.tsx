import React from 'react';
import { AuthProvider as BaseAuthProvider, SubscriptionProvider } from '@cosmichub/auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <BaseAuthProvider>
      <SubscriptionProvider appType="astro">
        {children}
      </SubscriptionProvider>
    </BaseAuthProvider>
  );
};

export default AuthProvider;
