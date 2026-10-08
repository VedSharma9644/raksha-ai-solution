import { useCallback, useEffect, useState } from "react";
import type { ProspectClient, ProspectStatus } from "@raskha/client-management";
import { useAuthContext } from "../authentication";
import { auth } from "../../lib/firebase";

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

export function useProspectList(statusFilter?: ProspectStatus | "") {
  const { agency } = useAuthContext();
  const [prospects, setProspects] = useState<ProspectClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!agency) { setIsLoading(false); return; }

    setIsLoading(true);
    setError("");

    const url = statusFilter
      ? `${API_BASE}/api/prospects?status=${encodeURIComponent(statusFilter)}`
      : `${API_BASE}/api/prospects`;

    authHeaders()
      .then((headers) => fetch(url, { headers }))
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `Failed to load prospects (${res.status})`);
        }
        return res.json() as Promise<ProspectClient[]>;
      })
      .then((data) => setProspects(data))
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load prospects.");
      })
      .finally(() => setIsLoading(false));
  }, [agency, statusFilter, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { prospects, isLoading, error, reload };
}
