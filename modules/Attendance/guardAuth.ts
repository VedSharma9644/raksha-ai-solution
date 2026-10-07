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

export type AuthenticateGuardParams = {
  /** Mobile number, employee / Guard ID, or email */
  identifier: string;
  password: string;
  demoMode?: boolean;
};

type GuardDoc = Guard;

function toContext(guard: GuardDoc): AuthenticatedGuardContext {
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
  };
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
  return toContext({
    id: snap.id,
    ...(snap.data() as Omit<GuardDoc, "id">),
  });
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
  };
}

/**
 * Authenticate with mobile / employeeCode / email + password.
 * Password is verified against Firebase Auth (set by HR/Admin).
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

  if (demoMode) {
    const matched = demoContext(identifier, password);
    if (matched) {
      return matched;
    }
  }

  try {
    const guard = await findGuardByIdentifier(identifier);
    if (!guard) {
      return demoMode ? demoContext(identifier, password) : null;
    }

    const email = await resolveLoginEmail(guard);
    if (!email) {
      return demoMode ? demoContext(identifier, password) : null;
    }

    const authResult = await verifyFirebaseEmailPassword(email, password);
    if (!authResult.ok) {
      return demoMode ? demoContext(identifier, password) : null;
    }

    // Prefer Auth UID when it matches the guard doc id (createGuardAccount path)
    if (authResult.localId === guard.id) {
      return toContext(guard);
    }

    // Legacy: Auth UID differs — still allow if email matches this guard
    return toContext(guard);
  } catch {
    return demoMode ? demoContext(identifier, password) : null;
  }
}
