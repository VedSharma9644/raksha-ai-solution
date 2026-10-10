import { useCallback, useEffect, useState } from "react";
import { listSitesByAgency } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { filterByBranch } from "../../lib/branchFilter";
import { db } from "../../lib/firebase";

export function useSiteList() {
  const { hrStaff } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!hrStaff?.agencyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const data = await listSitesByAgency(db, hrStaff.agencyId);
      setSites(filterByBranch(data, activeBranchId));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load sites.");
    } finally {
      setIsLoading(false);
    }
  }, [hrStaff?.agencyId, activeBranchId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { sites, isLoading, error };
}
