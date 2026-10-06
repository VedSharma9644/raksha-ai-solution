import { APP_ROUTES } from "../app/routePaths";
import type { AgencyFormValues } from "../features/agencies";
import { AddAgencyScreen, useAddAgency } from "../features/agencies";
import { useNavigate } from "react-router-dom";

export function AddAgencyPage() {
  const navigate = useNavigate();
  const { saveAgency, isSubmitting, error } = useAddAgency();

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  return (
    <AddAgencyScreen
      isSubmitting={isSubmitting}
      formError={error}
      onBack={goBack}
      onCancel={goBack}
      onSubmit={(values: AgencyFormValues) => saveAgency(values)}
    />
  );
}
