import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listGuardsByAgency } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { APP_ROUTES, viewGuardPath } from "../app/routePaths";
import { GuardListScreen } from "../features/guards";
import { useAuthContext } from "../features/authentication";
import { db } from "../lib/firebase";
import type { GuardListItem } from "../features/guards";

export function GuardListPage() {
  const navigate = useNavigate();
  const { hrStaff } = useAuthContext();
  const [guards, setGuards] = useState<GuardListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!hrStaff?.agencyId) return;
    setIsLoading(true);
    try {
      const data = await listGuardsByAgency(db, hrStaff.agencyId);
      // Map Guard → GuardListItem
      const mapped: GuardListItem[] = data.map((g: Guard) => ({
        id: g.id,
        fullName: g.fullName,
        employeeCode: g.employeeCode,
        phone: g.phone,
        status: g.status,
      }));
      setGuards(mapped);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load guards.");
    } finally {
      setIsLoading(false);
    }
  }, [hrStaff?.agencyId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return <p style={{ padding: "2rem" }}>Loading guards…</p>;
  }

  return (
    <>
      {error && <p style={{ color: "red", padding: "1rem" }}>{error}</p>}
      <GuardListScreen
        guards={guards}
        onBack={() => navigate(APP_ROUTES.dashboard)}
        onSelectGuard={(guardId) => navigate(viewGuardPath(guardId))}
      />
    </>
  );
}
