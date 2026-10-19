import { useCallback, useEffect, useState } from "react";
import { listGuardsByAgency } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { filterByBranch } from "../../lib/branchFilter";
import { db } from "../../lib/firebase";

export function useGuardList() {
  const { hrStaff } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!hrStaff?.agencyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    const assignedSiteIds = hrStaff.assignedSiteIds;

    listGuardsByAgency(db, hrStaff.agencyId)
      .then((data) => {
        let filtered = filterByBranch(data, activeBranchId);
        // When Admin configured site assignment, only show those sites' guards
        if (assignedSiteIds !== undefined) {
          const allowed = new Set(assignedSiteIds);
          filtered = filtered.filter(
            (g) => g.assignedSiteId && allowed.has(g.assignedSiteId)
          );
        }
        setGuards(filtered);
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load guards.");
      })
      .finally(() => setIsLoading(false));
  }, [hrStaff?.agencyId, hrStaff?.assignedSiteIds, activeBranchId, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { guards, isLoading, error, reload };
}
