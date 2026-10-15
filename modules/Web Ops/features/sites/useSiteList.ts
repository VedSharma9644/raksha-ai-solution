import { useEffect, useState } from "react";
import { listSitesByAgency } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import { useWebOps } from "../../context/WebOpsContext";
import { filterByBranch } from "../../lib/branchFilter";

export function useSiteList() {
  const { agencyId, activeBranchId, db } = useWebOps();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!agencyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    listSitesByAgency(db, agencyId)
      .then((data) => setSites(filterByBranch(data, activeBranchId)))
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load sites.");
      })
      .finally(() => setIsLoading(false));
  }, [agencyId, activeBranchId, db]);

  return { sites, isLoading, error };
}
