import { getFirestore, type Timestamp } from "firebase-admin/firestore";
import { GUARDS_COLLECTION } from "@raskha/guard-management";

import { ATTENDANCE_COLLECTION, type GeofenceStatus } from "./attendance";

const IST = "Asia/Kolkata";

const AVATAR_COLORS = [
  "#1d4ed8",
  "#047857",
  "#b45309",
  "#7c3aed",
  "#be123c",
  "#0f766e",
  "#0369a1",
  "#4f46e5",
] as const;

export type AgencyAttendanceIntervalDto = {
  id: string;
  sequenceNumber: number;
  checkinTime: string;
  selfieUrl: string;
  geofenceStatus: GeofenceStatus;
  lat: number;
  lng: number;
  accuracyMeters: number;
};

export type AgencyAttendanceRecordDto = {
  id: string;
  guardId: string;
  guardName: string;
  guardEmployeeCode: string;
  guardInitials: string;
  guardAvatarColor: string;
  agencyId: string;
  siteId: string;
  siteName: string;
  postName: string;
  punchInDate: string;
  punchInTime: string;
  punchInSelfieUrl: string;
  punchInGeofenceStatus: GeofenceStatus;
  punchInLat: number;
  punchInLng: number;
  punchInAccuracyMeters: number;
  punchOutTime: string | null;
  punchOutSelfieUrl: string | null;
  punchOutGeofenceStatus: GeofenceStatus | null;
  durationMinutes: number | null;
  intervalCheckins: AgencyAttendanceIntervalDto[];
};

export type AgencyAttendanceStatsDto = {
  presentToday: number;
  absentToday: number;
  onShift: number;
};

export type AgencyAttendanceDayResponse = {
  date: string;
  records: AgencyAttendanceRecordDto[];
  stats: AgencyAttendanceStatsDto;
};

function toIstDateKey(date: Date): string {
  // en-CA yields YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatIstTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    timeZone: IST,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isValidDateKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key.trim());
}

function toDate(value: unknown): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  return null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asGeofenceStatus(value: unknown): GeofenceStatus {
  if (value === "passed" || value === "failed" || value === "demo_passed") {
    return value;
  }
  return "failed";
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function avatarColorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function durationMinutesBetween(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

/**
 * Agency-scoped attendance for Admin / HR panels for one calendar day (IST).
 */
export async function listAgencyAttendanceForDate(params: {
  agencyId: string;
  date: string;
  siteId?: string;
}): Promise<AgencyAttendanceDayResponse> {
  const agencyId = params.agencyId.trim();
  if (!agencyId) {
    throw Object.assign(new Error("agencyId is required."), { statusCode: 400 });
  }

  if (!isValidDateKey(params.date)) {
    throw Object.assign(new Error("date must be YYYY-MM-DD."), {
      statusCode: 400,
    });
  }

  const db = getFirestore();
  const [attendanceSnap, guardsSnap] = await Promise.all([
    db.collection(ATTENDANCE_COLLECTION).where("agencyId", "==", agencyId).get(),
    db.collection(GUARDS_COLLECTION).where("agencyId", "==", agencyId).get(),
  ]);

  type RawDoc = { id: string; data: Record<string, unknown> };
  const docs: RawDoc[] = attendanceSnap.docs.map((doc) => ({
    id: doc.id,
    data: (doc.data() ?? {}) as Record<string, unknown>,
  }));

  const punchIns = docs.filter((doc) => {
    const type = String(doc.data.type ?? "punch_in");
    return type === "punch_in";
  });

  const intervalsByShift = new Map<string, RawDoc[]>();
  for (const doc of docs) {
    if (String(doc.data.type ?? "") !== "interval_checkin") {
      continue;
    }
    const shiftId = String(doc.data.shiftPunchInId ?? "");
    if (!shiftId) {
      continue;
    }
    const list = intervalsByShift.get(shiftId) ?? [];
    list.push(doc);
    intervalsByShift.set(shiftId, list);
  }

  const siteFilter = params.siteId?.trim();
  const records: AgencyAttendanceRecordDto[] = [];

  for (const doc of punchIns) {
    const punchedAt = toDate(doc.data.punchedAt);
    if (!punchedAt) {
      continue;
    }
    const punchInDate = toIstDateKey(punchedAt);
    if (punchInDate !== params.date) {
      continue;
    }

    const siteId = String(doc.data.siteId ?? "");
    if (siteFilter && siteFilter !== "all" && siteId !== siteFilter) {
      continue;
    }

    const punchedOutAt = toDate(doc.data.punchedOutAt);
    const shiftStatus = String(doc.data.shiftStatus ?? "");
    const onShift = !punchedOutAt && shiftStatus !== "ended";

    const guardId = String(doc.data.guardId ?? "");
    const guardName = String(doc.data.guardName ?? "Guard");
    const guardEmployeeCode = String(doc.data.guardEmployeeCode ?? "");

    const intervalDocs = (intervalsByShift.get(doc.id) ?? []).sort((a, b) => {
      const aMs = toDate(a.data.punchedAt)?.getTime() ?? 0;
      const bMs = toDate(b.data.punchedAt)?.getTime() ?? 0;
      return aMs - bMs;
    });

    const intervalCheckins: AgencyAttendanceIntervalDto[] = intervalDocs.map(
      (interval, index) => {
        const at = toDate(interval.data.punchedAt) ?? punchedAt;
        return {
          id: interval.id,
          sequenceNumber: index + 1,
          checkinTime: formatIstTime(at),
          selfieUrl: String(interval.data.selfieUrl ?? ""),
          geofenceStatus: asGeofenceStatus(interval.data.geofenceStatus),
          lat: toNumber(interval.data.lat),
          lng: toNumber(interval.data.lng),
          accuracyMeters: toNumber(interval.data.accuracyMeters, 5),
        };
      }
    );

    records.push({
      id: doc.id,
      guardId,
      guardName,
      guardEmployeeCode,
      guardInitials: initialsFromName(guardName),
      guardAvatarColor: avatarColorFromId(guardId || doc.id),
      agencyId,
      siteId,
      siteName: String(doc.data.siteName ?? "Site"),
      postName: String(doc.data.postName ?? "Post"),
      punchInDate,
      punchInTime: formatIstTime(punchedAt),
      punchInSelfieUrl: String(doc.data.selfieUrl ?? ""),
      punchInGeofenceStatus: asGeofenceStatus(doc.data.geofenceStatus),
      punchInLat: toNumber(doc.data.lat),
      punchInLng: toNumber(doc.data.lng),
      punchInAccuracyMeters: toNumber(doc.data.accuracyMeters, 5),
      punchOutTime: punchedOutAt ? formatIstTime(punchedOutAt) : null,
      punchOutSelfieUrl: punchedOutAt
        ? String(doc.data.punchOutSelfieUrl ?? "") || null
        : null,
      punchOutGeofenceStatus: punchedOutAt
        ? asGeofenceStatus(doc.data.punchOutGeofenceStatus)
        : null,
      durationMinutes:
        punchedOutAt && !onShift
          ? durationMinutesBetween(punchedAt, punchedOutAt)
          : null,
      intervalCheckins,
    });
  }

  records.sort((a, b) => {
    if (a.punchInTime === b.punchInTime) {
      return a.guardName.localeCompare(b.guardName);
    }
    // Newest first roughly by time string is weak; keep name secondary.
    return a.guardName.localeCompare(b.guardName);
  });

  const presentGuardIds = new Set(records.map((r) => r.guardId).filter(Boolean));
  const activeGuardCount = guardsSnap.docs.filter((doc) => {
    const status = String(doc.data()?.status ?? "active");
    return status === "active";
  }).length;

  const onShift = records.filter((r) => r.punchOutTime === null).length;
  const presentToday = presentGuardIds.size;
  const absentToday = Math.max(0, activeGuardCount - presentToday);

  return {
    date: params.date,
    records,
    stats: {
      presentToday,
      absentToday,
      onShift,
    },
  };
}
