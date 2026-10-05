import { useEffect, useState } from "react";
import { listHrStaffByAgency } from "@raskha/hr-management";
import type { HrStaff } from "@raskha/hr-management";
import { useAuthContext } from "../authentication";
import { db } from "../../lib/firebase";

export function useHrStaffList() {
  const { agency } = useAuthContext();
  const [hrStaff, setHrStaff] = useState<HrStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!agency) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    listHrStaffByAgency(db, agency.id)
      .then((data) => setHrStaff(data))
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setError(e.message ?? "Failed to load HR staff.");
      })
      .finally(() => setIsLoading(false));
  }, [agency]);

  return { hrStaff, isLoading, error };
}
