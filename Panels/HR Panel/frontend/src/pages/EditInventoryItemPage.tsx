import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { EditInventoryItemScreen } from "../features/inventory/EditInventoryItemScreen";
import { useInventoryList, useEditInventoryItem } from "../features/inventory/inventoryHooks";

export function EditInventoryItemPage() {
  const { itemId = "" } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const { rows, isLoading } = useInventoryList();
  const row = rows.find((r) => r.itemId === itemId) ?? null;

  const { saveItem, isSubmitting, error } = useEditInventoryItem(itemId);

  if (isLoading) {
    return <p style={{ padding: "2rem" }}>Loading…</p>;
  }

  if (!row) {
    return (
      <p role="alert" style={{ color: "red", padding: "2rem" }}>
        Item not found.
      </p>
    );
  }

  return (
    <>
      {error && (
        <p style={{ color: "red", padding: "1rem" }}>{error}</p>
      )}
      <EditInventoryItemScreen
        row={row}
        isSubmitting={isSubmitting}
        onSubmit={saveItem}
        onCancel={() => navigate(APP_ROUTES.manageInventory)}
      />
    </>
  );
}
