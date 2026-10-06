import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../app/routePaths";
import type { AgencyFormValues } from "./agencyTypes";
import { getAgencyApi, updateAgencyApi } from "./agencyApi";

const PLAN_TO_FORM: Record<string, string> = {
  basic: "plan-starter",
  standard: "plan-growth",
  premium: "plan-enterprise",
};

export function useEditAgency(agencyId: string) {
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<
    (AgencyFormValues & { password: string }) | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!agencyId) return;
    setIsLoading(true);
    setLoadError("");
    getAgencyApi(agencyId)
      .then((agency) => {
        setInitialValues({
          agencyName: agency.agencyName,
          contactPerson: agency.contactPerson,
          email: agency.email,
          phone: agency.phone ?? "",
          city: agency.city,
          planId: PLAN_TO_FORM[agency.plan ?? ""] ?? "plan-starter",
          notes: "",
          password: "",
        });
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setLoadError(e.message ?? "Failed to load agency.");
      })
      .finally(() => setIsLoading(false));
  }, [agencyId]);

  async function saveAgency(
    values: AgencyFormValues & { password: string; status?: "active" | "inactive" }
  ) {
    setSaveError("");
    setIsSubmitting(true);
    try {
      await updateAgencyApi(agencyId, {
        agencyName: values.agencyName,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        city: values.city,
        planId: values.planId,
        notes: values.notes,
        ...(values.password ? { password: values.password } : {}),
        ...(values.status ? { status: values.status } : {}),
      });
      navigate(APP_ROUTES.agencyList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to update agency.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    initialValues,
    isLoading,
    isSubmitting,
    loadError,
    saveError,
    saveAgency,
  };
}
