import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "@raskha/shared";
import { InventoryListScreen } from "../features/inventory";
import { useInventoryList } from "../features/inventory";
import { useConfirmDialog } from "../components/ConfirmDialog";
import { APP_ROUTES, editInventoryItemPath, inventoryBranchStockPath } from "../app/routePaths";

export function InventoryListPage() {
  const navigate = useNavigate();
  const { confirm, alert } = useConfirmDialog();
  const { items, isLoading, isSeeding, error, reload, seedDefaults } =
    useInventoryList();

  const handleDeleteItem = useCallback(async (itemId: string) => {
    const item = items.find((row) => row.id === itemId);
    const name = item?.name ?? "this item";
    const confirmed = await confirm({
      title: "Delete item?",
      message: `Delete "${name}"? Branch allocations and guard assignments for it will also be removed. This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await adminFetch(`/api/inventory/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      });
      await reload();
    } catch (err: unknown) {
      const e = err as { message?: string };
      await alert({
        title: "Could not delete",
        message: e.message ?? "Failed to delete item.",
        tone: "danger",
      });
    }
  }, [alert, confirm, items, reload]);

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
        onDeleteItem={handleDeleteItem}
        onSeedDefaults={seedDefaults}
      />
    </>
  );
}
