import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  InventoryScreen,
  SAMPLE_INVENTORY_ITEMS,
} from "../features/inventory";

export function InventoryPage() {
  const navigate = useNavigate();

  return (
    <InventoryScreen
      items={SAMPLE_INVENTORY_ITEMS}
      onBack={() => navigate(APP_ROUTES.dashboard)}
    />
  );
}
