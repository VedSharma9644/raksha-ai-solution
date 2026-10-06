export interface InventoryItemFormValues {
  name: string;
  category: string;
  unit: string;
  totalStock: string;     // stored as string in form, parsed to number on save
  thresholdStock: string; // same
  notes: string;
}

export const EMPTY_INVENTORY_ITEM_FORM: InventoryItemFormValues = {
  name: "",
  category: "",
  unit: "pcs",
  totalStock: "0",
  thresholdStock: "5",
  notes: "",
};

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
