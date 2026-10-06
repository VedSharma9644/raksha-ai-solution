import { useEffect, useState } from "react";
import { isFormBuilderEnabledForAgency } from "@raskha/form-builder";
import { db } from "../../lib/firebase";

/**
 * Returns whether the Form Builder feature is enabled for the given agency.
 * Used by the Add Guard page to decide which form to render.
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

    setIsLoading(true);
    isFormBuilderEnabledForAgency(db, agencyId)
      .then(setIsEnabled)
      .catch(() => setIsEnabled(false))
      .finally(() => setIsLoading(false));
  }, [agencyId]);

  return { isEnabled, isLoading };
}
