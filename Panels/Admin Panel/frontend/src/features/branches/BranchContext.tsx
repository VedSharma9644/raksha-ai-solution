import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Branch } from "@raskha/branch-management";
import { useAuthContext } from "../authentication";
import { auth } from "../../lib/firebase";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    if (import.meta.env.VITE_ADMIN_API_FORCE_REMOTE !== "true") {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();
const LS_KEY = "raskha_admin_active_branch";

// ─── Context value ────────────────────────────────────────────────────────────

export interface BranchContextValue {
  /** All branches for the agency, sorted by name. */
  branches: Branch[];
  /**
   * The currently selected branch ID.
   * `null` means "All Branches" (no filter applied).
   */
  activeBranchId: string | null;
  setActiveBranchId: (id: string | null) => void;
  isLoading: boolean;
  reload: () => Promise<void>;
}

const BranchContext = createContext<BranchContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BranchProvider({ children }: { children: ReactNode }) {
  const { agency } = useAuthContext();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeBranchId, setActiveBranchIdState] = useState<string | null>(
    () => localStorage.getItem(LS_KEY) ?? null
  );

  function setActiveBranchId(id: string | null) {
    setActiveBranchIdState(id);
    if (id === null) {
      localStorage.removeItem(LS_KEY);
    } else {
      localStorage.setItem(LS_KEY, id);
    }
  }

  const load = useCallback(async () => {
    if (!agency) return;
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`${API_BASE}/api/branches`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = (await res.json()) as Branch[];
      const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setBranches(sorted);
      // If the stored activeBranchId no longer exists, reset to null
      setActiveBranchIdState((prev) => {
        if (prev && !sorted.some((b) => b.id === prev)) {
          localStorage.removeItem(LS_KEY);
          return null;
        }
        return prev;
      });
    } catch {
      // silently fail — non-blocking
    } finally {
      setIsLoading(false);
    }
  }, [agency]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <BranchContext.Provider
      value={{ branches, activeBranchId, setActiveBranchId, isLoading, reload: load }}
    >
      {children}
    </BranchContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBranchContext(): BranchContextValue {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error("useBranchContext must be used inside <BranchProvider>");
  }
  return ctx;
}
