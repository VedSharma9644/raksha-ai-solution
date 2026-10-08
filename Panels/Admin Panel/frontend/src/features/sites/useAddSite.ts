import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSite } from "@raskha/site-management";
import type { SiteShiftConfig, SiteShift } from "@raskha/site-management";
import { useAuthContext } from "../authentication";
import { db } from "../../lib/firebase";
import type { SiteFormValues } from "./siteFormTypes";

function buildShiftConfig(values: SiteFormValues): SiteShiftConfig | null {
  const shifts: SiteShift[] = values.shifts.map((s) => ({
    id: s.id,
    label: s.label.trim(),
    shiftType: s.shiftType,
    startTime: s.startTime,
    endTime: s.endTime,
    requiredGuards: parseInt(s.requiredGuards, 10) || 1,
  }));

  if (!values.has24hSurveillance && shifts.length === 0) return null;

  return {
    has24hSurveillance: values.has24hSurveillance,
    shifts,
  };
}

export function useAddSite() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveSite(values: SiteFormValues) {
    if (!agency) {
      setError("Not authenticated.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const intervalMin = values.intervalCheckinMinutes
        ? parseInt(values.intervalCheckinMinutes, 10) || null
        : null;

      await addSite(db, {
        agencyId: agency.id,
        siteName: values.siteName,
        siteType: values.siteType,
        clientName: values.clientName,
        address: values.address,
        city: values.city,
        managerName: values.managerName,
        managerContact: values.managerContact,
        hrName: values.hrName,
        hrContact: values.hrContact,
        siteSupervisor: values.siteSupervisor,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,
        notes: values.notes,
        latitude: values.latitude ? parseFloat(values.latitude) : undefined,
        longitude: values.longitude ? parseFloat(values.longitude) : undefined,
        intervalCheckinMinutes: intervalMin,
        shiftConfig: buildShiftConfig(values),
      });
      navigate("/sites", { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? "Failed to save site. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveSite, isSubmitting, error };
}
