import type { Timestamp } from "firebase/firestore";

export type BranchStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface BranchStock {
  id: string;
  agencyId: string;
  branchId: string;

  /** References inventoryItems/{itemId} */
  itemId: string;
  /** Denormalized for fast display */
  itemName: string;
  category: string;
  unit: string;

  /** Total stock allocated to this branch (HR manages this) */
  allocatedStock: number;
  /** Sum of all guard assignments in this branch (auto-updated) */
  assignedStock: number;
  /** Low-stock warning threshold for this branch */
  thresholdStock: number;
  /** Computed: based on (allocatedStock - assignedStock) vs thresholdStock */
  status: BranchStockStatus;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const BRANCH_STOCK_COLLECTION = "branchStock";

export function computeBranchStockStatus(
  available: number,
  threshold: number,
): BranchStockStatus {
  if (available <= 0) return "out_of_stock";
  if (available <= threshold) return "low_stock";
  return "in_stock";
}
