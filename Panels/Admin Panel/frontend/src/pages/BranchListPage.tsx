import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "@raskha/shared";
import { useConfirmDialog } from "../components/ConfirmDialog";
import { BranchListScreen } from "../features/branchManagement";
import { useBranchesList } from "../features/branchManagement";
import { APP_ROUTES, editBranchPath } from "../app/routePaths";

export function BranchListPage() {
  const navigate = useNavigate();
  const { confirm, alert } = useConfirmDialog();
  const { branches, isLoading, error, reload } = useBranchesList();

  const handleDeleteBranch = useCallback(async (branchId: string) => {
    const branch = branches.find((row) => row.id === branchId);
    const name = branch?.name ?? "this branch";
    const confirmed = await confirm({
      title: "Delete branch?",
      message: `Delete "${name}"? This cannot be undone if the branch has no guards, sites, or inventory allocated to it.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await adminFetch(`/api/branches/${encodeURIComponent(branchId)}`, {
        method: "DELETE",
      });
      await reload();
    } catch (err: unknown) {
      const e = err as { message?: string };
      await alert({
        title: "Could not delete",
        message: e.message ?? "Failed to delete branch.",
        tone: "danger",
      });
    }
  }, [alert, confirm, branches, reload]);

  return (
    <BranchListScreen
      branches={branches}
      isLoading={isLoading}
      error={error}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onAddBranch={() => navigate(APP_ROUTES.addBranch)}
      onEditBranch={(id) => navigate(editBranchPath(id))}
      onDeleteBranch={handleDeleteBranch}
    />
  );
}
