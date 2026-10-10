import { useCallback, useEffect, useState } from "react";
import {
  listAssignmentsByGuard,
  assignItemToGuard,
  updateGuardAssignment,
  removeGuardAssignment,
} from "@raskha/inventory-management";
import type { GuardInventoryAssignment } from "@raskha/inventory-management";
import { adjustBranchAssignedStock } from "@raskha/branch-stock";
import { db } from "../../lib/firebase";
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
    try {
      const data = await listAssignmentsByGuard(db, guardId, hrStaff.agencyId);
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
      const newAssignment = await assignItemToGuard(db, {
        agencyId: hrStaff.agencyId,
        guardId,
        itemId,
        itemName,
        category,
        unit,
        quantity,
        branchId: activeBranchId ?? null,
        branchStockId: branchStockId ?? null,
        adjustBranchStock: branchStockId ? adjustBranchAssignedStock : undefined,
      });
      setAssignments((prev) => [...prev, newAssignment]);
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
      await updateGuardAssignment(db, assignmentId, newQuantity, adjustBranchAssignedStock);
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, quantity: newQuantity } : a,
        ),
      );
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
      await removeGuardAssignment(db, assignmentId, adjustBranchAssignedStock);
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
