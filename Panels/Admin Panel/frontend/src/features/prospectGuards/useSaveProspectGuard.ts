import { useState, useCallback } from "react";
import { useAuthContext } from "../authentication";
import { auth } from "../../lib/firebase";
import type { ProspectGuardFormValues } from "./prospectGuardFormTypes";

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

function toPayload(values: ProspectGuardFormValues, agencyId?: string) {
  return {
    ...(agencyId ? { agencyId } : {}),
    fullName: values.fullName.trim(),
    dateOfBirth: values.dateOfBirth || null,
    gender: values.gender,
    city: values.city.trim(),
    phone: values.phone.trim(),
    alternatePhone: values.alternatePhone.trim(),
    email: values.email.trim(),
    aadhaarNumber: values.aadhaarNumber.trim(),
    panNumber: values.panNumber.trim(),
    yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : null,
    previousEmployer: values.previousEmployer.trim(),
    height: values.height.trim(),
    weight: values.weight.trim(),
    physicalFitness: values.physicalFitness,
    interviewDate: values.interviewDate || null,
    interviewerName: values.interviewerName.trim(),
    applicationSource: values.applicationSource,
    status: values.status,
    followUpDate: values.followUpDate || null,
  };
}

export function useSaveProspectGuard() {
  const { agency } = useAuthContext();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveGuard = useCallback(
    async (values: ProspectGuardFormValues, existingId?: string): Promise<string | null> => {
      if (!agency) return null;
      setSaving(true);
      setSaveError(null);
      try {
        const method = existingId ? "PATCH" : "POST";
        const url = existingId
          ? `${API_BASE}/api/prospect-guards/${existingId}`
          : `${API_BASE}/api/prospect-guards`;
        const payload = existingId
          ? toPayload(values)
          : toPayload(values, auth.currentUser?.uid);

        const headers = await authHeaders();
        const res = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Save failed (${res.status})`);
        }
        const saved = await res.json();
        return saved.id as string;
      } catch (err: unknown) {
        setSaveError((err as { message?: string }).message ?? "Unknown error");
        return null;
      } finally {
        setSaving(false);
      }
    },
    [agency]
  );

  const deleteGuard = useCallback(
    async (guardId: string): Promise<boolean> => {
      if (!agency) return false;
      try {
        const headers = await authHeaders();
        const res = await fetch(`${API_BASE}/api/prospect-guards/${guardId}`, {
          method: "DELETE",
          headers,
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    [agency]
  );

  return { saving, saveError, saveGuard, deleteGuard };
}
