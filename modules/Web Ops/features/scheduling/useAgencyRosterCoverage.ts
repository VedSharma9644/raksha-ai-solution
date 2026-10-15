import { useCallback, useEffect, useState } from "react";
import type { RosterCoverageReport } from "@raskha/scheduling";
import { adminFetch } from "../../lib/adminApi";

export function useAgencyRosterCoverage(days = 7) {
  const [report, setReport] = useState<RosterCoverageReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const body = await adminFetch<RosterCoverageReport>(
        `/api/scheduling/coverage?days=${days}`,
        { requireAuth: false }
      );
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
