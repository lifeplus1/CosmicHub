// NOTE: Legacy helper kept only for backward compatibility with deprecated AuthContext.
// Legacy helper (deprecated Aug 2025)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Auth, onAuthStateChanged } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function createAuthContext(auth: Auth): { AuthProvider: React.FC<{ children: ReactNode }>; useAuth: () => AuthContextType } {
  function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser): void => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return (): void => unsubscribe();
    }, []); // Remove auth from dependencies as it's stable

    return (
      <AuthContext.Provider value={{ user, loading }}>
        {children}
      </AuthContext.Provider>
    );
  }

  function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  }

  return { AuthProvider, useAuth };
}
