import { createAuthContext } from './createAuthContext';
import { auth } from './firebase';

const { AuthProvider, useAuth }: {
  AuthProvider: React.FC<{ children: React.ReactNode }>;
  useAuth: () => { user: import('firebase/auth').User | null; loading: boolean };
} = createAuthContext(auth);

export { AuthProvider, useAuth };
