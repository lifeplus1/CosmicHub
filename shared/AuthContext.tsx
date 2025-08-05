import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User, type Auth } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  getAuthToken: () => Promise<string | null>;
}

export function createAuthContext(auth: Auth) {
  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return () => unsubscribe();
    }, []);

    const getAuthToken = async () => {
      if (!user) return null;
      try {
        // Force refresh the token to ensure it's not expired
        const token = await user.getIdToken(true);
        return token;
      } catch (error) {
        console.error('Error getting auth token:', error);
        // If token refresh fails, try to get a cached token
        try {
          return await user.getIdToken(false);
        } catch (fallbackError) {
          console.error('Error getting cached auth token:', fallbackError);
          return null;
        }
      }
    };

    return (
      <AuthContext.Provider value={{ user, getAuthToken }}>
        {children}
      </AuthContext.Provider>
    );
  };

  const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };

  return { AuthProvider, useAuth };
}