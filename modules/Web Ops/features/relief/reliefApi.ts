import { adminFetch } from "../../lib/adminApi";
import type { ReliefRequest, ReliefRequestStatus } from "./reliefTypes";

type ApiReliefRequest = {
  id: string;
  guardId: string;
  guardName: string;
  employeeCode: string;
  methodLabel: string;
  reasonLabel: string;
  note: string;
  status: ReliefRequestStatus;
  siteId?: string;
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
    siteId: item.siteId ?? "",
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
  branchId?: string | null
): Promise<{ requests: ReliefRequest[]; counts: ReliefListResponse["counts"] }> {
  const query = new URLSearchParams({ status });
  if (branchId) query.set("branchId", branchId);
  const data = await adminFetch<ReliefListResponse>(
    `/api/relief/requests?${query.toString()}`,
    { errorMessage: "You must be signed in to manage relief." }
  );
  return {
    requests: (data.requests ?? []).map(toReliefRequest),
    counts: data.counts ?? { all: 0, pending: 0, approved: 0, rejected: 0 },
  };
}

export async function decideAgencyReliefRequest(
  reliefId: string,
  status: Extract<ReliefRequestStatus, "approved" | "rejected">,
  params?: { assignedGuardId?: string; remark?: string }
): Promise<{ id: string; status: ReliefRequestStatus; message: string }> {
  const path =
    status === "approved"
      ? `/api/relief/requests/${encodeURIComponent(reliefId)}/approve`
      : `/api/relief/requests/${encodeURIComponent(reliefId)}/reject`;

  const data = await adminFetch<{
    id?: string;
    status?: ReliefRequestStatus;
    message?: string;
  }>(path, {
    method: "POST",
    body: JSON.stringify(
      status === "approved"
        ? {
            assignedGuardId: params?.assignedGuardId,
            approvalNote: params?.remark,
          }
        : { rejectionRemark: params?.remark }
    ),
    errorMessage: "You must be signed in to manage relief.",
  });

  return {
    id: data.id ?? reliefId,
    status: data.status ?? status,
    message: data.message ?? "Relief updated.",
  };
}
