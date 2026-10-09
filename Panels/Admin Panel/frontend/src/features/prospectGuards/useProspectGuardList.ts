import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../authentication";
import { auth } from "../../lib/firebase";

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

async function authHeaders(): Promise<Headers> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

export function useProspectGuardList(statusFilter?: string) {
  const { agency } = useAuthContext();
  const [guards, setGuards] = useState<ProspectGuardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuards = useCallback(async () => {
    if (!agency) return;
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter
        ? `${API_BASE}/api/prospect-guards?status=${encodeURIComponent(statusFilter)}`
        : `${API_BASE}/api/prospect-guards`;
      const headers = await authHeaders();
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Failed to load prospect guards (${res.status})`);
      setGuards(await res.json());
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [agency, statusFilter]);

  useEffect(() => { fetchGuards(); }, [fetchGuards]);

  return { guards, loading, error, refresh: fetchGuards };
}
