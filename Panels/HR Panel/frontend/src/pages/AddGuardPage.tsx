import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { GuardFormValues } from "../features/guards";
import { AddGuardScreen } from "../features/guards";

export function AddGuardPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: GuardFormValues) {
    setIsSubmitting(true);
    try {
      console.info("HR guard saved", values);
      navigate(APP_ROUTES.dashboard);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  return (
    <AddGuardScreen
      isSubmitting={isSubmitting}
      onBack={goBack}
      onCancel={goBack}
      onSubmit={handleSubmit}
    />
  );
}
