import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { InventoryItemForm } from "../InventoryItemForm";
import type { BranchInventoryRow } from "../inventoryHooks";
import type { BranchInventoryFormValues } from "../inventoryFormTypes";

export interface EditInventoryItemScreenProps {
  row: BranchInventoryRow;
  isSubmitting?: boolean;
  onSubmit: (values: BranchInventoryFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function EditInventoryItemScreen({
  row,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: EditInventoryItemScreenProps) {
  const initialValues: BranchInventoryFormValues = {
    itemId:         row.itemId,
    itemName:       row.name,
    category:       row.category,
    unit:           row.unit,
    allocatedStock: String(row.allocatedStock),
    thresholdStock: String(row.thresholdStock),
    notes:          "",
  };

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content">
        <PageHeader
          title={`Edit Stock — ${row.name}`}
          subtitle={`Category: ${row.category} · Unit: ${row.unit}`}
          onBack={onCancel}
          backLabel="Back to inventory"
        />
        <InventoryItemForm
          mode="edit"
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </AppScreenLayout>
  );
}
