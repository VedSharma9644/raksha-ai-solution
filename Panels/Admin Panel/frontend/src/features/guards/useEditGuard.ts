import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGuardById, updateGuard } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { APP_ROUTES } from "../../app/routePaths";
import { db } from "../../lib/firebase";
import type { StaffMemberFormValues } from "../staff";

export function useEditGuard(guardId: string) {
  const navigate = useNavigate();
  const [guard, setGuard] = useState<Guard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  // Load guard on mount
  useEffect(() => {
    if (!guardId) return;

    setIsLoading(true);
    setLoadError("");

    getGuardById(db, guardId)
      .then((data) => {
        if (!data) {
          setLoadError("Guard not found.");
        } else {
          setGuard(data);
        }
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setLoadError(e.message ?? "Failed to load guard.");
      })
      .finally(() => setIsLoading(false));
  }, [guardId]);

  async function saveGuard(values: StaffMemberFormValues) {
    setSaveError("");
    setIsSubmitting(true);

    try {
      await updateGuard(db, guardId, values);
      navigate(APP_ROUTES.employeeList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to update guard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Map Guard → StaffMemberFormValues for pre-filling the form
  const initialValues: StaffMemberFormValues | undefined = guard
    ? {
        fullName: guard.fullName,
        employeeCode: guard.employeeCode,
        phone: guard.phone,
        email: guard.email,
        assignedSiteId: guard.assignedSiteId,
        notes: guard.notes,
      }
    : undefined;

  return { guard, initialValues, isLoading, isSubmitting, loadError, saveError, saveGuard };
}
