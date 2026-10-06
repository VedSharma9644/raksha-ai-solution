import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_ENABLED_FEATURE_IDS } from "@raskha/shared";
import { useAgencyList } from "../agencies/useAgencyList";
import type { AgencyFeatureConfig } from "./featureControlTypes";
import { listModuleAccessApi, saveModuleAccessApi } from "./moduleApi";

/**
 * Loads agencies + module access via Super Admin API (Admin SDK).
 * Avoids client Firestore — SA browser auth has no write rules on module docs.
 */
export function useAgencyModuleControl() {
  const {
    agencies,
    isLoading: agenciesLoading,
    error: agenciesError,
    reload,
  } = useAgencyList();

  const [accessByAgency, setAccessByAgency] = useState<
    Record<string, string[]>
  >({});
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const loadAccess = useCallback(async () => {
    setAccessLoading(true);
    setAccessError("");
    try {
      const rows = await listModuleAccessApi();
      const map: Record<string, string[]> = {};
      for (const row of rows) {
        map[row.agencyId] = row.enabledFeatureIds;
      }
      setAccessByAgency(map);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAccessError(e.message ?? "Failed to load module access.");
    } finally {
      setAccessLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  const agencyConfigs = useMemo<AgencyFeatureConfig[]>(
    () =>
      agencies.map((agency) => ({
        agencyId: agency.id,
        agencyName: agency.agencyName,
        enabledFeatureIds:
          accessByAgency[agency.id] ?? [...DEFAULT_ENABLED_FEATURE_IDS],
      })),
    [agencies, accessByAgency]
  );

  const saveModuleAccess = useCallback(
    async (agencyId: string, enabledFeatureIds: string[]) => {
      if (!agencyId) return;
      setIsSaving(true);
      setSaveMessage("");
      setAccessError("");
      const previous = accessByAgency[agencyId];
      setAccessByAgency((current) => ({
        ...current,
        [agencyId]: enabledFeatureIds,
      }));

      try {
        await saveModuleAccessApi(agencyId, enabledFeatureIds);
        setSaveMessage("Module access saved.");
      } catch (err: unknown) {
        setAccessByAgency((current) => {
          const next = { ...current };
          if (previous === undefined) {
            delete next[agencyId];
          } else {
            next[agencyId] = previous;
          }
          return next;
        });
        const e = err as { message?: string };
        setAccessError(e.message ?? "Failed to save module access.");
      } finally {
        setIsSaving(false);
      }
    },
    [accessByAgency]
  );

  return {
    agencyConfigs,
    isLoading: agenciesLoading || accessLoading,
    error: agenciesError || accessError,
    isSaving,
    saveMessage,
    saveModuleAccess,
    reloadAgencies: reload,
    reloadAccess: loadAccess,
  };
}
