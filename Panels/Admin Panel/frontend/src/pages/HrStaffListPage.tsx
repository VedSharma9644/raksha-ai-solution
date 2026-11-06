import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "@raskha/shared";
import { useConfirmDialog } from "../components/ConfirmDialog";
import { HrStaffListScreen, useHrStaffList } from "../features/hrStaff";
import { APP_ROUTES, editHrStaffPath } from "../app/routePaths";

export function HrStaffListPage() {
  const navigate = useNavigate();
  const { confirm, alert } = useConfirmDialog();
  const { hrStaff, isLoading, error, reload } = useHrStaffList();

  const handleDeleteHr = useCallback(async (hrStaffId: string) => {
    const person = hrStaff.find((row) => row.id === hrStaffId);
    const name = person?.fullName ?? "this HR user";
    const confirmed = await confirm({
      title: "Delete HR user?",
      message: `Delete "${name}"? They will no longer be able to sign in. This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await adminFetch(`/api/hr-staff/${encodeURIComponent(hrStaffId)}`, {
        method: "DELETE",
      });
      reload();
    } catch (err: unknown) {
      const e = err as { message?: string };
      await alert({
        title: "Could not delete",
        message: e.message ?? "Failed to delete HR user.",
        tone: "danger",
      });
    }
  }, [alert, confirm, hrStaff, reload]);

  if (isLoading) {
    return <p style={{ padding: "2rem" }}>Loading HR staff…</p>;
  }

  if (error) {
    return (
      <p role="alert" style={{ color: "red", padding: "2rem" }}>
        {error}
      </p>
    );
  }

  return (
    <HrStaffListScreen
      hrStaff={hrStaff}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onAddHr={() => navigate(APP_ROUTES.addHrStaff)}
      onSelectHr={(hrStaffId) => navigate(editHrStaffPath(hrStaffId))}
      onDeleteHr={handleDeleteHr}
    />
  );
}
