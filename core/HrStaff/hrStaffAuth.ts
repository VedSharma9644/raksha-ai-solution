import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { Auth, UserCredential } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import {
  getHrStaffById,
  type HrStaff,
} from "@raskha/hr-management";

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

  // Step 1: Firebase Auth sign-in
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  // Step 2: Verify HR staff record exists in Firestore
  const hrStaff = await getHrStaffById(db, uid);

  if (!hrStaff) {
    await signOut(auth);
    throw new Error("Account not found");
  }

  // Step 3: Verify the account is active
  if (hrStaff.status !== "active") {
    await signOut(auth);
    throw new Error("Account is inactive");
  }

  return { credential, hrStaff };
}
