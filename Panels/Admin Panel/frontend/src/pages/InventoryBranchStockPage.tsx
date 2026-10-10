import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { BranchStockScreen } from "../features/inventory/BranchStockScreen";
import {
  useInventoryItemDetail,
  useBranchStockByItem,
  useAllocateToBranch,
} from "../features/inventory/inventoryHooks";
import { useBranchContext } from "../features/branches";

export function InventoryBranchStockPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { item, isLoading: itemLoading } = useInventoryItemDetail(id);
  const { branchStocks, isLoading: stockLoading, reload } = useBranchStockByItem(id);
  const { branches } = useBranchContext();

  const { allocate, isSaving, error: saveError } = useAllocateToBranch(reload);

  if (itemLoading) return <p style={{ padding: "2rem" }}>Loading…</p>;
  if (!item) return <p style={{ color: "red", padding: "2rem" }}>Item not found.</p>;

  return (
    <BranchStockScreen
      item={item}
      branches={branches}
      branchStocks={branchStocks}
      isLoading={stockLoading}
      isSaving={isSaving}
      saveError={saveError}
      onBack={() => navigate(APP_ROUTES.inventoryList)}
      onAllocate={allocate}
    />
  );
}
