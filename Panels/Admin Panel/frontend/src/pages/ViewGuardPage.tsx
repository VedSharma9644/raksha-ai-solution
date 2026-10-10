import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGuardById } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { APP_ROUTES } from "../app/routePaths";
import { useGuardInventory, ViewGuardScreen } from "../features/guards";
import { useInventoryList } from "../features/inventory";
import { db } from "../lib/firebase";

export function ViewGuardPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [guard, setGuard] = useState<Guard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getGuardById(db, id)
      .then((data) => {
        setGuard(data);
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setLoadError(e.message ?? "Failed to load guard.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const {
    assignments,
    isLoading: isAssignmentsLoading,
    isSaving,
    error: assignError,
    assign,
    updateQty,
    remove,
  } = useGuardInventory(id);

  const { items: inventoryItems } = useInventoryList();

  if (isLoading) {
    return <p style={{ padding: "2rem" }}>Loading guard…</p>;
  }

  if (loadError || !guard) {
    return (
      <p role="alert" style={{ color: "red", padding: "2rem" }}>
        {loadError || "Guard not found."}
      </p>
    );
  }

  return (
    <ViewGuardScreen
      guard={guard}
      assignments={assignments}
      inventoryItems={inventoryItems}
      isAssignmentsLoading={isAssignmentsLoading}
      isSaving={isSaving}
      assignError={assignError}
      onBack={() => navigate(APP_ROUTES.employeeList)}
      onAssign={assign}
      onUpdateQty={updateQty}
      onRemove={remove}
    />
  );
}
