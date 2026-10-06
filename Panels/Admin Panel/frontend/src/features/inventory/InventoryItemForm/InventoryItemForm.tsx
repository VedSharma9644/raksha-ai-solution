import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "../../../components/Button";
import { FormPanel } from "../../../components/FormPanel";
import { SelectField } from "../../../components/SelectField";
import { TextAreaField } from "../../../components/TextAreaField";
import { TextField } from "../../../components/TextField";
import type { InventoryItemFormValues } from "../inventoryFormTypes";
import { EMPTY_INVENTORY_ITEM_FORM, CATEGORY_OPTIONS, UNIT_OPTIONS } from "../inventoryFormTypes";
import "./InventoryItemForm.css";

export interface InventoryItemFormProps {
  mode: "add" | "edit";
  initialValues?: Partial<InventoryItemFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: InventoryItemFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function InventoryItemForm({
  mode,
  initialValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: InventoryItemFormProps) {
  const [values, setValues] = useState<InventoryItemFormValues>({
    ...EMPTY_INVENTORY_ITEM_FORM,
    ...initialValues,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof InventoryItemFormValues, string>>
  >({});

  function updateField<K extends keyof InventoryItemFormValues>(
    field: K,
    value: InventoryItemFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof InventoryItemFormValues, string>> = {};

    if (!values.name.trim()) next.name = "Enter the item name.";
    if (!values.category) next.category = "Select a category.";
    if (!values.unit.trim()) next.unit = "Enter a unit (e.g. pcs, pairs).";

    const total = Number(values.totalStock);
    if (isNaN(total) || total < 0)
      next.totalStock = "Enter a valid total stock (0 or more).";

    const threshold = Number(values.thresholdStock);
    if (isNaN(threshold) || threshold < 0)
      next.thresholdStock = "Enter a valid threshold (0 or more).";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...values,
      name: values.name.trim(),
      unit: values.unit.trim(),
      notes: values.notes.trim(),
    });
  }

  return (
    <form className="inventory-item-form" onSubmit={handleSubmit} noValidate>
      <FormPanel>
        {/* ── Basic info ── */}
        <p className="inventory-item-form__section-label">Item Details</p>
        <div className="form-panel__grid">
          <TextField
            label="Item name"
            name="name"
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            errorMessage={errors.name}
            required
            disabled={isSubmitting}
            placeholder="e.g. Shirt, Torch"
          />
          <SelectField
            label="Category"
            name="category"
            value={values.category}
            onChange={(e) => updateField("category", e.target.value)}
            options={CATEGORY_OPTIONS}
            placeholder="Select category"
            errorMessage={errors.category}
            required
            disabled={isSubmitting}
          />
          <SelectField
            label="Unit"
            name="unit"
            value={values.unit}
            onChange={(e) => updateField("unit", e.target.value)}
            options={UNIT_OPTIONS}
            errorMessage={errors.unit}
            required
            disabled={isSubmitting}
          />
        </div>

        {/* ── Stock ── */}
        <p className="inventory-item-form__section-label">Stock</p>
        <div className="form-panel__grid">
          <TextField
            label="Total stock"
            name="totalStock"
            type="number"
            value={values.totalStock}
            onChange={(e) => updateField("totalStock", e.target.value)}
            errorMessage={errors.totalStock}
            required
            disabled={isSubmitting}
            placeholder="0"
          />
          <div className="inventory-item-form__threshold-wrap">
            <TextField
              label="Threshold stock"
              name="thresholdStock"
              type="number"
              value={values.thresholdStock}
              onChange={(e) => updateField("thresholdStock", e.target.value)}
              errorMessage={errors.thresholdStock}
              required
              disabled={isSubmitting}
              placeholder="5"
            />
            <p className="inventory-item-form__threshold-hint">
              Items at or below this quantity will show a Low Stock warning.
            </p>
          </div>
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
                ? "Add Item"
                : "Save Changes"}
          </Button>
        </div>
      </FormPanel>
    </form>
  );
}
