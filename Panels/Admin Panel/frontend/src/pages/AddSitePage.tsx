import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { SiteFormValues } from "../features/sites";
import { AddSiteScreen } from "../features/sites";

export function AddSitePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: SiteFormValues) {
    setIsSubmitting(true);

    try {
      console.info("Site saved", values);
      navigate(APP_ROUTES.dashboard);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  return (
    <AddSiteScreen
      isSubmitting={isSubmitting}
      onBack={goBack}
      onCancel={goBack}
      onSubmit={handleSubmit}
    />
  );
}
