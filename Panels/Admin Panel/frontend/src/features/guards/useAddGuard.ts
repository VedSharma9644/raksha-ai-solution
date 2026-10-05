import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addGuard } from "@raskha/guard-management";
import { APP_ROUTES } from "../../app/routePaths";
import { useAuthContext } from "../authentication";
import { db } from "../../lib/firebase";

export interface AddGuardFormValues {
  fullName: string;
  employeeCode: string;
  phone: string;
  email: string;
  assignedSiteId: string;
  notes: string;
}

export function useAddGuard() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveGuard(values: AddGuardFormValues) {
    if (!agency) {
      setError("Not authenticated.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await addGuard(db, {
        agencyId: agency.id,
        ...values,
      });
      navigate(APP_ROUTES.dashboard, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to save guard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveGuard, isSubmitting, error };
}
