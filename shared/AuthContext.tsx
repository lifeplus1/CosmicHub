import { createAuthContext } from '../../../shared/AuthContext';
import { auth } from '../firebase';

// Create auth context instance with our firebase auth
const { AuthProvider, useAuth } = createAuthContext(auth);

export { AuthProvider, useAuth };