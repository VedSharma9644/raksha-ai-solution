import { useCallback, useEffect, useState } from "react";
import { listGuardsByAgency } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { useWebOps } from "../../context/WebOpsContext";
import { filterByBranch } from "../../lib/branchFilter";

export type UseGuardListOptions = {
  /**
   * When true (Assign Guards screen), HR also sees unassigned guards so they
   * can allot them to one of their sites.
   */
  forSiteAssignment?: boolean;
};

export function useGuardList(options: UseGuardListOptions = {}) {
  const { forSiteAssignment = false } = options;
  const { agencyId, activeBranchId, db, role, assignedSiteIds } = useWebOps();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!agencyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    const strict = role === "hr";

    listGuardsByAgency(db, agencyId)
      .then((data) => {
        let filtered = filterByBranch(data, activeBranchId, strict);
        if (role === "hr" && assignedSiteIds !== null) {
          const allowed = new Set(assignedSiteIds);
          filtered = filtered.filter((g) => {
            const siteId = (g.assignedSiteId ?? "").trim();
            if (!siteId) return forSiteAssignment; // free pool only when assigning
            return allowed.has(siteId);
          });
        }
        setGuards(filtered);
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load guards.");
      })
      .finally(() => setIsLoading(false));
  }, [
    agencyId,
    activeBranchId,
    db,
    role,
    assignedSiteIds,
    forSiteAssignment,
    tick,
  ]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { guards, isLoading, error, reload };
}
