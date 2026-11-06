import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "@raskha/shared";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { APP_ROUTES } from "../../app/routePaths";

export function useDeleteHrStaff(hrStaffId: string) {
  const navigate = useNavigate();
  const { confirm } = useConfirmDialog();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function removeHrStaff() {
    const confirmed = await confirm({
      title: "Delete HR user?",
      message:
        "Are you sure you want to delete this HR user? This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger",
    });

    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      await adminFetch(`/api/hr-staff/${encodeURIComponent(hrStaffId)}`, {
        method: "DELETE",
      });
      navigate(APP_ROUTES.hrList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to delete HR user. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return { removeHrStaff, isDeleting, error };
}
