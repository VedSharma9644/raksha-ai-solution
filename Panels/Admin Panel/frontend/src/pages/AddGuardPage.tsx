import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../app/routePaths";
import { AddStaffMemberScreen } from "../features/staff";
import type { StaffMemberFormValues } from "../features/staff";
import { useAddGuard } from "../features/guards";
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
  const { agency } = useAuthContext();
  const { saveGuard, isSubmitting, error } = useAddGuard();
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(
    agency?.id,
  );
  const { fields, isLoading: isSchemaLoading, isSaving, saveFields } =
    useFormSchema(agency?.id, "guard");

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  // Still checking feature status
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
            <p role="alert" style={{ color: "red", padding: "1rem" }}>
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
              // Map generic form data to StaffMemberFormValues
              const values = data as unknown as StaffMemberFormValues;
              // Handle file fields
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
      {error ? (
        <p role="alert" style={{ color: "red", padding: "1rem" }}>
          {error}
        </p>
      ) : null}
      <AddStaffMemberScreen
        role="guard"
        isSubmitting={isSubmitting}
        onBack={goBack}
        onCancel={goBack}
        onSubmit={saveGuard}
      />
    </>
  );
}
