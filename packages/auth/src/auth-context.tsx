/**
 * Auth Context - Migrated from shared/
 * This provides the AuthProvider and useAuth hook for the application
 */
import { createAuthContext } from './create-auth-context';
import { auth as baseAuth, hasAuthAvailable } from '@cosmichub/config/firebase';
import type { Auth, Unsubscribe, User } from 'firebase/auth';

// Create a safe auth with a no-op onAuthStateChanged when auth isn't available
const safeAuth: Auth = (baseAuth !== undefined && hasAuthAvailable === true)
	? baseAuth
		: new Proxy({} as Auth, {
				get(_target, prop): unknown {
				if (prop === 'onAuthStateChanged') {
					return (callback: (user: User | null) => void): Unsubscribe => {
						callback(null);
						return () => {};
					};
				}
				if (prop === 'currentUser') return null;
				return undefined;
			}
		});

// Create auth context instance with our firebase auth
const { AuthProvider, useAuth } = createAuthContext(safeAuth);

export { AuthProvider, useAuth };
