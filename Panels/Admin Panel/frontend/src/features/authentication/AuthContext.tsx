import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAgencyById } from "@raskha/core";
import type { Agency } from "@raskha/core";
import { auth, db } from "../../lib/firebase";

interface AuthContextValue {
  agency: Agency | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const agencyData = await getAgencyById(db, user.uid);
        setAgency(agencyData);
      } else {
        setAgency(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  async function logout() {
    await signOut(auth);
    setAgency(null);
  }

  return (
    <AuthContext.Provider value={{ agency, isLoading, logout }}>
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
