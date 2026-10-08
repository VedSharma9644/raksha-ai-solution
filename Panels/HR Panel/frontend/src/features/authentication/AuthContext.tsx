import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAgencyById } from "@raskha/core";
import { getHrStaffById } from "@raskha/hr-management";
import type { HrStaff } from "@raskha/hr-management";
import { resolveEnabledModules } from "@raskha/shared";
import { auth, db } from "../../lib/firebase";

interface AuthContextValue {
  hrStaff: HrStaff | null;
  /** Agency modules from Super Admin (cached on agencies.enabledModules). */
  enabledModules: string[];
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshModules: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hrStaff, setHrStaff] = useState<HrStaff | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>(
    resolveEnabledModules(null),
  );
  const [isLoading, setIsLoading] = useState(true);

  async function loadModulesForAgency(agencyId: string) {
    try {
      const agency = await getAgencyById(db, agencyId);
      setEnabledModules(resolveEnabledModules(agency?.enabledModules));
    } catch {
      setEnabledModules(resolveEnabledModules(null));
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getHrStaffById(db, user.uid);
        if (!data || data.status !== "active") {
          await signOut(auth);
          setHrStaff(null);
          setEnabledModules(resolveEnabledModules(null));
        } else {
          setHrStaff(data);
          await loadModulesForAgency(data.agencyId);
        }
      } else {
        setHrStaff(null);
        setEnabledModules(resolveEnabledModules(null));
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  async function logout() {
    await signOut(auth);
    setHrStaff(null);
    setEnabledModules(resolveEnabledModules(null));
  }

  async function refreshModules() {
    if (!hrStaff?.agencyId) {
      return;
    }
    await loadModulesForAgency(hrStaff.agencyId);
  }

  return (
    <AuthContext.Provider
      value={{ hrStaff, enabledModules, isLoading, logout, refreshModules }}
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
