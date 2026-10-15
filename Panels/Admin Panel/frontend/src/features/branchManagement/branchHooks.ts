import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Branch } from "@raskha/branch-management";
import { adminFetch } from "@raskha/shared";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { APP_ROUTES } from "../../app/routePaths";

// ─── useBranchesList ─────────────────────────────────────────────────────────

export function useBranchesList() {
  const { agency } = useAuthContext();
  const { branches, isLoading, reload } = useBranchContext();
  const [error, setError] = useState("");

  // proxy reload from context so consumers can trigger a fresh fetch
  const refreshList = useCallback(async () => {
    setError("");
    try {
      await reload();
    } catch {
      setError("Failed to reload branches.");
    }
  }, [reload]);

  return { branches, isLoading, error, reload: refreshList, agency };
}

// ─── useAddBranch ─────────────────────────────────────────────────────────────

export interface BranchFormValues {
  name: string;
  city: string;
  address: string;
  phone: string;
  managerName: string;
}

export function useAddBranch() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const { reload } = useBranchContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveBranch(values: BranchFormValues) {
    if (!agency) { setError("Not authenticated."); return; }
    setError("");
    setIsSubmitting(true);
    try {
      await adminFetch("/api/branches", {
        method: "POST",
        body: JSON.stringify({
          name: values.name.trim(),
          city: values.city.trim(),
          address: values.address.trim(),
          phone: values.phone.trim(),
          managerName: values.managerName.trim(),
        }),
        requireAuth: false,
      });
      await reload();
      navigate(APP_ROUTES.branchList, { replace: true });
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Failed to save branch.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveBranch, isSubmitting, error };
}

// ─── useEditBranch ────────────────────────────────────────────────────────────

export function useEditBranch(branchId: string) {
  const navigate = useNavigate();
  const { reload } = useBranchContext();
  const { branches } = useBranchContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const branch = branches.find((b) => b.id === branchId) ?? null;

  // also try fetching directly if not in context yet
  const [fetchedBranch, setFetchedBranch] = useState<Branch | null>(null);
  useEffect(() => {
    if (branch) return; // already in context
    void adminFetch<Branch>(`/api/branches/${branchId}`, { requireAuth: false })
      .then((data) => setFetchedBranch(data))
      .catch(() => undefined);
  }, [branchId, branch]);

  const activeBranch = branch ?? fetchedBranch;

  async function saveBranch(values: BranchFormValues & { status?: "active" | "inactive" }) {
    setError("");
    setIsSubmitting(true);
    try {
      await adminFetch(`/api/branches/${branchId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: values.name.trim(),
          city: values.city.trim(),
          address: values.address.trim(),
          phone: values.phone.trim(),
          managerName: values.managerName.trim(),
          status: values.status,
        }),
        requireAuth: false,
      });
      await reload();
      navigate(APP_ROUTES.branchList, { replace: true });
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Failed to save branch.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteBranch() {
    setError("");
    setIsDeleting(true);
    try {
      await adminFetch(`/api/branches/${branchId}`, {
        method: "DELETE",
        requireAuth: false,
      });
      await reload();
      navigate(APP_ROUTES.branchList, { replace: true });
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? "Failed to delete branch.");
    } finally {
      setIsDeleting(false);
    }
  }

  return { branch: activeBranch, saveBranch, deleteBranch, isSubmitting, isDeleting, error };
}
