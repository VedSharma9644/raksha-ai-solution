import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { editInventoryItemPath } from "../app/routePaths";
import { InventoryScreen } from "../features/inventory";
import { useInventoryList } from "../features/inventory/inventoryHooks";
import type { BranchInventoryRow } from "../features/inventory/inventoryHooks";

export function InventoryPage() {
  const navigate = useNavigate();
  const { rows, isLoading, error } = useInventoryList();

  function handleSelectRow(row: BranchInventoryRow) {
    // Navigate to edit using the master itemId as the URL param
    navigate(editInventoryItemPath(row.itemId));
  }

  return (
    <>
      {error && (
        <p style={{ color: "red", padding: "1rem" }}>{error}</p>
      )}
      <InventoryScreen
        rows={rows}
        isLoading={isLoading}
        onBack={() => navigate(APP_ROUTES.dashboard)}
        onAddItem={() => navigate(APP_ROUTES.addInventoryItem)}
        onSelectRow={handleSelectRow}
      />
    </>
  );
}
