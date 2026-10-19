import { useEffect, useState } from "react";
import { listSitesByAgency } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import { useWebOps } from "../../context/WebOpsContext";
import { filterByBranch } from "../../lib/branchFilter";

export function useSiteList() {
  const { agencyId, activeBranchId, db, role, assignedSiteIds } = useWebOps();
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

    // HR: only sites explicitly allotted to the working branch
    const strict = role === "hr";

    listSitesByAgency(db, agencyId)
      .then((data) => {
        let filtered = filterByBranch(data, activeBranchId, strict);
        // HR site assignment: when configured, keep only those sites
        if (role === "hr" && assignedSiteIds !== null) {
          const allowed = new Set(assignedSiteIds);
          filtered = filtered.filter((s) => allowed.has(s.id));
        }
        setSites(filtered);
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load sites.");
      })
      .finally(() => setIsLoading(false));
  }, [agencyId, activeBranchId, db, role, assignedSiteIds]);

  return { sites, isLoading, error };
}
