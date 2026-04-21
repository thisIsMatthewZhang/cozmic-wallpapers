import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "../utils/firebase";

type SignUpParams = {
  email: string;
  password: string;
  displayName?: string;
};

type AuthContextValue = {
  user: User | null;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function formatFirebaseError(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "That email is already in use. Try signing in instead.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/missing-password":
      case "auth/weak-password":
        return "Use a password with at least 6 characters.";
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Those credentials do not match an account.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      default:
        return "Something went wrong with authentication. Please try again.";
    }
  }

  return "Something went wrong with authentication. Please try again.";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsBootstrapping(false);
    });

    return unsubscribe;
  }, []);

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signIn = async (email: string, password: string) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      setAuthError(formatFirebaseError(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const signUp = async ({ email, password, displayName }: SignUpParams) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (displayName?.trim()) {
        await updateProfile(credentials.user, {
          displayName: displayName.trim(),
        });
      }
    } catch (error) {
      setAuthError(formatFirebaseError(error));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isBootstrapping,
        isSubmitting,
        authError,
        signIn,
        signUp,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
