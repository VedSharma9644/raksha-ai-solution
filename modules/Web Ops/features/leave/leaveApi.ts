import { adminFetch } from "../../lib/adminApi";
import type { LeaveRequest, LeaveRequestStatus } from "./leaveTypes";

type ApiLeaveRequest = {
  id: string;
  guardName: string;
  employeeCode: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveRequestStatus;
};

type LeaveListResponse = {
  requests: ApiLeaveRequest[];
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

function toLeaveRequest(item: ApiLeaveRequest): LeaveRequest {
  return {
    id: item.id,
    guardName: item.guardName,
    employeeCode: item.employeeCode,
    leaveType: item.leaveType,
    startDate: item.startDate,
    endDate: item.endDate,
    reason: item.reason,
    status: item.status,
  };
}

export async function fetchAgencyLeaveRequests(
  status: "all" | LeaveRequestStatus = "all",
  branchId?: string | null
): Promise<{ requests: LeaveRequest[]; counts: LeaveListResponse["counts"] }> {
  const query = new URLSearchParams({ status });
  if (branchId) query.set("branchId", branchId);
  const data = await adminFetch<LeaveListResponse>(
    `/api/leave/requests?${query.toString()}`,
    { errorMessage: "You must be signed in to manage leave." }
  );
  return {
    requests: (data.requests ?? []).map(toLeaveRequest),
    counts: data.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 },
  };
}

export async function decideAgencyLeaveRequest(
  leaveId: string,
  status: Extract<LeaveRequestStatus, "approved" | "rejected">,
  remark?: string
): Promise<{ id: string; status: LeaveRequestStatus; message: string }> {
  const path =
    status === "approved"
      ? `/api/leave/requests/${encodeURIComponent(leaveId)}/approve`
      : `/api/leave/requests/${encodeURIComponent(leaveId)}/reject`;

  const data = await adminFetch<{
    id?: string;
    status?: LeaveRequestStatus;
    message?: string;
  }>(path, {
    method: "POST",
    body: JSON.stringify(
      status === "approved"
        ? { approvalNote: remark }
        : { rejectionRemark: remark }
    ),
    errorMessage: "You must be signed in to manage leave.",
  });

  return {
    id: data.id ?? leaveId,
    status: data.status ?? status,
    message: data.message ?? "Leave updated.",
  };
}
