import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { AgencyFormValues } from "../features/agencies";
import { AddAgencyScreen } from "../features/agencies";

export function AddAgencyPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: AgencyFormValues) {
    setIsSubmitting(true);
    try {
      console.info("Agency saved", values);
      navigate(APP_ROUTES.dashboard);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  return (
    <AddAgencyScreen
      isSubmitting={isSubmitting}
      onBack={goBack}
      onCancel={goBack}
      onSubmit={handleSubmit}
    />
  );
}
