import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@raskha/shared";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { appendBranchParam } from "../../lib/branchFilter";

export interface ProspectGuardListItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  status: string;
  applicationSource: string;
  yearsOfExperience: number | null;
  createdAt: unknown;
  followUpDate: string | null;
}

export function useProspectGuardList(statusFilter?: string) {
  const { agency } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [guards, setGuards] = useState<ProspectGuardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuards = useCallback(async () => {
    if (!agency) return;
    setLoading(true);
    setError(null);
    try {
      let path = statusFilter
        ? `/api/prospect-guards?status=${encodeURIComponent(statusFilter)}`
        : `/api/prospect-guards`;
      path = appendBranchParam(path, activeBranchId);
      setGuards(
        await adminFetch<ProspectGuardListItem[]>(path, { requireAuth: false })
      );
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [agency, activeBranchId, statusFilter]);

  useEffect(() => {
    void fetchGuards();
  }, [fetchGuards]);

  return { guards, loading, error, refresh: fetchGuards };
}
