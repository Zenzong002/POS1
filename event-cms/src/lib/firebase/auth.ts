import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
  type UserCredential,
  type Unsubscribe,
} from "firebase/auth";
import { auth } from "./config";

// ─── Google Provider ──────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ─── Sign in with Email & Password ───────────────────────────────────────────

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

// ─── Sign in with Google (OAuth popup) ───────────────────────────────────────

export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

// ─── Auth State Observer ──────────────────────────────────────────────────────

/**
 * Subscribe to authentication state changes.
 * Returns an unsubscribe function — call it to clean up the listener.
 *
 * @example
 * const unsub = onAuthStateChanged((user) => {
 *   if (user) { ... } else { ... }
 * });
 * // later:
 * unsub();
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void
): Unsubscribe {
  return firebaseOnAuthStateChanged(auth, callback);
}

// ─── Current User Helper ──────────────────────────────────────────────────────

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
