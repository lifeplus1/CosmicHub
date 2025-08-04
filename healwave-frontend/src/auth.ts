import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getIdToken,
  setPersistence,
  browserSessionPersistence,
  type NextOrObserver,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

export async function signUp(email: string, password: string) {
  try {
    await setPersistence(auth, browserSessionPersistence);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
      const err = error as { code: string; message: string };
      throw new Error(err.code === "auth/email-already-in-use" ? "Email already in use" : err.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

export async function logIn(email: string, password: string) {
  try {
    await setPersistence(auth, browserSessionPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      throw new Error((error as { message: string }).message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      throw new Error((error as { message: string }).message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

export async function getAuthToken() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    return await getIdToken(user, true);
  } catch (error) {
    if (typeof error === "object" && error !== null && "message" in error) {
      throw new Error((error as { message: string }).message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

export function onAuthChange(callback: NextOrObserver<User>) {
  return onAuthStateChanged(auth, callback);
}
