import { useCallback, useEffect, useState } from "react";
import type { AgencyListItem } from "./agencyTypes";
import { listAgenciesApi, updateAgencyApi } from "./agencyApi";

export function useAgencyList() {
  const [agencies, setAgencies] = useState<AgencyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await listAgenciesApi();
      setAgencies(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load agencies.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setAgencyActive = useCallback(
    async (agencyId: string, active: boolean) => {
      const previous = agencies.find((a) => a.id === agencyId);
      if (!previous) return;

      const nextStatus = active ? "active" : "suspended";
      setAgencies((current) =>
        current.map((agency) =>
          agency.id === agencyId ? { ...agency, status: nextStatus } : agency
        )
      );
      setStatusUpdatingId(agencyId);
      setError("");

      try {
        const updated = await updateAgencyApi(agencyId, {
          status: active ? "active" : "inactive",
        });
        setAgencies((current) =>
          current.map((agency) =>
            agency.id === agencyId ? { ...agency, ...updated } : agency
          )
        );
      } catch (err: unknown) {
        setAgencies((current) =>
          current.map((agency) =>
            agency.id === agencyId ? previous : agency
          )
        );
        const e = err as { message?: string };
        setError(e.message ?? "Failed to update agency status.");
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [agencies]
  );

  return {
    agencies,
    isLoading,
    error,
    reload,
    setAgencyActive,
    statusUpdatingId,
  };
}
