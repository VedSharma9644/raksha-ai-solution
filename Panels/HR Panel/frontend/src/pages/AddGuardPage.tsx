import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddGuardScreen, useAddGuard } from "../features/guards";
import type { GuardFormValues } from "../features/guards";
import { useAuthContext } from "../features/authentication";
import {
  useFormBuilderStatus,
  useFormSchema,
  FormBuilderForm,
} from "../features/formBuilder";
import { AppScreenLayout } from "../components/AppScreenLayout";
import { PageHeader } from "../components/PageHeader";

export function AddGuardPage() {
  const navigate = useNavigate();
  const { hrStaff } = useAuthContext();
  const { saveGuard, isSubmitting, error } = useAddGuard();
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(
    hrStaff?.agencyId
  );
  const { fields, isLoading: isSchemaLoading } = useFormSchema(
    isEnabled ? hrStaff?.agencyId : undefined,
    "guard"
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
          <p
            style={{
              color: "var(--color-error, #dc2626)",
              padding: "0.75rem 1rem",
              background: "#fef2f2",
              borderRadius: "0.375rem",
              margin: "1rem",
            }}
          >
            {error}
          </p>
        ) : null}
        <AddGuardScreen
          isSubmitting={isSubmitting}
          onBack={goBack}
          onCancel={goBack}
          onSubmit={saveGuard}
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
          title="Add Guard"
          subtitle="Complete the custom form set by your agency admin."
          onBack={goBack}
          backLabel="Back to dashboard"
        />
        {error ? (
          <p
            style={{
              color: "var(--color-error, #dc2626)",
              padding: "0.75rem 1rem",
              background: "#fef2f2",
              borderRadius: "0.375rem",
              margin: "0 0 1rem",
            }}
          >
            {error}
          </p>
        ) : null}
        <FormBuilderForm
          formType="guard"
          fields={fields}
          isSubmitting={isSubmitting}
          onCancel={goBack}
          onSubmit={async (data) => {
            const values = data as unknown as GuardFormValues;
            values.characterCertificateFile =
              (data["characterCertificateFile"] as File | null) ?? null;
            values.policeVerificationFile =
              (data["policeVerificationFile"] as File | null) ?? null;
            await saveGuard(values);
          }}
        />
      </div>
    </AppScreenLayout>
  );
}
