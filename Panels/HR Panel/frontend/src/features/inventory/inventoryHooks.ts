import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listInventoryItemsByAgency,
} from "@raskha/inventory-management";
import type { InventoryItem } from "@raskha/inventory-management";
import {
  listBranchStockByBranch,
  upsertBranchStock,
} from "@raskha/branch-stock";
import type { BranchStock } from "@raskha/branch-stock";
import { db } from "../../lib/firebase";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import type { BranchInventoryFormValues } from "./inventoryFormTypes";
import { APP_ROUTES } from "../../app/routePaths";

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
    try {
      const [allItems, stocks] = await Promise.all([
        listInventoryItemsByAgency(db, hrStaff.agencyId),
        listBranchStockByBranch(db, hrStaff.agencyId, activeBranchId),
      ]);
      setMasterItems(allItems);

      const stockMap = new Map<string, BranchStock>(stocks.map((s) => [s.itemId, s]));

      const merged: BranchInventoryRow[] = allItems.map((item) => {
        const stock = stockMap.get(item.id);
        const allocated = stock?.allocatedStock ?? 0;
        const assigned  = stock?.assignedStock ?? 0;
        const available = allocated - assigned;
        return {
          id:             stock?.id ?? item.id,
          itemId:         item.id,
          branchStockId:  stock?.id ?? null,
          name:           item.name,
          category:       item.category,
          unit:           item.unit,
          allocatedStock: allocated,
          assignedStock:  assigned,
          availableStock: available,
          thresholdStock: stock?.thresholdStock ?? item.thresholdStock,
          status:         stock?.status ?? "out_of_stock",
          hasBranchStock: !!stock,
        };
      });

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

// ── Set branch stock (add / upsert) ──────────────────────────────────────────

export function useSetBranchStock() {
  const navigate = useNavigate();
  const { hrStaff } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveBranchStock(values: BranchInventoryFormValues) {
    if (!hrStaff?.agencyId || !activeBranchId) {
      setError("No active branch selected.");
      return;
    }
    if (!values.itemId) {
      setError("Please select an item.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await upsertBranchStock(db, {
        agencyId:       hrStaff.agencyId,
        branchId:       activeBranchId,
        itemId:         values.itemId,
        itemName:       values.itemName,
        category:       values.category,
        unit:           values.unit,
        allocatedStock: Number(values.allocatedStock) || 0,
        thresholdStock: Number(values.thresholdStock) || 0,
      });
      navigate(APP_ROUTES.manageInventory, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to save branch stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveBranchStock, isSubmitting, error };
}

// ── Edit branch stock ────────────────────────────────────────────────────────

export function useEditBranchStock(itemId: string) {
  const navigate = useNavigate();
  const { hrStaff } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveBranchStock(values: BranchInventoryFormValues) {
    if (!hrStaff?.agencyId || !activeBranchId) {
      setError("No active branch selected.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await upsertBranchStock(db, {
        agencyId:       hrStaff.agencyId,
        branchId:       activeBranchId,
        itemId:         itemId,
        itemName:       values.itemName,
        category:       values.category,
        unit:           values.unit,
        allocatedStock: Number(values.allocatedStock) || 0,
        thresholdStock: Number(values.thresholdStock) || 0,
      });
      navigate(APP_ROUTES.manageInventory, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to update branch stock. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveBranchStock, isSubmitting, error };
}

// Keep useAddInventoryItem / useEditInventoryItem as thin wrappers so
// existing page components don't need to be renamed.
export const useAddInventoryItem = useSetBranchStock;

export function useEditInventoryItem(itemId: string) {
  const { saveBranchStock, isSubmitting, error } = useEditBranchStock(itemId);
  return {
    saveItem: saveBranchStock,
    isSubmitting,
    error,
  };
}
