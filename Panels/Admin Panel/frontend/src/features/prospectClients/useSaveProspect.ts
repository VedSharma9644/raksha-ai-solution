import { useState } from "react";
import type { ProspectClient } from "@raskha/client-management";
import type { ProspectFormValues } from "./prospectFormTypes";
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

async function apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
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

/** Convert form values to the API payload shape */
function formToPayload(values: ProspectFormValues) {
  return {
    orgName: values.orgName.trim(),
    city: values.city.trim(),
    expectedSiteType: values.expectedSiteType,
    expectedGuardCount: values.expectedGuardCount ? Number(values.expectedGuardCount) : null,
    expectedMonthlyValue: values.expectedMonthlyValue.trim(),
    leadSource: values.leadSource,
    contactName: values.contactName.trim(),
    contactDesignation: values.contactDesignation.trim(),
    primaryPhone: values.primaryPhone.trim(),
    alternatePhone: values.alternatePhone.trim(),
    email: values.email.trim(),
    status: values.status,
    followUpDate: values.followUpDate || null,
  };
}

export function useSaveProspect() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function createProspect(values: ProspectFormValues): Promise<ProspectClient | null> {
    setIsSaving(true);
    setSaveError("");
    try {
      return await apiRequest<ProspectClient>("POST", "/api/prospects", formToPayload(values));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to create prospect.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateProspect(
    prospectId: string,
    values: Partial<ProspectFormValues>
  ): Promise<ProspectClient | null> {
    setIsSaving(true);
    setSaveError("");
    try {
      const payload = formToPayload({ ...values } as ProspectFormValues);
      return await apiRequest<ProspectClient>("PATCH", `/api/prospects/${prospectId}`, payload);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to update prospect.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStatus(prospectId: string, status: string): Promise<boolean> {
    setIsSaving(true);
    setSaveError("");
    try {
      await apiRequest("PATCH", `/api/prospects/${prospectId}`, { status });
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to update status.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProspect(prospectId: string): Promise<boolean> {
    setIsSaving(true);
    setSaveError("");
    try {
      await apiRequest("DELETE", `/api/prospects/${prospectId}`);
      return true;
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSaveError(e.message ?? "Failed to delete prospect.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return { isSaving, saveError, createProspect, updateProspect, updateStatus, deleteProspect };
}
