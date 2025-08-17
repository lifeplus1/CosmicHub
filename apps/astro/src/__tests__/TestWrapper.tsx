import React, { type ReactNode, type JSX } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, SubscriptionProvider } from '@cosmichub/auth';

export const TestWrapper = ({ children }: { children: ReactNode }): JSX.Element => (
  <MemoryRouter>
    <AuthProvider>
      <SubscriptionProvider appType="cosmichub">
        {children}
      </SubscriptionProvider>
    </AuthProvider>
  </MemoryRouter>
);
