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
import { BRANCHES_COLLECTION } from "./branch";
import type { Branch, BranchStatus } from "./branch";

export interface AddBranchParams {
  agencyId: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  managerName?: string;
}

export interface UpdateBranchParams {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  managerName?: string;
  status?: BranchStatus;
}

export async function addBranch(
  db: Firestore,
  params: AddBranchParams
): Promise<Branch> {
  const data = {
    ...params,
    status: "active" as BranchStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, BRANCHES_COLLECTION), data);
  return { id: ref.id, ...data } as unknown as Branch;
}

export async function getBranchById(
  db: Firestore,
  branchId: string
): Promise<Branch | null> {
  const ref = doc(db, BRANCHES_COLLECTION, branchId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Branch;
}

export async function listBranchesByAgency(
  db: Firestore,
  agencyId: string
): Promise<Branch[]> {
  const q = query(
    collection(db, BRANCHES_COLLECTION),
    where("agencyId", "==", agencyId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Branch));
}

/**
 * Fetch specific branches by their IDs — used by the HR Panel
 * to load only the branches an HR staff member is assigned to.
 */
export async function listBranchesByIds(
  db: Firestore,
  branchIds: string[]
): Promise<Branch[]> {
  if (branchIds.length === 0) return [];
  const results = await Promise.all(
    branchIds.map((id) => getBranchById(db, id))
  );
  return results.filter((b): b is Branch => b !== null);
}

export async function updateBranch(
  db: Firestore,
  branchId: string,
  updates: UpdateBranchParams
): Promise<void> {
  const ref = doc(db, BRANCHES_COLLECTION, branchId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

export async function deleteBranch(
  db: Firestore,
  branchId: string
): Promise<void> {
  const ref = doc(db, BRANCHES_COLLECTION, branchId);
  await deleteDoc(ref);
}
