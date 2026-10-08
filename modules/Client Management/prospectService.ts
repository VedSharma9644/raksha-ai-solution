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
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  PROSPECT_CLIENTS_COLLECTION,
  PROSPECT_NOTES_SUBCOLLECTION,
} from "./prospectClient";
import type {
  ProspectClient,
  ProspectNote,
  ProspectStatus,
  LeadSource,
} from "./prospectClient";

// ─── Create / Update params ───────────────────────────────────────────────────

export interface AddProspectParams {
  agencyId: string;
  orgName: string;
  city: string;
  expectedSiteType: string;
  expectedGuardCount: number | null;
  expectedMonthlyValue: string;
  leadSource: LeadSource | string;
  contactName: string;
  contactDesignation: string;
  primaryPhone: string;
  alternatePhone: string;
  email: string;
  status: ProspectStatus;
  followUpDate: string | null;
}

export interface UpdateProspectParams {
  orgName?: string;
  city?: string;
  expectedSiteType?: string;
  expectedGuardCount?: number | null;
  expectedMonthlyValue?: string;
  leadSource?: LeadSource | string;
  contactName?: string;
  contactDesignation?: string;
  primaryPhone?: string;
  alternatePhone?: string;
  email?: string;
  status?: ProspectStatus;
  followUpDate?: string | null;
}

// ─── Prospect CRUD ────────────────────────────────────────────────────────────

export async function addProspect(
  db: Firestore,
  params: AddProspectParams
): Promise<ProspectClient> {
  const data = {
    ...params,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, PROSPECT_CLIENTS_COLLECTION), data);
  return { id: ref.id, ...data } as unknown as ProspectClient;
}

export async function getProspectById(
  db: Firestore,
  prospectId: string
): Promise<ProspectClient | null> {
  const ref = doc(db, PROSPECT_CLIENTS_COLLECTION, prospectId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as ProspectClient;
}

export async function listProspectsByAgency(
  db: Firestore,
  agencyId: string,
  status?: ProspectStatus
): Promise<ProspectClient[]> {
  const constraints = [where("agencyId", "==", agencyId)];
  if (status) constraints.push(where("status", "==", status));
  const q = query(collection(db, PROSPECT_CLIENTS_COLLECTION), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProspectClient));
}

export async function updateProspect(
  db: Firestore,
  prospectId: string,
  updates: UpdateProspectParams
): Promise<void> {
  const ref = doc(db, PROSPECT_CLIENTS_COLLECTION, prospectId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteProspect(
  db: Firestore,
  prospectId: string
): Promise<void> {
  const ref = doc(db, PROSPECT_CLIENTS_COLLECTION, prospectId);
  await deleteDoc(ref);
}

// ─── Notes CRUD ───────────────────────────────────────────────────────────────

export async function addProspectNote(
  db: Firestore,
  prospectId: string,
  authorName: string,
  content: string
): Promise<ProspectNote> {
  const notesRef = collection(
    db,
    PROSPECT_CLIENTS_COLLECTION,
    prospectId,
    PROSPECT_NOTES_SUBCOLLECTION
  );
  const data = { authorName, content, createdAt: serverTimestamp() };
  const ref = await addDoc(notesRef, data);
  return { id: ref.id, ...data } as unknown as ProspectNote;
}

export async function listProspectNotes(
  db: Firestore,
  prospectId: string
): Promise<ProspectNote[]> {
  const notesRef = collection(
    db,
    PROSPECT_CLIENTS_COLLECTION,
    prospectId,
    PROSPECT_NOTES_SUBCOLLECTION
  );
  const q = query(notesRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProspectNote));
}

export async function deleteProspectNote(
  db: Firestore,
  prospectId: string,
  noteId: string
): Promise<void> {
  const ref = doc(
    db,
    PROSPECT_CLIENTS_COLLECTION,
    prospectId,
    PROSPECT_NOTES_SUBCOLLECTION,
    noteId
  );
  await deleteDoc(ref);
}
