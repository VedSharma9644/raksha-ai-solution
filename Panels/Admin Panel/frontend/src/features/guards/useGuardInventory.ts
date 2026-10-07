import { useCallback, useEffect, useState } from "react";
import {
  listAssignmentsByGuard,
  assignItemToGuard,
  updateGuardAssignment,
  removeGuardAssignment,
} from "@raskha/inventory-management";
import type { GuardInventoryAssignment } from "@raskha/inventory-management";
import { db } from "../../lib/firebase";
import { useAuthContext } from "../authentication";

export function useGuardInventory(guardId: string) {
  const { agency } = useAuthContext();
  const [assignments, setAssignments] = useState<GuardInventoryAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!guardId || !agency?.id) return;
    setIsLoading(true);
    try {
      const data = await listAssignmentsByGuard(db, guardId, agency.id);
      setAssignments(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load assignments.");
    } finally {
      setIsLoading(false);
    }
  }, [guardId, agency?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function assign(
    itemId: string,
    itemName: string,
    category: string,
    unit: string,
    quantity: number,
  ) {
    if (!agency) return;
    setIsSaving(true);
    setError("");
    try {
      const newAssignment = await assignItemToGuard(db, {
        agencyId: agency.id,
        guardId,
        itemId,
        itemName,
        category,
        unit,
        quantity,
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
      await updateGuardAssignment(db, assignmentId, newQuantity);
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
      await removeGuardAssignment(db, assignmentId);
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
