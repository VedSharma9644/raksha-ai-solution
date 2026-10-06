import type { InventoryItem } from "@raskha/inventory-management";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { Button } from "../../../components/Button";
import { PageHeader } from "../../../components/PageHeader";
import { InventoryItemForm } from "../InventoryItemForm";
import type { InventoryItemFormValues } from "../inventoryFormTypes";
import "./EditInventoryItemScreen.css";

export interface EditInventoryItemScreenProps {
  item: InventoryItem;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onSubmit: (values: InventoryItemFormValues) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onCancel: () => void;
}

export function EditInventoryItemScreen({
  item,
  isSubmitting = false,
  isDeleting = false,
  onSubmit,
  onDelete,
  onCancel,
}: EditInventoryItemScreenProps) {
  const initialValues: InventoryItemFormValues = {
    name: item.name,
    category: item.category,
    unit: item.unit,
    totalStock: String(item.totalStock),
    thresholdStock: String(item.thresholdStock),
    notes: item.notes ?? "",
  };

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content edit-inventory-item-screen">
        <PageHeader
          title={`Edit — ${item.name}`}
          subtitle={`Category: ${item.category} · Unit: ${item.unit}`}
          onBack={onCancel}
          backLabel="Back to inventory"
          actions={
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
            >
              {isDeleting ? "Deleting…" : "Delete Item"}
            </Button>
          }
        />
        <InventoryItemForm
          mode="edit"
          initialValues={initialValues}
          isSubmitting={isSubmitting || isDeleting}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </AppScreenLayout>
  );
}
