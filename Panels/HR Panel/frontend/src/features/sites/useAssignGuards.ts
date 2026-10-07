import { useCallback, useEffect, useMemo, useState } from "react";
import { bulkUpdateGuardSiteAssignment } from "@raskha/guard-management";
import { useAuthContext } from "../authentication";
import { useGuardList } from "../guards/useGuardList";
import { useSiteList } from "./useSiteList";
import { db } from "../../lib/firebase";

export interface UseAssignGuardsReturn {
  guards: ReturnType<typeof useGuardList>["guards"];
  siteNameById: Record<string, string>;
  isLoading: boolean;
  loadError: string;
  selectedIds: Set<string>;
  toggle: (guardId: string) => void;
  save: () => Promise<void>;
  isSaving: boolean;
  saveError: string;
  isDirty: boolean;
}

export function useAssignGuards(siteId: string): UseAssignGuardsReturn {
  const { hrStaff } = useAuthContext();
  const { guards, isLoading: guardsLoading, error: guardsError } = useGuardList();
  const { sites, isLoading: sitesLoading } = useSiteList();

  const siteNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of sites) map[s.id] = s.siteName;
    return map;
  }, [sites]);

  const isLoading = guardsLoading || sitesLoading;
  const loadError = guardsError;

  const initialSelected = useMemo(
    () =>
      new Set(
        guards
          .filter((g) => g.assignedSiteId === siteId)
          .map((g) => g.id)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [guards.length, siteId]
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelected);

  useEffect(() => {
    setSelectedIds(new Set(initialSelected));
  }, [initialSelected]);

  const toggle = useCallback((guardId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(guardId)) {
        next.delete(guardId);
      } else {
        next.add(guardId);
      }
      return next;
    });
  }, []);

  const isDirty = useMemo(() => {
    if (selectedIds.size !== initialSelected.size) return true;
    for (const id of selectedIds) {
      if (!initialSelected.has(id)) return true;
    }
    return false;
  }, [selectedIds, initialSelected]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const save = useCallback(async () => {
    if (!hrStaff?.agencyId) return;
    const addIds = [...selectedIds].filter((id) => !initialSelected.has(id));
    const removeIds = [...initialSelected].filter((id) => !selectedIds.has(id));
    setIsSaving(true);
    setSaveError("");
    try {
      await bulkUpdateGuardSiteAssignment(db, siteId, addIds, removeIds);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to save assignment.");
    } finally {
      setIsSaving(false);
    }
  }, [hrStaff?.agencyId, siteId, selectedIds, initialSelected]);

  return {
    guards,
    siteNameById,
    isLoading,
    loadError,
    selectedIds,
    toggle,
    save,
    isSaving,
    saveError,
    isDirty,
  };
}
