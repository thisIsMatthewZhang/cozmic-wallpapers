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

export function AppUserProvider({ children }: PropsWithChildren) {
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
            await signInAnonymously(auth);
            return;
          }

          const result = await initializeAppUser();
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
