import { useState } from "react";
import { deleteGuard } from "@raskha/guard-management";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { db } from "../../lib/firebase";

export function useDeleteGuard() {
  const { confirm } = useConfirmDialog();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function removeGuard(
    guardId: string,
    guardName: string,
    onSuccess?: () => void,
  ): Promise<void> {
    const confirmed = await confirm({
      title: "Delete guard?",
      message: `Delete "${guardName}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger",
    });
    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      await deleteGuard(db, guardId);
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to delete guard.");
    } finally {
      setIsDeleting(false);
    }
  }

  return { removeGuard, isDeleting, error };
}
