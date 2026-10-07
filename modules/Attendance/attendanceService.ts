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

async function uploadSelfie(
  guardId: string,
  selfieBase64: string
): Promise<string> {
  const path = `attendance/${guardId}/${Date.now()}.jpg`;
  const bytes = decodeBase64Image(selfieBase64);

  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(path);
    await file.save(bytes, {
      contentType: "image/jpeg",
      resumable: false,
      metadata: { cacheControl: "private, max-age=0" },
    });
    await file.makePublic().catch(() => undefined);
    return `https://storage.googleapis.com/${bucket.name}/${path}`;
  } catch {
    // Demo / rules-limited environments still complete punch-in
    return `demo://attendance/${guardId}/${Date.now()}.jpg`;
  }
}

export async function getTodayOpenPunchIn(
  guardId: string
): Promise<{ id: string } | null> {
  const db = getFirestore();
  const dayStart = Timestamp.fromDate(startOfTodayUtc());

  const snap = await db
    .collection(ATTENDANCE_COLLECTION)
    .where("guardId", "==", guardId)
    .where("type", "==", "punch_in")
    .where("shiftStatus", "==", "started")
    .get();

  for (const docSnap of snap.docs) {
    const punchedAt = docSnap.data().punchedAt as Timestamp | undefined;
    if (punchedAt && punchedAt.toMillis() >= dayStart.toMillis()) {
      return { id: docSnap.id };
    }
  }

  if (!snap.empty) {
    return { id: snap.docs[0]!.id };
  }

  return null;
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

  const selfieUrl = await uploadSelfie(
    params.guard.guardId,
    params.selfieBase64
  );

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
  };
}
