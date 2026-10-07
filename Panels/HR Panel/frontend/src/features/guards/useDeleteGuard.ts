import { useState } from "react";
import { deleteGuard } from "@raskha/guard-management";
import { db } from "../../lib/firebase";

export function useDeleteGuard() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function removeGuard(
    guardId: string,
    guardName: string,
    onSuccess?: () => void,
  ): Promise<void> {
    const confirmed = window.confirm(
      `Delete "${guardName}"? This action cannot be undone.`,
    );
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
