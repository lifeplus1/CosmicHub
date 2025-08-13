import { createAuthContext } from './createAuthContext';
// Use centralized Firebase auth to avoid duplicate initialization
import { auth as baseAuth } from '@cosmichub/config/firebase';
import type { Auth } from 'firebase/auth';

// Create a safe auth with a no-op onAuthStateChanged when auth isn't available
const safeAuth: Auth = (baseAuth && typeof (baseAuth as any).onAuthStateChanged === 'function')
	? (baseAuth as Auth)
	: (new Proxy({} as Auth, {
			get(target, prop) {
				if (prop === 'onAuthStateChanged') {
					return (callback: any) => {
						callback(null);
						return () => {};
					};
				}
				if (prop === 'currentUser') return null;
				return undefined;
			}
		}) as Auth);

// Create auth context instance with our firebase auth
const { AuthProvider, useAuth } = createAuthContext(safeAuth);

export { AuthProvider, useAuth };