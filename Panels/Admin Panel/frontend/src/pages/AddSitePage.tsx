import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddSiteScreen } from "../features/sites";
import { useAddSite } from "../features/sites";
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
    agency?.id,
  );
  const { fields, isLoading: isSchemaLoading, isSaving, saveFields } =
    useFormSchema(agency?.id, "site");

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  if (isStatusLoading || isSchemaLoading) {
    return null;
  }

  // ── Form Builder mode ─────────────────────────────────────────────────────
  if (isEnabled) {
    return (
      <AppScreenLayout>
        <div className="app-screen-layout__content">
          <PageHeader
            title="Add Site"
            subtitle="Custom form — edit fields above, then fill in site details below."
            onBack={goBack}
            backLabel="Back to dashboard"
          />
          {error && (
            <p role="alert" style={{ color: "red", padding: "1rem" }}>
              {error}
            </p>
          )}
          <FormBuilderForm
            formType="site"
            fields={fields}
            isSaving={isSaving}
            isSubmitting={isSubmitting}
            onSaveLayout={saveFields}
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

  // ── Default form mode ─────────────────────────────────────────────────────
  return (
    <AddSiteScreen
      isSubmitting={isSubmitting}
      onBack={goBack}
      onCancel={goBack}
      onSubmit={saveSite}
    />
  );
}
