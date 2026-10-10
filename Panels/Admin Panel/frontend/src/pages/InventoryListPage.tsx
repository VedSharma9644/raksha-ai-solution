import { useNavigate } from "react-router-dom";
import { InventoryListScreen } from "../features/inventory";
import { useInventoryList } from "../features/inventory";
import { APP_ROUTES, editInventoryItemPath, inventoryBranchStockPath } from "../app/routePaths";

export function InventoryListPage() {
  const navigate = useNavigate();
  const { items, isLoading, isSeeding, error, seedDefaults } =
    useInventoryList();

  if (isLoading) {
    return (
      <div className="page-loading-state">
        <p>Loading inventory…</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="page-error-message">{error}</p>
      )}
      <InventoryListScreen
        items={items}
        isSeeding={isSeeding}
        onBack={() => navigate(APP_ROUTES.dashboard)}
        onAddItem={() => navigate(APP_ROUTES.addInventoryItem)}
        onSelectItem={(id) => navigate(editInventoryItemPath(id))}
        onViewBranchStock={(id) => navigate(inventoryBranchStockPath(id))}
        onSeedDefaults={seedDefaults}
      />
    </>
  );
}
