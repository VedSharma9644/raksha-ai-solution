export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: InventoryStatus;
}

/**
 * Inventory shown to HR is operational stock only.
 * Purchase cost, vendor invoices, and other financial fields are excluded.
 */
export const SAMPLE_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Uniform shirt (Large)",
    category: "Uniforms",
    quantity: 8,
    unit: "pcs",
    status: "low_stock",
  },
  {
    id: "inv-2",
    name: "Safety shoes",
    category: "Footwear",
    quantity: 24,
    unit: "pairs",
    status: "in_stock",
  },
  {
    id: "inv-3",
    name: "Torch / flashlight",
    category: "Equipment",
    quantity: 0,
    unit: "pcs",
    status: "out_of_stock",
  },
  {
    id: "inv-4",
    name: "ID card holders",
    category: "Accessories",
    quantity: 40,
    unit: "pcs",
    status: "in_stock",
  },
];
