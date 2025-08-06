import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Auth } from 'firebase/auth';
import type { ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function createAuthContext(auth: Auth): {
  AuthProvider: React.FC<{ children: ReactNode }>;
  useAuth: () => AuthContextType;
} {
  function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((firebaseUser: User | null) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return () => unsubscribe();
    }, [auth]);

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
