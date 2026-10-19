import { useCallback, useEffect, useState } from "react";
import type { InventoryItem } from "@raskha/inventory-management";
import type { BranchStock } from "@raskha/branch-stock";
import { adminFetch } from "@raskha/shared";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";

// ── Unified display type ─────────────────────────────────────────────────────

export interface BranchInventoryRow {
  id: string;               // branchStockId (or itemId as fallback)
  itemId: string;
  branchStockId: string | null;
  name: string;
  category: string;
  unit: string;
  allocatedStock: number;
  assignedStock: number;
  availableStock: number;
  thresholdStock: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  hasBranchStock: boolean;
}

// ── List branch inventory (branchStock + master items fallback) ──────────────

export function useInventoryList() {
  const { hrStaff } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [rows, setRows] = useState<BranchInventoryRow[]>([]);
  const [masterItems, setMasterItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!hrStaff?.agencyId || !activeBranchId) {
      setRows([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // Backend Admin SDK — avoids client Firestore permission issues
      const stocks = await adminFetch<BranchStock[]>(
        `/api/branch-stock/by-branch/${encodeURIComponent(activeBranchId)}`
      );

      const merged: BranchInventoryRow[] = stocks.map((stock) => {
        const allocated = stock.allocatedStock ?? 0;
        const assigned = stock.assignedStock ?? 0;
        const available = allocated - assigned;
        return {
          id: stock.id,
          itemId: stock.itemId,
          branchStockId: stock.id,
          name: stock.itemName,
          category: stock.category,
          unit: stock.unit,
          allocatedStock: allocated,
          assignedStock: assigned,
          availableStock: available,
          thresholdStock: stock.thresholdStock,
          status: stock.status ?? "out_of_stock",
          hasBranchStock: true,
        };
      });

      setMasterItems(
        stocks.map(
          (s) =>
            ({
              id: s.itemId,
              name: s.itemName,
              category: s.category,
              unit: s.unit,
            }) as InventoryItem
        )
      );
      setRows(merged);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [hrStaff?.agencyId, activeBranchId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, masterItems, isLoading, error, reload: load };
}

/**
 * HR no longer allocates stock — Admin owns distribute-to-branch.
 * These stubs keep old page imports from breaking while routes redirect away.
 */
export function useSetBranchStock() {
  return {
    saveBranchStock: async () => {
      throw new Error("Only agency admins can allocate stock to branches.");
    },
    isSubmitting: false,
    error: "Only agency admins can allocate stock to branches.",
  };
}

export function useEditBranchStock(_itemId: string) {
  return useSetBranchStock();
}

export const useAddInventoryItem = useSetBranchStock;

export function useEditInventoryItem(_itemId: string) {
  const { saveBranchStock, isSubmitting, error } = useSetBranchStock();
  return { saveItem: saveBranchStock, isSubmitting, error };
}
