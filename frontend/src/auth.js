   import {
     createUserWithEmailAndPassword,
     signInWithEmailAndPassword,
     signOut,
     onAuthStateChanged,
     getIdToken,
     setPersistence,
     browserSessionPersistence,
   } from "firebase/auth";
   import { auth } from "./firebase";

   export async function signUp(email, password) {
     try {
       await setPersistence(auth, browserSessionPersistence);
       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
       return userCredential.user;
     } catch (error) {
       throw new Error(error.code === "auth/email-already-in-use" ? "Email already in use" : error.message);
     }
   }

   export async function logIn(email, password) {
     try {
       await setPersistence(auth, browserSessionPersistence);
       const userCredential = await signInWithEmailAndPassword(auth, email, password);
       return userCredential.user;
     } catch (error) {
       throw new Error(error.message);
     }
   }

   export async function logOut() {
     try {
       await signOut(auth);
     } catch (error) {
       throw new Error(error.message);
     }
   }

   export async function getAuthToken() {
     try {
       const user = auth.currentUser;
       if (!user) throw new Error("No user logged in");
       return await getIdToken(user, true);
     } catch (error) {
       throw new Error(error.message);
     }
   }

   export function onAuthChange(callback) {
     return onAuthStateChanged(auth, callback);
   }