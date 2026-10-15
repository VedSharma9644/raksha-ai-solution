import { FieldValue, getFirestore } from "firebase-admin/firestore";

import { daysInCalendarMonth, dutyDateFromParts } from "./dutyDate";

export const ATTENDANCE_DAY_OVERRIDES_COLLECTION = "attendanceDayOverrides";

/** Statuses an admin can set for payroll / history day classification. */
export const ATTENDANCE_CORRECTION_STATUSES = [
  "full",
  "half",
  "missed",
  "leave",
  "off",
  /** Covering guard worked an extra relief duty (admin backfill). */
  "relief",
] as const;

export type AttendanceCorrectionStatus =
  (typeof ATTENDANCE_CORRECTION_STATUSES)[number];

/** @deprecated Prefer AttendanceCorrectionStatus */
export type AttendanceOverrideStatus = AttendanceCorrectionStatus;

export type AttendanceDayOverride = {
  id: string;
  agencyId: string;
  guardId: string;
  dutyDate: string;
  status: AttendanceCorrectionStatus;
  note: string;
  correctedByUid: string;
  correctedByRole: "agency" | "hr";
  createdAt?: unknown;
  updatedAt?: unknown;
};

export function attendanceOverrideDocId(
  agencyId: string,
  guardId: string,
  dutyDate: string
): string {
  return `${agencyId}_${guardId}_${dutyDate}`;
}

export function isAttendanceCorrectionStatus(
  value: unknown
): value is AttendanceCorrectionStatus {
  return (
    typeof value === "string" &&
    (ATTENDANCE_CORRECTION_STATUSES as readonly string[]).includes(value)
  );
}

export async function getAttendanceDayOverride(params: {
  agencyId: string;
  guardId: string;
  dutyDate: string;
}): Promise<AttendanceDayOverride | null> {
  const id = attendanceOverrideDocId(
    params.agencyId,
    params.guardId,
    params.dutyDate
  );
  const snap = await getFirestore()
    .collection(ATTENDANCE_DAY_OVERRIDES_COLLECTION)
    .doc(id)
    .get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as AttendanceDayOverride;
}

/**
 * Load overrides for a duty-date range, keyed by YYYY-MM-DD.
 * Used by attendance history / payroll month stats.
 */
export async function listAttendanceOverridesForGuard(params: {
  agencyId: string;
  guardId: string;
  startDate: string;
  endDate: string;
}): Promise<Map<string, AttendanceCorrectionStatus>> {
  const { agencyId, guardId, startDate, endDate } = params;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    return new Map();
  }

  const dates: string[] = [];
  {
    const [ys, ms, ds] = startDate.split("-").map(Number);
    const [ye, me, de] = endDate.split("-").map(Number);
    const cursor = new Date(Date.UTC(ys, ms - 1, ds));
    const end = new Date(Date.UTC(ye, me - 1, de));
    while (cursor <= end) {
      const y = cursor.getUTCFullYear();
      const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
      const d = String(cursor.getUTCDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  if (dates.length === 0) return new Map();

  const db = getFirestore();
  const refs = dates.map((dutyDate) =>
    db
      .collection(ATTENDANCE_DAY_OVERRIDES_COLLECTION)
      .doc(attendanceOverrideDocId(agencyId, guardId, dutyDate))
  );

  const map = new Map<string, AttendanceCorrectionStatus>();
  // Firestore getAll accepts up to ~100 refs; a month is fine.
  for (let i = 0; i < refs.length; i += 100) {
    const chunk = refs.slice(i, i + 100);
    const snaps = await db.getAll(...chunk);
    snaps.forEach((snap, idx) => {
      if (!snap.exists) return;
      const status = (snap.data() as { status?: unknown }).status;
      if (isAttendanceCorrectionStatus(status)) {
        map.set(dates[i + idx], status);
      }
    });
  }
  return map;
}

/** Load overrides for a calendar month keyed by dutyDate YYYY-MM-DD. */
export async function loadAttendanceOverridesForMonth(params: {
  agencyId: string;
  guardId: string;
  year: number;
  month: number;
}): Promise<Map<string, AttendanceCorrectionStatus>> {
  const { agencyId, guardId, year, month } = params;
  const daysInMonth = daysInCalendarMonth(year, month);
  const startDate = dutyDateFromParts(year, month, 1);
  const endDate = dutyDateFromParts(year, month, daysInMonth);
  return listAttendanceOverridesForGuard({
    agencyId,
    guardId,
    startDate,
    endDate,
  });
}

/** Full override records in a date range (for payroll relief backfill, etc.). */
export async function listAttendanceOverrideRecordsForGuard(params: {
  agencyId: string;
  guardId: string;
  startDate: string;
  endDate: string;
}): Promise<AttendanceDayOverride[]> {
  const { agencyId, guardId, startDate, endDate } = params;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    return [];
  }

  const dates: string[] = [];
  {
    const [ys, ms, ds] = startDate.split("-").map(Number);
    const [ye, me, de] = endDate.split("-").map(Number);
    const cursor = new Date(Date.UTC(ys, ms - 1, ds));
    const end = new Date(Date.UTC(ye, me - 1, de));
    while (cursor <= end) {
      const y = cursor.getUTCFullYear();
      const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
      const d = String(cursor.getUTCDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  if (dates.length === 0) return [];

  const db = getFirestore();
  const refs = dates.map((dutyDate) =>
    db
      .collection(ATTENDANCE_DAY_OVERRIDES_COLLECTION)
      .doc(attendanceOverrideDocId(agencyId, guardId, dutyDate))
  );

  const rows: AttendanceDayOverride[] = [];
  for (let i = 0; i < refs.length; i += 100) {
    const chunk = refs.slice(i, i + 100);
    const snaps = await db.getAll(...chunk);
    snaps.forEach((snap) => {
      if (!snap.exists) return;
      const data = snap.data() as AttendanceDayOverride;
      if (!isAttendanceCorrectionStatus(data.status)) return;
      rows.push({ id: snap.id, ...data });
    });
  }
  return rows;
}

/** Stable synthetic id for payroll bonuses tied to an admin relief correction. */
export function attendanceReliefBonusDutyId(
  agencyId: string,
  guardId: string,
  dutyDate: string
): string {
  return `attOverride_${attendanceOverrideDocId(agencyId, guardId, dutyDate)}`;
}

export function isAttendanceReliefBonusDutyId(reliefRequestId: string): boolean {
  return reliefRequestId.startsWith("attOverride_");
}

export function attendanceOverrideDocIdFromReliefBonusId(
  reliefRequestId: string
): string | null {
  if (!isAttendanceReliefBonusDutyId(reliefRequestId)) return null;
  return reliefRequestId.slice("attOverride_".length);
}

export async function saveAttendanceDayOverride(params: {
  agencyId: string;
  guardId: string;
  dutyDate: string;
  status: AttendanceCorrectionStatus;
  note: string;
  correctedByUid: string;
  correctedByRole: "agency" | "hr";
}): Promise<AttendanceDayOverride> {
  const note = params.note.trim();
  if (!note) {
    throw Object.assign(new Error("Add a short note explaining the correction."), {
      statusCode: 400,
    });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.dutyDate)) {
    throw Object.assign(new Error("Invalid duty date."), { statusCode: 400 });
  }
  if (!isAttendanceCorrectionStatus(params.status)) {
    throw Object.assign(new Error("Invalid attendance status."), {
      statusCode: 400,
    });
  }

  const id = attendanceOverrideDocId(
    params.agencyId,
    params.guardId,
    params.dutyDate
  );
  const ref = getFirestore()
    .collection(ATTENDANCE_DAY_OVERRIDES_COLLECTION)
    .doc(id);
  const existing = await ref.get();

  const data = {
    id,
    agencyId: params.agencyId,
    guardId: params.guardId,
    dutyDate: params.dutyDate,
    status: params.status,
    note,
    correctedByUid: params.correctedByUid,
    correctedByRole: params.correctedByRole,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: existing.exists
      ? existing.data()?.createdAt ?? FieldValue.serverTimestamp()
      : FieldValue.serverTimestamp(),
  };

  await ref.set(data, { merge: true });
  return data as unknown as AttendanceDayOverride;
}

export async function deleteAttendanceDayOverride(params: {
  agencyId: string;
  guardId: string;
  dutyDate: string;
}): Promise<void> {
  const id = attendanceOverrideDocId(
    params.agencyId,
    params.guardId,
    params.dutyDate
  );
  await getFirestore()
    .collection(ATTENDANCE_DAY_OVERRIDES_COLLECTION)
    .doc(id)
    .delete();
}
