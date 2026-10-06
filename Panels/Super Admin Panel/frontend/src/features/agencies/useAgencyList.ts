import { useCallback, useEffect, useState } from "react";
import type { AgencyListItem } from "./agencyTypes";
import { listAgenciesApi } from "./agencyApi";

export function useAgencyList() {
  const [agencies, setAgencies] = useState<AgencyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  return { agencies, isLoading, error, reload };
}
