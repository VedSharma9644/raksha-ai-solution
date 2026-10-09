import { useState, useCallback } from "react";
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveGuard = useCallback(
    async (values: ProspectGuardFormValues, existingId?: string): Promise<string | null> => {
      const user = auth.currentUser;
      if (!user) return null;
      setSaving(true);
      setSaveError(null);
      try {
        const token = await user.getIdToken();
        const method = existingId ? "PATCH" : "POST";
        const url = existingId
          ? `${API_BASE}/api/prospect-guards/${existingId}`
          : `${API_BASE}/api/prospect-guards`;
        const payload = existingId
          ? toPayload(values)
          : toPayload(values, user.uid);

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    []
  );

  const deleteGuard = useCallback(
    async (guardId: string): Promise<boolean> => {
      const user = auth.currentUser;
      if (!user) return false;
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE}/api/prospect-guards/${guardId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.ok;
      } catch {
        return false;
      }
    },
    []
  );

  return { saving, saveError, saveGuard, deleteGuard };
}
