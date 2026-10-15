import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SiteShiftConfig, SiteShift } from "@raskha/site-management";
import { adminFetch } from "@raskha/shared";
import { useAuthContext } from "../authentication";
import { useBranchContext } from "../branches";
import type { SiteFormValues } from "./siteFormTypes";

function buildShiftConfig(values: SiteFormValues): SiteShiftConfig | null {
  const shifts: SiteShift[] = values.shifts.map((s) => {
    const male   = parseInt(s.requiredMale,   10) || 0;
    const female = parseInt(s.requiredFemale, 10) || 0;
    const other  = parseInt(s.requiredOther,  10) || 0;
    const total  = male + female + other || parseInt(s.requiredGuards, 10) || 1;
    return {
      id: s.id,
      label: s.label.trim(),
      shiftType: s.shiftType,
      startTime: s.startTime,
      endTime: s.endTime,
      requiredGuards: total,
      genderRequirements: { male, female, other },
    };
  });

  if (!values.has24hSurveillance && shifts.length === 0) return null;

  return {
    has24hSurveillance: values.has24hSurveillance,
    shifts,
  };
}

export function useAddSite() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const { activeBranchId } = useBranchContext();
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

      await adminFetch("/api/sites", {
        method: "POST",
        body: JSON.stringify({
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
          latitude: values.latitude ? parseFloat(values.latitude) : null,
          longitude: values.longitude ? parseFloat(values.longitude) : null,
          intervalCheckinMinutes: intervalMin,
          shiftConfig: buildShiftConfig(values),
          branchId: values.branchId || activeBranchId || null,
          clientRateMaleMonthly:
            Number(String(values.clientRateMaleMonthly).replace(/[^\d.]/g, "")) ||
            0,
          clientRateFemaleMonthly:
            Number(
              String(values.clientRateFemaleMonthly).replace(/[^\d.]/g, "")
            ) || 0,
        }),
        requireAuth: false,
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
