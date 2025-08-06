import { createAuthService } from "../../shared/auth";
import { auth } from "./firebase";

// Create auth service instance with our firebase auth
const authService = createAuthService(auth);

// Export the functions for backward compatibility
export const { signUp, logIn, logOut, getAuthToken, onAuthChange } = authService;
