import { useEffect, useState } from "react";
import { listSitesByAgency } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { filterByBranch } from "../../lib/branchFilter";
import { db } from "../../lib/firebase";

export function useSiteList() {
  const { agency } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!agency) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    listSitesByAgency(db, agency.id)
      .then((data) => setSites(filterByBranch(data, activeBranchId)))
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load sites.");
      })
      .finally(() => setIsLoading(false));
  }, [agency, activeBranchId]);

  return { sites, isLoading, error };
}
