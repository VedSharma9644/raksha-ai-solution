import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
  const [formError, setFormError] = useState("");
  const { isEnabled, isLoading: isStatusLoading } = useFormBuilderStatus(
    agency?.id
  );
  const { fields, isLoading: isSchemaLoading } = useFormSchema(
    isEnabled ? agency?.id : undefined,
    "hr"
  );

  function goBack() {
    navigate("/dashboard");
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
        <AddHrStaffScreen
          isSubmitting={isSubmitting}
          onBack={goBack}
          onCancel={goBack}
          onSubmit={saveHrStaff}
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
          title="Add HR Staff"
          subtitle="Fill in the custom form for this agency."
          onBack={goBack}
          backLabel="Back to dashboard"
        />
        {error || formError ? (
          <p role="alert" style={{ color: "red", padding: "1rem" }}>
            {formError || error}
          </p>
        ) : null}
        <FormBuilderForm
          formType="hr"
          fields={fields}
          isSubmitting={isSubmitting}
          onCancel={goBack}
          onSubmit={async (data) => {
            setFormError("");
            const values = data as unknown as HrStaffFormValues;
            const password =
              typeof data.password === "string" ? data.password.trim() : "";
            if (!password || password.length < 8) {
              setFormError(
                "Enter a login password with at least 8 characters."
              );
              return;
            }
            values.password = password;
            await saveHrStaff(values);
          }}
        />
      </div>
    </AppScreenLayout>
  );
}
