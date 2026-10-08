import { useCallback, useEffect, useState } from "react";
import { getSiteById } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import type { GuardShiftAssignment } from "@raskha/scheduling";
import { useAuthContext } from "../authentication";
import { db, auth } from "../../lib/firebase";

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

export function useScheduling(siteId: string) {
  const { agency } = useAuthContext();
  const [site, setSite] = useState<Site | null>(null);
  const [assignments, setAssignments] = useState<GuardShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!siteId || !agency) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    const fetchAssignments = async (): Promise<GuardShiftAssignment[]> => {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE}/api/scheduling?siteId=${encodeURIComponent(siteId)}`, { headers });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Failed to load assignments (${res.status})`);
      }
      return res.json() as Promise<GuardShiftAssignment[]>;
    };

    Promise.all([
      getSiteById(db, siteId),
      fetchAssignments().catch(() => [] as GuardShiftAssignment[]),
    ])
      .then(([siteData, assignmentData]) => {
        if (!siteData) setError("Site not found.");
        else setSite(siteData);
        setAssignments(assignmentData);
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load schedule.");
      })
      .finally(() => setIsLoading(false));
  }, [siteId, agency, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { site, assignments, isLoading, error, reload };
}
