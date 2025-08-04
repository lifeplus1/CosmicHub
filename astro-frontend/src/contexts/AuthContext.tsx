import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  getAuthToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Use the shared auth instance from firebase.ts

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [auth]);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};