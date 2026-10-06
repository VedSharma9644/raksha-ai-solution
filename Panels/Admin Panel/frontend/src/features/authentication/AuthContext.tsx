import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAgencyById } from "@raskha/core";
import type { Agency } from "@raskha/core";
import { auth, db } from "../../lib/firebase";

interface AuthContextValue {
  agency: Agency | null;
  isLoading: boolean;
  /** True while login + Raksha verify is in progress — blocks GuestRoute redirect. */
  isLoginPending: boolean;
  setLoginPending: (pending: boolean) => void;
  /** Re-read agency from Firestore (e.g. after verify caches enabledModules). */
  refreshAgency: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginPending, setLoginPending] = useState(false);

  const refreshAgency = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setAgency(null);
      return;
    }
    const agencyData = await getAgencyById(db, user.uid, { fromServer: true });
    if (!agencyData || agencyData.status !== "active") {
      await signOut(auth);
      setAgency(null);
      return;
    }
    setAgency(agencyData);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const agencyData = await getAgencyById(db, user.uid);
        if (!agencyData || agencyData.status !== "active") {
          await signOut(auth);
          setAgency(null);
        } else {
          setAgency(agencyData);
        }
      } else {
        setAgency(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  async function logout() {
    setLoginPending(false);
    await signOut(auth);
    setAgency(null);
  }

  const setLoginPendingStable = useCallback((pending: boolean) => {
    setLoginPending(pending);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        agency,
        isLoading,
        isLoginPending,
        setLoginPending: setLoginPendingStable,
        refreshAgency,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return context;
}
