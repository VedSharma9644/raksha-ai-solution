import { useCallback, useEffect, useState } from "react";
import type { RosterCoverageReport } from "@raskha/scheduling";
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

export function useAgencyRosterCoverage(days = 7) {
  const [report, setReport] = useState<RosterCoverageReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const headers = new Headers({ "Content-Type": "application/json" });
      const user = auth.currentUser;
      if (user) {
        headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
      }
      const res = await fetch(`${API_BASE}/api/scheduling/coverage?days=${days}`, {
        headers,
      });
      const body = (await res.json().catch(() => ({}))) as RosterCoverageReport & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(body.error ?? `Failed to load coverage (${res.status})`);
      }
      setReport(body);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load roster coverage.");
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { report, isLoading, error, reload };
}
