import { auth } from "../../lib/firebase";
import type { ReliefRequest, ReliefRequestStatus } from "./reliefTypes";

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

type ApiReliefRequest = {
  id: string;
  guardId: string;
  guardName: string;
  employeeCode: string;
  methodLabel: string;
  reasonLabel: string;
  note: string;
  status: ReliefRequestStatus;
  siteName: string;
  postName: string;
  dutyDate: string;
  shiftFrom: string;
  shiftTo: string;
  handoverFrom?: string;
  assignedGuardId?: string;
  assignedGuardName?: string;
};

type ReliefListResponse = {
  requests: ApiReliefRequest[];
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
    throw new Error("You must be signed in to manage relief.");
  }
  headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  return headers;
}

function toReliefRequest(item: ApiReliefRequest): ReliefRequest {
  return {
    id: item.id,
    guardId: item.guardId,
    guardName: item.guardName,
    employeeCode: item.employeeCode,
    methodLabel: item.methodLabel,
    reasonLabel: item.reasonLabel,
    note: item.note,
    status: item.status,
    siteName: item.siteName,
    postName: item.postName,
    dutyDate: item.dutyDate,
    shiftFrom: item.shiftFrom,
    shiftTo: item.shiftTo,
    handoverFrom: item.handoverFrom,
    assignedGuardId: item.assignedGuardId,
    assignedGuardName: item.assignedGuardName,
  };
}

export async function fetchAgencyReliefRequests(
  status: "all" | ReliefRequestStatus = "all",
  branchId?: string | null,
): Promise<{ requests: ReliefRequest[]; counts: ReliefListResponse["counts"] }> {
  const query = new URLSearchParams({ status });
  if (branchId) query.set("branchId", branchId);
  const response = await fetch(
    `${API_BASE}/api/relief/requests?${query.toString()}`,
    { headers: await authHeaders() },
  );
  const data = (await response.json().catch(() => ({}))) as ReliefListResponse & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return {
    requests: (data.requests ?? []).map(toReliefRequest),
    counts: data.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 },
  };
}

export async function decideAgencyReliefRequest(
  reliefId: string,
  status: Extract<ReliefRequestStatus, "approved" | "rejected">,
  params?: { assignedGuardId?: string; remark?: string },
): Promise<{ id: string; status: ReliefRequestStatus; message: string }> {
  const path =
    status === "approved"
      ? `/api/relief/requests/${encodeURIComponent(reliefId)}/approve`
      : `/api/relief/requests/${encodeURIComponent(reliefId)}/reject`;

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(
      status === "approved"
        ? {
            assignedGuardId: params?.assignedGuardId,
            approvalNote: params?.remark,
          }
        : { rejectionRemark: params?.remark },
    ),
  });
  const data = (await response.json().catch(() => ({}))) as {
    id?: string;
    status?: ReliefRequestStatus;
    message?: string;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return {
    id: data.id ?? reliefId,
    status: data.status ?? status,
    message: data.message ?? "Relief updated.",
  };
}
