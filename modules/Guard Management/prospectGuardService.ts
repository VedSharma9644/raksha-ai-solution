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
import {
  PROSPECT_GUARDS_COLLECTION,
  PROSPECT_GUARD_NOTES_SUBCOLLECTION,
} from "./prospectGuard";
import type {
  ProspectGuard,
  ProspectGuardNote,
  ProspectGuardStatus,
  ApplicationSource,
} from "./prospectGuard";

// ─── Create / Update params ───────────────────────────────────────────────────

export interface AddProspectGuardParams {
  agencyId: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: string;
  city: string;
  phone: string;
  alternatePhone: string;
  email: string;
  aadhaarNumber: string;
  panNumber: string;
  yearsOfExperience: number | null;
  previousEmployer: string;
  height: string;
  weight: string;
  physicalFitness: string;
  interviewDate: string | null;
  interviewerName: string;
  applicationSource: ApplicationSource | string;
  status: ProspectGuardStatus;
  followUpDate: string | null;
}

export interface UpdateProspectGuardParams {
  fullName?: string;
  dateOfBirth?: string | null;
  gender?: string;
  city?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  yearsOfExperience?: number | null;
  previousEmployer?: string;
  height?: string;
  weight?: string;
  physicalFitness?: string;
  interviewDate?: string | null;
  interviewerName?: string;
  applicationSource?: ApplicationSource | string;
  status?: ProspectGuardStatus;
  followUpDate?: string | null;
}

// ─── Prospect Guard CRUD ──────────────────────────────────────────────────────

export async function addProspectGuard(
  db: Firestore,
  params: AddProspectGuardParams
): Promise<ProspectGuard> {
  const data = {
    ...params,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, PROSPECT_GUARDS_COLLECTION), data);
  return { id: ref.id, ...data } as unknown as ProspectGuard;
}

export async function getProspectGuardById(
  db: Firestore,
  guardId: string
): Promise<ProspectGuard | null> {
  const ref = doc(db, PROSPECT_GUARDS_COLLECTION, guardId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ProspectGuard;
}

export async function listProspectGuardsByAgency(
  db: Firestore,
  agencyId: string,
  status?: ProspectGuardStatus
): Promise<ProspectGuard[]> {
  const constraints = [where("agencyId", "==", agencyId)];
  if (status) constraints.push(where("status", "==", status));
  const q = query(collection(db, PROSPECT_GUARDS_COLLECTION), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProspectGuard));
}

export async function updateProspectGuard(
  db: Firestore,
  guardId: string,
  updates: UpdateProspectGuardParams
): Promise<void> {
  const ref = doc(db, PROSPECT_GUARDS_COLLECTION, guardId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteProspectGuard(
  db: Firestore,
  guardId: string
): Promise<void> {
  const ref = doc(db, PROSPECT_GUARDS_COLLECTION, guardId);
  await deleteDoc(ref);
}

// ─── Notes CRUD ───────────────────────────────────────────────────────────────

export async function addProspectGuardNote(
  db: Firestore,
  guardId: string,
  authorName: string,
  content: string
): Promise<ProspectGuardNote> {
  const notesRef = collection(
    db,
    PROSPECT_GUARDS_COLLECTION,
    guardId,
    PROSPECT_GUARD_NOTES_SUBCOLLECTION
  );
  const data = { authorName, content, createdAt: serverTimestamp() };
  const ref = await addDoc(notesRef, data);
  return { id: ref.id, ...data } as unknown as ProspectGuardNote;
}

export async function listProspectGuardNotes(
  db: Firestore,
  guardId: string
): Promise<ProspectGuardNote[]> {
  const notesRef = collection(
    db,
    PROSPECT_GUARDS_COLLECTION,
    guardId,
    PROSPECT_GUARD_NOTES_SUBCOLLECTION
  );
  const q = query(notesRef);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProspectGuardNote));
}

export async function deleteProspectGuardNote(
  db: Firestore,
  guardId: string,
  noteId: string
): Promise<void> {
  const ref = doc(
    db,
    PROSPECT_GUARDS_COLLECTION,
    guardId,
    PROSPECT_GUARD_NOTES_SUBCOLLECTION,
    noteId
  );
  await deleteDoc(ref);
}
