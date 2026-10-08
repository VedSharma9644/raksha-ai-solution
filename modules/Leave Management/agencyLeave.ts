import { getFirestore, type Timestamp } from "firebase-admin/firestore";

import {
  LEAVE_REQUESTS_COLLECTION,
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
