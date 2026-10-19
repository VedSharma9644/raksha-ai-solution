import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listInventoryItemsByAgency,
  seedDefaultInventoryItems,
  deleteInventoryItem,
  updateInventoryItem,
  addInventoryItem,
} from "@raskha/inventory-management";
import type { InventoryItem } from "@raskha/inventory-management";
import type { BranchStock } from "@raskha/branch-stock";
import { adminFetch } from "@raskha/shared";
import { db } from "../../lib/firebase";
import { useAuthContext } from "../authentication";
import type { InventoryItemFormValues } from "./inventoryFormTypes";
import { APP_ROUTES } from "../../app/routePaths";

/** Master catalog row enriched with branch distribution totals. */
export interface InventoryCatalogRow extends InventoryItem {
  /** Sum of allocatedStock across all branches */
  allocatedToBranches: number;
  /** Sum of assignedStock across all branches */
  assignedToGuards: number;
  /** totalStock − allocatedToBranches (still free to distribute) */
  unallocated: number;
}

// ── List (admin, agency-wide master items + branch totals) ───────────────────

export function useInventoryList() {
  const { agency } = useAuthContext();
  const [items, setItems] = useState<InventoryCatalogRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!agency) return;
    setIsLoading(true);
    try {
      const [master, stocks] = await Promise.all([
        listInventoryItemsByAgency(db, agency.id),
        adminFetch<BranchStock[]>("/api/branch-stock").catch(() => [] as BranchStock[]),
      ]);

      const byItem = new Map<string, { allocated: number; assigned: number }>();
      for (const s of stocks) {
        const cur = byItem.get(s.itemId) ?? { allocated: 0, assigned: 0 };
        cur.allocated += Number(s.allocatedStock ?? 0);
        cur.assigned += Number(s.assignedStock ?? 0);
        byItem.set(s.itemId, cur);
      }

      setItems(
        master.map((item) => {
          const totals = byItem.get(item.id) ?? { allocated: 0, assigned: 0 };
          return {
            ...item,
            allocatedToBranches: totals.allocated,
            assignedToGuards: totals.assigned,
            unallocated: Math.max(0, item.totalStock - totals.allocated),
          };
        })
      );
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [agency]);

  useEffect(() => {
    void load();
  }, [load]);

  async function seedDefaults() {
    if (!agency) return;
    setIsSeeding(true);
    try {
      await seedDefaultInventoryItems(db, agency.id);
      await load();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to seed default items.");
    } finally {
      setIsSeeding(false);
    }
  }

  return { items, isLoading, isSeeding, error, reload: load, seedDefaults };
}

// ── Add (admin creates master item, no branchId) ─────────────────────────────

export function useAddInventoryItem() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveItem(values: InventoryItemFormValues) {
    if (!agency) {
      setError("Not authenticated.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await addInventoryItem(db, {
        agencyId: agency.id,
        name: values.name,
        category: values.category,
        unit: values.unit,
        totalStock: Number(values.totalStock) || 0,
        thresholdStock: Number(values.thresholdStock) || 0,
        notes: values.notes,
        branchId: null,   // items are agency-wide
      });
      navigate(APP_ROUTES.inventoryList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveItem, isSubmitting, error };
}

// ── Edit ─────────────────────────────────────────────────────────────────────

export function useEditInventoryItem(itemId: string) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function saveItem(values: InventoryItemFormValues) {
    setError("");
    setIsSubmitting(true);
    try {
      await updateInventoryItem(db, itemId, {
        name: values.name,
        category: values.category,
        unit: values.unit,
        totalStock: Number(values.totalStock) || 0,
        thresholdStock: Number(values.thresholdStock) || 0,
        notes: values.notes,
      });
      navigate(APP_ROUTES.inventoryList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to update item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteItem() {
    setError("");
    setIsDeleting(true);
    try {
      await deleteInventoryItem(db, itemId);
      navigate(APP_ROUTES.inventoryList, { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return { saveItem, deleteItem, isSubmitting, isDeleting, error };
}

export function useInventoryItemDetail(itemId: string) {
  const { items, isLoading, error } = useInventoryList();
  const item = items.find((i) => i.id === itemId) ?? null;
  return { item, isLoading, error };
}

export function useNavigateToInventory() {
  const navigate = useNavigate();
  return () => navigate(APP_ROUTES.inventoryList);
}

// ── Branch stock hooks (admin: per-branch distribution) ──────────────────────

export function useBranchStockByItem(itemId: string) {
  const { agency } = useAuthContext();
  const [branchStocks, setBranchStocks] = useState<BranchStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!agency || !itemId) return;
    setIsLoading(true);
    setError("");
    try {
      // Backend uses Admin SDK — avoids client Firestore permission issues
      const data = await adminFetch<BranchStock[]>(
        `/api/branch-stock/by-item/${encodeURIComponent(itemId)}`
      );
      setBranchStocks(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load branch stock.");
    } finally {
      setIsLoading(false);
    }
  }, [agency, itemId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { branchStocks, isLoading, error, reload: load };
}

export function useBranchStockByAgency() {
  const { agency } = useAuthContext();
  const [branchStocks, setBranchStocks] = useState<BranchStock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!agency) return;
    setIsLoading(true);
    try {
      const data = await adminFetch<BranchStock[]>("/api/branch-stock");
      setBranchStocks(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load agency branch stock.");
    } finally {
      setIsLoading(false);
    }
  }, [agency]);

  useEffect(() => {
    void load();
  }, [load]);

  return { branchStocks, isLoading, error, reload: load };
}

// ── Admin: allocate stock to a specific branch ────────────────────────────────

export interface AllocateToBranchParams {
  branchId: string;
  itemId: string;
  itemName: string;
  category: string;
  unit: string;
  allocatedStock: number;
  thresholdStock: number;
}

export function useAllocateToBranch(onSuccess?: () => void) {
  const { agency } = useAuthContext();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function allocate(params: AllocateToBranchParams): Promise<boolean> {
    if (!agency) { setError("Not authenticated."); return false; }
    setError("");
    setIsSaving(true);
    try {
      // Backend uses Admin SDK — bypasses client Firestore security rules
      await adminFetch("/api/branch-stock/allocate", {
        method: "PUT",
        body: JSON.stringify({
          branchId:       params.branchId,
          itemId:         params.itemId,
          itemName:       params.itemName,
          category:       params.category,
          unit:           params.unit,
          allocatedStock: params.allocatedStock,
          thresholdStock: params.thresholdStock,
        }),
      });
      onSuccess?.();
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to allocate stock.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  function clearError() { setError(""); }

  return { allocate, isSaving, error, clearError };
}
