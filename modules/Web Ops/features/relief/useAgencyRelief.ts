import { useCallback, useEffect, useState } from "react";

import { useWebOps } from "../../context/WebOpsContext";
import {
  decideAgencyReliefRequest,
  fetchAgencyReliefRequests,
} from "./reliefApi";
import type { ReliefRequest, ReliefRequestStatus } from "./reliefTypes";

export function useAgencyRelief() {
  const { activeBranchId, role, assignedSiteIds } = useWebOps();
  const [reliefRequests, setReliefRequests] = useState<ReliefRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (branchId: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAgencyReliefRequests("all", branchId);
      let requests = data.requests;
      if (role === "hr" && assignedSiteIds !== null) {
        const allowed = new Set(assignedSiteIds);
        requests = requests.filter((r) => r.siteId && allowed.has(r.siteId));
      }
      setReliefRequests(requests);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setReliefRequests([]);
      setError(e.message ?? "Failed to load relief requests.");
    } finally {
      setIsLoading(false);
    }
  }, [role, assignedSiteIds]);

  useEffect(() => {
    void load(activeBranchId);
  }, [activeBranchId, load]);

  const updateStatus = useCallback(
    async (
      reliefId: string,
      status: ReliefRequestStatus,
      assignedGuardId?: string
    ) => {
      if (status !== "approved" && status !== "rejected") {
        return;
      }
      if (status === "approved" && !assignedGuardId?.trim()) {
        setError("Select a replacement guard before approving.");
        throw new Error("Select a replacement guard before approving.");
      }
      setIsUpdatingId(reliefId);
      setError(null);
      try {
        await decideAgencyReliefRequest(reliefId, status, { assignedGuardId });
        await load(activeBranchId);
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to update relief request.");
        throw err;
      } finally {
        setIsUpdatingId(null);
      }
    },
    [activeBranchId, load]
  );

  return {
    reliefRequests,
    isLoading,
    isUpdatingId,
    error,
    refresh: () => load(activeBranchId),
    updateStatus,
  };
}
