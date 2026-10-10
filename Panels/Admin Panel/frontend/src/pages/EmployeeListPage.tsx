import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { deleteGuard } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { APP_ROUTES, editGuardPath, viewGuardPath } from "../app/routePaths";
import { EmployeeListScreen } from "../features/employees";
import type { EmployeeListItem } from "../features/employees";
import { useGuardList } from "../features/guards";
import { db } from "../lib/firebase";

function mapGuardToListItem(guard: Guard): EmployeeListItem {
  return {
    id: guard.id,
    fullName: guard.fullName,
    employeeCode: guard.employeeCode,
    role: "guard",
    phone: guard.phone,
    assignedSite: guard.assignedSiteId,
    status: guard.status,
    profilePictureUrl: guard.profilePictureUrl || undefined,
  };
}

export function EmployeeListPage() {
  const navigate = useNavigate();
  const { guards, isLoading, error, reload } = useGuardList();

  const employees = guards.map(mapGuardToListItem);

  const handleViewEmployee = useCallback((employeeId: string) => {
    navigate(viewGuardPath(employeeId));
  }, [navigate]);

  const handleDeleteEmployee = useCallback(async (employeeId: string) => {
    const guard = guards.find((g) => g.id === employeeId);
    const name = guard?.fullName ?? "this guard";
    const confirmed = window.confirm(
      `Delete "${name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      await deleteGuard(db, employeeId);
      reload?.();
    } catch (err: unknown) {
      const e = err as { message?: string };
      alert(e.message ?? "Failed to delete guard.");
    }
  }, [guards, reload]);

  if (isLoading) {
    return <p style={{ padding: "2rem" }}>Loading guards…</p>;
  }

  if (error) {
    return (
      <p role="alert" style={{ color: "red", padding: "2rem" }}>
        {error}
      </p>
    );
  }

  return (
    <EmployeeListScreen
      employees={employees}
      onBack={() => navigate(APP_ROUTES.dashboard)}
      onViewEmployee={handleViewEmployee}
      onSelectEmployee={(employeeId) => navigate(editGuardPath(employeeId))}
      onDeleteEmployee={handleDeleteEmployee}
    />
  );
}
