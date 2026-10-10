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

    listGuardsByAgency(db, hrStaff.agencyId)
      .then((data) => setGuards(filterByBranch(data, activeBranchId)))
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load guards.");
      })
      .finally(() => setIsLoading(false));
  }, [hrStaff?.agencyId, activeBranchId, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { guards, isLoading, error, reload };
}
