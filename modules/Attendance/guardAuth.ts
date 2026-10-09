import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { GUARDS_COLLECTION, type Guard } from "@raskha/guard-management";

import {
  DEMO_GUARD_ID,
  DEMO_GUARD_PASSWORD,
  type AuthenticatedGuardContext,
} from "./attendance";
import { verifyFirebaseEmailPassword } from "./firebasePasswordAuth";
import {
  isValidIndianMobile,
  normalizePhone,
  phoneLookupVariants,
} from "./phone";
import { getSiteGeofenceById } from "./siteLookup";

export type AuthenticateGuardParams = {
  /** Mobile number, employee / Guard ID, or email */
  identifier: string;
  password: string;
  demoMode?: boolean;
};

type GuardDoc = Guard;

function toContext(guard: GuardDoc): AuthenticatedGuardContext {
  const profilePictureUrl =
    typeof guard.profilePictureUrl === "string" ? guard.profilePictureUrl.trim() : "";
  return {
    guardId: guard.id,
    employeeCode: guard.employeeCode,
    fullName: guard.fullName,
    agencyId: guard.agencyId,
    assignedSiteId: guard.assignedSiteId,
    siteName: "",
    postName: guard.post || "Assigned Post",
    shiftFrom: guard.shiftFrom || "08:00",
    shiftTo: guard.shiftTo || "20:00",
    phone: guard.phone,
    profilePictureUrl,
  };
}

/** Resolve site display name from assignedSiteId (existing sites collection). */
async function withResolvedSiteName(
  ctx: AuthenticatedGuardContext
): Promise<AuthenticatedGuardContext> {
  if (ctx.siteName?.trim() || !ctx.assignedSiteId?.trim()) {
    return ctx;
  }
  try {
    const site = await getSiteGeofenceById(ctx.assignedSiteId);
    if (!site?.siteName) {
      return ctx;
    }
    return { ...ctx, siteName: site.siteName };
  } catch {
    return ctx;
  }
}

function demoPhone(): string {
  return normalizePhone(process.env.GUARD_DEMO_PHONE || "9876543210");
}

function demoContext(
  identifier: string,
  password: string
): AuthenticatedGuardContext | null {
  const expectedId = (
    process.env.GUARD_DEMO_ID || DEMO_GUARD_ID
  ).toUpperCase();
  const expectedPassword =
    process.env.GUARD_DEMO_PASSWORD || DEMO_GUARD_PASSWORD;
  const expectedPhone = demoPhone();
  const id = identifier.trim();
  const phone = normalizePhone(id);

  const idMatches =
    id.toUpperCase() === expectedId ||
    phone === expectedPhone ||
    id.toLowerCase() === "demo@raksha.local";

  if (idMatches && password === expectedPassword) {
    return {
      guardId: "demo-guard-rks-8842",
      employeeCode: expectedId,
      fullName: "Rajesh Kumar",
      agencyId: "demo-agency",
      assignedSiteId:
        process.env.GUARD_DEMO_SITE_ID || "5rSri9bhiI7AKVrAINts",
      siteName: "Test",
      postName: "Checkpoint Post Gate 3 (Main Entry)",
      shiftFrom: "08:00",
      shiftTo: "20:00",
      phone: expectedPhone,
      profilePictureUrl: "",
    };
  }

  return null;
}

async function findGuardByEmployeeCode(
  employeeCode: string
): Promise<GuardDoc | null> {
  const snap = await getFirestore()
    .collection(GUARDS_COLLECTION)
    .where("employeeCode", "==", employeeCode)
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  const docSnap = snap.docs[0]!;
  return { id: docSnap.id, ...(docSnap.data() as Omit<GuardDoc, "id">) };
}

async function findGuardByPhone(phone: string): Promise<GuardDoc | null> {
  const db = getFirestore();
  for (const variant of phoneLookupVariants(phone)) {
    const snap = await db
      .collection(GUARDS_COLLECTION)
      .where("phone", "==", variant)
      .limit(1)
      .get();
    if (!snap.empty) {
      const docSnap = snap.docs[0]!;
      return { id: docSnap.id, ...(docSnap.data() as Omit<GuardDoc, "id">) };
    }
  }
  return null;
}

async function findGuardByEmail(email: string): Promise<GuardDoc | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return null;
  }

  const snap = await getFirestore()
    .collection(GUARDS_COLLECTION)
    .where("email", "==", normalized)
    .limit(1)
    .get();

  if (!snap.empty) {
    const docSnap = snap.docs[0]!;
    return { id: docSnap.id, ...(docSnap.data() as Omit<GuardDoc, "id">) };
  }

  // Case-sensitive fallback (HR forms may store mixed case)
  const snapRaw = await getFirestore()
    .collection(GUARDS_COLLECTION)
    .where("email", "==", email.trim())
    .limit(1)
    .get();

  if (snapRaw.empty) {
    return null;
  }

  const docSnap = snapRaw.docs[0]!;
  return { id: docSnap.id, ...(docSnap.data() as Omit<GuardDoc, "id">) };
}

export async function findGuardByIdentifier(
  identifier: string
): Promise<GuardDoc | null> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("@")) {
    const byEmail = await findGuardByEmail(trimmed);
    if (byEmail) {
      return byEmail;
    }
  }

  if (isValidIndianMobile(trimmed) || normalizePhone(trimmed).length >= 10) {
    const byPhone = await findGuardByPhone(trimmed);
    if (byPhone) {
      return byPhone;
    }
  }

  return findGuardByEmployeeCode(trimmed);
}

async function resolveLoginEmail(guard: GuardDoc): Promise<string | null> {
  if (typeof guard.email === "string" && guard.email.includes("@")) {
    return guard.email.trim();
  }

  try {
    const user = await getAuth().getUser(guard.id);
    return user.email ?? null;
  } catch {
    return null;
  }
}

export async function getGuardContextById(
  guardId: string
): Promise<AuthenticatedGuardContext | null> {
  const snap = await getFirestore()
    .collection(GUARDS_COLLECTION)
    .doc(guardId)
    .get();
  if (!snap.exists) {
    return null;
  }
  return withResolvedSiteName(
    toContext({
      id: snap.id,
      ...(snap.data() as Omit<GuardDoc, "id">),
    })
  );
}

export function getDemoGuardContext(): AuthenticatedGuardContext {
  return {
    guardId: "demo-guard-rks-8842",
    employeeCode: (process.env.GUARD_DEMO_ID || DEMO_GUARD_ID).toUpperCase(),
    fullName: "Rajesh Kumar",
    agencyId: "demo-agency",
    assignedSiteId: process.env.GUARD_DEMO_SITE_ID || "5rSri9bhiI7AKVrAINts",
    siteName: "Test",
    postName: "Checkpoint Post Gate 3 (Main Entry)",
    shiftFrom: "08:00",
    shiftTo: "20:00",
    phone: demoPhone(),
    profilePictureUrl: "",
  };
}

/**
 * Authenticate with mobile / employeeCode / email + password.
 * Password is verified against Firebase Auth (set by HR/Admin).
 *
 * Order:
 * 1) Prefer a real Firestore guard (never override with demo identity).
 * 2) Only if no real guard matches, allow the demo credentials shortcut.
 */
export async function authenticateGuard(
  params: AuthenticateGuardParams
): Promise<AuthenticatedGuardContext | null> {
  const identifier = params.identifier.trim();
  const password = params.password;
  const demoMode = params.demoMode !== false;

  if (!identifier || !password) {
    return null;
  }

  try {
    const guard = await findGuardByIdentifier(identifier);
    if (guard) {
      const email = await resolveLoginEmail(guard);
      if (!email) {
        // Real guard exists but has no Auth email — do not silently map to demo.
        return null;
      }

      const authResult = await verifyFirebaseEmailPassword(email, password);
      if (!authResult.ok) {
        return null;
      }

      return withResolvedSiteName(toContext(guard));
    }
  } catch {
    // Fall through to demo only when no real guard was resolved.
  }

  if (demoMode) {
    const matched = demoContext(identifier, password);
    if (matched) {
      return withResolvedSiteName(matched);
    }
  }

  return null;
}
