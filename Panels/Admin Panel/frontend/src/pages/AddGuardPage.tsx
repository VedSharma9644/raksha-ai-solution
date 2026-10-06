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
    agency?.id
  );
  const { fields, isLoading: isSchemaLoading } = useFormSchema(
    isEnabled ? agency?.id : undefined,
    "guard"
  );

  function goBack() {
    navigate(APP_ROUTES.dashboard);
  }

  if (isStatusLoading) {
    return null;
  }

  // Form Builder off → keep business running with the default form
  if (!isEnabled) {
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

  if (isSchemaLoading) {
    return null;
  }

  return (
    <AppScreenLayout>
      <div className="app-screen-layout__content">
        <PageHeader
          title="Add Guard"
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
          formType="guard"
          fields={fields}
          isSubmitting={isSubmitting}
          onCancel={goBack}
          onSubmit={async (data) => {
            const values = data as unknown as StaffMemberFormValues;
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
