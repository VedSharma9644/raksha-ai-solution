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
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Assigns an inventory item to a guard.
 * Atomically: creates the assignment doc AND increments assignedStock on the
 * inventory item (writeBatch ensures both writes succeed or both fail).
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
    assignedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  batch.set(assignRef, data);

  await batch.commit();

  // 2. Adjust assignedStock on the inventory item (separate update with status recompute)
  await adjustAssignedStock(db, params.itemId, params.quantity);

  return { id: assignRef.id, ...data } as unknown as GuardInventoryAssignment;
}

/**
 * Updates the quantity on an existing assignment.
 * Adjusts the delta on inventoryItem.assignedStock accordingly.
 */
export async function updateGuardAssignment(
  db: Firestore,
  assignmentId: string,
  newQuantity: number,
): Promise<void> {
  const assignRef = doc(db, GUARD_INVENTORY_ASSIGNMENT_COLLECTION, assignmentId);
  const snapshot = await getDoc(assignRef);
  if (!snapshot.exists()) return;

  const current = snapshot.data() as GuardInventoryAssignment;
  const delta = newQuantity - current.quantity;

  // Update assignment quantity
  const batch = writeBatch(db);
  batch.update(assignRef, { quantity: newQuantity, updatedAt: serverTimestamp() });
  await batch.commit();

  // Adjust assignedStock by the delta
  if (delta !== 0) {
    await adjustAssignedStock(db, current.itemId, delta);
  }
}

/**
 * Removes a guard assignment and returns the stock to the available pool.
 */
export async function removeGuardAssignment(
  db: Firestore,
  assignmentId: string,
): Promise<void> {
  const assignRef = doc(db, GUARD_INVENTORY_ASSIGNMENT_COLLECTION, assignmentId);
  const snapshot = await getDoc(assignRef);
  if (!snapshot.exists()) return;

  const assignment = snapshot.data() as GuardInventoryAssignment;

  await deleteDoc(assignRef);
  await adjustAssignedStock(db, assignment.itemId, -assignment.quantity);
}

/** Fetch all assignments for a specific guard. */
export async function listAssignmentsByGuard(
  db: Firestore,
  guardId: string,
): Promise<GuardInventoryAssignment[]> {
  const q = query(
    collection(db, GUARD_INVENTORY_ASSIGNMENT_COLLECTION),
    where("guardId", "==", guardId),
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
