import { getFirestore, Timestamp } from "firebase-admin/firestore";

import type { AuthenticatedGuardContext } from "@raskha/attendance";

import {
  RELIEF_METHOD_LABELS,
  RELIEF_REASON_LABELS,
  RELIEF_REQUESTS_COLLECTION,
  type ReliefMethodKey,
  type ReliefReasonKey,
  type ReliefRequestCardDto,
  type ReliefRequestRecord,
  type ReliefRequestsResponse,
  type ReliefRequestStatus,
} from "./relief";

const STATUS_LABELS: Record<
  Exclude<ReliefRequestStatus, "withdrawn">,
  string
> = {
  pending: "PENDING REVIEW",
  approved: "APPROVED",
  rejected: "NOT APPROVED",
};

function asData(raw: unknown): Record<string, unknown> {
  return (raw ?? {}) as Record<string, unknown>;
}

export function isReliefMethod(value: unknown): value is ReliefMethodKey {
  return value === "remaining" || value === "swap" || value === "cover";
}

export function isReliefReason(value: unknown): value is ReliefReasonKey {
  return (
    value === "urgentFamily" ||
    value === "medical" ||
    value === "transport" ||
    value === "personalEmergency"
  );
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDutyDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatTimeRange(from: string, to: string): string {
  return `${from || "—"} – ${to || "—"}`;
}

function mapRecord(
  id: string,
  data: Record<string, unknown>
): ReliefRequestRecord {
  return {
    id,
    guardId: String(data.guardId ?? ""),
    agencyId: String(data.agencyId ?? ""),
    employeeCode: String(data.employeeCode ?? ""),
    guardName: String(data.guardName ?? ""),
    method: isReliefMethod(data.method) ? data.method : "remaining",
    reason: isReliefReason(data.reason) ? data.reason : "personalEmergency",
    note: String(data.note ?? ""),
    status: (data.status as ReliefRequestStatus) ?? "pending",
    siteId: String(data.siteId ?? ""),
    siteName: String(data.siteName ?? ""),
    postName: String(data.postName ?? ""),
    shiftFrom: String(data.shiftFrom ?? ""),
    shiftTo: String(data.shiftTo ?? ""),
    dutyDate: String(data.dutyDate ?? ""),
    handoverFrom:
      typeof data.handoverFrom === "string" ? data.handoverFrom : undefined,
    assignedGuardId:
      typeof data.assignedGuardId === "string"
        ? data.assignedGuardId
        : undefined,
    assignedGuardName:
      typeof data.assignedGuardName === "string"
        ? data.assignedGuardName
        : undefined,
    assignedEmployeeCode:
      typeof data.assignedEmployeeCode === "string"
        ? data.assignedEmployeeCode
        : undefined,
    decidedByName:
      typeof data.decidedByName === "string" ? data.decidedByName : undefined,
    approvalNote:
      typeof data.approvalNote === "string" ? data.approvalNote : undefined,
    rejectionRemark:
      typeof data.rejectionRemark === "string"
        ? data.rejectionRemark
        : undefined,
    appliedAt: data.appliedAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
    decidedAt: data.decidedAt as Timestamp | undefined,
  };
}

function toCardDto(
  record: ReliefRequestRecord,
  opts?: { isAssignment?: boolean }
): ReliefRequestCardDto | null {
  if (record.status === "withdrawn") {
    return null;
  }
  return {
    id: record.id,
    status: record.status,
    statusLabel: STATUS_LABELS[record.status],
    method: record.method,
    methodLabel: RELIEF_METHOD_LABELS[record.method],
    reasonLabel: RELIEF_REASON_LABELS[record.reason],
    note: record.note,
    siteName: record.siteName,
    postName: record.postName,
    dutyDate: record.dutyDate,
    shiftFrom: record.shiftFrom,
    shiftTo: record.shiftTo,
    timeRangeLabel: formatTimeRange(record.shiftFrom, record.shiftTo),
    handoverFrom: record.handoverFrom,
    assignedGuardName: record.assignedGuardName,
    assignedEmployeeCode: record.assignedEmployeeCode,
    appliedAt: record.appliedAt?.toDate?.()?.toISOString?.() ?? null,
    decidedByName: record.decidedByName,
    rejectionRemark: record.rejectionRemark,
    approvalNote: record.approvalNote,
    isAssignment: opts?.isAssignment,
    requesterName: opts?.isAssignment ? record.guardName : undefined,
  };
}

async function fetchGuardReliefRequests(
  guardId: string
): Promise<ReliefRequestRecord[]> {
  const snap = await getFirestore()
    .collection(RELIEF_REQUESTS_COLLECTION)
    .where("guardId", "==", guardId)
    .get();

  const records = snap.docs.map((doc) => mapRecord(doc.id, asData(doc.data())));
  records.sort((a, b) => {
    const aMs = a.appliedAt?.toMillis?.() ?? 0;
    const bMs = b.appliedAt?.toMillis?.() ?? 0;
    return bMs - aMs;
  });
  return records;
}

async function fetchAssignedReliefRequests(
  guardId: string
): Promise<ReliefRequestRecord[]> {
  const snap = await getFirestore()
    .collection(RELIEF_REQUESTS_COLLECTION)
    .where("assignedGuardId", "==", guardId)
    .get();

  const records = snap.docs
    .map((doc) => mapRecord(doc.id, asData(doc.data())))
    .filter((r) => r.status === "approved");
  records.sort((a, b) => {
    const aMs = a.decidedAt?.toMillis?.() ?? a.updatedAt?.toMillis?.() ?? 0;
    const bMs = b.decidedAt?.toMillis?.() ?? b.updatedAt?.toMillis?.() ?? 0;
    return bMs - aMs;
  });
  return records;
}

export type SubmitReliefRequestParams = {
  guard: AuthenticatedGuardContext;
  method: ReliefMethodKey;
  reason: ReliefReasonKey;
  note?: string;
  dutyDate?: string;
  shiftFrom?: string;
  shiftTo?: string;
  siteId?: string;
  siteName?: string;
  postName?: string;
  handoverFrom?: string;
};

export type SubmitReliefRequestResult = {
  id: string;
  status: "pending";
  message: string;
};

export async function submitReliefRequest(
  params: SubmitReliefRequestParams
): Promise<SubmitReliefRequestResult> {
  if (!isReliefMethod(params.method)) {
    throw Object.assign(new Error("Invalid relief method."), {
      statusCode: 400,
    });
  }
  if (!isReliefReason(params.reason)) {
    throw Object.assign(new Error("Please select a reason for relief."), {
      statusCode: 400,
    });
  }

  const dutyDate = (params.dutyDate ?? toDutyDateKey()).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dutyDate)) {
    throw Object.assign(new Error("dutyDate must be YYYY-MM-DD."), {
      statusCode: 400,
    });
  }

  const existing = await fetchGuardReliefRequests(params.guard.guardId);
  const conflict = existing.find(
    (r) =>
      (r.status === "pending" || r.status === "approved") &&
      r.dutyDate === dutyDate &&
      r.method === params.method
  );
  if (conflict) {
    throw Object.assign(
      new Error(
        `You already have a ${conflict.status} ${RELIEF_METHOD_LABELS[params.method].toLowerCase()} for ${dutyDate}.`
      ),
      { statusCode: 409 }
    );
  }

  const now = Timestamp.now();
  const handoverFrom =
    params.method === "remaining"
      ? (params.handoverFrom?.trim() || now.toDate().toISOString())
      : undefined;

  const ref = getFirestore().collection(RELIEF_REQUESTS_COLLECTION).doc();
  await ref.set({
    guardId: params.guard.guardId,
    agencyId: params.guard.agencyId,
    employeeCode: params.guard.employeeCode,
    guardName: params.guard.fullName,
    method: params.method,
    reason: params.reason,
    note: (params.note ?? "").trim(),
    status: "pending",
    siteId: (params.siteId ?? params.guard.assignedSiteId ?? "").trim(),
    siteName:
      (params.siteName ?? params.guard.siteName ?? "").trim() || "Assigned Site",
    postName:
      (params.postName ?? params.guard.postName ?? "").trim() || "Assigned Post",
    shiftFrom: (params.shiftFrom ?? params.guard.shiftFrom ?? "").trim() || "08:00",
    shiftTo: (params.shiftTo ?? params.guard.shiftTo ?? "").trim() || "20:00",
    dutyDate,
    ...(handoverFrom ? { handoverFrom } : {}),
    appliedAt: now,
    updatedAt: now,
  });

  return {
    id: ref.id,
    status: "pending",
    message: `${RELIEF_METHOD_LABELS[params.method]} submitted for Admin/HR approval.`,
  };
}

export async function listReliefRequestsForGuard(params: {
  guard: AuthenticatedGuardContext;
  status?: "all" | "pending" | "approved" | "rejected";
}): Promise<ReliefRequestsResponse> {
  const [mine, assigned] = await Promise.all([
    fetchGuardReliefRequests(params.guard.guardId),
    fetchAssignedReliefRequests(params.guard.guardId),
  ]);

  const visible = mine.filter((r) => r.status !== "withdrawn");
  const filterCounts = {
    all: visible.length,
    pending: visible.filter((r) => r.status === "pending").length,
    approved: visible.filter((r) => r.status === "approved").length,
    rejected: visible.filter((r) => r.status === "rejected").length,
  };

  const filtered =
    !params.status || params.status === "all"
      ? visible
      : visible.filter((r) => r.status === params.status);

  const requests = filtered
    .map((r) => toCardDto(r))
    .filter((card): card is ReliefRequestCardDto => Boolean(card));

  const assignments = assigned
    .map((r) => toCardDto(r, { isAssignment: true }))
    .filter((card): card is ReliefRequestCardDto => Boolean(card));

  return { filterCounts, requests, assignments };
}

export async function withdrawReliefRequest(params: {
  guard: AuthenticatedGuardContext;
  requestId: string;
}): Promise<{ ok: true; message: string }> {
  const ref = getFirestore()
    .collection(RELIEF_REQUESTS_COLLECTION)
    .doc(params.requestId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw Object.assign(new Error("Relief request not found."), {
      statusCode: 404,
    });
  }

  const data = asData(snap.data());
  if (String(data.guardId) !== params.guard.guardId) {
    throw Object.assign(new Error("You cannot withdraw this request."), {
      statusCode: 403,
    });
  }
  if (data.status !== "pending") {
    throw Object.assign(
      new Error("Only pending relief requests can be withdrawn."),
      { statusCode: 400 }
    );
  }

  await ref.update({
    status: "withdrawn",
    updatedAt: Timestamp.now(),
  });

  return { ok: true, message: "Relief request withdrawn." };
}

export { mapRecord, asData };
