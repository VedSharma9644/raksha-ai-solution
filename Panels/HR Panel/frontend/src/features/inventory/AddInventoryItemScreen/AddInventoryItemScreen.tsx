import type { InventoryItem } from "@raskha/inventory-management";
import { AppScreenLayout } from "../../../components/AppScreenLayout";
import { PageHeader } from "../../../components/PageHeader";
import { InventoryItemForm } from "../InventoryItemForm";
import type { BranchInventoryFormValues } from "../inventoryFormTypes";

export interface AddInventoryItemScreenProps {
  masterItems: InventoryItem[];
  isSubmitting?: boolean;
  onSubmit: (values: BranchInventoryFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export function AddInventoryItemScreen({
  masterItems,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: AddInventoryItemScreenProps) {
  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content">
        <PageHeader
          title="Set Branch Stock"
          subtitle="Allocate stock from the agency catalog to your branch."
          onBack={onCancel}
          backLabel="Back to inventory"
        />
        <InventoryItemForm
          mode="add"
          masterItems={masterItems}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </AppScreenLayout>
  );
}
