import { useCallback, useEffect, useState } from "react";
import { listInventoryItemsByAgency } from "@raskha/inventory-management";
import type { InventoryItem } from "@raskha/inventory-management";
import { db } from "../../lib/firebase";
import { useAuthContext } from "../authentication";

export function useInventoryList() {
  const { hrStaff } = useAuthContext();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!hrStaff?.agencyId) return;
    setIsLoading(true);
    try {
      const data = await listInventoryItemsByAgency(db, hrStaff.agencyId);
      setItems(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [hrStaff?.agencyId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, isLoading, error, reload: load };
}
