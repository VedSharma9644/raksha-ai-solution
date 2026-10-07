import { getFirestore, Timestamp } from "firebase-admin/firestore";

import type { AuthenticatedGuardContext } from "@raskha/attendance";

import {
  DEFAULT_ANNUAL_LEAVE_QUOTA,
  LEAVE_REQUESTS_COLLECTION,
  LEAVE_TYPE_LABELS,
  type LeaveBalanceSummaryDto,
  type LeaveBalanceTypeDto,
  type LeaveRequestCardDto,
  type LeaveRequestRecord,
  type LeaveRequestsResponse,
  type LeaveRequestStatus,
  type LeaveTypeKey,
} from "./leave";

const STATUS_LABELS: Record<
  Exclude<LeaveRequestStatus, "withdrawn">,
  string
> = {
  pending: "PENDING REVIEW",
  approved: "APPROVED",
  rejected: "NOT APPROVED",
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

export function inclusiveDayCount(startKey: string, endKey: string): number {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (!start || !end || end < start) {
    return 0;
  }
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

function formatShortDate(key: string): string {
  const date = parseDateKey(key);
  if (!date) {
    return key;
  }
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function formatDateRange(startKey: string, endKey: string): string {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (!start || !end) {
    return `${startKey} – ${endKey}`;
  }
  if (startKey === endKey) {
    return start.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  const sameYear = start.getFullYear() === end.getFullYear();
  const left = start.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" as const }),
  });
  const right = end.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return `${left} – ${right}`;
}

function formatAppliedMeta(appliedAt: Date): string {
  const now = new Date();
  const sameDay =
    appliedAt.getFullYear() === now.getFullYear() &&
    appliedAt.getMonth() === now.getMonth() &&
    appliedAt.getDate() === now.getDate();
  const dayPart = sameDay
    ? "Today"
    : appliedAt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
  const timePart = appliedAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `Applied: ${dayPart} • ${timePart}`;
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
    approvalNote:
      typeof data.approvalNote === "string" ? data.approvalNote : undefined,
    approvalDetail:
      typeof data.approvalDetail === "string" ? data.approvalDetail : undefined,
    rejectionRemark:
      typeof data.rejectionRemark === "string" ? data.rejectionRemark : undefined,
    compensationNote:
      typeof data.compensationNote === "string"
        ? data.compensationNote
        : undefined,
    appliedAt: data.appliedAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
    decidedAt: data.decidedAt as Timestamp | undefined,
  };
}

function asData(raw: unknown): Record<string, unknown> {
  return (raw ?? {}) as Record<string, unknown>;
}

async function fetchGuardYearRequests(
  guardId: string,
  year: number
): Promise<LeaveRequestRecord[]> {
  // Single-field query avoids a composite index; filter year in memory.
  const snap = await getFirestore()
    .collection(LEAVE_REQUESTS_COLLECTION)
    .where("guardId", "==", guardId)
    .get();

  const records = snap.docs
    .map((doc) => {
      const data = asData(doc.data());
      const record = mapRecord(doc.id, data);
      const storedYear =
        typeof data.year === "number"
          ? data.year
          : Number(record.startDate.slice(0, 4));
      return storedYear === year ? record : null;
    })
    .filter((record): record is LeaveRequestRecord => Boolean(record));

  records.sort((a, b) => {
    const aMs = a.appliedAt?.toMillis?.() ?? 0;
    const bMs = b.appliedAt?.toMillis?.() ?? 0;
    return bMs - aMs;
  });
  return records;
}

function buildTypeBalances(
  records: LeaveRequestRecord[]
): LeaveBalanceTypeDto[] {
  const tally: Record<
    LeaveTypeKey,
    { approved: number; pending: number }
  > = {
    CL: { approved: 0, pending: 0 },
    SL: { approved: 0, pending: 0 },
    EL: { approved: 0, pending: 0 },
  };

  for (const record of records) {
    if (record.status === "withdrawn" || record.status === "rejected") {
      continue;
    }
    const bucket = tally[record.leaveType];
    if (record.status === "approved") {
      bucket.approved += record.dayCount;
    } else if (record.status === "pending") {
      bucket.pending += record.dayCount;
    }
  }

  const clQuota = DEFAULT_ANNUAL_LEAVE_QUOTA.CL ?? 0;
  const slQuota = DEFAULT_ANNUAL_LEAVE_QUOTA.SL ?? 0;
  const clRemaining = Math.max(0, clQuota - tally.CL.approved - tally.CL.pending);
  const slRemaining = Math.max(0, slQuota - tally.SL.approved - tally.SL.pending);

  return [
    {
      key: "CL",
      title: "Paid Casual (CL)",
      quota: clQuota,
      remaining: clRemaining,
      usedApproved: tally.CL.approved,
      usedPending: tally.CL.pending,
      valueLabel: String(clRemaining),
      valueSuffix: `/ ${clQuota} Left`,
      badge: "Paid 100%",
      badgeTone: "paid",
      highlighted: true,
    },
    {
      key: "SL",
      title: "Medical (SL)",
      quota: slQuota,
      remaining: slRemaining,
      usedApproved: tally.SL.approved,
      usedPending: tally.SL.pending,
      valueLabel: String(slRemaining),
      valueSuffix: `/ ${slQuota} Left`,
      badge: "With Slip",
      badgeTone: "slip",
    },
    {
      key: "EL",
      title: "Emergency (EL)",
      quota: null,
      remaining: null,
      usedApproved: tally.EL.approved,
      usedPending: tally.EL.pending,
      valueLabel: "Instant",
      subtitle: "Needs Approval",
      badge: "Urgent",
      badgeTone: "urgent",
    },
  ];
}

export function buildLeaveBalanceSummary(params: {
  year: number;
  records: LeaveRequestRecord[];
  siteName: string;
  supervisorName: string;
}): LeaveBalanceSummaryDto {
  const types = buildTypeBalances(params.records);
  const cl = types.find((t) => t.key === "CL")!;
  const sl = types.find((t) => t.key === "SL")!;

  const daysLeft = (cl.remaining ?? 0) + (sl.remaining ?? 0);
  const daysTaken = types.reduce((sum, t) => sum + t.usedApproved, 0);
  const daysPending = types.reduce((sum, t) => sum + t.usedPending, 0);

  return {
    year: params.year,
    updatedLabel: "Updated Today",
    daysLeft,
    daysTaken,
    daysPending,
    payrollNote:
      "Leaves sync directly with monthly salary slip & attendance bonus. No deduction for approved casual leave.",
    types,
    coverSite: params.siteName || "your assigned site",
    coverSupervisor: params.supervisorName || "your supervisor",
  };
}

function toCardDto(record: LeaveRequestRecord): LeaveRequestCardDto | null {
  if (record.status === "withdrawn") {
    return null;
  }

  const reasonText =
    record.note.trim() ||
    record.reason ||
    (record.status === "rejected"
      ? record.rejectionRemark ?? "Request was not approved."
      : "—");

  const leaveTypeLabel = `${LEAVE_TYPE_LABELS[record.leaveType]}${
    record.reason ? ` • ${record.reason}` : ""
  }`;

  const base: LeaveRequestCardDto = {
    id: record.id,
    status: record.status,
    statusLabel: STATUS_LABELS[record.status],
    durationLabel: `${record.dayCount} Day${record.dayCount === 1 ? "" : "s"}`,
    dateRange: formatDateRange(record.startDate, record.endDate),
    leaveTypeLabel,
    reasonText,
  };

  if (record.status === "pending") {
    return {
      ...base,
      appliedMeta: record.appliedAt
        ? formatAppliedMeta(record.appliedAt.toDate())
        : undefined,
      supervisorMeta: `Supervisor: ${record.supervisorName}`,
      showPendingActions: true,
    };
  }

  if (record.status === "approved") {
    return {
      ...base,
      approvalNote:
        record.approvalNote ??
        `Approved by ${record.supervisorName}`,
      approvalDetail: record.approvalDetail,
    };
  }

  return {
    ...base,
    reasonText: record.rejectionRemark || reasonText,
    rejectionLabel: "Supervisor Remark",
    compensationNote: record.compensationNote,
  };
}

export async function getLeaveBalanceForGuard(
  guard: AuthenticatedGuardContext,
  year = new Date().getFullYear()
): Promise<LeaveBalanceSummaryDto> {
  const records = await fetchGuardYearRequests(guard.guardId, year);
  return buildLeaveBalanceSummary({
    year,
    records,
    siteName: guard.siteName,
    supervisorName: "Supervisor",
  });
}

export async function listLeaveRequestsForGuard(params: {
  guard: AuthenticatedGuardContext;
  year?: number;
  status?: "all" | "pending" | "approved" | "rejected";
}): Promise<LeaveRequestsResponse> {
  const year = params.year ?? new Date().getFullYear();
  const records = await fetchGuardYearRequests(params.guard.guardId, year);
  const balance = buildLeaveBalanceSummary({
    year,
    records,
    siteName: params.guard.siteName,
    supervisorName: "Supervisor",
  });

  const visible = records.filter((r) => r.status !== "withdrawn");
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
    .map(toCardDto)
    .filter((card): card is LeaveRequestCardDto => Boolean(card));

  return { year, balance, filterCounts, requests };
}

export type SubmitLeaveRequestParams = {
  guard: AuthenticatedGuardContext;
  leaveType: LeaveTypeKey;
  startDate: string;
  endDate: string;
  reason: string;
  note?: string;
  supervisorName?: string;
};

export type SubmitLeaveRequestResult = {
  id: string;
  status: "pending";
  dayCount: number;
  message: string;
};

export async function submitLeaveRequest(
  params: SubmitLeaveRequestParams
): Promise<SubmitLeaveRequestResult> {
  const start = parseDateKey(params.startDate);
  const end = parseDateKey(params.endDate);
  if (!start || !end) {
    throw Object.assign(new Error("startDate and endDate must be YYYY-MM-DD."), {
      statusCode: 400,
    });
  }
  if (end < start) {
    throw Object.assign(new Error("End date cannot be before start date."), {
      statusCode: 400,
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (start < today) {
    throw Object.assign(new Error("Leave cannot start in the past."), {
      statusCode: 400,
    });
  }

  const dayCount = inclusiveDayCount(params.startDate, params.endDate);
  if (dayCount < 1) {
    throw Object.assign(new Error("Invalid leave duration."), {
      statusCode: 400,
    });
  }

  const reason = params.reason.trim();
  if (!reason) {
    throw Object.assign(new Error("Please select a reason for leave."), {
      statusCode: 400,
    });
  }

  if (!isLeaveType(params.leaveType)) {
    throw Object.assign(new Error("Invalid leave type."), { statusCode: 400 });
  }

  const year = start.getFullYear();
  const existing = await fetchGuardYearRequests(params.guard.guardId, year);

  for (const record of existing) {
    if (record.status !== "pending" && record.status !== "approved") {
      continue;
    }
    if (
      rangesOverlap(
        params.startDate,
        params.endDate,
        record.startDate,
        record.endDate
      )
    ) {
      throw Object.assign(
        new Error(
          `Overlaps an existing ${record.status} leave (${formatShortDate(record.startDate)} – ${formatShortDate(record.endDate)}).`
        ),
        { statusCode: 409 }
      );
    }
  }

  const balance = buildLeaveBalanceSummary({
    year,
    records: existing,
    siteName: params.guard.siteName,
    supervisorName: params.supervisorName ?? "Supervisor",
  });
  const typeBalance = balance.types.find((t) => t.key === params.leaveType);
  if (
    typeBalance &&
    typeBalance.remaining !== null &&
    dayCount > typeBalance.remaining
  ) {
    throw Object.assign(
      new Error(
        `Only ${typeBalance.remaining} day(s) of ${LEAVE_TYPE_LABELS[params.leaveType]} left.`
      ),
      { statusCode: 400 }
    );
  }

  const now = Timestamp.now();
  const supervisorName = params.supervisorName?.trim() || "Supervisor";
  const ref = getFirestore().collection(LEAVE_REQUESTS_COLLECTION).doc();

  await ref.set({
    guardId: params.guard.guardId,
    agencyId: params.guard.agencyId,
    employeeCode: params.guard.employeeCode,
    guardName: params.guard.fullName,
    leaveType: params.leaveType,
    startDate: params.startDate,
    endDate: params.endDate,
    dayCount,
    reason,
    note: (params.note ?? "").trim(),
    status: "pending",
    year,
    siteId: params.guard.assignedSiteId,
    siteName: params.guard.siteName || "Assigned Site",
    supervisorName,
    appliedAt: now,
    updatedAt: now,
  });

  return {
    id: ref.id,
    status: "pending",
    dayCount,
    message: `Leave request submitted for ${dayCount} day${dayCount === 1 ? "" : "s"}.`,
  };
}

export async function withdrawLeaveRequest(params: {
  guard: AuthenticatedGuardContext;
  requestId: string;
}): Promise<{ ok: true; message: string }> {
  const ref = getFirestore()
    .collection(LEAVE_REQUESTS_COLLECTION)
    .doc(params.requestId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw Object.assign(new Error("Leave request not found."), {
      statusCode: 404,
    });
  }

  const data = snap.data() ?? {};
  if (String(data.guardId) !== params.guard.guardId) {
    throw Object.assign(new Error("You cannot withdraw this request."), {
      statusCode: 403,
    });
  }
  if (data.status !== "pending") {
    throw Object.assign(
      new Error("Only pending leave requests can be withdrawn."),
      { statusCode: 400 }
    );
  }

  await ref.update({
    status: "withdrawn",
    updatedAt: Timestamp.now(),
  });

  return { ok: true, message: "Leave request withdrawn." };
}
