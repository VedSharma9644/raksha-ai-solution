import { useState } from "react";
import type { SaveGuardShiftAssignmentParams } from "@raskha/scheduling";
import type { GuardShiftAssignment } from "@raskha/scheduling";
import { adminFetch } from "../../lib/adminApi";

export function useSaveShiftAssignment() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function createAssignment(
    params: Omit<SaveGuardShiftAssignmentParams, "agencyId">
  ): Promise<GuardShiftAssignment | null> {
    setIsSaving(true);
    setSaveError("");
    try {
      return await adminFetch<GuardShiftAssignment>("/api/scheduling", {
        method: "POST",
        body: JSON.stringify(params),
        requireAuth: false,
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to save assignment.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateAssignment(
    assignmentId: string,
    params: Partial<
      Omit<SaveGuardShiftAssignmentParams, "agencyId" | "siteId" | "guardId">
    >
  ): Promise<boolean> {
    setIsSaving(true);
    setSaveError("");
    try {
      await adminFetch(`/api/scheduling/${assignmentId}`, {
        method: "PATCH",
        body: JSON.stringify(params),
        requireAuth: false,
      });
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to update assignment.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAssignment(assignmentId: string): Promise<boolean> {
    setIsSaving(true);
    setSaveError("");
    try {
      await adminFetch(`/api/scheduling/${assignmentId}`, {
        method: "DELETE",
        requireAuth: false,
      });
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to delete assignment.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return { isSaving, saveError, createAssignment, updateAssignment, removeAssignment };
}
