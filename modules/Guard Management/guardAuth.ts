import {
  createUserWithEmailAndPassword,
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
import { GUARDS_COLLECTION } from "./guard";
import type { Guard, GuardStatus, GuardGender } from "./guard";

export interface CreateGuardAccountParams {
  agencyId: string;
  fullName: string;
  fatherName: string;
  gender: GuardGender;
  phone: string;
  email: string;
  password: string;
  address: string;
  caste: string;
  height: string;
  aadhaarNumber: string;
  panNumber: string;
  employeeCode: string;
  post: string;
  joiningDate: string;
  salary: string;
  experience: string;
  education: string;
  assignedSiteId: string;
  guardType: "ex-serviceman" | "civilian";
  interestedCity: string;
  shiftFrom: string;
  shiftTo: string;
  characterCertificateUrl: string;
  policeVerificationUrl: string;
  profilePictureUrl: string;
  bankAccount: string;
  esiNumber: string;
  pfNumber: string;
  notes: string;
  /** Branch this guard belongs to. null/undefined = unassigned. */
  branchId?: string | null;
}

/**
 * Creates a Firebase Auth user for the guard using a secondary Firebase app
 * instance so the admin's/HR's current session is not disrupted.
 * Then writes the guard document to Firestore at the Auth UID.
 *
 * Password is stored ONLY in Firebase Auth — never in Firestore.
 * This mirrors createHrStaffAccount() from modules/HR Management/hrStaffAuth.ts.
 */
export async function createGuardAccount(
  db: Firestore,
  firebaseConfig: object,
  params: CreateGuardAccountParams
): Promise<Guard> {
  const { password, email, agencyId, ...rest } = params;

  // Use a secondary app so the signed-in admin/HR stays logged in
  const appName = `guard-creation-${Date.now()}`;
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

  const guardData = {
    id: uid,
    agencyId,
    email,
    ...rest,
    status: "active" as GuardStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, GUARDS_COLLECTION, uid), guardData);

  return guardData as unknown as Guard;
}
