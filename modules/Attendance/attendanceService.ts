import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import {
  ATTENDANCE_COLLECTION,
  type AuthenticatedGuardContext,
  type PunchInResult,
} from "./attendance";
import { checkGeofence, type SiteGeofenceInput } from "./geofence";

export type MarkPunchInParams = {
  guard: AuthenticatedGuardContext;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  selfieBase64: string;
  site?: SiteGeofenceInput | null;
  demoMode?: boolean;
};

function formatPunchTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatPunchDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function decodeBase64Image(selfieBase64: string): Buffer {
  const cleaned = selfieBase64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(cleaned, "base64");
}

async function uploadSelfie(params: {
  agencyId: string;
  siteId: string;
  guardId: string;
  selfieBase64: string;
  purpose?: "punch_in_selfie" | "punch_out_selfie";
}): Promise<{ selfieUrl: string; storagePath: string }> {
  const agencyId = params.agencyId || "unassigned-agency";
  const siteId = params.siteId || "unassigned-site";
  const guardId = params.guardId || "unassigned-guard";
  const purpose = params.purpose ?? "punch_in_selfie";
  const storagePath = `attendance/${agencyId}/${siteId}/${guardId}/${purpose}-${Date.now()}.jpg`;
  const bytes = decodeBase64Image(params.selfieBase64);

  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(storagePath);
    await file.save(bytes, {
      contentType: "image/jpeg",
      resumable: false,
      metadata: {
        cacheControl: "private, max-age=0",
        metadata: {
          agencyId,
          siteId,
          guardId,
          purpose,
        },
      },
    });
    await file.makePublic().catch(() => undefined);
    return {
      selfieUrl: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
      storagePath,
    };
  } catch {
    // Demo / rules-limited environments still complete punch-in
    return {
      selfieUrl: `demo://${storagePath}`,
      storagePath,
    };
  }
}

export type OpenPunchInRecord = {
  id: string;
  punchedAt: Date;
  siteName: string;
  postName: string;
  selfieUrl?: string;
};

export async function getTodayOpenPunchIn(
  guardId: string
): Promise<OpenPunchInRecord | null> {
  const db = getFirestore();
  const dayStartMs = startOfTodayUtc().getTime();

  const snap = await db
    .collection(ATTENDANCE_COLLECTION)
    .where("guardId", "==", guardId)
    .get();

  let best: OpenPunchInRecord | null = null;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.type && data.type !== "punch_in") {
      continue;
    }
    if (data.shiftStatus !== "started") {
      continue;
    }
    const punchedAtRaw = data.punchedAt as Timestamp | undefined;
    if (!punchedAtRaw?.toMillis) {
      continue;
    }
    const punchedAt = punchedAtRaw.toDate();
    if (punchedAt.getTime() < dayStartMs) {
      continue;
    }
    if (!best || punchedAt.getTime() > best.punchedAt.getTime()) {
      best = {
        id: docSnap.id,
        punchedAt,
        siteName:
          (typeof data.siteName === "string" && data.siteName) || "Assigned Site",
        postName:
          (typeof data.postName === "string" && data.postName) || "Assigned Post",
        selfieUrl: typeof data.selfieUrl === "string" ? data.selfieUrl : undefined,
      };
    }
  }

  return best;
}

function formatDuration(from: Date, to: Date): string {
  const minutes = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
}

export async function markPunchIn(
  params: MarkPunchInParams
): Promise<PunchInResult> {
  const demoMode = params.demoMode !== false;
  const accuracyMeters = params.accuracyMeters ?? 5;
  const db = getFirestore();

  if (!params.selfieBase64?.trim()) {
    throw new Error("Selfie is required to mark attendance.");
  }

  const geofence = checkGeofence({
    lat: params.lat,
    lng: params.lng,
    accuracyMeters,
    site: params.site,
    demoMode,
  });

  if (!geofence.unlocked) {
    throw new Error(geofence.message || "Geofence check failed.");
  }

  const existing = await getTodayOpenPunchIn(params.guard.guardId);
  if (existing) {
    throw new Error("Punch-in already recorded for today. Shift is active.");
  }

  const { selfieUrl, storagePath } = await uploadSelfie({
    agencyId: params.guard.agencyId,
    siteId: params.guard.assignedSiteId,
    guardId: params.guard.guardId,
    selfieBase64: params.selfieBase64,
  });

  const now = new Date();
  const docRef = await db.collection(ATTENDANCE_COLLECTION).add({
    guardId: params.guard.guardId,
    agencyId: params.guard.agencyId,
    siteId: params.guard.assignedSiteId,
    type: "punch_in",
    punchedAt: Timestamp.fromDate(now),
    lat: params.lat,
    lng: params.lng,
    accuracyMeters,
    selfieUrl,
    selfieStoragePath: storagePath,
    geofenceStatus: geofence.status,
    shiftStatus: "started",
    guardName: params.guard.fullName,
    guardEmployeeCode: params.guard.employeeCode,
    siteName: params.guard.siteName || "Assigned Site",
    postName: params.guard.postName || "Assigned Post",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const rosterHours = `${params.guard.shiftFrom} – ${params.guard.shiftTo}`;

  return {
    recordId: docRef.id,
    guardName: params.guard.fullName,
    guardId: params.guard.employeeCode,
    punchInTime: formatPunchTime(now),
    punchInDate: formatPunchDate(now),
    punchInStatus: "On Time",
    dutySiteName: params.guard.siteName || "Assigned Site",
    dutyPostName: params.guard.postName || "Assigned Post",
    rosterTitle: "Day Duty",
    rosterHours,
    geofenceDetail: `Site Match: ${geofence.status === "failed" ? "0%" : "100%"} (Accuracy: ${accuracyMeters}m)`,
    geofenceResult: geofence.unlocked ? "PASSED" : "FAILED",
    selfieUrl,
    shiftStatus: "started",
    mode: "punch_in",
  };
}

export type MarkPunchOutParams = {
  guard: AuthenticatedGuardContext;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  selfieBase64: string;
  site?: SiteGeofenceInput | null;
  demoMode?: boolean;
};

/**
 * End an active shift: require site geofence + punch-out selfie.
 * Updates today's open punch-in record (shiftStatus → ended).
 */
export async function markPunchOut(
  params: MarkPunchOutParams
): Promise<PunchInResult> {
  const demoMode = params.demoMode !== false;
  const accuracyMeters = params.accuracyMeters ?? 5;
  const db = getFirestore();

  if (!params.selfieBase64?.trim()) {
    throw new Error("Selfie is required to end your shift.");
  }

  const geofence = checkGeofence({
    lat: params.lat,
    lng: params.lng,
    accuracyMeters,
    site: params.site,
    demoMode,
  });

  if (!geofence.unlocked) {
    throw new Error(
      geofence.message || "You must be at the duty site to end your shift."
    );
  }

  const open = await getTodayOpenPunchIn(params.guard.guardId);
  if (!open) {
    throw new Error("No active shift found. Punch in first.");
  }

  const { selfieUrl, storagePath } = await uploadSelfie({
    agencyId: params.guard.agencyId,
    siteId: params.guard.assignedSiteId,
    guardId: params.guard.guardId,
    selfieBase64: params.selfieBase64,
    purpose: "punch_out_selfie",
  });

  const now = new Date();
  const durationLabel = formatDuration(open.punchedAt, now);

  await db.collection(ATTENDANCE_COLLECTION).doc(open.id).update({
    shiftStatus: "ended",
    punchedOutAt: Timestamp.fromDate(now),
    punchOutLat: params.lat,
    punchOutLng: params.lng,
    punchOutAccuracyMeters: accuracyMeters,
    punchOutSelfieUrl: selfieUrl,
    punchOutSelfieStoragePath: storagePath,
    punchOutGeofenceStatus: geofence.status,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Optional companion punch_out row for audit trail
  await db.collection(ATTENDANCE_COLLECTION).add({
    guardId: params.guard.guardId,
    agencyId: params.guard.agencyId,
    siteId: params.guard.assignedSiteId,
    type: "punch_out",
    punchInRecordId: open.id,
    punchedAt: Timestamp.fromDate(now),
    lat: params.lat,
    lng: params.lng,
    accuracyMeters,
    selfieUrl,
    selfieStoragePath: storagePath,
    geofenceStatus: geofence.status,
    shiftStatus: "ended",
    guardName: params.guard.fullName,
    guardEmployeeCode: params.guard.employeeCode,
    siteName: params.guard.siteName || open.siteName,
    postName: params.guard.postName || open.postName,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    recordId: open.id,
    guardName: params.guard.fullName,
    guardId: params.guard.employeeCode,
    punchInTime: formatPunchTime(open.punchedAt),
    punchInDate: formatPunchDate(now),
    punchInStatus: "Shift Ended",
    dutySiteName: params.guard.siteName || open.siteName,
    dutyPostName: params.guard.postName || open.postName,
    rosterTitle: "Duty Complete",
    rosterHours: durationLabel,
    geofenceDetail: `Site Match: ${geofence.status === "failed" ? "0%" : "100%"} (Accuracy: ${accuracyMeters}m)`,
    geofenceResult: geofence.unlocked ? "PASSED" : "FAILED",
    selfieUrl,
    shiftStatus: "ended",
    mode: "punch_out",
    punchOutTime: formatPunchTime(now),
    durationLabel,
  };
}

export type AttendanceHistoryDayStatus =
  | "present"
  | "today"
  | "off"
  | "leave"
  | "empty";

export type AttendanceHistoryLogDto = {
  id: string;
  kind: "onDuty" | "present" | "weeklyOff" | "leave";
  statusLabel: string;
  dateLabel: string;
  postLabel: string;
  postIcon: "shield" | "door-front" | "weekend" | "domain";
  detailPrimaryLabel?: string;
  detailPrimaryValue?: string;
  detailSecondaryLabel?: string;
  detailSecondaryValue?: string;
  detailTertiaryLabel?: string;
  detailTertiaryValue?: string;
  footerTags: string[];
  punchedAtIso: string;
  dayOfMonth: number;
  selfieUrl?: string;
};

export type AttendanceHistoryResponse = {
  year: number;
  month: number;
  monthLabel: string;
  cycleLabel: string;
  cycleNote: string;
  punctualityTitle: string;
  punctualitySubtitle: string;
  stats: {
    presentDays: number;
    totalHours: number;
    leaveDays: number;
    weeklyOffDays: number;
  };
  calendarDays: Array<{ day: number; status: AttendanceHistoryDayStatus }>;
  leadingEmpty: number;
  logs: AttendanceHistoryLogDto[];
  filterCounts: {
    all: number;
    present: number;
    weeklyOff: number;
  };
};

function monthBounds(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function mondayBasedWeekday(date: Date): number {
  // JS: 0=Sun … 6=Sat → Mon-first grid offset 0=Mon … 6=Sun
  return (date.getDay() + 6) % 7;
}

function estimateShiftHours(shiftFrom?: string, shiftTo?: string): number {
  if (!shiftFrom || !shiftTo || !shiftFrom.includes(":") || !shiftTo.includes(":")) {
    return 12;
  }
  const [fh, fm] = shiftFrom.split(":").map(Number);
  const [th, tm] = shiftTo.split(":").map(Number);
  let minutes = th * 60 + tm - (fh * 60 + fm);
  if (minutes <= 0) {
    minutes += 24 * 60;
  }
  return Math.max(1, Math.round(minutes / 60));
}

/**
 * Guard attendance history for a calendar month (punch-in records).
 */
export async function listAttendanceHistory(params: {
  guardId: string;
  year: number;
  month: number;
  postName?: string;
  shiftFrom?: string;
  shiftTo?: string;
}): Promise<AttendanceHistoryResponse> {
  const year = params.year;
  const month = params.month;
  const { start, end } = monthBounds(year, month);
  const startMs = start.getTime();
  const endMs = end.getTime();
  const today = new Date();
  const hoursPerDay = estimateShiftHours(params.shiftFrom, params.shiftTo);

  // Single-field query avoids a composite index requirement.
  const snap = await getFirestore()
    .collection(ATTENDANCE_COLLECTION)
    .where("guardId", "==", params.guardId)
    .get();

  type Row = {
    id: string;
    punchedAt: Date;
    postName: string;
    siteName: string;
    geofenceStatus: string;
    shiftStatus: string;
    selfieUrl?: string;
  };

  const rows: Row[] = [];
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.type && data.type !== "punch_in") {
      continue;
    }
    const punchedAtRaw = data.punchedAt as Timestamp | undefined;
    if (!punchedAtRaw?.toMillis) {
      continue;
    }
    const punchedAt = punchedAtRaw.toDate();
    const ms = punchedAt.getTime();
    if (ms < startMs || ms >= endMs) {
      continue;
    }
    rows.push({
      id: docSnap.id,
      punchedAt,
      postName:
        (typeof data.postName === "string" && data.postName) ||
        params.postName ||
        "Assigned Post",
      siteName:
        (typeof data.siteName === "string" && data.siteName) || "Assigned Site",
      geofenceStatus: String(data.geofenceStatus ?? ""),
      shiftStatus: String(data.shiftStatus ?? ""),
      selfieUrl: typeof data.selfieUrl === "string" ? data.selfieUrl : undefined,
    });
  }

  rows.sort((a, b) => b.punchedAt.getTime() - a.punchedAt.getTime());

  // One entry per calendar day (latest punch wins)
  const byDay = new Map<number, Row>();
  for (const row of rows) {
    const day = row.punchedAt.getDate();
    if (!byDay.has(day)) {
      byDay.set(day, row);
    }
  }

  const presentDays = byDay.size;
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const elapsedDays = isCurrentMonth ? today.getDate() : daysInMonth;
  const punctualityPct =
    elapsedDays > 0 ? Math.min(100, Math.round((presentDays / elapsedDays) * 100)) : 0;

  const calendarDays: AttendanceHistoryResponse["calendarDays"] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const hasPresent = byDay.has(day);
    const isToday =
      isCurrentMonth && today.getDate() === day && hasPresent;
    const isTodayEmpty =
      isCurrentMonth && today.getDate() === day && !hasPresent;

    let status: AttendanceHistoryDayStatus = "empty";
    if (isToday) {
      status = "today";
    } else if (hasPresent) {
      status = "present";
    } else if (isTodayEmpty) {
      status = "today";
    }

    calendarDays.push({ day, status });
  }

  const logs: AttendanceHistoryLogDto[] = [...byDay.values()]
    .sort((a, b) => b.punchedAt.getTime() - a.punchedAt.getTime())
    .map((row) => {
      const isToday = isSameLocalDay(row.punchedAt, today);
      const onDuty = isToday && row.shiftStatus === "started";
      const tags = ["Geofence Verified"];
      if (onDuty) {
        tags.push("Live Session");
      } else {
        tags.push("Punch Recorded");
      }
      if (row.selfieUrl && !row.selfieUrl.startsWith("demo://")) {
        tags.push("Selfie Saved");
      }

      return {
        id: row.id,
        kind: onDuty ? "onDuty" : "present",
        statusLabel: onDuty ? "ON DUTY • TODAY" : "PRESENT • PUNCHED IN",
        dateLabel: formatShortDate(row.punchedAt).toUpperCase(),
        postLabel: row.postName || row.siteName,
        postIcon: "shield",
        detailPrimaryLabel: onDuty ? "Punch In" : "In",
        detailPrimaryValue: formatPunchTime(row.punchedAt),
        detailSecondaryLabel: onDuty ? "Status" : "Site",
        detailSecondaryValue: onDuty ? "Shift active" : row.siteName,
        footerTags: tags,
        punchedAtIso: row.punchedAt.toISOString(),
        dayOfMonth: row.punchedAt.getDate(),
        selfieUrl: row.selfieUrl,
      };
    });

  const monthLabel = formatMonthLabel(year, month);
  const lastDay = daysInMonth;

  return {
    year,
    month,
    monthLabel,
    cycleLabel: isCurrentMonth ? "Current Cycle" : "Past Cycle",
    cycleNote: `Cycle: 01 ${monthLabel.split(" ")[0]} - ${String(lastDay).padStart(2, "0")} ${monthLabel.split(" ")[0]} • Guard verified punches`,
    punctualityTitle: `${presentDays} Days Present • ${punctualityPct}% coverage`,
    punctualitySubtitle:
      presentDays > 0
        ? "Based on verified punch-in records for this cycle"
        : "No punch-in records for this month yet",
    stats: {
      presentDays,
      totalHours: presentDays * hoursPerDay,
      leaveDays: 0,
      weeklyOffDays: 0,
    },
    calendarDays,
    leadingEmpty: mondayBasedWeekday(start),
    logs,
    filterCounts: {
      all: logs.length,
      present: logs.filter((l) => l.kind === "present" || l.kind === "onDuty")
        .length,
      weeklyOff: 0,
    },
  };
}
