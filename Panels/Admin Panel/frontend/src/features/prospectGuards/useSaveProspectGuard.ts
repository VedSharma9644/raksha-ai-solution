import { useState, useCallback } from "react";
import { adminFetch } from "@raskha/shared";
import { useAuthContext } from "../authentication";
import type { ProspectGuardFormValues } from "./prospectGuardFormTypes";

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
    yearsOfExperience: values.yearsOfExperience
      ? Number(values.yearsOfExperience)
      : null,
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
    async (
      values: ProspectGuardFormValues,
      existingId?: string
    ): Promise<string | null> => {
      if (!agency) return null;
      setSaving(true);
      setSaveError(null);
      try {
        const path = existingId
          ? `/api/prospect-guards/${existingId}`
          : `/api/prospect-guards`;
        const payload = existingId
          ? toPayload(values)
          : toPayload(values, agency.id);
        const saved = await adminFetch<{ id: string }>(path, {
          method: existingId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
          requireAuth: false,
        });
        return saved.id;
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
        await adminFetch(`/api/prospect-guards/${guardId}`, {
          method: "DELETE",
          requireAuth: false,
        });
        return true;
      } catch {
        return false;
      }
    },
    [agency]
  );

  return { saving, saveError, saveGuard, deleteGuard };
}
