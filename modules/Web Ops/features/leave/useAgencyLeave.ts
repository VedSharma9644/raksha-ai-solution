import { useCallback, useEffect, useState } from "react";

import { useWebOps } from "../../context/WebOpsContext";
import {
  decideAgencyLeaveRequest,
  fetchAgencyLeaveRequests,
} from "./leaveApi";
import type { LeaveRequest, LeaveRequestStatus } from "./leaveTypes";

export function useAgencyLeave() {
  const { activeBranchId, role, assignedSiteIds } = useWebOps();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (branchId: string | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAgencyLeaveRequests("all", branchId);
      let requests = data.requests;
      if (role === "hr" && assignedSiteIds !== null) {
        const allowed = new Set(assignedSiteIds);
        requests = requests.filter((r) => r.siteId && allowed.has(r.siteId));
      }
      setLeaveRequests(requests);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setLeaveRequests([]);
      setError(e.message ?? "Failed to load leave requests.");
    } finally {
      setIsLoading(false);
    }
  }, [role, assignedSiteIds]);

  useEffect(() => {
    void load(activeBranchId);
  }, [activeBranchId, load]);

  const updateStatus = useCallback(
    async (
      leaveId: string,
      status: LeaveRequestStatus,
      remark?: string
    ) => {
      if (status !== "approved" && status !== "rejected") {
        return;
      }
      if (status === "rejected" && !remark?.trim()) {
        setError("A rejection remark is required.");
        throw new Error("A rejection remark is required.");
      }
      setIsUpdatingId(leaveId);
      setError(null);
      try {
        await decideAgencyLeaveRequest(leaveId, status, remark?.trim());
        setLeaveRequests((current) =>
          current.map((request) =>
            request.id === leaveId ? { ...request, status } : request
          )
        );
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to update leave request.");
        throw err;
      } finally {
        setIsUpdatingId(null);
      }
    },
    []
  );

  return {
    leaveRequests,
    isLoading,
    isUpdatingId,
    error,
    refresh: () => load(activeBranchId),
    updateStatus,
  };
}
