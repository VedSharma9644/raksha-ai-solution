import { useNavigate, useParams } from "react-router-dom";
import { EditInventoryItemScreen } from "../features/inventory";
import {
  useInventoryItemDetail,
  useEditInventoryItem,
} from "../features/inventory";
import { APP_ROUTES } from "../app/routePaths";

export function EditInventoryItemPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { item, isLoading, error: loadError } = useInventoryItemDetail(id);
  const { saveItem, deleteItem, isSubmitting, isDeleting, error: saveError } =
    useEditInventoryItem(id);

  if (isLoading) {
    return (
      <div className="page-loading-state">
        <p>Loading item…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-error-message">
        <p>{loadError || "Item not found."}</p>
      </div>
    );
  }

  return (
    <>
      {saveError && (
        <p className="page-error-message">{saveError}</p>
      )}
      <EditInventoryItemScreen
        item={item}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        onSubmit={saveItem}
        onDelete={deleteItem}
        onCancel={() => navigate(APP_ROUTES.inventoryList)}
      />
    </>
  );
}
