import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../app/routePaths";
import type { AgencyFormValues } from "./agencyTypes";
import { createAgencyApi } from "./agencyApi";

export function useAddAgency() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveAgency(values: AgencyFormValues & { password: string }) {
    setError("");
    setIsSubmitting(true);
    try {
      await createAgencyApi(values);
      navigate(APP_ROUTES.agencyList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to create agency.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveAgency, isSubmitting, error };
}
