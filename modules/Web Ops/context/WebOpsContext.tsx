import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import type { Firestore } from "firebase/firestore";
import type { GetIdToken } from "../lib/adminApi";
import { bindWebOpsRuntime } from "../lib/webOpsRuntime";

export type WebOpsRole = "agency" | "hr";

export type WebOpsCapabilities = {
  /** Show attendance day corrections + month review. */
  canCorrectAttendance: boolean;
  /** Show Add/Edit site affordances on the site list. */
  canEditSites: boolean;
};

export type WebOpsContextValue = {
  role: WebOpsRole;
  /** Agency id for the signed-in admin or HR staff. Null when logged out. */
  agencyId: string | null;
  /** Active branch filter; null = all branches (Admin) or unset. */
  activeBranchId: string | null;
  db: Firestore;
  getIdToken: GetIdToken;
  capabilities: WebOpsCapabilities;
};

const WebOpsContext = createContext<WebOpsContextValue | null>(null);

export type WebOpsProviderProps = {
  value: WebOpsContextValue;
  children: ReactNode;
};

export function WebOpsProvider({ value, children }: WebOpsProviderProps) {
  useEffect(() => {
    bindWebOpsRuntime({
      getIdToken: value.getIdToken,
      db: value.db,
    });
  }, [value.getIdToken, value.db]);

  return (
    <WebOpsContext.Provider value={value}>{children}</WebOpsContext.Provider>
  );
}

export function useWebOps(): WebOpsContextValue {
  const ctx = useContext(WebOpsContext);
  if (!ctx) {
    throw new Error("useWebOps must be used within a WebOpsProvider.");
  }
  return ctx;
}
