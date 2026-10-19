import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { InventoryScreen } from "../features/inventory";
import { useInventoryList } from "../features/inventory/inventoryHooks";

export function InventoryPage() {
  const navigate = useNavigate();
  const { rows, isLoading, error } = useInventoryList();

  // HR only sees items already allocated to their branch (not the full catalog)
  const allocatedRows = rows.filter((r) => r.hasBranchStock && r.allocatedStock > 0);

  return (
    <>
      {error && (
        <p style={{ color: "red", padding: "1rem" }}>{error}</p>
      )}
      <InventoryScreen
        rows={allocatedRows}
        isLoading={isLoading}
        onBack={() => navigate(APP_ROUTES.dashboard)}
      />
    </>
  );
}
