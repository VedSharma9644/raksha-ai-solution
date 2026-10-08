import { getFirestore, Timestamp } from "firebase-admin/firestore";

import {
  LEAVE_REQUESTS_COLLECTION,
  LEAVE_TYPE_LABELS,
  type LeaveRequestRecord,
  type LeaveRequestStatus,
  type LeaveTypeKey,
} from "./leave";

function asData(raw: unknown): Record<string, unknown> {
  return (raw ?? {}) as Record<string, unknown>;
}

function isLeaveType(value: unknown): value is LeaveTypeKey {
  return value === "CL" || value === "SL" || value === "EL";
}

function mapRecord(id: string, data: Record<string, unknown>): LeaveRequestRecord {
  return {
    id,
    guardId: String(data.guardId ?? ""),
    agencyId: String(data.agencyId ?? ""),
    employeeCode: String(data.employeeCode ?? ""),
    guardName: String(data.guardName ?? ""),
    leaveType: isLeaveType(data.leaveType) ? data.leaveType : "CL",
    startDate: String(data.startDate ?? ""),
    endDate: String(data.endDate ?? ""),
    dayCount: Number(data.dayCount ?? 0),
    reason: String(data.reason ?? ""),
    note: String(data.note ?? ""),
    status: (data.status as LeaveRequestStatus) ?? "pending",
    siteId: String(data.siteId ?? ""),
    siteName: String(data.siteName ?? ""),
    supervisorName: String(data.supervisorName ?? "Supervisor"),
    appliedAt: data.appliedAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
    decidedAt: data.decidedAt as Timestamp | undefined,
  };
}

/**
 * Agency-scoped leave requests (Admin / HR). Single-field query + in-memory filters.
 */
export async function listLeaveRequestsForAgency(params: {
  agencyId: string;
  status?: LeaveRequestStatus | LeaveRequestStatus[];
}): Promise<LeaveRequestRecord[]> {
  const agencyId = params.agencyId.trim();
  if (!agencyId) {
    return [];
  }

  const snap = await getFirestore()
    .collection(LEAVE_REQUESTS_COLLECTION)
    .where("agencyId", "==", agencyId)
    .get();

  const statusFilter = params.status
    ? new Set(Array.isArray(params.status) ? params.status : [params.status])
    : null;

  const records = snap.docs
    .map((doc) => mapRecord(doc.id, asData(doc.data())))
    .filter((record) => {
      if (record.status === "withdrawn") {
        return false;
      }
      if (statusFilter && !statusFilter.has(record.status)) {
        return false;
      }
      return true;
    });

  records.sort((a, b) => {
    const aMs = a.appliedAt?.toMillis?.() ?? 0;
    const bMs = b.appliedAt?.toMillis?.() ?? 0;
    return bMs - aMs;
  });

  return records;
}

export type AgencyLeaveRequestDto = {
  id: string;
  guardId: string;
  guardName: string;
  employeeCode: string;
  leaveType: string;
  leaveTypeKey: LeaveTypeKey;
  startDate: string;
  endDate: string;
  dayCount: number;
  reason: string;
  note: string;
  status: Exclude<LeaveRequestStatus, "withdrawn">;
  siteName: string;
  appliedAt: string | null;
};

export type AgencyLeaveListResponse = {
  requests: AgencyLeaveRequestDto[];
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

function toAgencyDto(record: LeaveRequestRecord): AgencyLeaveRequestDto | null {
  if (record.status === "withdrawn") {
    return null;
  }
  const reason =
    record.note.trim() ||
    record.reason.trim() ||
    (record.status === "rejected"
      ? record.rejectionRemark?.trim() || "—"
      : "—");

  return {
    id: record.id,
    guardId: record.guardId,
    guardName: record.guardName || "Guard",
    employeeCode: record.employeeCode || "—",
    leaveType: LEAVE_TYPE_LABELS[record.leaveType] ?? record.leaveType,
    leaveTypeKey: record.leaveType,
    startDate: record.startDate,
    endDate: record.endDate,
    dayCount: record.dayCount,
    reason,
    note: record.note,
    status: record.status,
    siteName: record.siteName || "",
    appliedAt: record.appliedAt?.toDate?.()?.toISOString?.() ?? null,
  };
}

export async function listAgencyLeaveRequestsDto(params: {
  agencyId: string;
  status?: "all" | "pending" | "approved" | "rejected";
}): Promise<AgencyLeaveListResponse> {
  const all = await listLeaveRequestsForAgency({ agencyId: params.agencyId });
  const visible = all.filter((r) => r.status !== "withdrawn");
  const filtered =
    !params.status || params.status === "all"
      ? visible
      : visible.filter((r) => r.status === params.status);

  const requests = filtered
    .map(toAgencyDto)
    .filter((dto): dto is AgencyLeaveRequestDto => Boolean(dto));

  return {
    requests,
    counts: {
      all: visible.length,
      pending: visible.filter((r) => r.status === "pending").length,
      approved: visible.filter((r) => r.status === "approved").length,
      rejected: visible.filter((r) => r.status === "rejected").length,
    },
  };
}

export type DecideLeaveParams = {
  agencyId: string;
  requestId: string;
  decision: "approved" | "rejected";
  decidedByName?: string;
  remark?: string;
};

export type DecideLeaveResult = {
  id: string;
  status: "approved" | "rejected";
  message: string;
  guardId: string;
  agencyId: string;
  leaveType: LeaveTypeKey;
  startDate: string;
  endDate: string;
  guardName: string;
};

export async function decideLeaveRequest(
  params: DecideLeaveParams
): Promise<DecideLeaveResult> {
  const agencyId = params.agencyId.trim();
  const requestId = params.requestId.trim();
  if (!agencyId || !requestId) {
    throw Object.assign(new Error("agencyId and requestId are required."), {
      statusCode: 400,
    });
  }

  const ref = getFirestore().collection(LEAVE_REQUESTS_COLLECTION).doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw Object.assign(new Error("Leave request not found."), {
      statusCode: 404,
    });
  }

  const data = asData(snap.data());
  if (String(data.agencyId ?? "") !== agencyId) {
    throw Object.assign(new Error("You cannot decide this leave request."), {
      statusCode: 403,
    });
  }
  if (data.status !== "pending") {
    throw Object.assign(
      new Error("Only pending leave requests can be approved or rejected."),
      { statusCode: 400 }
    );
  }

  const now = Timestamp.now();
  const decidedByName = params.decidedByName?.trim() || "Supervisor";
  const remark = params.remark?.trim() || "";

  const guardId = String(data.guardId ?? "");
  const leaveType = isLeaveType(data.leaveType) ? data.leaveType : "CL";
  const startDate = String(data.startDate ?? "");
  const endDate = String(data.endDate ?? "");
  const guardName = String(data.guardName ?? "");

  if (params.decision === "approved") {
    await ref.update({
      status: "approved",
      approvalNote: `Approved by ${decidedByName}`,
      supervisorName: decidedByName,
      updatedAt: now,
      decidedAt: now,
    });
    return {
      id: requestId,
      status: "approved",
      message: "Leave request approved.",
      guardId,
      agencyId,
      leaveType,
      startDate,
      endDate,
      guardName,
    };
  }

  await ref.update({
    status: "rejected",
    rejectionRemark: remark || "Not approved by supervisor.",
    supervisorName: decidedByName,
    updatedAt: now,
    decidedAt: now,
  });

  return {
    id: requestId,
    status: "rejected",
    message: "Leave request rejected.",
    guardId,
    agencyId,
    leaveType,
    startDate,
    endDate,
    guardName,
  };
}
