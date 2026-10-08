import { useCallback, useEffect, useState } from "react";

import {
  decideAgencyLeaveRequest,
  fetchAgencyLeaveRequests,
} from "./leaveApi";
import type { LeaveRequest, LeaveRequestStatus } from "./leaveTypes";

export function useAgencyLeave() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAgencyLeaveRequests("all");
      setLeaveRequests(data.requests);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setLeaveRequests([]);
      setError(e.message ?? "Failed to load leave requests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = useCallback(
    async (leaveId: string, status: LeaveRequestStatus) => {
      if (status !== "approved" && status !== "rejected") {
        return;
      }
      setIsUpdatingId(leaveId);
      setError(null);
      try {
        await decideAgencyLeaveRequest(leaveId, status);
        setLeaveRequests((current) =>
          current.map((request) =>
            request.id === leaveId ? { ...request, status } : request,
          ),
        );
      } catch (err: unknown) {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to update leave request.");
        throw err;
      } finally {
        setIsUpdatingId(null);
      }
    },
    [],
  );

  return {
    leaveRequests,
    isLoading,
    isUpdatingId,
    error,
    refresh: load,
    updateStatus,
  };
}
