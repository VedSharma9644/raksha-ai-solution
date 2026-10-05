import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import type { StaffMemberFormValues } from "../features/staff";
import { AddStaffMemberScreen } from "../features/staff";

export function AddHrPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: StaffMemberFormValues) {
    setIsSubmitting(true);

    try {
      console.info("HR user saved", values);
      navigate(APP_ROUTES.dashboard);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  return (
    <AddStaffMemberScreen
      role="hr"
      isSubmitting={isSubmitting}
      onBack={goBack}
      onCancel={goBack}
      onSubmit={handleSubmit}
    />
  );
}
