import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import {
  GUARD_INVENTORY_ASSIGNMENT_COLLECTION,
} from "./guardInventoryAssignment";
import type { GuardInventoryAssignment } from "./guardInventoryAssignment";
import { adjustAssignedStock } from "./inventoryItemService";

// ── Param types ──────────────────────────────────────────────────────────────

export interface AssignItemToGuardParams {
  agencyId: string;
  guardId: string;
  itemId: string;
  itemName: string;
  category: string;
  unit: string;
  quantity: number;
  /** branchId of the guard — stored on the assignment for branch-level tracking */
  branchId?: string | null;
  /**
   * If provided, also updates branchStock.assignedStock for this branch's stock record.
   * Pass the BranchStock document ID.
   */
  branchStockId?: string | null;
  /** adjustBranchAssignedStock function — injected to avoid circular import */
  adjustBranchStock?: (db: Firestore, branchStockId: string, delta: number) => Promise<void>;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Assigns an inventory item to a guard.
 * Atomically: creates the assignment doc AND increments assignedStock on the
 * inventory item. Also updates branchStock.assignedStock if branchStockId provided.
 */
export async function assignItemToGuard(
  db: Firestore,
  params: AssignItemToGuardParams,
): Promise<GuardInventoryAssignment> {
  const batch = writeBatch(db);

  // 1. Create the assignment document
  const assignRef = doc(collection(db, GUARD_INVENTORY_ASSIGNMENT_COLLECTION));
  const data = {
    agencyId: params.agencyId,
    guardId: params.guardId,
    itemId: params.itemId,
    itemName: params.itemName,
    category: params.category,
    unit: params.unit,
    quantity: params.quantity,
    branchId: params.branchId ?? null,
    branchStockId: params.branchStockId ?? null,
    assignedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  batch.set(assignRef, data);

  await batch.commit();

  // 2. Adjust master item's assignedStock (admin total view)
  await adjustAssignedStock(db, params.itemId, params.quantity);

  // 3. Adjust branch stock if branchStockId provided
  if (params.branchStockId && params.adjustBranchStock) {
    await params.adjustBranchStock(db, params.branchStockId, params.quantity);
  }

  return { id: assignRef.id, ...data } as unknown as GuardInventoryAssignment;
}

/**
 * Updates the quantity on an existing assignment.
 * Adjusts both inventoryItem.assignedStock and branchStock.assignedStock.
 */
export async function updateGuardAssignment(
  db: Firestore,
  assignmentId: string,
  newQuantity: number,
  adjustBranchStock?: (db: Firestore, branchStockId: string, delta: number) => Promise<void>,
): Promise<void> {
  const assignRef = doc(db, GUARD_INVENTORY_ASSIGNMENT_COLLECTION, assignmentId);
  const snapshot = await getDoc(assignRef);
  if (!snapshot.exists()) return;

  const current = snapshot.data() as GuardInventoryAssignment;
  const delta = newQuantity - current.quantity;

  const batch = writeBatch(db);
  batch.update(assignRef, { quantity: newQuantity, updatedAt: serverTimestamp() });
  await batch.commit();

  if (delta !== 0) {
    // Update master item assigned stock
    await adjustAssignedStock(db, current.itemId, delta);
    // Update branch stock if applicable
    if (current.branchStockId && adjustBranchStock) {
      await adjustBranchStock(db, current.branchStockId, delta);
    }
  }
}

/**
 * Removes a guard assignment and returns the stock to the available pool.
 */
export async function removeGuardAssignment(
  db: Firestore,
  assignmentId: string,
  adjustBranchStock?: (db: Firestore, branchStockId: string, delta: number) => Promise<void>,
): Promise<void> {
  const assignRef = doc(db, GUARD_INVENTORY_ASSIGNMENT_COLLECTION, assignmentId);
  const snapshot = await getDoc(assignRef);
  if (!snapshot.exists()) return;

  const assignment = snapshot.data() as GuardInventoryAssignment;

  await deleteDoc(assignRef);
  await adjustAssignedStock(db, assignment.itemId, -assignment.quantity);

  if (assignment.branchStockId && adjustBranchStock) {
    await adjustBranchStock(db, assignment.branchStockId, -assignment.quantity);
  }
}

/** Fetch all assignments for a specific guard, scoped to the agency. */
export async function listAssignmentsByGuard(
  db: Firestore,
  guardId: string,
  agencyId: string,
): Promise<GuardInventoryAssignment[]> {
  const q = query(
    collection(db, GUARD_INVENTORY_ASSIGNMENT_COLLECTION),
    where("guardId", "==", guardId),
    where("agencyId", "==", agencyId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as GuardInventoryAssignment,
  );
}

/** Fetch all assignments for an agency (e.g. for audit/reporting). */
export async function listAssignmentsByAgency(
  db: Firestore,
  agencyId: string,
): Promise<GuardInventoryAssignment[]> {
  const q = query(
    collection(db, GUARD_INVENTORY_ASSIGNMENT_COLLECTION),
    where("agencyId", "==", agencyId),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as GuardInventoryAssignment,
  );
}
