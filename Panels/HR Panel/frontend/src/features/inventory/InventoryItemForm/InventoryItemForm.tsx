import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { InventoryItem } from "@raskha/inventory-management";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { SelectField } from "../../../components/SelectField";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import type { BranchInventoryFormValues } from "../inventoryFormTypes";
import { EMPTY_BRANCH_INVENTORY_FORM } from "../inventoryFormTypes";

// InventoryItemFormValues is an alias for BranchInventoryFormValues
export type { BranchInventoryFormValues as InventoryItemFormValues };

export interface InventoryItemFormProps {
  mode: "add" | "edit";
  masterItems?: InventoryItem[];     // used in add mode to pick from catalog
  initialValues?: Partial<BranchInventoryFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: BranchInventoryFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function InventoryItemForm({
  mode,
  masterItems = [],
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: InventoryItemFormProps) {
  const [values, setValues] = useState<BranchInventoryFormValues>({
    ...EMPTY_BRANCH_INVENTORY_FORM,
    ...initialValues,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof BranchInventoryFormValues, string>>
  >({});

  // When itemId changes (add mode), auto-fill name/category/unit from master
  useEffect(() => {
    if (mode === "add" && values.itemId) {
      const found = masterItems.find((m) => m.id === values.itemId);
      if (found) {
        setValues((prev) => ({
          ...prev,
          itemName: found.name,
          category: found.category,
          unit: found.unit,
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.itemId, mode]);

  function updateField<K extends keyof BranchInventoryFormValues>(
    field: K,
    value: BranchInventoryFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof BranchInventoryFormValues, string>> = {};

    if (mode === "add" && !values.itemId) next.itemId = "Select an inventory item.";

    const allocated = Number(values.allocatedStock);
    if (isNaN(allocated) || allocated < 0)
      next.allocatedStock = "Enter a valid allocated stock (0 or more).";

    const threshold = Number(values.thresholdStock);
    if (isNaN(threshold) || threshold < 0)
      next.thresholdStock = "Enter a valid threshold (0 or more).";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ ...values });
  }

  const selectedMaster = masterItems.find((m) => m.id === values.itemId);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormPanel>
        {/* ── Item Selection (add mode) / Display (edit mode) ── */}
        <p className="form-panel__section-label">Item</p>
        <div className="form-panel__grid">
          {mode === "add" ? (
            <SelectField
              label="Select item from catalog"
              name="itemId"
              value={values.itemId}
              onChange={(e) => updateField("itemId", e.target.value)}
              options={masterItems.map((m) => ({
                value: m.id,
                label: `${m.name} (${m.category})`,
              }))}
              placeholder="Choose an item…"
              errorMessage={errors.itemId}
              required
              disabled={isSubmitting}
            />
          ) : (
            <TextField
              label="Item"
              name="itemName"
              value={values.itemName}
              onChange={() => {/* read-only */}}
              disabled
            />
          )}
          {(mode === "edit" || selectedMaster) && (
            <>
              <TextField
                label="Category"
                name="category"
                value={values.category || selectedMaster?.category || ""}
                onChange={() => {/* read-only */}}
                disabled
              />
              <TextField
                label="Unit"
                name="unit"
                value={values.unit || selectedMaster?.unit || ""}
                onChange={() => {/* read-only */}}
                disabled
              />
            </>
          )}
        </div>

        {/* ── Stock ── */}
        <p className="form-panel__section-label">Branch Stock</p>
        <div className="form-panel__grid">
          <TextField
            label="Allocated stock for this branch"
            name="allocatedStock"
            type="number"
            value={values.allocatedStock}
            onChange={(e) => updateField("allocatedStock", e.target.value)}
            errorMessage={errors.allocatedStock}
            required
            disabled={isSubmitting}
            placeholder="0"
          />
          <TextField
            label="Low-stock threshold"
            name="thresholdStock"
            type="number"
            value={values.thresholdStock}
            onChange={(e) => updateField("thresholdStock", e.target.value)}
            errorMessage={errors.thresholdStock}
            required
            disabled={isSubmitting}
            placeholder="5"
          />
        </div>

        {/* ── Notes ── */}
        <TextAreaField
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Supplier, storage location, or any other notes"
          disabled={isSubmitting}
        />

        <div className="form-panel__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving…"
              : mode === "add"
                ? "Set Branch Stock"
                : "Save Changes"}
          </Button>
        </div>
      </FormPanel>
    </form>
  );
}
