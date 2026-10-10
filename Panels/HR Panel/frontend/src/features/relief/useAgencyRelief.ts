import { useCallback, useEffect, useState } from "react";

import { useBranchContext } from "../branches";
import {
  decideAgencyReliefRequest,
  fetchAgencyReliefRequests,
} from "./reliefApi";
import type { ReliefRequest, ReliefRequestStatus } from "./reliefTypes";

export function useAgencyRelief() {
  const { activeBranchId } = useBranchContext();
  const [reliefRequests, setReliefRequests] = useState<ReliefRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (branchId: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAgencyReliefRequests("all", branchId);
      setReliefRequests(data.requests);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setReliefRequests([]);
      setError(e.message ?? "Failed to load relief requests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(activeBranchId);
  }, [activeBranchId, load]);

  const updateStatus = useCallback(
    async (
      reliefId: string,
      status: ReliefRequestStatus,
      assignedGuardId?: string,
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
    [activeBranchId, load],
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
