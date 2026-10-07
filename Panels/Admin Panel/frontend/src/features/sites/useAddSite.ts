import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addSite } from "@raskha/site-management";
import { useAuthContext } from "../authentication";
import { db } from "../../lib/firebase";
import type { SiteFormValues } from "./siteFormTypes";

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
