import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSiteById, updateSite } from "@raskha/site-management";
import type { Site, SiteShiftConfig, SiteShift } from "@raskha/site-management";
import { db } from "../../lib/firebase";
import type { SiteFormValues, SiteShiftRowValues } from "./siteFormTypes";

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

export function useEditSite(siteId: string) {
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!siteId) return;

    setIsLoading(true);
    setLoadError("");

    getSiteById(db, siteId)
      .then((data) => {
        if (!data) setLoadError("Site not found.");
        else setSite(data);
      })
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setLoadError(e.message ?? "Failed to load site.");
      })
      .finally(() => setIsLoading(false));
  }, [siteId]);

  async function saveSite(values: SiteFormValues) {
    setSaveError("");
    setIsSubmitting(true);

    try {
      const intervalMin = values.intervalCheckinMinutes
        ? parseInt(values.intervalCheckinMinutes, 10) || null
        : null;

      await updateSite(db, siteId, {
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
      setSaveError(e.message ?? "Failed to update site. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const initialValues: SiteFormValues | undefined = site
    ? {
        siteName: site.siteName,
        siteType: site.siteType ?? "",
        clientName: site.clientName,
        address: site.address,
        city: site.city,
        managerName: site.managerName ?? "",
        managerContact: site.managerContact ?? "",
        hrName: site.hrName ?? "",
        hrContact: site.hrContact ?? "",
        siteSupervisor: site.siteSupervisor ?? "",
        contactPerson: site.contactPerson ?? "",
        contactPhone: site.contactPhone ?? "",
        latitude: site.latitude != null ? String(site.latitude) : "",
        longitude: site.longitude != null ? String(site.longitude) : "",
        notes: site.notes ?? "",
        has24hSurveillance: site.shiftConfig?.has24hSurveillance ?? false,
        intervalCheckinMinutes:
          site.intervalCheckinMinutes != null
            ? String(site.intervalCheckinMinutes)
            : "",
        shifts: (site.shiftConfig?.shifts ?? []).map(
          (s): SiteShiftRowValues => ({
            id: s.id,
            label: s.label,
            shiftType: s.shiftType,
            startTime: s.startTime,
            endTime: s.endTime,
            requiredGuards: String(s.requiredGuards),
          })
        ),
      }
    : undefined;

  return { site, initialValues, isLoading, isSubmitting, loadError, saveError, saveSite };
}
