import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import {
  INVENTORY_COLLECTION,
  computeInventoryStatus,
  DEFAULT_INVENTORY_ITEMS,
} from "./inventoryItem";
import type { InventoryItem, InventoryStatus } from "./inventoryItem";

// ── Param types ──────────────────────────────────────────────────────────────

export interface AddInventoryItemParams {
  agencyId: string;
  name: string;
  category: string;
  unit: string;
  totalStock: number;
  thresholdStock: number;
  notes: string;
  /** Branch this item belongs to. null/undefined = agency-wide. */
  branchId?: string | null;
}

export interface UpdateInventoryItemParams {
  name?: string;
  category?: string;
  unit?: string;
  totalStock?: number;
  thresholdStock?: number;
  notes?: string;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function addInventoryItem(
  db: Firestore,
  params: AddInventoryItemParams,
): Promise<InventoryItem> {
  const availableStock = params.totalStock; // assignedStock = 0 on creation
  const status: InventoryStatus = computeInventoryStatus(
    availableStock,
    params.thresholdStock,
  );

  const data = {
    ...params,
    assignedStock: 0,
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, INVENTORY_COLLECTION), data);
  return { id: ref.id, ...data } as unknown as InventoryItem;
}

export async function getInventoryItemById(
  db: Firestore,
  itemId: string,
): Promise<InventoryItem | null> {
  const snapshot = await getDoc(doc(db, INVENTORY_COLLECTION, itemId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as InventoryItem;
}

export async function listInventoryItemsByAgency(
  db: Firestore,
  agencyId: string,
): Promise<InventoryItem[]> {
  const q = query(
    collection(db, INVENTORY_COLLECTION),
    where("agencyId", "==", agencyId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as InventoryItem,
  );
}

export async function updateInventoryItem(
  db: Firestore,
  itemId: string,
  updates: UpdateInventoryItemParams,
): Promise<void> {
  const current = await getInventoryItemById(db, itemId);
  const totalStock =
    updates.totalStock !== undefined
      ? updates.totalStock
      : (current?.totalStock ?? 0);
  const assignedStock = current?.assignedStock ?? 0;
  const thresholdStock =
    updates.thresholdStock !== undefined
      ? updates.thresholdStock
      : (current?.thresholdStock ?? 0);

  const availableStock = totalStock - assignedStock;
  const status = computeInventoryStatus(availableStock, thresholdStock);

  await updateDoc(doc(db, INVENTORY_COLLECTION, itemId), {
    ...updates,
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInventoryItem(
  db: Firestore,
  itemId: string,
): Promise<void> {
  await deleteDoc(doc(db, INVENTORY_COLLECTION, itemId));
}

/**
 * Atomically adjusts the assignedStock field and recomputes status.
 * delta > 0 = more assigned, delta < 0 = items returned to pool.
 * Called exclusively from guardInventoryAssignmentService.
 */
export async function adjustAssignedStock(
  db: Firestore,
  itemId: string,
  delta: number,
): Promise<void> {
  const current = await getInventoryItemById(db, itemId);
  if (!current) return;

  const newAssigned = Math.max(0, (current.assignedStock ?? 0) + delta);
  const availableStock = current.totalStock - newAssigned;
  const status = computeInventoryStatus(availableStock, current.thresholdStock);

  await updateDoc(doc(db, INVENTORY_COLLECTION, itemId), {
    assignedStock: newAssigned,
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Seeds all DEFAULT_INVENTORY_ITEMS for an agency in a single batch.
 */
export async function seedDefaultInventoryItems(
  db: Firestore,
  agencyId: string,
): Promise<void> {
  const batch = writeBatch(db);

  for (const item of DEFAULT_INVENTORY_ITEMS) {
    const ref = doc(collection(db, INVENTORY_COLLECTION));
    batch.set(ref, {
      agencyId,
      name: item.name,
      category: item.category,
      unit: item.unit,
      totalStock: 0,
      assignedStock: 0,
      thresholdStock: 5,
      notes: "",
      status: "out_of_stock" as InventoryStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}
