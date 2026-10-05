import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getHrStaffById } from "@raskha/hr-management";
import type { HrStaff } from "@raskha/hr-management";
import { auth, db } from "../../lib/firebase";

interface AuthContextValue {
  hrStaff: HrStaff | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hrStaff, setHrStaff] = useState<HrStaff | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getHrStaffById(db, user.uid);
        if (!data || data.status !== "active") {
          // Signed into Firebase but not a valid active HR user — force sign out
          await signOut(auth);
          setHrStaff(null);
        } else {
          setHrStaff(data);
        }
      } else {
        setHrStaff(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  async function logout() {
    await signOut(auth);
    setHrStaff(null);
  }

  return (
    <AuthContext.Provider value={{ hrStaff, isLoading, logout }}>
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
