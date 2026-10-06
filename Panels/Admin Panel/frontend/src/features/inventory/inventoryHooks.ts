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
import { db } from "../../lib/firebase";
import { useAuthContext } from "../authentication";
import type { InventoryItemFormValues } from "./inventoryFormTypes";
import { APP_ROUTES } from "../../app/routePaths";

export function useInventoryList() {
  const { agency } = useAuthContext();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!agency) return;
    setIsLoading(true);
    try {
      const data = await listInventoryItemsByAgency(db, agency.id);
      setItems(data);
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

/** Navigate to the inventory list */
export function useNavigateToInventory() {
  const navigate = useNavigate();
  return () => navigate(APP_ROUTES.inventoryList);
}
