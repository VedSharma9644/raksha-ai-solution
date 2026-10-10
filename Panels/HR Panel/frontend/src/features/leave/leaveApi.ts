import { auth } from "../../lib/firebase";
import type { LeaveRequest, LeaveRequestStatus } from "./leaveTypes";

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    const forceRemote = import.meta.env.VITE_ADMIN_API_FORCE_REMOTE === "true";
    if (!forceRemote) {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();

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

async function authHeaders(): Promise<Headers> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to manage leave.");
  }
  headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  return headers;
}

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
  branchId?: string | null,
): Promise<{ requests: LeaveRequest[]; counts: LeaveListResponse["counts"] }> {
  const query = new URLSearchParams({ status });
  if (branchId) query.set("branchId", branchId);
  const response = await fetch(
    `${API_BASE}/api/leave/requests?${query.toString()}`,
    { headers: await authHeaders() },
  );
  const data = (await response.json().catch(() => ({}))) as LeaveListResponse & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return {
    requests: (data.requests ?? []).map(toLeaveRequest),
    counts: data.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 },
  };
}

export async function decideAgencyLeaveRequest(
  leaveId: string,
  status: Extract<LeaveRequestStatus, "approved" | "rejected">,
  remark?: string,
): Promise<{ id: string; status: LeaveRequestStatus; message: string }> {
  const path =
    status === "approved"
      ? `/api/leave/requests/${encodeURIComponent(leaveId)}/approve`
      : `/api/leave/requests/${encodeURIComponent(leaveId)}/reject`;

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(
      status === "approved"
        ? { approvalNote: remark }
        : { rejectionRemark: remark },
    ),
  });
  const data = (await response.json().catch(() => ({}))) as {
    id?: string;
    status?: LeaveRequestStatus;
    message?: string;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return {
    id: data.id ?? leaveId,
    status: data.status ?? status,
    message: data.message ?? "Leave updated.",
  };
}
