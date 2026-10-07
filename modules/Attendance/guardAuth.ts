import { getFirestore } from "firebase-admin/firestore";
import { GUARDS_COLLECTION, type Guard } from "@raskha/guard-management";

import {
  DEMO_GUARD_ID,
  DEMO_GUARD_PASSWORD,
  type AuthenticatedGuardContext,
} from "./attendance";
import { isValidIndianMobile, normalizePhone, phoneLookupVariants } from "./phone";

export type AuthenticateGuardParams = {
  /** Mobile number or employee / Guard ID */
  identifier: string;
  password: string;
  demoMode?: boolean;
};

type GuardDoc = Guard & {
  password?: string;
  pin?: string;
  loginPassword?: string;
};

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
    id.toUpperCase() === expectedId || phone === expectedPhone;

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

function passwordMatches(guard: GuardDoc, password: string): boolean {
  const candidates = [guard.password, guard.loginPassword, guard.pin].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );
  return candidates.some((stored) => stored === password);
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

export async function findGuardByIdentifier(
  identifier: string
): Promise<GuardDoc | null> {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return null;
  }

  if (isValidIndianMobile(trimmed) || normalizePhone(trimmed).length >= 10) {
    const byPhone = await findGuardByPhone(trimmed);
    if (byPhone) {
      return byPhone;
    }
  }

  return findGuardByEmployeeCode(trimmed);
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
 * Authenticate with mobile number or employeeCode + password from `guards`.
 * Demo credentials remain available when demoMode is on.
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

    if (passwordMatches(guard, password)) {
      return toContext(guard);
    }

    return demoMode ? demoContext(identifier, password) : null;
  } catch {
    return demoMode ? demoContext(identifier, password) : null;
  }
}

/** @deprecated Prefer authenticateGuard({ identifier, password }) */
export async function authenticateGuardLegacy(
  _db: unknown,
  params: { guardId: string; password: string; demoMode?: boolean }
): Promise<AuthenticatedGuardContext | null> {
  return authenticateGuard({
    identifier: params.guardId,
    password: params.password,
    demoMode: params.demoMode,
  });
}
