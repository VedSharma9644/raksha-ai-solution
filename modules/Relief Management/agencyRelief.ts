import { getFirestore, Timestamp } from "firebase-admin/firestore";

import {
  RELIEF_METHOD_LABELS,
  RELIEF_REASON_LABELS,
  RELIEF_REQUESTS_COLLECTION,
  type ReliefMethodKey,
  type ReliefReasonKey,
  type ReliefRequestRecord,
  type ReliefRequestStatus,
} from "./relief";
import { asData, isReliefMethod, isReliefReason, mapRecord } from "./reliefService";

/**
 * Agency-scoped relief requests (Admin / HR).
 */
export async function listReliefRequestsForAgency(params: {
  agencyId: string;
  status?: ReliefRequestStatus | ReliefRequestStatus[];
}): Promise<ReliefRequestRecord[]> {
  const agencyId = params.agencyId.trim();
  if (!agencyId) {
    return [];
  }

  const snap = await getFirestore()
    .collection(RELIEF_REQUESTS_COLLECTION)
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

export type AgencyReliefRequestDto = {
  id: string;
  guardId: string;
  guardName: string;
  employeeCode: string;
  method: ReliefMethodKey;
  methodLabel: string;
  reason: ReliefReasonKey;
  reasonLabel: string;
  note: string;
  status: Exclude<ReliefRequestStatus, "withdrawn">;
  siteName: string;
  postName: string;
  dutyDate: string;
  shiftFrom: string;
  shiftTo: string;
  handoverFrom?: string;
  assignedGuardId?: string;
  assignedGuardName?: string;
  assignedEmployeeCode?: string;
  appliedAt: string | null;
};

export type AgencyReliefListResponse = {
  requests: AgencyReliefRequestDto[];
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

function toAgencyDto(
  record: ReliefRequestRecord
): AgencyReliefRequestDto | null {
  if (record.status === "withdrawn") {
    return null;
  }
  return {
    id: record.id,
    guardId: record.guardId,
    guardName: record.guardName || "Guard",
    employeeCode: record.employeeCode || "—",
    method: record.method,
    methodLabel: RELIEF_METHOD_LABELS[record.method],
    reason: record.reason,
    reasonLabel: RELIEF_REASON_LABELS[record.reason],
    note: record.note,
    status: record.status,
    siteName: record.siteName || "",
    postName: record.postName || "",
    dutyDate: record.dutyDate,
    shiftFrom: record.shiftFrom,
    shiftTo: record.shiftTo,
    handoverFrom: record.handoverFrom,
    assignedGuardId: record.assignedGuardId,
    assignedGuardName: record.assignedGuardName,
    assignedEmployeeCode: record.assignedEmployeeCode,
    appliedAt: record.appliedAt?.toDate?.()?.toISOString?.() ?? null,
  };
}

export async function listAgencyReliefRequestsDto(params: {
  agencyId: string;
  status?: "all" | "pending" | "approved" | "rejected";
}): Promise<AgencyReliefListResponse> {
  const all = await listReliefRequestsForAgency({ agencyId: params.agencyId });
  const visible = all.filter((r) => r.status !== "withdrawn");
  const filtered =
    !params.status || params.status === "all"
      ? visible
      : visible.filter((r) => r.status === params.status);

  const requests = filtered
    .map(toAgencyDto)
    .filter((dto): dto is AgencyReliefRequestDto => Boolean(dto));

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

export type DecideReliefParams = {
  agencyId: string;
  requestId: string;
  decision: "approved" | "rejected";
  decidedByName?: string;
  remark?: string;
  /** Required when approving. */
  assignedGuardId?: string;
};

export type DecideReliefResult = {
  id: string;
  status: "approved" | "rejected";
  message: string;
  guardId: string;
  agencyId: string;
  method: ReliefMethodKey;
  methodLabel: string;
  dutyDate: string;
  guardName: string;
  assignedGuardId?: string;
  assignedGuardName?: string;
};

export async function decideReliefRequest(
  params: DecideReliefParams
): Promise<DecideReliefResult> {
  const agencyId = params.agencyId.trim();
  const requestId = params.requestId.trim();
  if (!agencyId || !requestId) {
    throw Object.assign(new Error("agencyId and requestId are required."), {
      statusCode: 400,
    });
  }

  const ref = getFirestore().collection(RELIEF_REQUESTS_COLLECTION).doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw Object.assign(new Error("Relief request not found."), {
      statusCode: 404,
    });
  }

  const data = asData(snap.data());
  if (String(data.agencyId ?? "") !== agencyId) {
    throw Object.assign(new Error("You cannot decide this relief request."), {
      statusCode: 403,
    });
  }
  if (data.status !== "pending") {
    throw Object.assign(
      new Error("Only pending relief requests can be approved or rejected."),
      { statusCode: 400 }
    );
  }

  const now = Timestamp.now();
  const decidedByName = params.decidedByName?.trim() || "Admin";
  const remark = params.remark?.trim() || "";
  const guardId = String(data.guardId ?? "");
  const guardName = String(data.guardName ?? "");
  const method = isReliefMethod(data.method) ? data.method : "remaining";
  const dutyDate = String(data.dutyDate ?? "");

  if (params.decision === "rejected") {
    if (!remark) {
      throw Object.assign(
        new Error("A rejection remark is required."),
        { statusCode: 400 }
      );
    }
    await ref.update({
      status: "rejected",
      rejectionRemark: remark,
      decidedByName,
      updatedAt: now,
      decidedAt: now,
    });
    return {
      id: requestId,
      status: "rejected",
      message: "Relief request rejected.",
      guardId,
      agencyId,
      method,
      methodLabel: RELIEF_METHOD_LABELS[method],
      dutyDate,
      guardName,
    };
  }

  const assignedGuardId = params.assignedGuardId?.trim() || "";
  if (!assignedGuardId) {
    throw Object.assign(
      new Error("Select a replacement guard before approving."),
      { statusCode: 400 }
    );
  }
  if (assignedGuardId === guardId) {
    throw Object.assign(
      new Error("Replacement guard cannot be the same as the requester."),
      { statusCode: 400 }
    );
  }

  const assigneeSnap = await getFirestore()
    .collection("guards")
    .doc(assignedGuardId)
    .get();
  if (!assigneeSnap.exists) {
    throw Object.assign(new Error("Selected replacement guard was not found."), {
      statusCode: 404,
    });
  }
  const assignee = asData(assigneeSnap.data());
  if (String(assignee.agencyId ?? "") !== agencyId) {
    throw Object.assign(
      new Error("Replacement guard must belong to your agency."),
      { statusCode: 403 }
    );
  }

  const assignedGuardName = String(assignee.fullName ?? "").trim() || "Guard";
  const assignedEmployeeCode = String(assignee.employeeCode ?? "").trim();

  await ref.update({
    status: "approved",
    assignedGuardId,
    assignedGuardName,
    assignedEmployeeCode,
    approvalNote: remark || `Approved by ${decidedByName}`,
    decidedByName,
    updatedAt: now,
    decidedAt: now,
  });

  return {
    id: requestId,
    status: "approved",
    message: "Relief request approved and replacement assigned.",
    guardId,
    agencyId,
    method,
    methodLabel: RELIEF_METHOD_LABELS[method],
    dutyDate,
    guardName,
    assignedGuardId,
    assignedGuardName,
  };
}
