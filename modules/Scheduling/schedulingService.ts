import {
  Firestore,
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
import type { GuardShiftAssignment, DayOfWeek } from "./shiftAssignment";
import { SHIFT_ASSIGNMENTS_COLLECTION } from "./shiftAssignment";

// ─── Params ────────────────────────────────────────────────────────────────

export interface SaveGuardShiftAssignmentParams {
  agencyId: string;
  siteId: string;
  guardId: string;
  guardName: string;
  /** Gender of the guard — stored for gender-quota enforcement */
  guardGender?: "male" | "female" | "other" | null;
  shiftId: string;
  shiftLabel: string;
  shiftStartTime: string;
  shiftEndTime: string;
  recurringDays: DayOfWeek[];
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface UpdateGuardShiftAssignmentParams {
  shiftId?: string;
  shiftLabel?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  recurringDays?: DayOfWeek[];
  effectiveFrom?: string;
  effectiveTo?: string | null;
}

// ─── Service functions ──────────────────────────────────────────────────────

export async function createGuardShiftAssignment(
  db: Firestore,
  params: SaveGuardShiftAssignmentParams
): Promise<GuardShiftAssignment> {
  const data = {
    ...params,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, SHIFT_ASSIGNMENTS_COLLECTION), data);
  return { id: ref.id, ...data } as unknown as GuardShiftAssignment;
}

export async function updateGuardShiftAssignment(
  db: Firestore,
  assignmentId: string,
  updates: UpdateGuardShiftAssignmentParams
): Promise<void> {
  const ref = doc(db, SHIFT_ASSIGNMENTS_COLLECTION, assignmentId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteGuardShiftAssignment(
  db: Firestore,
  assignmentId: string
): Promise<void> {
  await deleteDoc(doc(db, SHIFT_ASSIGNMENTS_COLLECTION, assignmentId));
}

export async function listShiftAssignmentsBySite(
  db: Firestore,
  siteId: string,
  agencyId: string
): Promise<GuardShiftAssignment[]> {
  const q = query(
    collection(db, SHIFT_ASSIGNMENTS_COLLECTION),
    where("siteId", "==", siteId),
    where("agencyId", "==", agencyId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GuardShiftAssignment));
}

export async function listShiftAssignmentsByGuard(
  db: Firestore,
  guardId: string,
  agencyId: string
): Promise<GuardShiftAssignment[]> {
  const q = query(
    collection(db, SHIFT_ASSIGNMENTS_COLLECTION),
    where("guardId", "==", guardId),
    where("agencyId", "==", agencyId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GuardShiftAssignment));
}

export async function getShiftAssignmentById(
  db: Firestore,
  assignmentId: string
): Promise<GuardShiftAssignment | null> {
  const snap = await getDoc(doc(db, SHIFT_ASSIGNMENTS_COLLECTION, assignmentId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as GuardShiftAssignment;
}
