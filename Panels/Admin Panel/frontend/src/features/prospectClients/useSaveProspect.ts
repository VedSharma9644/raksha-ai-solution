import { useState } from "react";
import type { ProspectClient } from "@raskha/client-management";
import { adminFetch } from "@raskha/shared";
import type { ProspectFormValues } from "./prospectFormTypes";
import { useBranchContext } from "../branches";

async function apiRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  return adminFetch<T>(path, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    requireAuth: false,
  });
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
    referralName:
      values.leadSource === "referral" ? values.referralName.trim() : "",
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
  const { activeBranchId } = useBranchContext();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function createProspect(values: ProspectFormValues): Promise<ProspectClient | null> {
    setIsSaving(true);
    setSaveError("");
    try {
      return await apiRequest<ProspectClient>("POST", "/api/prospects", {
        ...formToPayload(values),
        branchId: activeBranchId ?? null,
      });
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
