import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import type { Auth, UserCredential } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import {
  getHrStaffById,
  type HrStaff,
} from "@raskha/hr-management";

// ── Login ────────────────────────────────────────────────────────────────────

export interface LoginHrStaffParams {
  email: string;
  password: string;
}

export interface LoginHrStaffResult {
  credential: UserCredential;
  hrStaff: HrStaff;
}

/**
 * Signs an HR staff member in via Firebase Auth, then verifies their record
 * exists in the Firestore hrStaff collection and that their status is "active".
 * Mirrors loginAgency() from core/Agency/agencyAuth.ts.
 */
export async function loginHrStaff(
  auth: Auth,
  db: Firestore,
  params: LoginHrStaffParams
): Promise<LoginHrStaffResult> {
  const { email, password } = params;

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  const hrStaff = await getHrStaffById(db, uid);

  if (!hrStaff) {
    await signOut(auth);
    throw new Error("Account not found");
  }

  if (hrStaff.status !== "active") {
    await signOut(auth);
    throw new Error("Account is inactive");
  }

  return { credential, hrStaff };
}

// ── Password update (via Admin backend) ──────────────────────────────────────

/**
 * Updates an HR staff member's Firebase Auth password by calling the Admin
 * backend endpoint (PUT /api/hr-staff/:id/password).
 * The Admin SDK (server-side only) performs the actual update.
 *
 * @param hrStaffId  - Firebase Auth UID of the HR user
 * @param newPassword - The new plain-text password (min 8 chars)
 * @param backendBaseUrl - Base URL of the Admin backend, e.g. "http://localhost:3001"
 */
export async function updateHrStaffPassword(
  hrStaffId: string,
  newPassword: string,
  backendBaseUrl: string
): Promise<void> {
  const response = await fetch(
    `${backendBaseUrl}/api/hr-staff/${hrStaffId}/password`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    }
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(data.error ?? "Failed to update password.");
  }
}

// ── Forgot password (HR Panel self-service) ──────────────────────────────────

/**
 * Sends a Firebase password reset email to the given address.
 * Used by the HR Panel login page's "Forgot password?" button.
 */
export async function sendHrForgotPasswordEmail(
  auth: Auth,
  email: string
): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
