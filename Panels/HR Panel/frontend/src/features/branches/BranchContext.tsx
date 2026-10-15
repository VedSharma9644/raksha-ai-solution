import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Branch } from "@raskha/branch-management";
import { adminFetch } from "@raskha/shared";
import { useAuthContext } from "../authentication";

const LS_KEY = "raskha_hr_active_branch";

// ─── Context value ────────────────────────────────────────────────────────────

export interface BranchContextValue {
  /**
   * Branches this HR staff member is assigned to.
   * Empty array = no assignments yet.
   */
  branches: Branch[];
  /**
   * The currently selected branch ID.
   * `null` only when HR has multiple branches and hasn't picked one yet
   * (triggers the branch selection screen).
   */
  activeBranchId: string | null;
  setActiveBranchId: (id: string | null) => void;
  /** True when HR has multiple branches and no branch is selected yet. */
  needsBranchSelection: boolean;
  isLoading: boolean;
  reload: () => Promise<void>;
}

const BranchContext = createContext<BranchContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BranchProvider({ children }: { children: ReactNode }) {
  const { hrStaff } = useAuthContext();
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
    if (!hrStaff) return;
    const assignedIds = hrStaff.assignedBranchIds ?? [];
    if (assignedIds.length === 0) {
      setBranches([]);
      return;
    }
    setIsLoading(true);
    try {
      // Fetch all branches the agency has, then filter to assigned ones
      const allBranches = await adminFetch<Branch[]>("/api/branches", {
        requireAuth: false,
      });
      const myBranches = allBranches
        .filter((b) => assignedIds.includes(b.id))
        .sort((a, b) => a.name.localeCompare(b.name));
      setBranches(myBranches);
      // If stored activeBranchId is no longer in assigned list, reset to null
      setActiveBranchIdState((prev) => {
        if (prev && !myBranches.some((b) => b.id === prev)) {
          localStorage.removeItem(LS_KEY);
          return null;
        }
        // Auto-select if only one branch is assigned
        if (!prev && myBranches.length === 1) {
          localStorage.setItem(LS_KEY, myBranches[0].id);
          return myBranches[0].id;
        }
        return prev;
      });
    } catch {
      // silently fail — non-blocking
    } finally {
      setIsLoading(false);
    }
  }, [hrStaff]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <BranchContext.Provider
      value={{
        branches,
        activeBranchId,
        setActiveBranchId,
        needsBranchSelection: branches.length > 1 && activeBranchId === null,
        isLoading,
        reload: load,
      }}
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
