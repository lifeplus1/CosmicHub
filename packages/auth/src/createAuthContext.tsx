import React, { createContext, useContext, ReactNode } from 'react';

export interface CreateAuthContextOptions<T> {
  name: string;
  defaultValue?: T;
}

export interface ProviderProps<T> {
  children: ReactNode;
  value: T;
}

export function createAuthContext<T>(options: CreateAuthContextOptions<T>) {
  const Context = createContext<T | undefined>(options.defaultValue);

  const useAuth = () => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`use${options.name} must be used within a ${options.name}Provider`);
    }
    return context;
  };

  const Provider = ({ children, value }: ProviderProps<T>) => {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  Provider.displayName = `${options.name}Provider`;

  return {
    Context,
    Provider,
    useAuth,
  };
}

export function createTypedAuthContext<T>() {
  const Context = createContext<T | undefined>(undefined);

  const useTypedAuth = () => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error('useTypedAuth must be used within a TypedAuthProvider');
    }
    return context;
  };

  const TypedProvider = ({ children, value }: ProviderProps<T>) => {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  TypedProvider.displayName = 'TypedAuthProvider';

  return {
    Context,
    Provider: TypedProvider,
    useAuth: useTypedAuth,
  };
}
