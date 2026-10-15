import { useCallback, useEffect, useState } from "react";
import { listGuardsByAgency } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { useWebOps } from "../../context/WebOpsContext";
import { filterByBranch } from "../../lib/branchFilter";

export function useGuardList() {
  const { agencyId, activeBranchId, db } = useWebOps();
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

    listGuardsByAgency(db, agencyId)
      .then((data) => setGuards(filterByBranch(data, activeBranchId)))
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load guards.");
      })
      .finally(() => setIsLoading(false));
  }, [agencyId, activeBranchId, db, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { guards, isLoading, error, reload };
}
