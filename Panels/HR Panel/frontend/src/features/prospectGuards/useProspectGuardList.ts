import { useState, useEffect, useCallback } from "react";
import { auth } from "../../lib/firebase";
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

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    if (import.meta.env.VITE_ADMIN_API_FORCE_REMOTE !== "true") {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();

export function useProspectGuardList(statusFilter?: string) {
  const { activeBranchId } = useBranchContext();
  const [guards, setGuards] = useState<ProspectGuardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuards = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const url = new URL(`${API_BASE}/api/prospect-guards`);
      if (statusFilter) url.searchParams.set("status", statusFilter);
      const finalUrl = appendBranchParam(url.toString(), activeBranchId);
      const res = await fetch(finalUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load prospect guards (${res.status})`);
      const data = await res.json();
      setGuards(data);
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [activeBranchId, statusFilter]);

  useEffect(() => { fetchGuards(); }, [fetchGuards]);

  return { guards, loading, error, refresh: fetchGuards };
}
