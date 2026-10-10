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
import {
  listBranchStockByAgency,
  listBranchStockByItem,
  upsertBranchStock,
} from "@raskha/branch-stock";
import type { BranchStock } from "@raskha/branch-stock";
import { db } from "../../lib/firebase";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import type { InventoryItemFormValues } from "./inventoryFormTypes";
import { APP_ROUTES } from "../../app/routePaths";

// ── List (admin, agency-wide master items) ───────────────────────────────────

export function useInventoryList() {
  const { agency } = useAuthContext();
  const { activeBranchId } = useBranchContext();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!agency) return;
    setIsLoading(true);
    try {
      const data = await listInventoryItemsByAgency(db, agency.id);
      // Items are now agency-wide; activeBranchId is unused for master list
      setItems(activeBranchId ? data : data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, [agency, activeBranchId]);

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
    try {
      const data = await listBranchStockByItem(db, agency.id, itemId);
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
      const data = await listBranchStockByAgency(db, agency.id);
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

  async function allocate(params: AllocateToBranchParams) {
    if (!agency) { setError("Not authenticated."); return; }
    setError("");
    setIsSaving(true);
    try {
      await upsertBranchStock(db, {
        agencyId:       agency.id,
        branchId:       params.branchId,
        itemId:         params.itemId,
        itemName:       params.itemName,
        category:       params.category,
        unit:           params.unit,
        allocatedStock: params.allocatedStock,
        thresholdStock: params.thresholdStock,
      });
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to allocate stock.");
    } finally {
      setIsSaving(false);
    }
  }

  function clearError() { setError(""); }

  return { allocate, isSaving, error, clearError };
}
