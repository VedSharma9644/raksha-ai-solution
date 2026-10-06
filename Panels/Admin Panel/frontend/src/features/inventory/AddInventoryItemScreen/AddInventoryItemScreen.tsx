import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { InventoryItemForm } from "../InventoryItemForm";
import type { InventoryItemFormValues } from "../inventoryFormTypes";
import "./AddInventoryItemScreen.css";

export interface AddInventoryItemScreenProps {
  isSubmitting?: boolean;
  onSubmit: (values: InventoryItemFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function AddInventoryItemScreen({
  isSubmitting = false,
  onSubmit,
  onCancel,
}: AddInventoryItemScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content add-inventory-item-screen">
        <PageHeader
          title="Add Inventory Item"
          subtitle="Create a new item to track in your agency's inventory."
          onBack={onCancel}
          backLabel="Back to inventory"
        />
        <InventoryItemForm
          mode="add"
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </AppScreenLayout>
  );
}
