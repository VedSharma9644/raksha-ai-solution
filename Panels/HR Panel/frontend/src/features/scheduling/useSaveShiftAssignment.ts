import { useState } from "react";
import type { SaveGuardShiftAssignmentParams, GuardShiftAssignment } from "@raskha/scheduling";
import { auth } from "../../lib/firebase";

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
  const headers = new Headers({ "Content-Type": "application/json" });
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  }
  return data;
}

export function useSaveShiftAssignment() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function createAssignment(
    params: Omit<SaveGuardShiftAssignmentParams, "agencyId">
  ): Promise<GuardShiftAssignment | null> {
    setIsSaving(true);
    setSaveError("");
    try {
      const result = await apiRequest<GuardShiftAssignment>("POST", "/api/scheduling", params);
      return result;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to save assignment.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateAssignment(
    assignmentId: string,
    params: Partial<Omit<SaveGuardShiftAssignmentParams, "agencyId" | "siteId" | "guardId">>
  ): Promise<void> {
    setIsSaving(true);
    setSaveError("");
    try {
      await apiRequest("PATCH", `/api/scheduling/${assignmentId}`, params);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to update assignment.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAssignment(assignmentId: string): Promise<void> {
    setIsSaving(true);
    setSaveError("");
    try {
      await apiRequest("DELETE", `/api/scheduling/${assignmentId}`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to delete assignment.");
    } finally {
      setIsSaving(false);
    }
  }

  return { isSaving, saveError, createAssignment, updateAssignment, removeAssignment };
}
