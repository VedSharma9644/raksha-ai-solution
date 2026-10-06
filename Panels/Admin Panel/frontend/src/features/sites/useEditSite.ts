import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSiteById, updateSite } from "@raskha/site-management";
import type { Site } from "@raskha/site-management";
import { db } from "../../lib/firebase";
import type { SiteFormValues } from "./siteFormTypes";

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
        notes: site.notes ?? "",
      }
    : undefined;

  return { site, initialValues, isLoading, isSubmitting, loadError, saveError, saveSite };
}
