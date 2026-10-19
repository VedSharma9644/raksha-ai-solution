import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import {
  ATTENDANCE_COLLECTION,
  type AuthenticatedGuardContext,
  type PunchInResult,
} from "./attendance";
import { checkGeofence, type SiteGeofenceInput } from "./geofence";
import {
  addDaysToDutyDate,
  formatIstPunchDate,
  formatIstPunchTime,
  shiftWindowIst,
  startOfIstDay,
  toDutyDateKey,
} from "./dutyDate";
import { withSelfieUploadSlot } from "./uploadQueue";
import {
  computeIntervalCheckinStatus,
  evaluateIntervalCheckinPunctuality,
} from "./intervalCheckin";

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
  /** Roster duty date (YYYY-MM-DD IST); required for overnight after midnight. */
  dutyDate?: string;
};

const formatPunchTime = formatIstPunchTime;
const formatPunchDate = formatIstPunchDate;

/** Whole meters for UI (GPS accuracy often arrives with long floats). */
function formatAccuracyMeters(meters: number): string {
  const n = Number.isFinite(meters) ? Math.max(0, Math.round(meters)) : 0;
  return `${n}m`;
}

function formatGeofenceDetail(params: {
  failed: boolean;
  accuracyMeters: number;
}): string {
  return `Site Match: ${params.failed ? "0%" : "100%"} (Accuracy: ${formatAccuracyMeters(params.accuracyMeters)})`;
}

function decodeBase64Image(selfieBase64: string): Buffer {
  const cleaned = selfieBase64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(cleaned, "base64");
}

/**
 * All attendance selfies live under this prefix so GCS Object Lifecycle can
 * delete only images after retention without touching Firestore or other files.
 * Retention: 120 days (~4 months) — see scripts/storage/attendance-selfie-lifecycle.json
 */
export const ATTENDANCE_SELFIE_STORAGE_PREFIX = "attendance/";

/** Days before GCS lifecycle deletes selfie objects (must match lifecycle JSON). */
export const ATTENDANCE_SELFIE_RETENTION_DAYS = 120;

function buildSelfieStoragePath(params: {
  agencyId: string;
  siteId: string;
  guardId: string;
  purpose: "punch_in_selfie" | "punch_out_selfie" | "interval_checkin_selfie";
  loadTestId?: string;
}): string {
  const agencyId = params.agencyId || "unassigned-agency";
  const siteId = params.siteId || "unassigned-site";
  const guardId = params.guardId || "unassigned-guard";
  const suffix = params.loadTestId?.trim()
    ? `-${params.loadTestId.trim().slice(0, 64)}`
    : "";
  return `${ATTENDANCE_SELFIE_STORAGE_PREFIX}${agencyId}/${siteId}/${guardId}/${params.purpose}-${Date.now()}${suffix}.jpg`;
}

function publicSelfieUrl(bucketName: string, storagePath: string): string {
  return `https://storage.googleapis.com/${bucketName}/${storagePath}`;
}

async function uploadSelfie(params: {
  agencyId: string;
  siteId: string;
  guardId: string;
  selfieBase64: string;
  purpose?: "punch_in_selfie" | "punch_out_selfie" | "interval_checkin_selfie";
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
  purpose?: "punch_in_selfie" | "punch_out_selfie" | "interval_checkin_selfie";
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
  /** Roster duty date when recorded (may be yesterday for overnight). */
  dutyDate?: string;
  selfieUrl?: string;
  punchInStatus?: string;
  minutesLate?: number;
};

/** Ended punch-in for a duty day (shift completed / handed over). */
export type CompletedPunchInRecord = OpenPunchInRecord & {
  punchedOutAt: Date | null;
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

/** Earliest punch-in: this many minutes before shift start (e.g. 22:00 → from 21:45). */
export const PUNCH_IN_EARLY_MINUTES = 15;

/** How long after shift start a guard may still punch in (marked Late). */
export const PUNCH_IN_LATE_GRACE_MINUTES = 15;

function resolvePunchInShiftStart(params: {
  punchedAt: Date;
  shiftFrom: string;
  shiftTo?: string;
  dutyDate?: string;
}): Date | null {
  if (!parseShiftHhMm(params.shiftFrom || "08:00")) {
    return null;
  }
  const dutyDate = params.dutyDate ?? toDutyDateKey(params.punchedAt);
  const { start } = shiftWindowIst(
    dutyDate,
    params.shiftFrom || "08:00",
    params.shiftTo || params.shiftFrom || "20:00"
  );
  return start;
}

/**
 * Compare punch time against scheduled shift start in Asia/Kolkata.
 * On or before start → On Time; any minute after start → Late.
 */
export function evaluatePunchInPunctuality(params: {
  punchedAt: Date;
  shiftFrom: string;
  shiftTo?: string;
  /** Roster duty date (YYYY-MM-DD IST). Defaults to IST calendar day of punchedAt. */
  dutyDate?: string;
}): { punchInStatus: "On Time" | "Late"; minutesLate: number } {
  const start = resolvePunchInShiftStart(params);
  if (!start) {
    return { punchInStatus: "On Time", minutesLate: 0 };
  }

  const minutesLate = Math.max(
    0,
    Math.floor((params.punchedAt.getTime() - start.getTime()) / 60_000)
  );

  if (minutesLate > 0) {
    return { punchInStatus: "Late", minutesLate };
  }
  return { punchInStatus: "On Time", minutesLate: 0 };
}

/**
 * Punch-in allowed from {@link PUNCH_IN_EARLY_MINUTES} before start through
 * {@link PUNCH_IN_LATE_GRACE_MINUTES} after start (IST). Earlier / later → 403.
 */
export function assertPunchInWithinLateWindow(params: {
  punchedAt: Date;
  shiftFrom: string;
  shiftTo?: string;
  dutyDate?: string;
}): void {
  const start = resolvePunchInShiftStart(params);
  if (!start) {
    throw Object.assign(
      new Error(
        "Punch-in unavailable — shift start time is missing. Contact your supervisor."
      ),
      { statusCode: 403 }
    );
  }
  const parsed = parseShiftHhMm(params.shiftFrom || "");
  const startLabel = parsed
    ? `${String(parsed.hours).padStart(2, "0")}:${String(parsed.minutes).padStart(2, "0")}`
    : params.shiftFrom || "shift start";

  const opensAt = new Date(
    start.getTime() - PUNCH_IN_EARLY_MINUTES * 60_000
  );
  if (params.punchedAt.getTime() < opensAt.getTime()) {
    throw Object.assign(
      new Error(
        `Punch-in not open yet. You can check in from ${PUNCH_IN_EARLY_MINUTES} minutes before shift start (${startLabel}).`
      ),
      { statusCode: 403 }
    );
  }

  const punctuality = evaluatePunchInPunctuality(params);
  if (punctuality.minutesLate <= PUNCH_IN_LATE_GRACE_MINUTES) {
    return;
  }
  throw Object.assign(
    new Error(
      `Punch-in closed. Late check-in is only allowed within ${PUNCH_IN_LATE_GRACE_MINUTES} minutes after shift start (${startLabel}). Contact your supervisor if you still need to start duty.`
    ),
    { statusCode: 403 }
  );
}

export function getPunchInWindowStatus(params: {
  now?: Date;
  shiftFrom: string;
  shiftTo?: string;
  /** Roster duty date for the shift window (may be yesterday overnight). */
  dutyDate?: string;
  shiftActive: boolean;
}): {
  open: boolean;
  graceMinutes: number;
  earlyMinutes: number;
  minutesPastStart: number | null;
  minutesUntilOpen: number | null;
  opensAt: string | null;
  closesAt: string | null;
  message: string | null;
} {
  if (params.shiftActive) {
    return {
      open: false,
      graceMinutes: PUNCH_IN_LATE_GRACE_MINUTES,
      earlyMinutes: PUNCH_IN_EARLY_MINUTES,
      minutesPastStart: null,
      minutesUntilOpen: null,
      opensAt: null,
      closesAt: null,
      message: null,
    };
  }
  const now = params.now ?? new Date();
  const dutyDate = params.dutyDate ?? toDutyDateKey(now);
  const start = resolvePunchInShiftStart({
    punchedAt: now,
    shiftFrom: params.shiftFrom,
    shiftTo: params.shiftTo,
    dutyDate,
  });
  if (!start) {
    // Fail closed — never unlock punch-in when shift start cannot be resolved.
    return {
      open: false,
      graceMinutes: PUNCH_IN_LATE_GRACE_MINUTES,
      earlyMinutes: PUNCH_IN_EARLY_MINUTES,
      minutesPastStart: null,
      minutesUntilOpen: null,
      opensAt: null,
      closesAt: null,
      message:
        "Punch-in unavailable — shift start time is missing. Contact your supervisor.",
    };
  }

  const opensAt = new Date(start.getTime() - PUNCH_IN_EARLY_MINUTES * 60_000);
  const closesAt = new Date(
    start.getTime() + PUNCH_IN_LATE_GRACE_MINUTES * 60_000
  );
  const punctuality = evaluatePunchInPunctuality({
    punchedAt: now,
    shiftFrom: params.shiftFrom,
    shiftTo: params.shiftTo,
    dutyDate,
  });

  if (now.getTime() < opensAt.getTime()) {
    const minutesUntilOpen = Math.ceil(
      (opensAt.getTime() - now.getTime()) / 60_000
    );
    return {
      open: false,
      graceMinutes: PUNCH_IN_LATE_GRACE_MINUTES,
      earlyMinutes: PUNCH_IN_EARLY_MINUTES,
      minutesPastStart: null,
      minutesUntilOpen,
      opensAt: opensAt.toISOString(),
      closesAt: closesAt.toISOString(),
      message: `Punch-in opens ${PUNCH_IN_EARLY_MINUTES} minutes before your shift start. Come back in about ${minutesUntilOpen} min.`,
    };
  }

  const open = punctuality.minutesLate <= PUNCH_IN_LATE_GRACE_MINUTES;
  return {
    open,
    graceMinutes: PUNCH_IN_LATE_GRACE_MINUTES,
    earlyMinutes: PUNCH_IN_EARLY_MINUTES,
    minutesPastStart: punctuality.minutesLate,
    minutesUntilOpen: null,
    opensAt: opensAt.toISOString(),
    closesAt: closesAt.toISOString(),
    message: open
      ? null
      : `Punch-in closed. Late check-in is only allowed within ${PUNCH_IN_LATE_GRACE_MINUTES} minutes after your shift start.`,
  };
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
  const dutyDateRaw =
    typeof data.dutyDate === "string" && data.dutyDate.trim()
      ? data.dutyDate.trim()
      : undefined;
  return {
    id: docSnap.id,
    punchedAt,
    dutyDate: dutyDateRaw,
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

async function findOpenPunchForDutyDate(
  guardId: string,
  dutyDate: string
): Promise<OpenPunchInRecord | null> {
  const db = getFirestore();
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
    return best;
  } catch {
    return null;
  }
}

/**
 * Active punch-in for the live shift — includes yesterday's overnight open punches
 * that spill past IST midnight.
 */
export async function getTodayOpenPunchIn(
  guardId: string
): Promise<OpenPunchInRecord | null> {
  const db = getFirestore();
  const todayKey = toDutyDateKey();
  const yesterdayKey = addDaysToDutyDate(todayKey, -1);
  // Legacy open-punch scan: look back from yesterday IST midnight (overnight).
  const lookbackMs = startOfIstDay(yesterdayKey).getTime();

  const [todayOpen, yesterdayOpen] = await Promise.all([
    findOpenPunchForDutyDate(guardId, todayKey),
    findOpenPunchForDutyDate(guardId, yesterdayKey),
  ]);

  let best: OpenPunchInRecord | null = null;
  for (const candidate of [todayOpen, yesterdayOpen]) {
    if (!candidate) {
      continue;
    }
    if (!best || candidate.punchedAt.getTime() > best.punchedAt.getTime()) {
      best = candidate;
    }
  }
  if (best) {
    return best;
  }

  // Legacy: records without dutyDate (pre-migration), or index miss.
  const snap = await db
    .collection(ATTENDANCE_COLLECTION)
    .where("guardId", "==", guardId)
    .get();

  for (const docSnap of snap.docs) {
    const mapped = mapOpenPunchIn(docSnap);
    if (!mapped) {
      continue;
    }
    if (mapped.punchedAt.getTime() < lookbackMs) {
      continue;
    }
    if (!best || mapped.punchedAt.getTime() > best.punchedAt.getTime()) {
      best = mapped;
    }
  }

  return best;
}

function mapCompletedPunchIn(docSnap: {
  id: string;
  data: () => Record<string, unknown>;
}): CompletedPunchInRecord | null {
  const data = docSnap.data();
  if (data.type && data.type !== "punch_in") {
    return null;
  }
  if (data.shiftStatus !== "ended") {
    return null;
  }
  const punchedAtRaw = data.punchedAt as Timestamp | undefined;
  if (!punchedAtRaw?.toMillis) {
    return null;
  }
  const punchedOutRaw = data.punchedOutAt as Timestamp | undefined;
  const minutesLateRaw = Number(data.minutesLate);
  const dutyDateRaw =
    typeof data.dutyDate === "string" && data.dutyDate.trim()
      ? data.dutyDate.trim()
      : undefined;
  return {
    id: docSnap.id,
    punchedAt: punchedAtRaw.toDate(),
    punchedOutAt: punchedOutRaw?.toMillis
      ? punchedOutRaw.toDate()
      : null,
    dutyDate: dutyDateRaw,
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

async function findCompletedPunchForDutyDate(
  guardId: string,
  dutyDate: string
): Promise<CompletedPunchInRecord | null> {
  const db = getFirestore();
  try {
    const indexed = await db
      .collection(ATTENDANCE_COLLECTION)
      .where("guardId", "==", guardId)
      .where("dutyDate", "==", dutyDate)
      .get();

    let best: CompletedPunchInRecord | null = null;
    for (const docSnap of indexed.docs) {
      const mapped = mapCompletedPunchIn(docSnap);
      if (!mapped) {
        continue;
      }
      if (!best || mapped.punchedAt.getTime() > best.punchedAt.getTime()) {
        best = mapped;
      }
    }
    return best;
  } catch {
    return null;
  }
}

/**
 * Most recent completed (ended) punch-in for today's or overnight duty.
 * Used so Home can show COMPLETED instead of MISSED after punch-out.
 */
export async function getTodayCompletedPunchIn(
  guardId: string,
  preferredDutyDate?: string | null
): Promise<CompletedPunchInRecord | null> {
  const todayKey = toDutyDateKey();
  const yesterdayKey = addDaysToDutyDate(todayKey, -1);
  const preferred = preferredDutyDate?.trim() || "";

  const dutyDates = preferred
    ? Array.from(new Set([preferred, todayKey, yesterdayKey]))
    : [todayKey, yesterdayKey];

  let best: CompletedPunchInRecord | null = null;
  for (const dutyDate of dutyDates) {
    const candidate = await findCompletedPunchForDutyDate(guardId, dutyDate);
    if (!candidate) {
      continue;
    }
    if (!best || candidate.punchedAt.getTime() > best.punchedAt.getTime()) {
      best = candidate;
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
  purpose: "punch_in_selfie" | "punch_out_selfie" | "interval_checkin_selfie";
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

  const now = new Date();
  const dutyDate = params.dutyDate?.trim() || toDutyDateKey(now);
  assertPunchInWithinLateWindow({
    punchedAt: now,
    shiftFrom: params.guard.shiftFrom,
    shiftTo: params.guard.shiftTo,
    dutyDate,
  });

  const { selfieUrl, storagePath } = await resolveSelfieAssets({
    guard: params.guard,
    selfieBase64: params.selfieBase64,
    selfieStoragePath: params.selfieStoragePath,
    selfieUrl: params.selfieUrl,
    purpose: "punch_in_selfie",
    loadTestId: loadTestId || undefined,
  });

  const punctuality = evaluatePunchInPunctuality({
    punchedAt: now,
    shiftFrom: params.guard.shiftFrom,
    shiftTo: params.guard.shiftTo,
    dutyDate,
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

const RELIEF_REQUESTS_COLLECTION = "reliefRequests";

export type PunchOutEligibility = {
  /** True when now is still before the scheduled shift end. */
  early: boolean;
  /** True when punch-out is allowed (at/after end, or relief assignee exists). */
  allowed: boolean;
  reliefAssigned: boolean;
  reliefRequestId?: string;
  reliefAssigneeName?: string;
  shiftEndsAt: string | null;
  message: string | null;
};

type ApprovedReliefAssignee = {
  requestId: string;
  assignedGuardId: string;
  assignedGuardName: string;
};

/**
 * Find an approved relief request for this guard's duty date with a replacement assigned.
 */
export async function findApprovedReliefAssigneeForDuty(params: {
  guardId: string;
  dutyDate: string;
}): Promise<ApprovedReliefAssignee | null> {
  const guardId = params.guardId.trim();
  const dutyDate = params.dutyDate.trim();
  if (!guardId || !dutyDate) {
    return null;
  }

  const snap = await getFirestore()
    .collection(RELIEF_REQUESTS_COLLECTION)
    .where("guardId", "==", guardId)
    .get();

  for (const docSnap of snap.docs) {
    const data = docSnap.data() as {
      status?: string;
      dutyDate?: string;
      assignedGuardId?: string;
      assignedGuardName?: string;
    };
    if (data.status !== "approved") {
      continue;
    }
    if ((data.dutyDate ?? "").trim() !== dutyDate) {
      continue;
    }
    const assignedGuardId = (data.assignedGuardId ?? "").trim();
    if (!assignedGuardId) {
      continue;
    }
    return {
      requestId: docSnap.id,
      assignedGuardId,
      assignedGuardName:
        (data.assignedGuardName ?? "").trim() || "Relief guard",
    };
  }
  return null;
}

/**
 * Mid-shift punch-out is allowed only when a relief guard has been assigned.
 * At or after scheduled shift end, punch-out is allowed without relief.
 */
export async function evaluatePunchOutEligibility(params: {
  guardId: string;
  shiftFrom: string;
  shiftTo: string;
  dutyDate: string;
  now?: Date;
}): Promise<PunchOutEligibility> {
  const now = params.now ?? new Date();
  const dutyDate = params.dutyDate.trim() || toDutyDateKey(now);
  const { end } = shiftWindowIst(
    dutyDate,
    params.shiftFrom || "08:00",
    params.shiftTo || "20:00"
  );
  const early = now.getTime() < end.getTime();
  const shiftEndsAt = end.toISOString();

  if (!early) {
    return {
      early: false,
      allowed: true,
      reliefAssigned: false,
      shiftEndsAt,
      message: null,
    };
  }

  const relief = await findApprovedReliefAssigneeForDuty({
    guardId: params.guardId,
    dutyDate,
  });

  if (relief) {
    return {
      early: true,
      allowed: true,
      reliefAssigned: true,
      reliefRequestId: relief.requestId,
      reliefAssigneeName: relief.assignedGuardName,
      shiftEndsAt,
      message: null,
    };
  }

  return {
    early: true,
    allowed: false,
    reliefAssigned: false,
    shiftEndsAt,
    message:
      "You cannot end your shift before scheduled end time unless a relief guard has been assigned. Request relief and wait for approval first.",
  };
}

/**
 * End an active shift: require site geofence + punch-out selfie.
 * Mid-shift end also requires an approved relief assignee.
 * Updates today's open punch-in record (shiftStatus → ended).
 */
export async function markPunchOut(
  params: MarkPunchOutParams
): Promise<PunchInResult> {
  const demoMode = params.demoMode !== false;
  const accuracyMeters = params.accuracyMeters ?? 5;
  const db = getFirestore();

  if (!params.selfieBase64?.trim() && !params.selfieStoragePath?.trim()) {
    throw Object.assign(
      new Error("End-shift selfie is required to end your shift."),
      { statusCode: 400 }
    );
  }

  const geofence = checkGeofence({
    lat: params.lat,
    lng: params.lng,
    accuracyMeters,
    site: params.site,
    demoMode,
  });

  if (!geofence.unlocked) {
    throw Object.assign(
      new Error(
        geofence.message || "You must be at the duty site to end your shift."
      ),
      { statusCode: 403 }
    );
  }

  const open = await getTodayOpenPunchIn(params.guard.guardId);
  if (!open) {
    throw Object.assign(new Error("No active shift found. Punch in first."), {
      statusCode: 400,
    });
  }

  const now = new Date();
  const dutyDate =
    open.dutyDate?.trim() || toDutyDateKey(open.punchedAt);

  const eligibility = await evaluatePunchOutEligibility({
    guardId: params.guard.guardId,
    shiftFrom: params.guard.shiftFrom,
    shiftTo: params.guard.shiftTo,
    dutyDate,
    now,
  });
  if (!eligibility.allowed) {
    throw Object.assign(
      new Error(
        eligibility.message ||
          "Early punch-out is not allowed without a relief guard."
      ),
      { statusCode: 403 }
    );
  }

  const { selfieUrl, storagePath } = await resolveSelfieAssets({
    guard: params.guard,
    selfieBase64: params.selfieBase64,
    selfieStoragePath: params.selfieStoragePath,
    selfieUrl: params.selfieUrl,
    purpose: "punch_out_selfie",
    loadTestId: params.loadTestId?.trim() || undefined,
  });

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
    ...(eligibility.early && eligibility.reliefRequestId
      ? {
          earlyPunchOut: true,
          reliefHandoverRequestId: eligibility.reliefRequestId,
        }
      : {}),
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
    ...(eligibility.early && eligibility.reliefRequestId
      ? {
          earlyPunchOut: true,
          reliefHandoverRequestId: eligibility.reliefRequestId,
        }
      : {}),
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

export type IntervalCheckinRecordSummary = {
  id: string;
  punchedAt: Date;
  selfieUrl: string;
  punctuality: "on_time" | "late";
};

export async function listIntervalCheckinsForShift(
  shiftPunchInId: string
): Promise<IntervalCheckinRecordSummary[]> {
  if (!shiftPunchInId.trim()) {
    return [];
  }
  const db = getFirestore();
  // Single-field query — filter type in memory (avoids composite index).
  const snap = await db
    .collection(ATTENDANCE_COLLECTION)
    .where("shiftPunchInId", "==", shiftPunchInId.trim())
    .get();

  const rows: IntervalCheckinRecordSummary[] = [];
  for (const docSnap of snap.docs) {
    const data = docSnap.data() ?? {};
    if (String(data.type ?? "") !== "interval_checkin") {
      continue;
    }
    const punchedAtRaw = data.punchedAt as Timestamp | undefined;
    if (!punchedAtRaw?.toMillis) {
      continue;
    }
    const punctualityRaw = String(data.checkinPunctuality ?? "on_time");
    rows.push({
      id: docSnap.id,
      punchedAt: punchedAtRaw.toDate(),
      selfieUrl: typeof data.selfieUrl === "string" ? data.selfieUrl : "",
      punctuality: punctualityRaw === "late" ? "late" : "on_time",
    });
  }
  rows.sort((a, b) => a.punchedAt.getTime() - b.punchedAt.getTime());
  return rows;
}

export type MarkIntervalCheckinParams = {
  guard: AuthenticatedGuardContext;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  selfieBase64?: string;
  selfieStoragePath?: string;
  selfieUrl?: string;
  site?: SiteGeofenceInput | null;
  demoMode?: boolean;
  /** Site interval minutes (required for window validation). */
  intervalCheckinMinutes: number | null;
};

export type IntervalCheckinResult = PunchInResult & {
  mode: "interval_checkin";
  checkinPunctuality: "on_time" | "late";
  sequenceNumber: number;
};

/**
 * Mid-shift photo check-in: requires active punch-in, site geofence, and
 * an open due/late window (15-minute grace after due).
 */
export async function markIntervalCheckin(
  params: MarkIntervalCheckinParams
): Promise<IntervalCheckinResult> {
  const demoMode = params.demoMode !== false;
  const accuracyMeters = params.accuracyMeters ?? 5;
  const db = getFirestore();

  const open = await getTodayOpenPunchIn(params.guard.guardId);
  if (!open) {
    throw Object.assign(
      new Error("No active shift. Punch in before interval check-in."),
      { statusCode: 400 }
    );
  }

  const intervalMinutes = params.intervalCheckinMinutes;
  if (!intervalMinutes || intervalMinutes < 5) {
    throw Object.assign(
      new Error("This site does not require regular interval check-ins."),
      { statusCode: 400 }
    );
  }

  const prior = await listIntervalCheckinsForShift(open.id);
  const lastCheckinAt =
    prior.length > 0 ? prior[prior.length - 1]!.punchedAt : null;
  const window = computeIntervalCheckinStatus({
    intervalMinutes,
    shiftActive: true,
    punchInAt: open.punchedAt,
    lastCheckinAt,
    completedCount: prior.length,
  const dutyDate =
    open.dutyDate?.trim() || toDutyDateKey(open.punchedAt);
  const shiftEndsAt = shiftWindowIst(
    dutyDate,
    params.guard.shiftFrom,
    params.guard.shiftTo
  ).end;
  const window = computeIntervalCheckinStatus({
    intervalMinutes,
    shiftActive: true,
    punchInAt: open.punchedAt,
    lastCheckinAt,
    completedCount: prior.length,
    shiftEndsAt,
  });

  if (window.status !== "due" && window.status !== "late") {
    if (window.status === "complete") {
      throw Object.assign(
        new Error(
          "Interval photo check-ins for this shift are done. Use End shift when you are ready to leave."
        ),
        { statusCode: 400 }
      );
    }
      );
    }
    if (window.status === "waiting" && window.dueAt) {
      throw Object.assign(
        new Error(
          `Next check-in is due at ${new Date(window.dueAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true })}.`
        ),
        { statusCode: 400 }
      );
    }
    throw Object.assign(new Error("Interval check-in is not available now."), {
      statusCode: 400,
    });
  }

  if (!window.dueAt) {
    throw Object.assign(new Error("Interval check-in window is invalid."), {
      statusCode: 400,
    });
  }

  const geofence = checkGeofence({
    lat: params.lat,
    lng: params.lng,
    accuracyMeters,
    site: params.site,
    demoMode,
  });

  if (!geofence.unlocked) {
    throw Object.assign(
      new Error(
        geofence.message ||
          "You must be at the duty site to complete a check-in."
      ),
      { statusCode: 403 }
    );
  }

  const now = new Date();
  const punctuality = evaluateIntervalCheckinPunctuality({
    punchedAt: now,
    dueAt: new Date(window.dueAt),
  });

  const { selfieUrl, storagePath } = await resolveSelfieAssets({
    guard: params.guard,
    selfieBase64: params.selfieBase64,
    selfieStoragePath: params.selfieStoragePath,
    selfieUrl: params.selfieUrl,
    purpose: "interval_checkin_selfie",
  });

  const dutyDate = open.dutyDate?.trim() || toDutyDateKey(open.punchedAt);
  const sequenceNumber = prior.length + 1;

  const docRef = await db.collection(ATTENDANCE_COLLECTION).add({
    guardId: params.guard.guardId,
    agencyId: params.guard.agencyId,
    type: "interval_checkin",
    shiftPunchInId: open.id,
    dutyDate,
    punchedAt: Timestamp.fromDate(now),
    dueAt: Timestamp.fromDate(new Date(window.dueAt)),
    checkinPunctuality: punctuality,
    sequenceNumber,
    lat: params.lat,
    lng: params.lng,
    accuracyMeters,
    selfieUrl,
    selfieStoragePath: storagePath,
    geofenceStatus: geofence.status,
    shiftStatus: "started",
    guardName: params.guard.fullName,
    guardEmployeeCode: params.guard.employeeCode,
    siteName: params.guard.siteName || open.siteName,
    postName: params.guard.postName || open.postName,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    recordId: docRef.id,
    guardName: params.guard.fullName,
    guardId: params.guard.employeeCode,
    punchInTime: formatPunchTime(now),
    punchInDate: formatPunchDate(now),
    punchInStatus: punctuality === "late" ? "Late check-in" : "Check-in OK",
    dutySiteName: params.guard.siteName || open.siteName,
    dutyPostName: params.guard.postName || open.postName,
    rosterTitle: `Interval check-in #${sequenceNumber}`,
    rosterHours: `Every ${intervalMinutes} min`,
    geofenceDetail: `Site Match: ${geofence.status === "failed" ? "0%" : "100%"} (Accuracy: ${accuracyMeters}m)`,
    geofenceResult: geofence.unlocked ? "PASSED" : "FAILED",
    selfieUrl,
    shiftStatus: "started",
    mode: "interval_checkin",
    checkinPunctuality: punctuality,
    sequenceNumber,
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
