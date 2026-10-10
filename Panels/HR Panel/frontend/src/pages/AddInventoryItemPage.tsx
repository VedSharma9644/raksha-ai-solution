import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddInventoryItemScreen } from "../features/inventory/AddInventoryItemScreen";
import { useAddInventoryItem, useInventoryList } from "../features/inventory/inventoryHooks";

export function AddInventoryItemPage() {
  const navigate = useNavigate();
  const { saveBranchStock, isSubmitting, error } = useAddInventoryItem();
  const { masterItems, isLoading } = useInventoryList();

  return (
    <>
      {error && (
        <p style={{ color: "red", padding: "1rem" }}>{error}</p>
      )}
      <AddInventoryItemScreen
        masterItems={masterItems}
        isSubmitting={isSubmitting || isLoading}
        onSubmit={saveBranchStock}
        onCancel={() => navigate(APP_ROUTES.manageInventory)}
      />
    </>
  );
}
