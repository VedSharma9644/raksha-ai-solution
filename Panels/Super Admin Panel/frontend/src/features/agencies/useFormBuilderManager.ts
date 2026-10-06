import { useCallback, useEffect, useState } from "react";
import {
  enableFormBuilderForAgency,
  disableFormBuilderForAgency,
  listFormBuilderFeatures,
} from "@raskha/form-builder";
import { db } from "../../lib/firebase";

/**
 * Tracks the Form Builder enabled/disabled state per agency.
 * Populated from Firestore on mount; updates optimistically on toggle.
 */
export function useFormBuilderManager() {
  // Map of agencyId → enabled
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    listFormBuilderFeatures(db)
      .then((features) => {
        const map: Record<string, boolean> = {};
        for (const f of features) {
          map[f.agencyId] = f.enabled;
        }
        setStatusMap(map);
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load Form Builder statuses.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const toggleFormBuilder = useCallback(
    async (agencyId: string, enabled: boolean) => {
      // Optimistic update
      setStatusMap((prev) => ({ ...prev, [agencyId]: enabled }));

      try {
        if (enabled) {
          await enableFormBuilderForAgency(db, agencyId);
        } else {
          await disableFormBuilderForAgency(db, agencyId);
        }
      } catch (err: unknown) {
        // Revert on failure
        setStatusMap((prev) => ({ ...prev, [agencyId]: !enabled }));
        const e = err as { message?: string };
        setError(e.message ?? "Failed to update Form Builder status.");
      }
    },
    [],
  );

  function isEnabled(agencyId: string): boolean {
    return statusMap[agencyId] === true;
  }

  return { isEnabled, toggleFormBuilder, isLoading, error };
}
