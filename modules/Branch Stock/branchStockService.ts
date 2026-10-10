import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import {
  BRANCH_STOCK_COLLECTION,
  computeBranchStockStatus,
} from "./branchStock";
import type { BranchStock, BranchStockStatus } from "./branchStock";

// ── Param types ──────────────────────────────────────────────────────────────

export interface UpsertBranchStockParams {
  agencyId: string;
  branchId: string;
  itemId: string;
  itemName: string;
  category: string;
  unit: string;
  allocatedStock: number;
  thresholdStock: number;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Create or update the BranchStock record for a {branchId, itemId} pair.
 * If a record already exists it is updated; otherwise a new one is created.
 */
export async function upsertBranchStock(
  db: Firestore,
  params: UpsertBranchStockParams,
): Promise<BranchStock> {
  const existing = await getBranchStockByBranchAndItem(
    db,
    params.agencyId,
    params.branchId,
    params.itemId,
  );

  const available = params.allocatedStock - (existing?.assignedStock ?? 0);
  const status = computeBranchStockStatus(available, params.thresholdStock);

  if (existing) {
    await updateDoc(doc(db, BRANCH_STOCK_COLLECTION, existing.id), {
      allocatedStock: params.allocatedStock,
      thresholdStock: params.thresholdStock,
      itemName: params.itemName,
      status,
      updatedAt: serverTimestamp(),
    });
    return { ...existing, allocatedStock: params.allocatedStock, thresholdStock: params.thresholdStock, status };
  }

  const data = {
    agencyId: params.agencyId,
    branchId: params.branchId,
    itemId: params.itemId,
    itemName: params.itemName,
    category: params.category,
    unit: params.unit,
    allocatedStock: params.allocatedStock,
    assignedStock: 0,
    thresholdStock: params.thresholdStock,
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, BRANCH_STOCK_COLLECTION), data);
  return { id: ref.id, ...data } as unknown as BranchStock;
}

export async function getBranchStockById(
  db: Firestore,
  id: string,
): Promise<BranchStock | null> {
  const snap = await getDoc(doc(db, BRANCH_STOCK_COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as BranchStock;
}

export async function getBranchStockByBranchAndItem(
  db: Firestore,
  agencyId: string,
  branchId: string,
  itemId: string,
): Promise<BranchStock | null> {
  const q = query(
    collection(db, BRANCH_STOCK_COLLECTION),
    where("agencyId", "==", agencyId),
    where("branchId", "==", branchId),
    where("itemId", "==", itemId),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as BranchStock;
}

/** All branch stock records for a single branch — used by HR Panel. */
export async function listBranchStockByBranch(
  db: Firestore,
  agencyId: string,
  branchId: string,
): Promise<BranchStock[]> {
  const q = query(
    collection(db, BRANCH_STOCK_COLLECTION),
    where("agencyId", "==", agencyId),
    where("branchId", "==", branchId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BranchStock);
}

/** All branch stock records for a single item across all branches — used by Admin. */
export async function listBranchStockByItem(
  db: Firestore,
  agencyId: string,
  itemId: string,
): Promise<BranchStock[]> {
  const q = query(
    collection(db, BRANCH_STOCK_COLLECTION),
    where("agencyId", "==", agencyId),
    where("itemId", "==", itemId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BranchStock);
}

/** All branch stock records across all branches — used by Admin overview. */
export async function listBranchStockByAgency(
  db: Firestore,
  agencyId: string,
): Promise<BranchStock[]> {
  const q = query(
    collection(db, BRANCH_STOCK_COLLECTION),
    where("agencyId", "==", agencyId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as BranchStock);
}

/**
 * Adjusts assignedStock when a guard assignment is created, updated, or removed.
 * delta > 0 = items assigned to guard; delta < 0 = items returned.
 */
export async function adjustBranchAssignedStock(
  db: Firestore,
  branchStockId: string,
  delta: number,
): Promise<void> {
  const current = await getBranchStockById(db, branchStockId);
  if (!current) return;

  const newAssigned = Math.max(0, (current.assignedStock ?? 0) + delta);
  const available = current.allocatedStock - newAssigned;
  const status: BranchStockStatus = computeBranchStockStatus(available, current.thresholdStock);

  await updateDoc(doc(db, BRANCH_STOCK_COLLECTION, branchStockId), {
    assignedStock: newAssigned,
    status,
    updatedAt: serverTimestamp(),
  });
}
