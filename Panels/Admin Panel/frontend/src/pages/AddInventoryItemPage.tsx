import { useNavigate } from "react-router-dom";
import { AddInventoryItemScreen } from "../features/inventory";
import { useAddInventoryItem } from "../features/inventory";
import { APP_ROUTES } from "../app/routePaths";

export function AddInventoryItemPage() {
  const navigate = useNavigate();
  const { saveItem, isSubmitting, error } = useAddInventoryItem();

  return (
    <>
      {error && (
        <p className="page-error-message">{error}</p>
      )}
      <AddInventoryItemScreen
        isSubmitting={isSubmitting}
        onSubmit={saveItem}
        onCancel={() => navigate(APP_ROUTES.inventoryList)}
      />
    </>
  );
}
