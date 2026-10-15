import { useCallback, useEffect, useState } from "react";
import type { ProspectClient, ProspectStatus } from "@raskha/client-management";
import { adminFetch } from "@raskha/shared";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { appendBranchParam } from "../../lib/branchFilter";

export function useProspectList(statusFilter?: ProspectStatus | "") {
  const { agency } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [prospects, setProspects] = useState<ProspectClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!agency) { setIsLoading(false); return; }

    setIsLoading(true);
    setError("");

    let path = statusFilter
      ? `/api/prospects?status=${encodeURIComponent(statusFilter)}`
      : `/api/prospects`;
    path = appendBranchParam(path, activeBranchId);

    adminFetch<ProspectClient[]>(path, { requireAuth: false })
      .then((data) => setProspects(data))
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load prospects.");
      })
      .finally(() => setIsLoading(false));
  }, [agency, activeBranchId, statusFilter, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { prospects, isLoading, error, reload };
}
