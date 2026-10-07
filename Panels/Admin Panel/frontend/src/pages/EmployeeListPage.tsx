import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGuardById, deleteGuard } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { APP_ROUTES, editGuardPath } from "../app/routePaths";
import { EmployeeListScreen } from "../features/employees";
import type { EmployeeListItem } from "../features/employees";
import { GuardProfileModal } from "../features/guards";
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
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const employees = guards.map(mapGuardToListItem);

  const handleViewEmployee = useCallback(async (employeeId: string) => {
    setIsLoadingProfile(true);
    try {
      const guard = await getGuardById(db, employeeId);
      if (guard) setSelectedGuard(guard);
    } catch {
      // silently ignore — guard may be stale
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

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
    <>
      {isLoadingProfile && (
        <div style={{ position: "fixed", top: "1rem", right: "1.5rem", background: "#1e293b", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.85rem", zIndex: 999 }}>
          Loading profile…
        </div>
      )}

      <EmployeeListScreen
        employees={employees}
        onBack={() => navigate(APP_ROUTES.dashboard)}
        onViewEmployee={handleViewEmployee}
        onSelectEmployee={(employeeId) => navigate(editGuardPath(employeeId))}
        onDeleteEmployee={handleDeleteEmployee}
      />

      <GuardProfileModal
        guard={selectedGuard}
        onClose={() => setSelectedGuard(null)}
      />
    </>
  );
}
