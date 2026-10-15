import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteGuard } from "@raskha/guard-management";
import { APP_ROUTES } from "../../app/routePaths";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { db } from "../../lib/firebase";

export function useDeleteGuard(guardId: string) {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function removeGuard() {
    const confirmed = await confirm({
      title: "Delete guard?",
      message:
        "Are you sure you want to delete this guard? This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger",
    });

    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      await deleteGuard(db, guardId);
      navigate(APP_ROUTES.employeeList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to delete guard. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return { removeGuard, isDeleting, error };
}
