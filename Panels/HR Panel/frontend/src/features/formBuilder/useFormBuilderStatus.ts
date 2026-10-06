import { useEffect, useState } from "react";
import { getAgencyById } from "@raskha/core";
import { isFormBuilderModuleEnabled } from "@raskha/shared";
import { db } from "../../lib/firebase";

/**
 * Form Builder on/off from the agency's cached enabledModules
 * (written by Super Admin verify-login when the Agency Admin signs in).
 */
export function useFormBuilderStatus(agencyId: string | undefined) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!agencyId) {
      setIsEnabled(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getAgencyById(db, agencyId)
      .then((agency) => {
        if (cancelled) return;
        setIsEnabled(isFormBuilderModuleEnabled(agency?.enabledModules));
      })
      .catch(() => {
        if (!cancelled) setIsEnabled(false);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [agencyId]);

  return { isEnabled, isLoading };
}
