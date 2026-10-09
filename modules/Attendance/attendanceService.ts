import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import {
  ATTENDANCE_COLLECTION,
  type AuthenticatedGuardContext,
  type PunchInResult,
} from "./attendance";
import { checkGeofence, type SiteGeofenceInput } from "./geofence";
import {
  formatIstPunchDate,
  formatIstPunchTime,
  istWallClockToDate,
  toDutyDateKey,
} from "./dutyDate";
import { withSelfieUploadSlot } from "./uploadQueue";

export {
  formatIstPunchDate,
  formatIstPunchTime,
  toDutyDateKey,
} from "./dutyDate";

export type MarkPunchInParams = {
  guard: AuthenticatedGuardContext;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  /** Legacy path: base64 JPEG in JSON (still supported). */
  selfieBase64?: string;
  /** Preferred: client uploaded via signed URL. */
  selfieStoragePath?: string;
  selfieUrl?: string;
  site?: SiteGeofenceInput | null;
  demoMode?: boolean;
  /** Demo load-test only: unique Storage path + skip duplicate punch check. */
  loadTestId?: string;
};

const formatPunchTime = formatIstPunchTime;
const formatPunchDate = formatIstPunchDate;

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

function buildSelfieStoragePath(params: {
  agencyId: string;
  siteId: string;
  guardId: string;
  purpose: "punch_in_selfie" | "punch_out_selfie";
  loadTestId?: string;
}): string {
  const agencyId = params.agencyId || "unassigned-agency";
  const siteId = params.siteId || "unassigned-site";
  const guardId = params.guardId || "unassigned-guard";
  const suffix = params.loadTestId?.trim()
    ? `-${params.loadTestId.trim().slice(0, 64)}`
    : "";
  return `attendance/${agencyId}/${siteId}/${guardId}/${params.purpose}-${Date.now()}${suffix}.jpg`;
}

function publicSelfieUrl(bucketName: string, storagePath: string): string {
  return `https://storage.googleapis.com/${bucketName}/${storagePath}`;
}

async function uploadSelfie(params: {
  agencyId: string;
  siteId: string;
  guardId: string;
  selfieBase64: string;
  purpose?: "punch_in_selfie" | "punch_out_selfie";
  loadTestId?: string;
}): Promise<{ selfieUrl: string; storagePath: string }> {
  const purpose = params.purpose ?? "punch_in_selfie";
  const storagePath = buildSelfieStoragePath({
    agencyId: params.agencyId,
    siteId: params.siteId,
    guardId: params.guardId,
    purpose,
    loadTestId: params.loadTestId,
  });
  const bytes = decodeBase64Image(params.selfieBase64);

  return withSelfieUploadSlot(async () => {
    try {
      const bucket = getStorage().bucket();
      const file = bucket.file(storagePath);
      await file.save(bytes, {
        contentType: "image/jpeg",
        resumable: false,
        metadata: {
          cacheControl: "private, max-age=0",
          metadata: {
            agencyId: params.agencyId || "unassigned-agency",
            siteId: params.siteId || "unassigned-site",
            guardId: params.guardId || "unassigned-guard",
            purpose,
          },
        },
      });
      await file.makePublic().catch(() => undefined);
      return {
        selfieUrl: publicSelfieUrl(bucket.name, storagePath),
        storagePath,
      };
    } catch {
      // Demo / rules-limited environments still complete punch-in
      return {
        selfieUrl: `demo://${storagePath}`,
        storagePath,
      };
    }
  });
}

/**
 * Create a short-lived V4 signed URL so the mobile app uploads JPEG bytes
 * directly to Storage (avoids base64-in-JSON on the API).
 */
export async function createSelfieUploadUrl(params: {
  agencyId: string;
  siteId: string;
  guardId: string;
  purpose?: "punch_in_selfie" | "punch_out_selfie";
  loadTestId?: string;
}): Promise<{
  uploadUrl: string;
  storagePath: string;
  selfieUrl: string;
  contentType: string;
  expiresAt: string;
}> {
  const purpose = params.purpose ?? "punch_in_selfie";
  const storagePath = buildSelfieStoragePath({
    agencyId: params.agencyId,
    siteId: params.siteId,
    guardId: params.guardId,
    purpose,
    loadTestId: params.loadTestId,
  });

  // Signed-URL minting is cheap — do not consume the upload semaphore here.
  const bucket = getStorage().bucket();
  const file = bucket.file(storagePath);
  const expires = Date.now() + 15 * 60 * 1000;
  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires,
    contentType: "image/jpeg",
  });
  return {
    uploadUrl,
    storagePath,
    selfieUrl: publicSelfieUrl(bucket.name, storagePath),
    contentType: "image/jpeg",
    expiresAt: new Date(expires).toISOString(),
  };
}

export type OpenPunchInRecord = {
  id: string;
  punchedAt: Date;
  siteName: string;
  postName: string;
  selfieUrl?: string;
  punchInStatus?: string;
  minutesLate?: number;
};

function parseShiftHhMm(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  return { hours, minutes };
}

/**
 * Compare punch time against scheduled shift start in Asia/Kolkata.
 * Returns Late when punch is after shift start.
 */
export function evaluatePunchInPunctuality(params: {
  punchedAt: Date;
  shiftFrom: string;
}): { punchInStatus: "On Time" | "Late"; minutesLate: number } {
  const parsed = parseShiftHhMm(params.shiftFrom || "08:00");
  if (!parsed) {
    return { punchInStatus: "On Time", minutesLate: 0 };
  }

  const dutyDate = toDutyDateKey(params.punchedAt);
  const start = istWallClockToDate(dutyDate, parsed.hours, parsed.minutes);

  const minutesLate = Math.max(
    0,
    Math.floor((params.punchedAt.getTime() - start.getTime()) / 60_000)
  );

  if (minutesLate > 0) {
    return { punchInStatus: "Late", minutesLate };
  }
  return { punchInStatus: "On Time", minutesLate: 0 };
}

function mapOpenPunchIn(docSnap: {
  id: string;
  data: () => Record<string, unknown>;
}): OpenPunchInRecord | null {
  const data = docSnap.data();
  if (data.type && data.type !== "punch_in") {
    return null;
  }
  if (data.shiftStatus !== "started") {
    return null;
  }
  const punchedAtRaw = data.punchedAt as Timestamp | undefined;
  if (!punchedAtRaw?.toMillis) {
    return null;
  }
  const punchedAt = punchedAtRaw.toDate();
  const minutesLateRaw = Number(data.minutesLate);
  return {
    id: docSnap.id,
    punchedAt,
    siteName:
      (typeof data.siteName === "string" && data.siteName) || "Assigned Site",
    postName:
      (typeof data.postName === "string" && data.postName) || "Assigned Post",
    selfieUrl: typeof data.selfieUrl === "string" ? data.selfieUrl : undefined,
    punchInStatus:
      typeof data.punchInStatus === "string" ? data.punchInStatus : undefined,
    minutesLate: Number.isFinite(minutesLateRaw) ? minutesLateRaw : undefined,
  };
}

export async function getTodayOpenPunchIn(
  guardId: string
): Promise<OpenPunchInRecord | null> {
  const db = getFirestore();
  const dutyDate = toDutyDateKey();
  const dayStartMs = startOfTodayUtc().getTime();

  // Prefer indexed query: guardId + dutyDate (composite index in firestore.indexes.json)
  try {
    const indexed = await db
      .collection(ATTENDANCE_COLLECTION)
      .where("guardId", "==", guardId)
      .where("dutyDate", "==", dutyDate)
      .get();

    let best: OpenPunchInRecord | null = null;
    for (const docSnap of indexed.docs) {
      const mapped = mapOpenPunchIn(docSnap);
      if (!mapped) {
        continue;
      }
      if (!best || mapped.punchedAt.getTime() > best.punchedAt.getTime()) {
        best = mapped;
      }
    }
    if (best) {
      return best;
    }
    // Today already has dutyDate-indexed rows (none open) — skip legacy full scan.
    if (indexed.docs.length > 0) {
      return null;
    }
    // Empty indexed day: may still have pre-migration open punches without dutyDate.
  } catch {
    // Missing composite index or older projects — fall through to legacy scan
  }

  // Legacy: records without dutyDate (pre-migration)
  const snap = await db
    .collection(ATTENDANCE_COLLECTION)
    .where("guardId", "==", guardId)
    .get();

  let best: OpenPunchInRecord | null = null;
  for (const docSnap of snap.docs) {
    const mapped = mapOpenPunchIn(docSnap);
    if (!mapped) {
      continue;
    }
    if (mapped.punchedAt.getTime() < dayStartMs) {
      continue;
    }
    if (!best || mapped.punchedAt.getTime() > best.punchedAt.getTime()) {
      best = mapped;
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

async function resolveSelfieAssets(params: {
  guard: AuthenticatedGuardContext;
  selfieBase64?: string;
  selfieStoragePath?: string;
  selfieUrl?: string;
  purpose: "punch_in_selfie" | "punch_out_selfie";
  loadTestId?: string;
}): Promise<{ selfieUrl: string; storagePath: string }> {
  const path = params.selfieStoragePath?.trim() || "";
  if (path) {
    if (!path.startsWith("attendance/")) {
      throw Object.assign(new Error("Invalid selfie storage path."), {
        statusCode: 400,
      });
    }
    if (!path.includes(`/${params.guard.guardId}/`)) {
      throw Object.assign(new Error("Selfie path does not match this guard."), {
        statusCode: 403,
      });
    }
    const bucket = getStorage().bucket();
    const selfieUrl =
      params.selfieUrl?.trim() || publicSelfieUrl(bucket.name, path);
    await bucket.file(path).makePublic().catch(() => undefined);
    return { selfieUrl, storagePath: path };
  }

  if (params.selfieBase64?.trim()) {
    return uploadSelfie({
      agencyId: params.guard.agencyId,
      siteId: params.guard.assignedSiteId,
      guardId: params.guard.guardId,
      selfieBase64: params.selfieBase64,
      purpose: params.purpose,
      loadTestId: params.loadTestId,
    });
  }

  throw Object.assign(new Error("Selfie is required to mark attendance."), {
    statusCode: 400,
  });
}

export async function markPunchIn(
  params: MarkPunchInParams
): Promise<PunchInResult> {
  const demoMode = params.demoMode !== false;
  const accuracyMeters = params.accuracyMeters ?? 5;
  const db = getFirestore();
  const loadTestId = params.loadTestId?.trim() || "";
  const allowMultiPunch =
    demoMode &&
    process.env.LOAD_TEST_ALLOW_MULTI_PUNCH === "true" &&
    Boolean(loadTestId);

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

  if (!allowMultiPunch) {
    const existing = await getTodayOpenPunchIn(params.guard.guardId);
    if (existing) {
      throw new Error("Punch-in already recorded for today. Shift is active.");
    }
  }

  const { selfieUrl, storagePath } = await resolveSelfieAssets({
    guard: params.guard,
    selfieBase64: params.selfieBase64,
    selfieStoragePath: params.selfieStoragePath,
    selfieUrl: params.selfieUrl,
    purpose: "punch_in_selfie",
    loadTestId: loadTestId || undefined,
  });

  const now = new Date();
  const dutyDate = toDutyDateKey(now);
  const punctuality = evaluatePunchInPunctuality({
    punchedAt: now,
    shiftFrom: params.guard.shiftFrom,
  });

  const docRef = await db.collection(ATTENDANCE_COLLECTION).add({
    guardId: params.guard.guardId,
    agencyId: params.guard.agencyId,
    siteId: params.guard.assignedSiteId,
    type: "punch_in",
    dutyDate,
    punchedAt: Timestamp.fromDate(now),
    lat: params.lat,
    lng: params.lng,
    accuracyMeters,
    selfieUrl,
    selfieStoragePath: storagePath,
    geofenceStatus: geofence.status,
    shiftStatus: "started",
    punchInStatus: punctuality.punchInStatus,
    loginPunctuality:
      punctuality.punchInStatus === "Late" ? "late" : "on_time",
    minutesLate: punctuality.minutesLate,
    guardName: params.guard.fullName,
    guardEmployeeCode: params.guard.employeeCode,
    siteName: params.guard.siteName || "Assigned Site",
    postName: params.guard.postName || "Assigned Post",
    ...(loadTestId ? { loadTestId } : {}),
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
    punchInStatus: punctuality.punchInStatus,
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
  selfieBase64?: string;
  selfieStoragePath?: string;
  selfieUrl?: string;
  site?: SiteGeofenceInput | null;
  demoMode?: boolean;
  loadTestId?: string;
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

  const { selfieUrl, storagePath } = await resolveSelfieAssets({
    guard: params.guard,
    selfieBase64: params.selfieBase64,
    selfieStoragePath: params.selfieStoragePath,
    selfieUrl: params.selfieUrl,
    purpose: "punch_out_selfie",
    loadTestId: params.loadTestId?.trim() || undefined,
  });

  const now = new Date();
  const dutyDate = toDutyDateKey(now);
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
    dutyDate,
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
    punchInDate: formatPunchDate(open.punchedAt),
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

export {
  listAttendanceHistory,
  type AttendanceHistoryDayStatus,
  type AttendanceHistoryLogDto,
  type AttendanceHistoryLogKind,
  type AttendanceHistoryResponse,
} from "./attendanceHistory";

export {
  listGuardUpcomingSchedule,
  type GuardScheduleDutyStatus,
  type GuardScheduleResponse,
  type GuardScheduleShiftDto,
} from "./guardSchedule";

export {
  resolveTodayDuty,
  type TodayDutyResolution,
} from "./todayDuty";
