import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { GUARDS_COLLECTION } from "./guard";
import type { Guard, GuardStatus } from "./guard";

export interface AddGuardParams {
  agencyId: string;
  fullName: string;
  fatherName: string;
  phone: string;
  email: string;
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
  pfNumber: string;
  notes: string;
}

export interface UpdateGuardParams {
  fullName?: string;
  fatherName?: string;
  phone?: string;
  email?: string;
  address?: string;
  caste?: string;
  height?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  employeeCode?: string;
  post?: string;
  joiningDate?: string;
  salary?: string;
  experience?: string;
  education?: string;
  assignedSiteId?: string;
  guardType?: "ex-serviceman" | "civilian";
  interestedCity?: string;
  shiftFrom?: string;
  shiftTo?: string;
  characterCertificateUrl?: string;
  policeVerificationUrl?: string;
  profilePictureUrl?: string;
  bankAccount?: string;
  esiNumber?: string;
  pfNumber?: string;
  notes?: string;
  status?: GuardStatus;
}

export async function addGuard(
  db: Firestore,
  params: AddGuardParams
): Promise<Guard> {
  const guardData = {
    ...params,
    status: "active" as GuardStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, GUARDS_COLLECTION), guardData);

  return {
    id: ref.id,
    ...guardData,
  } as unknown as Guard;
}

export async function getGuardById(
  db: Firestore,
  guardId: string
): Promise<Guard | null> {
  const ref = doc(db, GUARDS_COLLECTION, guardId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Guard;
}

export async function listGuardsByAgency(
  db: Firestore,
  agencyId: string
): Promise<Guard[]> {
  const q = query(
    collection(db, GUARDS_COLLECTION),
    where("agencyId", "==", agencyId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Guard));
}

export async function updateGuard(
  db: Firestore,
  guardId: string,
  updates: UpdateGuardParams
): Promise<void> {
  const ref = doc(db, GUARDS_COLLECTION, guardId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGuard(
  db: Firestore,
  guardId: string
): Promise<void> {
  const ref = doc(db, GUARDS_COLLECTION, guardId);
  await deleteDoc(ref);
}
