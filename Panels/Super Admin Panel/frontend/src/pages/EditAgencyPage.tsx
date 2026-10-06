import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddAgencyScreen, useEditAgency } from "../features/agencies";

export function EditAgencyPage() {
  const navigate = useNavigate();
  const { agencyId = "" } = useParams();
  const {
    initialValues,
    isLoading,
    isSubmitting,
    loadError,
    saveError,
    saveAgency,
  } = useEditAgency(agencyId);

  function goBack() {
    navigate(APP_ROUTES.agencyList);
  }

  if (isLoading) {
    return (
      <AddAgencyScreen
        isSubmitting
        requirePassword={false}
        title="Edit Agency"
        subtitle="Loading agency…"
        onBack={goBack}
        onCancel={goBack}
        onSubmit={async () => undefined}
      />
    );
  }

  if (loadError || !initialValues) {
    return (
      <AddAgencyScreen
        requirePassword={false}
        title="Edit Agency"
        subtitle={loadError || "Agency not found."}
        formError={loadError}
        onBack={goBack}
        onCancel={goBack}
        onSubmit={async () => undefined}
      />
    );
  }

  return (
    <AddAgencyScreen
      key={agencyId}
      isSubmitting={isSubmitting}
      requirePassword={false}
      initialValues={initialValues}
      submitLabel="Update Agency"
      formError={saveError}
      title="Edit Agency"
      subtitle="Update company details, plan, or login password."
      onBack={goBack}
      onCancel={goBack}
      onSubmit={saveAgency}
    />
  );
}
