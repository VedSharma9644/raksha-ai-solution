import { useNavigate, useParams } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import {
  EditSiteScreen,
  useEditSite,
  useDeleteSite,
} from "../features/sites";
import type { SiteFormValues } from "../features/sites";
import { useAuthContext } from "../features/authentication";
import {
  useFormBuilderStatus,
  useFormSchema,
  FormBuilderForm,
} from "../features/formBuilder";
import { AppScreenLayout } from "../components/AppScreenLayout";
import { PageHeader } from "../components/PageHeader";

function toFormData(
  values: SiteFormValues
): Record<string, string | File | null> {
  const data: Record<string, string | File | null> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string" || value instanceof File || value === null) {
      data[key] = value;
    } else {
      data[key] = value == null ? "" : String(value);
    }
  }
  return data;
}

export function EditSitePage() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { agency } = useAuthContext();

  const { initialValues, isLoading, isSubmitting, loadError, saveError, saveSite } =
    useEditSite(id);
  const { removeSite, isDeleting, error: deleteError } = useDeleteSite(id);
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(
    agency?.id
  );
  const { fields, isLoading: isSchemaLoading } = useFormSchema(
    isEnabled ? agency?.id : undefined,
    "site"
  );

  function goBack() {
    navigate(APP_ROUTES.siteList);
  }

  if (isStatusLoading || isLoading) {
    return <p style={{ padding: "2rem" }}>Loading site…</p>;
  }

  if (loadError) {
    return <p style={{ padding: "2rem", color: "red" }}>{loadError}</p>;
  }

  if (!initialValues) {
    return null;
  }

  const formError = saveError || deleteError;

  if (!isEnabled) {
    return (
      <>
        {formError ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {formError}
          </p>
        ) : null}
        <EditSiteScreen
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onBack={goBack}
          onCancel={goBack}
          onSubmit={saveSite}
          onDelete={removeSite}
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
          title="Edit Site"
          subtitle="Update site details."
          onBack={goBack}
          backLabel="Back to sites"
        />
        {formError ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {formError}
          </p>
        ) : null}
        <FormBuilderForm
          formType="site"
          fields={fields}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          initialValues={toFormData(initialValues)}
          submitLabel="Update site"
          onCancel={goBack}
          onDelete={removeSite}
          onSubmit={async (data) => {
            const values = {
              ...initialValues,
              ...(data as unknown as SiteFormValues),
            };
            await saveSite(values);
          }}
        />
      </div>
    </AppScreenLayout>
  );
}
