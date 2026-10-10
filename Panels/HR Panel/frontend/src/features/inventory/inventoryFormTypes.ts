// HR Panel inventory form is for managing branch stock (allocatedStock per branch)
// Admin creates master catalog items; HR sets how much of each item is allocated
// to their specific branch.

export interface BranchInventoryFormValues {
  itemId: string;       // ID of the master InventoryItem
  itemName: string;     // Denormalized for display / storage
  category: string;
  unit: string;
  allocatedStock: string;   // branch's allocated stock (string in form)
  thresholdStock: string;
  notes: string;
}

export const EMPTY_BRANCH_INVENTORY_FORM: BranchInventoryFormValues = {
  itemId: "",
  itemName: "",
  category: "",
  unit: "pcs",
  allocatedStock: "0",
  thresholdStock: "5",
  notes: "",
};

// Keep old name alias so existing imports don't break immediately
export type InventoryItemFormValues = BranchInventoryFormValues;
export const EMPTY_INVENTORY_ITEM_FORM = EMPTY_BRANCH_INVENTORY_FORM;

export const CATEGORY_OPTIONS = [
  { value: "Dress",     label: "Dress" },
  { value: "Equipment", label: "Equipment" },
  { value: "Other",     label: "Other" },
];

export const UNIT_OPTIONS = [
  { value: "pcs",   label: "Pieces (pcs)" },
  { value: "pairs", label: "Pairs" },
  { value: "sets",  label: "Sets" },
  { value: "nos",   label: "Numbers (nos)" },
];
