import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Branch } from "@raskha/branch-management";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import { auth } from "../../lib/firebase";
import { APP_ROUTES } from "../../app/routePaths";

function resolveAdminApiBase(): string {
  const fromEnv = import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    if (import.meta.env.VITE_ADMIN_API_FORCE_REMOTE !== "true") {
      return "http://localhost:3001";
    }
  }
  return fromEnv || "http://localhost:3001";
}

const API_BASE = resolveAdminApiBase();

async function authHeaders(): Promise<Headers> {
  const h = new Headers({ "Content-Type": "application/json" });
  const user = auth.currentUser;
  if (user) h.set("Authorization", `Bearer ${await user.getIdToken()}`);
  return h;
}

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
      const res = await fetch(`${API_BASE}/api/branches`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify({
          name: values.name.trim(),
          city: values.city.trim(),
          address: values.address.trim(),
          phone: values.phone.trim(),
          managerName: values.managerName.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to create branch.");
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
    auth.currentUser?.getIdToken().then(async (token) => {
      const res = await fetch(`${API_BASE}/api/branches/${branchId}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) setFetchedBranch(await res.json() as Branch);
    }).catch(() => undefined);
  }, [branchId, branch]);

  const activeBranch = branch ?? fetchedBranch;

  async function saveBranch(values: BranchFormValues & { status?: "active" | "inactive" }) {
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/branches/${branchId}`, {
        method: "PUT",
        headers: await authHeaders(),
        body: JSON.stringify({
          name: values.name.trim(),
          city: values.city.trim(),
          address: values.address.trim(),
          phone: values.phone.trim(),
          managerName: values.managerName.trim(),
          status: values.status,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to update branch.");
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
      const res = await fetch(`${API_BASE}/api/branches/${branchId}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to delete branch.");
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
