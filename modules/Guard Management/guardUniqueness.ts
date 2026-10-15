import {
  collection,
  getDocs,
  limit,
  query,
  where,
  type Firestore,
} from "firebase/firestore";

import { GUARDS_COLLECTION } from "./guard";

export function normalizeGuardPhone(raw: string): string {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
}

export function normalizeGuardEmail(raw: string): string {
  return String(raw ?? "").trim().toLowerCase();
}

/** Phone spellings commonly stored by Admin/HR forms. */
export function guardPhoneLookupVariants(raw: string): string[] {
  const normalized = normalizeGuardPhone(raw);
  const trimmed = String(raw ?? "").trim();
  return [
    ...new Set(
      [trimmed, normalized, `0${normalized}`, `+91${normalized}`, `91${normalized}`].filter(
        Boolean
      )
    ),
  ];
}

export type GuardContactAvailability = {
  available: boolean;
  /** Existing guard doc id when taken */
  existingGuardId?: string;
  message?: string;
};

async function findGuardIdByPhone(
  db: Firestore,
  phone: string,
  excludeGuardId?: string
): Promise<string | null> {
  for (const variant of guardPhoneLookupVariants(phone)) {
    const snap = await getDocs(
      query(
        collection(db, GUARDS_COLLECTION),
        where("phone", "==", variant),
        limit(5)
      )
    );
    for (const docSnap of snap.docs) {
      if (excludeGuardId && docSnap.id === excludeGuardId) {
        continue;
      }
      return docSnap.id;
    }
  }
  return null;
}

async function findGuardIdByEmail(
  db: Firestore,
  email: string,
  excludeGuardId?: string
): Promise<string | null> {
  const normalized = normalizeGuardEmail(email);
  if (!normalized.includes("@")) {
    return null;
  }

  const candidates = [normalized, String(email ?? "").trim()].filter(
    (v, i, arr) => v && arr.indexOf(v) === i
  );

  for (const candidate of candidates) {
    const snap = await getDocs(
      query(
        collection(db, GUARDS_COLLECTION),
        where("email", "==", candidate),
        limit(5)
      )
    );
    for (const docSnap of snap.docs) {
      if (excludeGuardId && docSnap.id === excludeGuardId) {
        continue;
      }
      return docSnap.id;
    }
  }
  return null;
}

export async function checkGuardPhoneAvailability(
  db: Firestore,
  phone: string,
  excludeGuardId?: string
): Promise<GuardContactAvailability> {
  const normalized = normalizeGuardPhone(phone);
  if (normalized.length < 10) {
    return { available: false, message: "Enter a valid mobile number." };
  }
  const existingGuardId = await findGuardIdByPhone(db, phone, excludeGuardId);
  if (existingGuardId) {
    return {
      available: false,
      existingGuardId,
      message: "This mobile number is already registered to another guard.",
    };
  }
  return { available: true, message: "Mobile number is available." };
}

export async function checkGuardEmailAvailability(
  db: Firestore,
  email: string,
  excludeGuardId?: string
): Promise<GuardContactAvailability> {
  const normalized = normalizeGuardEmail(email);
  if (!normalized.includes("@")) {
    return { available: false, message: "Enter a valid email address." };
  }
  const existingGuardId = await findGuardIdByEmail(db, email, excludeGuardId);
  if (existingGuardId) {
    return {
      available: false,
      existingGuardId,
      message: "This email is already registered to another guard.",
    };
  }
  return { available: true, message: "Email is available." };
}

/**
 * Throws if phone or email is already used by another guard document.
 * Call before Auth/Firestore create (and before contact updates).
 */
export async function assertGuardContactUnique(
  db: Firestore,
  params: { phone: string; email: string; excludeGuardId?: string }
): Promise<void> {
  const [phoneCheck, emailCheck] = await Promise.all([
    checkGuardPhoneAvailability(db, params.phone, params.excludeGuardId),
    checkGuardEmailAvailability(db, params.email, params.excludeGuardId),
  ]);

  if (!phoneCheck.available) {
    throw Object.assign(
      new Error(
        phoneCheck.message ??
          "This mobile number is already registered to another guard."
      ),
      { code: "guard/phone-taken", statusCode: 409 }
    );
  }
  if (!emailCheck.available) {
    throw Object.assign(
      new Error(
        emailCheck.message ??
          "This email is already registered to another guard."
      ),
      { code: "guard/email-taken", statusCode: 409 }
    );
  }
}
