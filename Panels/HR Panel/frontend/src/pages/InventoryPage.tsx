import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { InventoryScreen, useInventoryList } from "../features/inventory";

export function InventoryPage() {
  const navigate = useNavigate();
  const { items, isLoading, error } = useInventoryList();

  return (
    <>
      {error && (
        <p style={{ color: "red", padding: "1rem" }}>{error}</p>
      )}
      <InventoryScreen
        items={items}
        isLoading={isLoading}
        onBack={() => navigate(APP_ROUTES.dashboard)}
      />
    </>
  );
}
