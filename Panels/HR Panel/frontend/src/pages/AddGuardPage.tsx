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
    hrStaff?.agencyId,
  );
  const { fields, isLoading: isSchemaLoading, isSaving, saveFields } =
    useFormSchema(hrStaff?.agencyId, "guard");

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
            title="Add Guard"
            subtitle="Custom form — edit fields above, then fill in guard details below."
            onBack={goBack}
            backLabel="Back to dashboard"
          />
          {error && (
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
          )}
          <FormBuilderForm
            formType="guard"
            fields={fields}
            isSaving={isSaving}
            isSubmitting={isSubmitting}
            onSaveLayout={saveFields}
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

  // ── Default form mode ─────────────────────────────────────────────────────
  return (
    <>
      {error && (
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
      )}
      <AddGuardScreen
        isSubmitting={isSubmitting}
        onBack={goBack}
        onCancel={goBack}
        onSubmit={saveGuard}
      />
    </>
  );
}
