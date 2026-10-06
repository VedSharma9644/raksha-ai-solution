// ── Inventory Item ──────────────────────────────────────────────────────────
export type { InventoryItem, InventoryStatus } from "./inventoryItem";
export {
  INVENTORY_COLLECTION,
  computeInventoryStatus,
  DEFAULT_INVENTORY_ITEMS,
} from "./inventoryItem";

export type {
  AddInventoryItemParams,
  UpdateInventoryItemParams,
} from "./inventoryItemService";
export {
  addInventoryItem,
  getInventoryItemById,
  listInventoryItemsByAgency,
  updateInventoryItem,
  deleteInventoryItem,
  adjustAssignedStock,
  seedDefaultInventoryItems,
} from "./inventoryItemService";

// ── Guard Inventory Assignments ──────────────────────────────────────────────
export type { GuardInventoryAssignment } from "./guardInventoryAssignment";
export { GUARD_INVENTORY_ASSIGNMENT_COLLECTION } from "./guardInventoryAssignment";

export type { AssignItemToGuardParams } from "./guardInventoryAssignmentService";
export {
  assignItemToGuard,
  updateGuardAssignment,
  removeGuardAssignment,
  listAssignmentsByGuard,
  listAssignmentsByAgency,
} from "./guardInventoryAssignmentService";
