import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { httpsCallable } from "firebase/functions";

import { auth, functions } from "../utils/firebase";

type InitializeAppUserResponse = {
  created: boolean;
  creditBalance: number;
  uid: string;
};

type AppUserContextValue = {
  bootstrapMessage: string;
  creditBalance: number | null;
  errorMessage: string | null;
  isBootstrapping: boolean;
  uid: string | null;
};

const AppUserContext = createContext<AppUserContextValue | undefined>(undefined);

const initializeAppUser = httpsCallable<void, InitializeAppUserResponse>(
  functions,
  "initializeAppUser",
);

const BOOTSTRAP_TIMEOUT_MS = 20000;

function withTimeout<T>(promise: Promise<T>, message: string) {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), BOOTSTRAP_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export function AppUserProvider({ children }: PropsWithChildren) {
  const [bootstrapMessage, setBootstrapMessage] = useState("Checking account...");
  const [uid, setUid] = useState<string | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      void (async () => {
        try {
          setErrorMessage(null);

          if (!nextUser) {
            setBootstrapMessage("Signing in anonymously...");
            await withTimeout(
              signInAnonymously(auth),
              "Timed out signing in anonymously.",
            );
            return;
          }

          setBootstrapMessage("Initializing app profile...");
          const result = await withTimeout(
            initializeAppUser(),
            "Timed out initializing your app profile.",
          );
          if (!isMounted) return;

          setUid(result.data.uid);
          setCreditBalance(result.data.creditBalance);
          setIsBootstrapping(false);
        } catch (error) {
          if (!isMounted) return;
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to initialize app user.",
          );
          setIsBootstrapping(false);
        }
      })();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AppUserContext.Provider
      value={{
        bootstrapMessage,
        creditBalance,
        errorMessage,
        isBootstrapping,
        uid,
      }}
    >
      {children}
    </AppUserContext.Provider>
  );
}

export function useAppUser() {
  const context = useContext(AppUserContext);

  if (!context) {
    throw new Error("useAppUser must be used within an AppUserProvider.");
  }

  return context;
}
