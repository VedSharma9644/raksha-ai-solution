import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddSiteScreen, useAddSite } from "../features/sites";
import type { SiteFormValues } from "../features/sites";
import { useAuthContext } from "../features/authentication";
import {
  useFormBuilderStatus,
  useFormSchema,
  FormBuilderForm,
} from "../features/formBuilder";
import { AppScreenLayout } from "../components/AppScreenLayout";
import { PageHeader } from "../components/PageHeader";

export function AddSitePage() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const { saveSite, isSubmitting, error } = useAddSite();
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(
    agency?.id
  );
  const { fields, isLoading: isSchemaLoading } = useFormSchema(
    isEnabled ? agency?.id : undefined,
    "site"
  );

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  if (isStatusLoading) {
    return null;
  }

  if (!isEnabled) {
    return (
      <>
        {error ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {error}
          </p>
        ) : null}
        <AddSiteScreen
          isSubmitting={isSubmitting}
          onBack={goBack}
          onCancel={goBack}
          onSubmit={saveSite}
        />
      </>
    );
  }

  if (isSchemaLoading) {
    return null;
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content">
        <PageHeader
          title="Add Site"
          subtitle="Fill in the custom form for this agency."
          onBack={goBack}
          backLabel="Back to dashboard"
        />
        {error ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {error}
          </p>
        ) : null}
        <FormBuilderForm
          formType="site"
          fields={fields}
          isSubmitting={isSubmitting}
          onCancel={goBack}
          onSubmit={async (data) => {
            const values = data as unknown as SiteFormValues;
            await saveSite(values);
          }}
        />
      </div>
    </AppScreenLayout>
  );
}
