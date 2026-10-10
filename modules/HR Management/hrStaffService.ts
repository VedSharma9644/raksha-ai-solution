import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { HR_STAFF_COLLECTION } from "./hrStaff";
import type { HrStaff, HrStaffStatus } from "./hrStaff";

export interface UpdateHrStaffParams {
  fullName?: string;
  employeeCode?: string;
  phone?: string;
  email?: string;
  notes?: string;
  status?: HrStaffStatus;
  /** Branch IDs this HR staff member is allowed to access. */
  assignedBranchIds?: string[];
}

export async function getHrStaffById(
  db: Firestore,
  hrStaffId: string
): Promise<HrStaff | null> {
  const ref = doc(db, HR_STAFF_COLLECTION, hrStaffId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as HrStaff;
}

export async function listHrStaffByAgency(
  db: Firestore,
  agencyId: string
): Promise<HrStaff[]> {
  const q = query(
    collection(db, HR_STAFF_COLLECTION),
    where("agencyId", "==", agencyId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as HrStaff));
}

export async function updateHrStaff(
  db: Firestore,
  hrStaffId: string,
  updates: UpdateHrStaffParams
): Promise<void> {
  const ref = doc(db, HR_STAFF_COLLECTION, hrStaffId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteHrStaff(
  db: Firestore,
  hrStaffId: string
): Promise<void> {
  const ref = doc(db, HR_STAFF_COLLECTION, hrStaffId);
  await deleteDoc(ref);
}
