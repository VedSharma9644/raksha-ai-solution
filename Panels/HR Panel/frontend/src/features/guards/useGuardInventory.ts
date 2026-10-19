import { useCallback, useEffect, useState } from "react";
import type { GuardInventoryAssignment } from "@raskha/inventory-management";
import { adminFetch } from "@raskha/shared";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";

export function useGuardInventory(guardId: string) {
  const { hrStaff } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [assignments, setAssignments] = useState<GuardInventoryAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!guardId || !hrStaff?.agencyId) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await adminFetch<GuardInventoryAssignment[]>(
        `/api/guard-inventory/by-guard/${encodeURIComponent(guardId)}`
      );
      setAssignments(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load assignments.");
    } finally {
      setIsLoading(false);
    }
  }, [guardId, hrStaff?.agencyId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function assign(
    itemId: string,
    itemName: string,
    category: string,
    unit: string,
    quantity: number,
    branchStockId?: string | null,
  ) {
    if (!hrStaff?.agencyId) return;
    setIsSaving(true);
    setError("");
    try {
      const saved = await adminFetch<GuardInventoryAssignment & { merged?: boolean }>(
        "/api/guard-inventory/assign",
        {
          method: "POST",
          body: JSON.stringify({
            guardId,
            itemId,
            itemName,
            category,
            unit,
            quantity,
            branchId: activeBranchId ?? null,
            branchStockId: branchStockId ?? null,
          }),
        }
      );
      // Keep one row per item — replace any prior rows for this itemId
      setAssignments((prev) => [
        ...prev.filter((a) => a.itemId !== itemId),
        saved,
      ]);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to assign item.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateQty(assignmentId: string, newQuantity: number) {
    setIsSaving(true);
    setError("");
    try {
      const result = await adminFetch<{ id?: string; quantity?: number; deleted?: boolean }>(
        `/api/guard-inventory/${encodeURIComponent(assignmentId)}`,
        {
          method: "PUT",
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );
      if (result.deleted || newQuantity === 0) {
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      } else {
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === assignmentId ? { ...a, quantity: newQuantity } : a,
          ),
        );
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to update assignment.");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(assignmentId: string) {
    setIsSaving(true);
    setError("");
    try {
      await adminFetch(`/api/guard-inventory/${encodeURIComponent(assignmentId)}`, {
        method: "DELETE",
      });
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to remove assignment.");
    } finally {
      setIsSaving(false);
    }
  }

  return { assignments, isLoading, isSaving, error, assign, updateQty, remove };
}
