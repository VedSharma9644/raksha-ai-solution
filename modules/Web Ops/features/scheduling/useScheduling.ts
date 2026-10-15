import { useCallback, useEffect, useState } from "react";
import { getSiteById } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import type { GuardShiftAssignment } from "@raskha/scheduling";
import { useWebOps } from "../../context/WebOpsContext";
import { adminFetch } from "../../lib/adminApi";

export function useScheduling(siteId: string) {
  const { agencyId, db } = useWebOps();
  const [site, setSite] = useState<Site | null>(null);
  const [assignments, setAssignments] = useState<GuardShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!siteId || !agencyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    const fetchAssignments = async (): Promise<GuardShiftAssignment[]> => {
      return adminFetch<GuardShiftAssignment[]>(
        `/api/scheduling?siteId=${encodeURIComponent(siteId)}`,
        { requireAuth: false }
      );
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
  }, [siteId, agencyId, db, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { site, assignments, isLoading, error, reload };
}
