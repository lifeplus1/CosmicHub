export const initializeApp = jest.fn(() => ({}));
export const getAuth = jest.fn(() => ({
  currentUser: null,
}));
export const createUserWithEmailAndPassword = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const onAuthStateChanged = jest.fn((auth, callback) => {
  callback(null); // Mock no user by default
  return jest.fn(); // Mock unsubscribe
});
export const browserSessionPersistence = jest.fn();
export const setPersistence = jest.fn();