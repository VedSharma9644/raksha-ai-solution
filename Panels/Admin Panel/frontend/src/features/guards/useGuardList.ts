import { useCallback, useEffect, useState } from "react";
import { listGuardsByAgency } from "@raskha/guard-management";
import type { Guard } from "@raskha/guard-management";
import { useAuthContext } from "../authentication";
import { db } from "../../lib/firebase";

export function useGuardList() {
  const { agency } = useAuthContext();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!agency) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    listGuardsByAgency(db, agency.id)
      .then((data) => setGuards(data))
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load guards.");
      })
      .finally(() => setIsLoading(false));
  }, [agency, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { guards, isLoading, error, reload };
}
