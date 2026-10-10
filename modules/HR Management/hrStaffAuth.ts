import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { HR_STAFF_COLLECTION } from "./hrStaff";
import type { HrStaff, HrStaffStatus } from "./hrStaff";

export interface CreateHrStaffParams {
  agencyId: string;
  fullName: string;
  employeeCode: string;
  phone: string;
  email: string;
  password: string;
  notes: string;
  /** Branch IDs this HR staff member is allowed to access. */
  assignedBranchIds?: string[];
}

/**
 * Creates a Firebase Auth user for the HR staff member using a secondary
 * Firebase app instance so the admin's current session is not disrupted.
 * Then writes the HR staff document to Firestore.
 */
export async function createHrStaffAccount(
  db: Firestore,
  firebaseConfig: object,
  params: CreateHrStaffParams
): Promise<HrStaff> {
  const { agencyId, fullName, employeeCode, phone, email, password, notes, assignedBranchIds } = params;

  // Use a secondary app so the admin stays logged in
  const appName = `hr-creation-${Date.now()}`;
  let secondaryApp: FirebaseApp | null = null;
  let uid: string;

  try {
    secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );
    uid = credential.user.uid;
  } finally {
    if (secondaryApp) {
      await deleteApp(secondaryApp);
    }
  }

  const hrStaffData = {
    id: uid,
    agencyId,
    fullName,
    employeeCode,
    phone,
    email,
    notes,
    assignedBranchIds: assignedBranchIds ?? [],
    status: "active" as HrStaffStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, HR_STAFF_COLLECTION, uid), hrStaffData);

  return hrStaffData as unknown as HrStaff;
}

/**
 * Sends a Firebase password reset email to the HR staff member.
 * Used when admin sets a new password from the edit form — Firebase client SDK
 * does not allow changing another user's password directly; a reset email is
 * the secure client-side alternative. The HR user follows the link to set
 * their new password.
 *
 * Pass `continueUrl` (e.g. the HR Hosting site) so the reset lands on the
 * correct panel after completion.
 */
export async function sendHrPasswordResetEmail(
  firebaseConfig: object,
  email: string,
  continueUrl?: string
): Promise<void> {
  const appName = `hr-pw-reset-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, appName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    await sendPasswordResetEmail(
      secondaryAuth,
      email,
      continueUrl
        ? { url: continueUrl, handleCodeInApp: false }
        : undefined
    );
  } finally {
    await deleteApp(secondaryApp);
  }
}

