import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSiteById } from "@raskha/site-management";
import type { Site, SiteShiftConfig, SiteShift } from "@raskha/site-management";
import { db, auth } from "../../lib/firebase";
import type { SiteFormValues, SiteShiftRowValues } from "./siteFormTypes";

const ADMIN_BACKEND_URL =
  (import.meta.env.VITE_ADMIN_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:3001";

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

      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${ADMIN_BACKEND_URL}/api/sites/${siteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
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
          branchId: values.branchId || null,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to update site.");
      }

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
        branchId: site.branchId ?? "",
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
            requiredMale:   String(s.genderRequirements?.male   ?? s.requiredGuards),
            requiredFemale: String(s.genderRequirements?.female ?? 0),
            requiredOther:  String(s.genderRequirements?.other  ?? 0),
          })
        ),
      }
    : undefined;

  return { site, initialValues, isLoading, isSubmitting, loadError, saveError, saveSite };
}
