import React, { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';

export const TestWrapper = ({ children }: { children: ReactNode }): JSX.Element => (
  <MemoryRouter>
    <AuthProvider>
      <SubscriptionProvider>
        {children}
      </SubscriptionProvider>
    </AuthProvider>
  </MemoryRouter>
);
