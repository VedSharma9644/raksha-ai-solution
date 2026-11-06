import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteGuard } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { listSitesByAgency } from "@raskha/site-management";
import { APP_ROUTES, editGuardPath, viewGuardPath } from "../app/routePaths";
import { useConfirmDialog } from "../components/ConfirmDialog";
import { useAuthContext } from "../features/authentication";
import { EmployeeListScreen } from "../features/employees";
import type { EmployeeListItem } from "../features/employees";
import { useGuardList } from "../features/guards";
import { db } from "../lib/firebase";

function siteLabel(
  siteId: string,
  siteNames: ReadonlyMap<string, string>
): string {
  const id = siteId.trim();
  if (!id) return "";
  return siteNames.get(id) ?? id;
}

function mapGuardToListItem(
  guard: Guard,
  siteNames: ReadonlyMap<string, string>
): EmployeeListItem {
  return {
    id: guard.id,
    fullName: guard.fullName,
    employeeCode: guard.employeeCode,
    role: "guard",
    phone: guard.phone,
    assignedSite: siteLabel(guard.assignedSiteId, siteNames),
    status: guard.status,
    profilePictureUrl: guard.profilePictureUrl || undefined,
  };
}

export function EmployeeListPage() {
  const navigate = useNavigate();
  const { confirm, alert } = useConfirmDialog();
  const { agency, isLoading: authLoading } = useAuthContext();
  const { guards, isLoading, error, reload } = useGuardList();
  const [siteNames, setSiteNames] = useState<ReadonlyMap<string, string>>(
    () => new Map()
  );
  const [sitesLoading, setSitesLoading] = useState(true);

  useEffect(() => {
    if (!agency?.id) {
      setSiteNames(new Map());
      setSitesLoading(false);
      return;
    }

    let cancelled = false;
    setSitesLoading(true);
    listSitesByAgency(db, agency.id)
      .then((sites) => {
        if (cancelled) return;
        setSiteNames(
          new Map(
            sites.map((site) => [site.id, site.siteName?.trim() || site.id])
          )
        );
      })
      .catch(() => {
        if (!cancelled) setSiteNames(new Map());
      })
      .finally(() => {
        if (!cancelled) setSitesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [agency?.id]);

  const employees = useMemo(
    () => guards.map((guard) => mapGuardToListItem(guard, siteNames)),
    [guards, siteNames]
  );

  const handleViewEmployee = useCallback((employeeId: string) => {
    navigate(viewGuardPath(employeeId));
  }, [navigate]);

  const handleDeleteEmployee = useCallback(async (employeeId: string) => {
    const guard = guards.find((g) => g.id === employeeId);
    const name = guard?.fullName ?? "this guard";
    const confirmed = await confirm({
      title: "Delete guard?",
      message: `Delete "${name}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteGuard(db, employeeId);
      reload?.();
    } catch (err: unknown) {
      const e = err as { message?: string };
      await alert({
        title: "Could not delete",
        message: e.message ?? "Failed to delete guard.",
        tone: "danger",
      });
    }
  }, [alert, confirm, guards, reload]);

  if (authLoading || isLoading || sitesLoading) {
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
      onAddGuard={() => navigate(APP_ROUTES.addGuard)}
      onViewEmployee={handleViewEmployee}
      onSelectEmployee={(employeeId) => navigate(editGuardPath(employeeId))}
      onDeleteEmployee={handleDeleteEmployee}
    />
  );
}
