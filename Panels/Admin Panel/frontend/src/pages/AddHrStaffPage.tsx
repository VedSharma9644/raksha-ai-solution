import { useNavigate } from "react-router-dom";
import { AddHrStaffScreen, useAddHrStaff } from "../features/hrStaff";
import type { HrStaffFormValues } from "../features/hrStaff";
import { useAuthContext } from "../features/authentication";
import {
  useFormBuilderStatus,
  useFormSchema,
  FormBuilderForm,
} from "../features/formBuilder";
import { AppScreenLayout } from "../components/AppScreenLayout";
import { PageHeader } from "../components/PageHeader";

export function AddHrStaffPage() {
  const navigate = useNavigate();
  const { agency } = useAuthContext();
  const { saveHrStaff, isSubmitting, error } = useAddHrStaff();
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(
    agency?.id,
  );
  const { fields, isLoading: isSchemaLoading, isSaving, saveFields } =
    useFormSchema(agency?.id, "hr");

  function goBack() {
    navigate("/dashboard");
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
            title="Add HR Staff"
            subtitle="Custom form — edit fields above, then fill in HR staff details below."
            onBack={goBack}
            backLabel="Back to dashboard"
          />
          {error && (
            <p role="alert" style={{ color: "red", padding: "1rem" }}>
              {error}
            </p>
          )}
          <FormBuilderForm
            formType="hr"
            fields={fields}
            isSaving={isSaving}
            isSubmitting={isSubmitting}
            onSaveLayout={saveFields}
            onCancel={goBack}
            onSubmit={async (data) => {
              const values = data as unknown as HrStaffFormValues;
              await saveHrStaff(values);
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
      <AddHrStaffScreen
        isSubmitting={isSubmitting}
        onBack={goBack}
        onCancel={goBack}
        onSubmit={saveHrStaff}
      />
    </>
  );
}
