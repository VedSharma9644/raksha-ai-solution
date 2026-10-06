import type { Timestamp } from "firebase/firestore";

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: string;
  agencyId: string;

  name: string;
  category: string;       // "Dress" | "Equipment" | custom
  unit: string;           // e.g. "pcs", "pairs"

  totalStock: number;
  assignedStock: number;  // sum of all guard assignments (default 0)
  thresholdStock: number; // low-stock warning if availableStock <= thresholdStock

  notes: string;
  status: InventoryStatus; // computed + stored on every write

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const INVENTORY_COLLECTION = "inventoryItems";

/**
 * Derives the stock status from available stock vs threshold.
 * availableStock = totalStock - assignedStock
 * - 0 or below  → out_of_stock
 * - 1–threshold → low_stock
 * - > threshold → in_stock
 */
export function computeInventoryStatus(
  availableStock: number,
  thresholdStock: number,
): InventoryStatus {
  if (availableStock <= 0) return "out_of_stock";
  if (availableStock <= thresholdStock) return "low_stock";
  return "in_stock";
}

/**
 * Default item definitions used to seed a new agency's inventory on
 * first use. All items start with totalStock = 0 and thresholdStock = 5.
 */
export const DEFAULT_INVENTORY_ITEMS: Array<{
  name: string;
  category: string;
  unit: string;
}> = [
  { name: "Shirt",          category: "Dress",     unit: "pcs"   },
  { name: "Pant",           category: "Dress",     unit: "pcs"   },
  { name: "Cap",            category: "Dress",     unit: "pcs"   },
  { name: "Logo",           category: "Dress",     unit: "pcs"   },
  { name: "Lanyard",        category: "Dress",     unit: "pcs"   },
  { name: "Shoes",          category: "Dress",     unit: "pairs" },
  { name: "Whistle",        category: "Dress",     unit: "pcs"   },
  { name: "Walkie-Talkie",  category: "Equipment", unit: "pcs"   },
  { name: "Torch",          category: "Equipment", unit: "pcs"   },
  { name: "Lathi",          category: "Equipment", unit: "pcs"   },
  { name: "Metal Detector", category: "Equipment", unit: "pcs"   },
  { name: "Register",       category: "Equipment", unit: "pcs"   },
];
