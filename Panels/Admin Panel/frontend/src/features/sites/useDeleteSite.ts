import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "@raskha/shared";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { APP_ROUTES } from "../../app/routePaths";

export function useDeleteSite(siteId: string) {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function removeSite() {
    const confirmed = await confirm({
      title: "Delete site?",
      message:
        "Are you sure you want to delete this site? Guards assigned here will be unassigned. This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger",
    });
    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      await adminFetch(`/api/sites/${encodeURIComponent(siteId)}`, {
        method: "DELETE",
      });
      navigate(APP_ROUTES.siteList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to delete site. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return { removeSite, isDeleting, error };
}
