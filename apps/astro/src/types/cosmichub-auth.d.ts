// Type declarations for @cosmichub/auth package
declare module '@cosmichub/auth' {
  import { ReactNode, FC } from 'react';
  import { User } from 'firebase/auth';

  export interface AuthState {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
  }

  export const useAuth: () => AuthState;

  export interface AuthProviderProps {
    children: ReactNode;
    appName?: string;
  }

  export const AuthProvider: FC<AuthProviderProps>;

  export const logIn: (email: string, password: string) => Promise<User>;
  export const signUp: (email: string, password: string) => Promise<User>;
  export const logOut: () => Promise<void>;

  export interface SubscriptionState {
    subscription: any | null;
    userTier: string;
    tier: string; // Alias for userTier for compatibility
    isLoading: boolean;
    hasFeature: (feature: string, app?: 'astro' | 'healwave') => boolean;
    upgradeRequired: (feature: string) => void;
    refreshSubscription: () => Promise<void>;
    checkUsageLimit?: (limitType: string) => { allowed: boolean; current: number; limit: number };
  }

  export const useSubscription: () => SubscriptionState;

  export interface SubscriptionProviderProps {
    children: ReactNode;
    appType: string;
  }

  export const SubscriptionProvider: FC<SubscriptionProviderProps>;

  export * from 'firebase/auth';
}
